// src/feedback/feedback.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { RedisService } from 'src/redis/redis.provider';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = new this.feedbackModel({
      userId: new Types.ObjectId(dto.userId),
      message: dto.message,
      rating: dto.rating,
    });

    const saved = await feedback.save();

    // Invalidate cache
    await this.redisService.setCache(`feedback:user:${dto.userId}`, null);
    await this.redisService.setCache(`feedback:all`, null);

    return saved;
  }

  async findAll(): Promise<Feedback[]> {
    const cacheKey = 'feedback:all';
    const cached = await this.redisService.getCache<Feedback[]>(cacheKey);
    if (cached) return cached;

    try {
      const feedbacks = await this.feedbackModel
        .find()
        .populate('userId', 'fullName email')
        .exec();

      await this.redisService.setCache(cacheKey, feedbacks, 300); // Cache for 5 mins
      return feedbacks;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching feedback');
    }
  }

  async findByUser(userId: string): Promise<Feedback[]> {
    const cacheKey = `feedback:user:${userId}`;
    const cached = await this.redisService.getCache<Feedback[]>(cacheKey);
    if (cached) return cached;

    try {
      const filter = Types.ObjectId.isValid(userId)
        ? { userId: new Types.ObjectId(userId) }
        : { userId };

      const feedbacks = await this.feedbackModel.find(filter).exec();

      await this.redisService.setCache(cacheKey, feedbacks, 300);
      return feedbacks;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user feedback');
    }
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) throw new NotFoundException('Feedback not found');

    const updated = await this.feedbackModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        userId: feedback.userId, // Keep original
      },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Feedback not found');

    // Invalidate cache
    await this.redisService.setCache(`feedback:user:${feedback.userId}`, null);
    await this.redisService.setCache(`feedback:all`, null);

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) throw new NotFoundException('Feedback not found');

    await this.feedbackModel.findByIdAndDelete(id);

    // Invalidate cache
    await this.redisService.setCache(`feedback:user:${feedback.userId}`, null);
    await this.redisService.setCache(`feedback:all`, null);

    return { message: 'Feedback deleted' };
  }
}
