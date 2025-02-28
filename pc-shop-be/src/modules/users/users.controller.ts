import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log("Check: ", createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
) {
  // validate query parameters
  if (!current ||!pageSize) {
    return { message: "Invalid query parameters" };
  }
    return this.usersService.findAll(query, +current, +pageSize);  //exchange string parameters to number by +Variable
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.usersService.remove(_id);
  }
}
