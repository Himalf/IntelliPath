// src/feedback/feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = new this.feedbackModel({
      userId: new Types.ObjectId(dto.userId),
      message: dto.message,
      rating: dto.rating,
    });
    return feedback.save();
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackModel
      .find()
      .populate('userId', 'fullName email')
      .exec();
  }

  async findByUser(userId: string): Promise<Feedback[]> {
    return this.feedbackModel.find({ userId }).exec();
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<Feedback> {
    const updated = await this.feedbackModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Feedback not found');
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const res = await this.feedbackModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Feedback not found');
    return { message: 'Feedback deleted' };
  }
}
