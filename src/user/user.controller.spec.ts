import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AuthGuard } from '../auth/auth.guard'
import { CacheInterceptor } from '../common/interceptors/cache/cache.interceptor'

describe('UserController', () => {
  let controller: UserController
  let userService: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .overrideInterceptor(CacheInterceptor)
      .useValue({
        intercept: (context, next) => next.handle(),
      })
      .compile()

    controller = module.get<UserController>(UserController)
    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should call userService.findAll and return the result', async () => {
      const mockUsers = [{ id: 1, name: 'Test User', email: 'test@example.com' }]
      ;(userService.findAll as jest.Mock).mockResolvedValue(mockUsers)

      const result = await controller.findAll()

      expect(userService.findAll).toHaveBeenCalled()
      expect(result).toEqual(mockUsers)
    })
  })

  describe('findOne', () => {
    it('should call userService.findOne and return the user result', async () => {
      const userId = 1
      const mockUser = { id: userId, name: 'Test User', email: 'test@example.com' }

      ;(userService.findById as jest.Mock).mockResolvedValue(mockUser)

      const result = await controller.findOne(userId)

      expect(userService.findById).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockUser)
    })
  })
})
