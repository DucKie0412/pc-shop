import { UsersService } from 'src/modules/users/users.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ActiveAuthDto, ChangePasswordDto, CreateAuthDto, ReactiveAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from './decorator/customize-guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { MailerService } from '@nestjs-modules/mailer';
import { ResponseMessage } from './decorator/response_message.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) { }

  @Post('login')
  @Public()  //don't check jwt logic if using @Public() decorator
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successfully')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  @ResponseMessage('Register successfully')
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('active')
  @Public()
  @ResponseMessage('Active successfully')
  handleActive(@Body() activeDto: ActiveAuthDto) {
    return this.authService.activeAccount(activeDto);
  }


  @Post('reactive')
  @Public()
  @ResponseMessage('Reactive successfully')
  handleReactive(@Body("email") email: string) {
    return this.authService.reactiveAccount(email);
  }

  @Public()
  @Post('change-password')
  @ResponseMessage('Change password successfully')
  handleChangePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Post('send-code')
  @Public()
  @ResponseMessage('Send code successfully')
  handleSendEmail(@Body("email") email: string) {
    return this.authService.sendEmail(email);
  }
}
