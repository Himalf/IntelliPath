import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CareerSuggestion, CareerDocument } from '../career_suggestion/schemas/career-suggestion.schema';
import { ResumeAnalysis, ResumeAnalysisDocument } from '../resume-analysis/schemas/resume-analysis.schema';
import { ChatbotQuery, ChatbotQueryDocument } from '../chatbot-query/schemas/chatbot-query.schema';
import { Feedback, FeedbackDocument } from '../feedback/schemas/feedback.schema';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CareerSuggestion.name) private careerModel: Model<CareerDocument>,
    @InjectModel(ResumeAnalysis.name) private resumeModel: Model<ResumeAnalysisDocument>,
    @InjectModel(ChatbotQuery.name) private chatbotModel: Model<ChatbotQueryDocument>,
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  private loadMLDataset(datasetName: string): any {
    try {
      // Try multiple path resolutions for both dev and production
      const possiblePaths = [
        path.join(process.cwd(), 'src/algorithms/datasets/ml-training', `${datasetName}.json`),
        path.join(__dirname, '../algorithms/datasets/ml-training', `${datasetName}.json`),
        path.join(__dirname, '../../algorithms/datasets/ml-training', `${datasetName}.json`),
      ];

      for (const datasetPath of possiblePaths) {
        if (fs.existsSync(datasetPath)) {
          const data = fs.readFileSync(datasetPath, 'utf-8');
          return JSON.parse(data);
        }
      }

      console.error(`ML dataset ${datasetName} not found in any expected location`);
      return null;
    } catch (error) {
      console.error(`Error loading ML dataset ${datasetName}:`, error);
      return null;
    }
  }

  async seedDatabase() {
    console.log('🌱 Starting database seeding with ML training datasets...');

    try {
      // Clear existing data (optional - comment out if you want to keep existing data)
      // await this.clearDatabase();

      // Seed Users
      const users = await this.seedUsers();
      console.log(`✅ Seeded ${users.length} users`);

      // Seed Courses
      const courses = await this.seedCourses();
      console.log(`✅ Seeded ${courses.length} courses`);

      // Seed Career Suggestions
      await this.seedCareerSuggestions(users, courses);
      console.log('✅ Seeded career suggestions');

      // Seed Resume Analyses
      await this.seedResumeAnalyses(users);
      console.log('✅ Seeded resume analyses');

      // Seed Chatbot Queries
      await this.seedChatbotQueries(users);
      console.log('✅ Seeded chatbot queries');

      // Seed Feedback
      await this.seedFeedback(users);
      console.log('✅ Seeded feedback');

      console.log('🎉 Database seeding completed successfully!');
      return { success: true, message: 'Database seeded successfully' };
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private async seedUsers() {
    const userProfiles = this.loadMLDataset('user-profiles');
    if (!userProfiles) {
      // Create default users if dataset not found
      const defaultUsers = [
        {
          email: 'admin@intellipath.com',
          password: await bcrypt.hash('admin123', 10),
          fullName: 'Admin User',
          role: UserRole.ADMIN,
          education: 'Master in Computer Science',
          skills: 'Leadership, Management, System Design',
        },
        {
          email: 'user1@example.com',
          password: await bcrypt.hash('user123', 10),
          fullName: 'John Doe',
          role: UserRole.USER,
          education: 'Bachelor in Computer Science',
          skills: 'JavaScript, React, Node.js, MongoDB',
        },
        {
          email: 'user2@example.com',
          password: await bcrypt.hash('user123', 10),
          fullName: 'Sarah Chen',
          role: UserRole.USER,
          education: 'Master in Data Science',
          skills: 'Python, Machine Learning, TensorFlow, SQL',
        },
      ];
      return await this.userModel.insertMany(defaultUsers);
    }

    const users = [];
    for (const profile of userProfiles.slice(0, 10)) {
      const user = await this.userModel.create({
        email: `user${profile.user_id}@example.com`,
        password: await bcrypt.hash('password123', 10),
        fullName: profile.user_id.replace('_', ' ').replace(/\d+/g, '').trim() || 'Test User',
        role: profile.user_id === 'user_001' ? UserRole.ADMIN : UserRole.USER,
        education: `${profile.education_level} in ${profile.education_field}`,
        skills: profile.skills.join(', '),
      });
      users.push(user);
    }

    // Add admin user
    const admin = await this.userModel.create({
      email: 'admin@intellipath.com',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      education: 'Master in Computer Science',
      skills: 'Leadership, Management, System Design',
    });
    users.push(admin);

    return users;
  }

  private async seedCourses() {
    const coursesData = [
      {
        title: 'AWS Certified Solutions Architect',
        description: 'Comprehensive course on AWS cloud architecture and best practices',
        url: 'https://aws.amazon.com/training/',
        tags: ['AWS', 'Cloud', 'Architecture'],
      },
      {
        title: 'React Advanced Patterns',
        description: 'Master advanced React patterns and performance optimization',
        url: 'https://react.dev/',
        tags: ['React', 'JavaScript', 'Frontend'],
      },
      {
        title: 'Node.js Production Best Practices',
        description: 'Learn production-ready Node.js development techniques',
        url: 'https://nodejs.org/',
        tags: ['Node.js', 'Backend', 'JavaScript'],
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning algorithms and applications',
        url: 'https://www.coursera.org/',
        tags: ['Machine Learning', 'Python', 'Data Science'],
      },
      {
        title: 'Docker and Kubernetes',
        description: 'Containerization and orchestration with Docker and Kubernetes',
        url: 'https://kubernetes.io/',
        tags: ['Docker', 'Kubernetes', 'DevOps'],
      },
      {
        title: 'Data Science with Python',
        description: 'Complete data science course using Python and pandas',
        url: 'https://pandas.pydata.org/',
        tags: ['Python', 'Data Science', 'Pandas'],
      },
    ];

    return await this.courseModel.insertMany(coursesData);
  }

  private async seedCareerSuggestions(users: UserDocument[], courses: CourseDocument[]) {
    const careerDataset = this.loadMLDataset('career-recommendations');
    if (!careerDataset) return;

    for (let i = 0; i < Math.min(careerDataset.length, users.length); i++) {
      const data = careerDataset[i];
      const user = users[i];
      if (!user) continue;

      const topCareers = data.recommended_careers
        .slice(0, 3)
        .map((c: any) => c.career)
        .join(', ');

      await this.careerModel.create({
        user_id: user._id,
        suggestedCareers: topCareers,
        skillGapAnalysis: data.skill_gap_analysis.weaknesses.join(', '),
        recommended_courses: courses.slice(0, 3).map(c => c._id),
      });
    }
  }

  private async seedResumeAnalyses(users: UserDocument[]) {
    const resumeDataset = this.loadMLDataset('resume-analysis-dataset');
    if (!resumeDataset) return;

    for (let i = 0; i < Math.min(resumeDataset.length, users.length); i++) {
      const data = resumeDataset[i];
      const user = users[i];
      if (!user) continue;

      const analysis = data.ml_analysis;
      await this.resumeModel.create({
        user_id: user._id,
        resumeText: data.resume_text,
        strengths: analysis.strengths,
        weakness: analysis.weaknesses,
        recommendation: analysis.recommendations,
        jobRecommendations: analysis.job_recommendations || [],
      });
    }
  }

  private async seedChatbotQueries(users: UserDocument[]) {
    const chatbotDataset = this.loadMLDataset('chatbot-responses-dataset');
    if (!chatbotDataset) return;

    const questions = [
      'What career should I choose?',
      'How to improve my resume?',
      'What skills do I need for software engineering?',
      'Can you give me job interview tips?',
      'Who built this platform?',
    ];

    for (let i = 0; i < Math.min(users.length, questions.length); i++) {
      const user = users[i];
      const question = questions[i];
      if (!user) continue;

      const matchingEntry = chatbotDataset.find((entry: any) =>
        entry.question_keywords.some((kw: string) =>
          question.toLowerCase().includes(kw.toLowerCase()),
        ),
      );

      await this.chatbotModel.create({
        userId: user._id,
        question: question,
        response: matchingEntry?.response_template || 'I am here to help with your career questions.',
      });
    }
  }

  private async seedFeedback(users: UserDocument[]) {
    const feedbackMessages = [
      { rating: 5, message: 'Excellent platform! The career suggestions were very helpful.' },
      { rating: 4, message: 'Good service, but could use more detailed analysis.' },
      { rating: 5, message: 'The resume analysis feature is amazing!' },
      { rating: 4, message: 'Helpful chatbot, but sometimes responses could be more specific.' },
      { rating: 5, message: 'Great tool for career guidance. Highly recommend!' },
      { rating: 3, message: 'Decent platform, but needs more job recommendations.' },
      { rating: 4, message: 'Good overall experience. The dashboard is well-designed.' },
      { rating: 5, message: 'Very insightful career path suggestions!' },
    ];

    for (let i = 0; i < Math.min(users.length, feedbackMessages.length); i++) {
      const user = users[i];
      const feedback = feedbackMessages[i];
      if (!user) continue;

      await this.feedbackModel.create({
        userId: user._id,
        rating: feedback.rating,
        message: feedback.message,
      });
    }
  }

  private async clearDatabase() {
    await this.userModel.deleteMany({});
    await this.careerModel.deleteMany({});
    await this.resumeModel.deleteMany({});
    await this.chatbotModel.deleteMany({});
    await this.feedbackModel.deleteMany({});
    await this.courseModel.deleteMany({});
    console.log('🗑️  Cleared existing data');
  }
}

