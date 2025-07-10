import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { I18nService } from 'nestjs-i18n'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { SignUpDTO, SignInDTO, ChangePasswordDTO } from './dtos/auth'

// Mock do bcrypt para não precisar fazer o hash de verdade nos testes
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let service: AuthService
  let prismaService: PrismaService
  let jwtService: JwtService
  let i18nService: I18nService
  let cacheManager: Cache

  // Mocks para as dependências
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockJwtService = {
    signAsync: jest.fn(),
  }

  const mockI18nService = {
    translate: jest.fn().mockImplementation((key) => key), // Retorna a própria chave para simplificar
  }

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  }

  beforeEach(async () => {
    // Cria um módulo de teste do NestJS antes de cada teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile()

    // Obtém as instâncias (real e mocks) do container de injeção de dependência
    service = module.get<AuthService>(AuthService)
    prismaService = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
    i18nService = module.get<I18nService>(I18nService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)

    // Limpa todos os mocks antes de cada teste para garantir isolamento
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // --- Testes para o método signup ---
  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signUpDto: SignUpDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      // Arrange: Simula que o usuário não existe no banco
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      // Arrange: Simula a criação do usuário
      mockPrismaService.user.create.mockResolvedValue({ id: 1, ...signUpDto })

      // Act: Chama o método
      const result = await service.signup(signUpDto, 'en')

      // Assert: Verifica se o resultado está correto
      expect(result).toEqual({ id: 1, email: signUpDto.email })
      // Assert: Verifica se o método de hash foi chamado
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10)
      // Assert: Verifica se o usuário foi criado com a senha hasheada
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...signUpDto, password: 'hashedPassword' },
      })
    })

    it('should throw UnauthorizedException if user already exists', async () => {
      const signUpDto: SignUpDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      // Arrange: Simula que o usuário JÁ existe
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1, ...signUpDto })

      // Act & Assert: Espera que o método lance uma exceção
      await expect(service.signup(signUpDto, 'en')).rejects.toThrow(UnauthorizedException)
    })
  })

  // --- Testes para o método signin ---
  describe('signin', () => {
    const signInDto: SignInDTO = { email: 'test@example.com', password: 'password123' }
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
    }

    it('should return an access token on successful login', async () => {
      // Arrange: Simula encontrar o usuário e a senha corresponder
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      mockJwtService.signAsync.mockResolvedValue('fake-access-token')

      // Act
      const result = await service.signin(signInDto, 'en')

      // Assert
      expect(result).toHaveProperty('accessToken', 'fake-access-token')
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      })
    })

    it('should throw UnauthorizedException if user does not exist', async () => {
      // Arrange: Simula que o usuário não foi encontrado
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(service.signin(signInDto, 'en')).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if password does not match', async () => {
      // Arrange: Simula encontrar o usuário, mas a senha não corresponder
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(service.signin(signInDto, 'en')).rejects.toThrow(UnauthorizedException)
    })
  })

  // --- Testes para o método changepassword ---
  describe('changepassword', () => {
    const changePasswordDto: ChangePasswordDTO = {
      email: 'test@example.com',
      password: 'oldPassword',
      newPassword: 'newPassword',
    }
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedOldPassword',
    }

    it('should change the password successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true) // Senha antiga confere
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
      })
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword')

      // Act
      const result = await service.changepassword(changePasswordDto, 'en')

      // Assert
      expect(result.message).toEqual('senha alterada com sucesso!')
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        data: { password: 'hashedNewPassword' },
      })
    })

    it('should throw UnauthorizedException if user is not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(service.changepassword(changePasswordDto, 'en')).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should throw UnauthorizedException if current password does not match', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false) // Senha antiga NÃO confere

      // Act & Assert
      await expect(service.changepassword(changePasswordDto, 'en')).rejects.toThrow(
        UnauthorizedException
      )
    })
  })
})
