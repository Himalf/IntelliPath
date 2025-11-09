// ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  private readonly API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  private readonly API_KEY = process.env.GEMINI_API_KEY;
  private readonly USE_DUMMY_DATA = !this.API_KEY || process.env.USE_DUMMY_DATA === 'true';

  // Load ML training datasets
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

  // Get dummy response for career suggestions
  private getDummyCareerSuggestion(skills: string): string {
    const dataset = this.loadMLDataset('career-recommendations');
    if (!dataset || dataset.length === 0) {
      // Fallback response
      return JSON.stringify({
        suggestedCareers: 'Full Stack Developer, Software Engineer, Frontend Developer',
        skillGapAnalysis: 'Consider learning cloud platforms and testing frameworks',
        recommended_courses: 'AWS Fundamentals, React Advanced, Node.js Masterclass',
      });
    }

    // Find best match based on skills
    const userSkills = skills.toLowerCase().split(',').map(s => s.trim());
    let bestMatch = dataset[0];
    let maxMatch = 0;

    for (const entry of dataset) {
      const entrySkills = entry.input_features.skills.map((s: string) => s.toLowerCase());
      const matchCount = userSkills.filter(us => 
        entrySkills.some(es => es.includes(us) || us.includes(es))
      ).length;
      
      if (matchCount > maxMatch) {
        maxMatch = matchCount;
        bestMatch = entry;
      }
    }

    const topCareer = bestMatch.recommended_careers[0];
    const careers = bestMatch.recommended_careers
      .slice(0, 3)
      .map((c: any) => c.career)
      .join(', ');

    return JSON.stringify({
      suggestedCareers: careers,
      skillGapAnalysis: bestMatch.skill_gap_analysis.weaknesses.join(', '),
      recommended_courses: 'AWS Certified Solutions Architect, React Advanced Patterns, Node.js Production Best Practices',
    });
  }

  // Get dummy response for resume analysis
  private getDummyResumeAnalysis(resumeText: string): string {
    const dataset = this.loadMLDataset('resume-analysis-dataset');
    if (!dataset || dataset.length === 0) {
      // Fallback response
      return JSON.stringify({
        strengths: ['Strong technical skills', 'Good project experience'],
        weaknesses: ['Could improve documentation', 'Needs more testing experience'],
        recommendations: ['Add more quantifiable achievements', 'Include certifications'],
      });
    }

    // Simple keyword matching to find best match
    const resumeLower = resumeText.toLowerCase();
    let bestMatch = dataset[0];
    let maxScore = 0;

    for (const entry of dataset) {
      const entryText = entry.resume_text.toLowerCase();
      const keywords = entry.extracted_features.skills.map((s: string) => s.toLowerCase());
      const matchScore = keywords.filter(k => resumeLower.includes(k)).length;
      
      if (matchScore > maxScore) {
        maxScore = matchScore;
        bestMatch = entry;
      }
    }

    const analysis = bestMatch.ml_analysis;
    
    // Check if this is a job recommendations request (contains job-related keywords)
    if (resumeText.includes('job') || resumeText.includes('suggest') || resumeText.includes('roles')) {
      // Return job recommendations array
      const jobs = analysis.job_recommendations || [];
      return JSON.stringify(jobs);
    }
    
    // Return regular analysis
    return JSON.stringify({
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
    });
  }

  // Get dummy response for chatbot
  private getDummyChatbotResponse(question: string): string {
    const dataset = this.loadMLDataset('chatbot-responses-dataset');
    if (!dataset || dataset.length === 0) {
      return JSON.stringify({
        response: 'I am an AI career guidance assistant. How can I help you with your career questions today?',
      });
    }

    const questionLower = question.toLowerCase();
    
    // Find best matching response
    let bestMatch = dataset[0];
    let maxScore = 0;

    for (const entry of dataset) {
      const keywords = entry.question_keywords.map((k: string) => k.toLowerCase());
      const matchScore = keywords.filter(k => questionLower.includes(k)).length;
      
      if (matchScore > maxScore) {
        maxScore = matchScore;
        bestMatch = entry;
      }
    }

    // Special handling for creator questions
    if (questionLower.includes('who') && (questionLower.includes('built') || questionLower.includes('made') || questionLower.includes('created'))) {
      const creatorEntry = dataset.find((e: any) => e.query_id === 'query_006');
      if (creatorEntry) {
        return JSON.stringify({
          response: creatorEntry.response_template,
        });
      }
    }

    return JSON.stringify({
      response: bestMatch.response_template,
    });
  }

  async generateCareerSuggestion(prompt: string): Promise<string> {
    // Use dummy data if API key is missing or USE_DUMMY_DATA is set
    if (this.USE_DUMMY_DATA) {
      console.log('Using ML training dataset for career suggestion (dummy mode)');
      // Extract skills from prompt
      const skillsMatch = prompt.match(/skills:\s*(.+?)(?:\n|$)/i);
      const skills = skillsMatch ? skillsMatch[1] : 'JavaScript, React, Node.js';
      return this.getDummyCareerSuggestion(skills);
    }

    try {
      const res = await axios.post(
        `${this.API_URL}?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        { timeout: 10000 },
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      // Optional: try parsing JSON if possible
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.substring(jsonStart, jsonEnd + 1);

      return jsonString;
    } catch (err) {
      console.error('Gemini AI Error:', err.message);
      console.log('Falling back to ML training dataset');
      
      // Fallback to dummy data on API error
      const skillsMatch = prompt.match(/skills:\s*(.+?)(?:\n|$)/i);
      const skills = skillsMatch ? skillsMatch[1] : 'JavaScript, React, Node.js';
      return this.getDummyCareerSuggestion(skills);
    }
  }

  async generateResumeAnalysis(prompt: string): Promise<string> {
    // Use dummy data if API key is missing
    if (this.USE_DUMMY_DATA) {
      console.log('Using ML training dataset for resume analysis (dummy mode)');
      // Extract resume text from prompt
      const resumeMatch = prompt.match(/Resume[:\s]*(.+)/is);
      const resumeText = resumeMatch ? resumeMatch[1] : prompt;
      return this.getDummyResumeAnalysis(resumeText);
    }

    try {
      const res = await axios.post(
        `${this.API_URL}?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        { timeout: 10000 },
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.substring(jsonStart, jsonEnd + 1);

      return jsonString;
    } catch (err) {
      console.error('Gemini AI Error:', err.message);
      console.log('Falling back to ML training dataset');
      
      const resumeMatch = prompt.match(/Resume[:\s]*(.+)/is);
      const resumeText = resumeMatch ? resumeMatch[1] : prompt;
      return this.getDummyResumeAnalysis(resumeText);
    }
  }

  async generateChatbotResponse(prompt: string): Promise<string> {
    // Use dummy data if API key is missing
    if (this.USE_DUMMY_DATA) {
      console.log('Using ML training dataset for chatbot response (dummy mode)');
      // Extract question from prompt
      const questionMatch = prompt.match(/Question[:\s]*(.+)/is);
      const question = questionMatch ? questionMatch[1] : prompt;
      return this.getDummyChatbotResponse(question);
    }

    try {
      const res = await axios.post(
        `${this.API_URL}?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        { timeout: 10000 },
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.substring(jsonStart, jsonEnd + 1);

      return jsonString;
    } catch (err) {
      console.error('Gemini AI Error:', err.message);
      console.log('Falling back to ML training dataset');
      
      const questionMatch = prompt.match(/Question[:\s]*(.+)/is);
      const question = questionMatch ? questionMatch[1] : prompt;
      return this.getDummyChatbotResponse(question);
    }
  }
}
