import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // 1. see if email is in use
    const emailsFound = await this.usersService.find(email);
    if (emailsFound.length > 0) {
      throw new BadRequestException('email is use');
    }

    // 2. hash the user's password
    // 2.1. generate a salt
    const salt = randomBytes(8).toString('hex'); // salt is 16 chars

    // 2.2 hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // 2.3 join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    // 3. create a new user and save it
    const user = await this.usersService.create(email, result);

    // 4. return user
    return user;
  }

  signin() {
    //
  }
}
