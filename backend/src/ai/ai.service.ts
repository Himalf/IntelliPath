// ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  private readonly API_KEY = process.env.GEMINI_API_KEY;

  async generateCareerSuggestion(prompt: string): Promise<string> {
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
      throw new Error('AI service Failed Please Try again later');
    }
  }
}
