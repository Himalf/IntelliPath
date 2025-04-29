import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RedisService } from 'src/redis/redis.provider';
import * as crypto from 'crypto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly redisService: RedisService,
  ) {}

  // CREATE
  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const course = new this.courseModel(dto);
    const saved = await course.save();

    // Invalidate cache
    await this.redisService.setCache('courses:all', null);
    return saved;
  }

  // READ all (with caching)
  async findAll(): Promise<Course[]> {
    const cacheKey = 'courses:all';
    const cached = await this.redisService.getCache<Course[]>(cacheKey);
    if (cached) return cached;

    const allCourses = await this.courseModel.find();
    await this.redisService.setCache(cacheKey, allCourses, 300);
    return allCourses;
  }

  // READ by ID
  async findById(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  // UPDATE
  async updateCourse(id: string, dto: UpdateCourseDto): Promise<Course> {
    const updated = await this.courseModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Course not found');

    // Invalidate cache
    await this.redisService.setCache('courses:all', null);
    return updated;
  }

  // DELETE
  async deleteCourse(id: string): Promise<{ message: string }> {
    const result = await this.courseModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Course not found');

    // Invalidate cache
    await this.redisService.setCache('courses:all', null);
    return { message: 'Course deleted successfully' };
  }

  // Normalize course titles to match the database titles correctly
  private normalizeCourseTitle(title: string): string {
    return title.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  // Generate a hashed cache key for array of titles
  private generateTitlesCacheKey(titles: string[]): string {
    const normalized = titles.map(this.normalizeCourseTitle).sort().join(',');
    const hash = crypto.createHash('md5').update(normalized).digest('hex');
    return `courses:titles:${hash}`;
  }

  // Find courses by titles (with caching)
  async findCoursesByTitles(titles: string[]): Promise<Course[]> {
    const cacheKey = this.generateTitlesCacheKey(titles);
    const cached = await this.redisService.getCache<Course[]>(cacheKey);
    if (cached) return cached;

    const normalizedTitles = titles.map((title) =>
      this.normalizeCourseTitle(title),
    );

    const matchedCourses = [];
    for (const title of normalizedTitles) {
      const regex = new RegExp(title.split(' ').join('|'), 'i');
      const courses = await this.courseModel.find({
        title: { $regex: regex },
      });
      matchedCourses.push(...courses);
    }

    await this.redisService.setCache(cacheKey, matchedCourses, 300);
    return matchedCourses;
  }
}
