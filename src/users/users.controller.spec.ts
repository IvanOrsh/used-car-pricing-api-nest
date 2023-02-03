import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'qwerty',
        } as User);
      },

      find: (email: string) => {
        return Promise.resolve([
          {
            id: 1,
            email,
            password: 'qwerty',
          } as User,
        ]);
      },

      remove: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
        } as User);
      },

      update: (id: number, attrs: User) => Promise.resolve(attrs),
    };
    fakeAuthService = {
      signup: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with a given email', async () => {
    const users = await controller.findAllUsers('test@test.com');

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with the given id is not found', async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'test@test.com', password: 'qwerty' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('createUser updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.createUser(
      {
        email: 'test@test.com',
        password: 'qwerty',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('signout updates session object and sets session.userId to null', () => {
    const session = { userId: 1 };
    controller.signOut(session);

    expect(session.userId).toBeNull();
  });

  it('removeUser calls usersServive.remove with provided id', async () => {
    fakeUsersService.remove = jest.fn((id) =>
      Promise.resolve({
        id,
        email: 'fake@email.com',
      } as User),
    );

    await controller.removeUser('2');

    expect(fakeUsersService.remove).toHaveBeenCalledTimes(1);
    expect(fakeUsersService.remove).toHaveBeenCalledWith(2);
  });

  it('updateUser calls usersServive.remove with provided id', async () => {
    fakeUsersService.update = jest.fn((id, attr) =>
      Promise.resolve({ email: 'whatever' } as User),
    );

    await controller.updateUser('2', { email: 'this' } as User);

    expect(fakeUsersService.update).toHaveBeenCalledTimes(1);
    expect(fakeUsersService.update).toHaveBeenCalledWith(2, { email: 'this' });
  });
});
