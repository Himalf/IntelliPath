import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  // CREATE
  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const course = new this.courseModel(dto);
    return course.save();
  }

  // READ all
  async findAll(): Promise<Course[]> {
    return this.courseModel.find();
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
    return updated;
  }

  // DELETE
  async deleteCourse(id: string): Promise<{ message: string }> {
    const result = await this.courseModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Course not found');
    return { message: 'Course deleted successfully' };
  }

  // Normalize course titles to match the database titles correctly
  private normalizeCourseTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim() // Remove leading and trailing spaces
      .toLowerCase(); // Convert to lowercase for case-insensitive matching
  }

  // Find courses by a list of titles (partial and multi-word matching)
  async findCoursesByTitles(titles: string[]): Promise<Course[]> {
    // Normalize all the course titles
    const normalizedTitles = titles.map((title) =>
      this.normalizeCourseTitle(title),
    );
    console.log('Normalized AI Course Titles:', normalizedTitles);

    // Use regular expressions to check for partial matches
    const matchedCourses = [];

    for (const title of normalizedTitles) {
      const regex = new RegExp(title.split(' ').join('|'), 'i'); // Regular expression for partial match
      const courses = await this.courseModel.find({
        title: { $regex: regex },
      });

      // Add matched courses to the array
      matchedCourses.push(...courses);
    }

    return matchedCourses;
  }
}
