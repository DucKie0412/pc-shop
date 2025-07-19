import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from 'src/auth/decorator/response_message.decorator';
import { Public } from 'src/auth/decorator/customize-guard';

@Controller('users')
@UseGuards(AuthGuard('jwt')) // Apply the AuthGuard to the entire controller
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('points/:id')
  getUserPoints(@Param('id') _id: string){
    return this.usersService.getUserPoints(_id);
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    return this.usersService.findOne(_id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Patch()
  @ResponseMessage('User updated successfully')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Patch('toggle-role/:id')
  @ResponseMessage('User role toggled successfully')
  toggleRole(@Param('id') _id: string) {
    return this.usersService.toggleUserRole(_id);
  }

  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  remove(@Param('id') _id: string) {
    return this.usersService.remove(_id);
  }
}
