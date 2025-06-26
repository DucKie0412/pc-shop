import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ActiveAuthDto, CreateAuthDto, ChangePasswordDto } from './dto/create-auth.dto';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordUtil } from 'src/utils/util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isValidPassword = await comparePasswordUtil(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Password is not correct');
    }
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }

  async activeAccount(activeDto: ActiveAuthDto) {
    return await this.usersService.handleActive(activeDto);
  }

  async reactiveAccount(email: string) {
    return await this.usersService.handleReactive(email);
  }

  async changePassword(changePasswordDto: ChangePasswordDto  ) {
    return await this.usersService.handleChangePassword(changePasswordDto);
  }

  async sendEmail(email: string) {
    return await this.usersService.handleSendCodeId(email);
  }
}
