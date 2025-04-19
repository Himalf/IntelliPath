import { HttpService } from '@nestjs/axios';
import { HttpServer, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly apiUrl = process.env.HF_API_URL;
  private readonly apiKey = process.env.HF_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async generateCareerSuggestion(prompt: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    const result = response.data?.[0]?.generated_text || 'No response';
    return result;
  }
}
