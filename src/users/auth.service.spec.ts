import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },

      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const email = 'test@test.com';
    const password = 'qwerty';
    const user = await service.signup(email, password);

    expect(user.password).not.toEqual(password);

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    const email = 'test@test.com';
    const password = 'qwerty';

    await service.signup(email, password);

    await expect(service.signup(email, password)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    const email = 'test@test.com';
    const password = 'qwerty';

    await expect(service.signin(email, password)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    const email = 'test@test.com';
    const password = 'qwerty';
    const invalidPassword = 'babaganush';

    await service.signup(email, password);

    await expect(service.signin(email, invalidPassword)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    const email = 'test@test.com';
    const password = 'qwerty';

    await service.signup(email, password);

    const user = await service.signin(email, password);

    expect(user).toBeDefined();
    expect(user.email).toEqual(email);
  });
});
