import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService {
  private readonly MODEL_NAME = 'gemini-1.5-flash';
  
  async getImageAsBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async generateRecipe(imageBase64: string, prompt: string): Promise<string> {
    try {
      const client = new GoogleGenerativeAI({
        apiKey: environment.googleApiKey
      });
      const model = await client.getModel(this.MODEL_NAME);
      const response = await model.generateContent({
        input: imageBase64,
        prompt: prompt
      });
      return response.text;
    } catch (error) {
      throw new Error('Failed to generate recipe');
    }
  }
}