import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from 'src/redis/redis.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    return user.save();
  }
  async findAll() {
    const cacheKey = `users:all`;
    const cachedUsers = await this.redisService.getCache<User[]>(cacheKey);
    if (cachedUsers) return cachedUsers;
    const users = await this.userModel.find().exec();
    await this.redisService.setCache(cacheKey, users, 300);
    return users;
  }
  async findOne(id: string) {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisService.getCache<User>(cacheKey);
    if (cachedUser) return cachedUser;
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not Found');
    await this.redisService.setCache(cacheKey, user, 300); //cache for 5 mins
    return user;
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async update(updateUserDto: UpdateUserDto, id: string) {
    const updateUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updateUser) throw new NotFoundException('User Not Found');
    await this.redisService.setCache(`user:${id}`, updateUser, 300);
    await this.redisService.setCache('users:all', null);
    return updateUser;
  }

  async remove(id: string) {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User Not Found');
    await this.redisService.setCache(`user:${id}`, null); // invalidate single user
    await this.redisService.setCache('users:all', null); // invalidate all users list
  }

  async findByPhone(phone: string) {
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
