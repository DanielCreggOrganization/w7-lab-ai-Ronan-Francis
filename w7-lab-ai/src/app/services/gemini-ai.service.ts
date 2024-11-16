import { Injectable } from '@angular/core';
import { GenerateContentRequest, GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService {
  private readonly MODEL_NAME = 'gemini-1.5-flash';
  private readonly API_KEY = environment.googleApiKey;
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Initialize the AI client once to optimize performance
    this.genAI = new GoogleGenerativeAI(this.API_KEY);
  }

  /**
   * Fetches an image, converts it to Base64 format, and returns the Base64 string.
   * @param imageUrl The URL of the image to fetch.
   * @returns Base64 encoded string of the image.
   */
  async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject('Failed to convert image to Base64.');
        reader.readAsDataURL(blob);
      });
      return base64data.split(',')[1];
    } catch (error) {
      console.error('Error in getImageAsBase64:', error);
      throw error;
    }
  }

  /**
   * Generates content based on a Base64 image and a text prompt.
   * @param imageBase64 The Base64 string of the image.
   * @param prompt The text prompt to provide to the AI model.
   * @returns The generated content as a string.
   */
  async generateRecipe(imageBase64: string, prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME });
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64
                }
              },
              { text: prompt }
            ]
          }
        ]
      });

      // Validate and return the response
      if (result?.response?.text) {
        return result.response.text();
      } else {
        throw new Error('Invalid response from the AI model.');
      }
    } catch (error) {
      console.error('Error in generateRecipe:', error);
      throw error;
    }
  }
}
