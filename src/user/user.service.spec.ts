import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { PrismaService } from '../common/database/prisma/prisma.service'
import { NotFoundException } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'

describe('UserService', () => {
  let service: UserService
  let prisma: PrismaService
  let i18nService: I18nService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    prisma = module.get<PrismaService>(PrismaService)
    i18nService = module.get<I18nService>(I18nService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findById', () => {
    it('deve retornar um usuário quando um ID válido é fornecido', async () => {
      const userId = 1
      const mockUser = { id: userId, name: 'Test User', email: 'test@email.com' }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.findById(userId)

      expect(result).toEqual(mockUser)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    })

    it('deve lançar um NotFoundException com a mensagem traduzida', async () => {
      const userId = 999
      const expectedErrorMessage = `Usuário com ID ${userId} não encontrado.`

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(i18nService.translate as jest.Mock).mockResolvedValue(expectedErrorMessage)

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException)
      await expect(service.findById(userId)).rejects.toThrow(expectedErrorMessage)
    })
  })
})
