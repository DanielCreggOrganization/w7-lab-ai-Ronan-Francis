import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, 
         IonGrid, IonRow, IonCol, IonCard, IonCardContent, 
         IonCardHeader, IonCardTitle, IonItem, IonLabel, 
         IonButton, IonIcon, IonProgressBar, IonText,
         IonRadioGroup, IonRadio, IonImg, IonTextarea,
         IonRippleEffect } from '@ionic/angular/standalone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, 
    IonCardHeader, IonCardTitle, IonItem, IonLabel, 
    IonButton, IonIcon, IonProgressBar, IonText,
    IonRadioGroup, IonRadio, IonImg, IonTextarea,
    IonRippleEffect
  ]
})
export class HomePage {
  prompt = 'Provide a recipe for these baked goods';
  output = '';
  isLoading = false;

  availableImages = [
    { url: 'assets/images/baked_goods_1.jpg', label: 'Baked Good 1' },
    { url: 'assets/images/baked_goods_2.jpg', label: 'Baked Good 2' },
    { url: 'assets/images/baked_goods_3.jpg', label: 'Baked Good 3' }
  ];

  selectedImage = this.availableImages[0].url;

  get formattedOutput() {
    return this.output.replace(/\n/g, '<br>');
  }

  selectImage(url: string) {
    this.selectedImage = url;
  }

  async onSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      // Fetch the image as a blob
      const response = await fetch(this.selectedImage);
      const blob = await response.blob();

      // Convert the image blob to Base64
      const base64data = await this.blobToBase64(blob);
      const base64String = base64data.split(',')[1]; // Extract Base64 string

      // Initialize the Google Generative AI client
      const genAI = new GoogleGenerativeAI(environment.googleApiKey); // Use environment for API Key

      // Get the generative model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Prepare the image part
      const imagePart = {
        inlineData: {
          data: base64String,
          mimeType: blob.type, // Use the blob's MIME type
        },
      };

      // Generate content
      const result = await model.generateContent([this.prompt, imagePart]);

      // Update the output
      this.output = result.response.text();

      // Log the result
      console.log(this.output);

    } catch (error) {
      this.output = `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`;
    }

    this.isLoading = false;
  }

  // Utility function to convert a blob to Base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to Base64'));
      reader.readAsDataURL(blob);
    });
  }
}
