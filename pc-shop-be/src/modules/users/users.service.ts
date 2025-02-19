import mongoose, {Model} from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordUtil } from 'src/utils/util';
import aqp from 'api-query-params';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  
  ) {}

  isEmailExist = async (email: string) => {
    const isExist = await this.userModel.exists({email});
    if(isExist){
      return true;
    }
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    
    //check email is exist
    const isEmailExist = await this.isEmailExist(createUserDto.email);
    if(isEmailExist){
      throw new BadRequestException(`Email: ${createUserDto.email} is exist`);
    }

    //hash password
    const hashedPassword= await hashPasswordUtil(createUserDto.password);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword
    })
    return user._id;
  }

  //pagination
  async findAll(query: string, current: number, pageSize: number) {
    const {filter, sort} = aqp(query);

    if(filter.current) delete filter.current;
    if(filter.pageSize) delete filter.pageSize;

    if(!current) current = 1;
    if(!pageSize) pageSize = 5;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize

    const results = await this.userModel
    .find(filter)
    .limit(pageSize)
    .skip(skip)
    .select('-password')  //hide password field
    .sort(sort as any)

    return {results, totalPages};
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({email})
  }

  async findByPhone(phone: string) {
    return await this.userModel.findOne({phone})
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({_id: updateUserDto._id}, {...updateUserDto});
  }

  remove(_id: string) {
    //check mongoId is valid
    if(mongoose.isValidObjectId(_id)){
      return this.userModel.deleteOne({_id})
    }
    else{
      throw new BadRequestException(`Id: ${_id} is not exist in the database`);
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;

    //check email exist
    const isEmailExist = await this.isEmailExist(email);
    if (isEmailExist) {
      throw new BadRequestException(`Email: ${email} is already exist`);
    }

    //hash password
    const hashPassword = await hashPasswordUtil(password);
    const generateCodeId = () => Math.floor(100000 + Math.random() * 900000).toString();
    const createdUser = await this.userModel.create(
      {
        name,
        email,
        password: hashPassword,
        isActive: false,
        codeId: generateCodeId(),
        codeExpired: new Date((new Date().getTime() + 1000 * 60 * 5)) //5'
      });

    

    return {
      _id: createdUser._id,
    }
  }
}
