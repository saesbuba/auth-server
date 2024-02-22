import {
  Injectable,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const newUserInfo = await this.userService.create(createUserDto);
      return {
        success: true,
        statusCode: 201,
        message: '',
        data: newUserInfo,
      };
    } catch (error) {
      throw new HttpException(error.response, error.response.statusCode);
    }
  }

  async login(username: string, password: string) {
    const user = await this.userService.findOne(username);

    if (!user)
      throw new NotFoundException({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        data: {},
      });

    const isPasswordMatching = await bcrypt.compare(password, user?.password);

    if (!isPasswordMatching)
      throw new UnauthorizedException({
        success: false,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        data: {},
      });

    const payload = { sub: user.id, username: user.username };
    const options = {
      audience: 'http://localhost:8080/nestjs/api/v1',
      issuer: 'http://localhost:3000/nestjs/auth/',
      expiresIn: 28800,
      secret: 'custom-secret-from-env-vars',
    };

    const jwt = await this.jwtService.signAsync(payload, options);
    return {
      success: true,
      statusCode: 201,
      message: '',
      data: {
        jwt: jwt,
        expiresIn: 28800,
        tokenType: 'Bearer',
      },
    };
  }
}
