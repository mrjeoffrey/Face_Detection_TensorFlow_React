
import * as faceapi from 'face-api.js';
import { v4 as uuidv4 } from 'uuid';
import { FaceDetection } from '../store/types';

export class FaceDetectionService {
  private modelsLoaded: boolean = false;
  private readonly MODEL_URL = '/models';

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) {
      return;
    }

    try {
      console.log('Loading face detection models...');
      
      // Load models one by one with better error handling
      await this.loadModelSafely(() => faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL), 'Tiny Face Detector');
      await this.loadModelSafely(() => faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL), 'Face Landmark 68');
      await this.loadModelSafely(() => faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL), 'Face Recognition');
      await this.loadModelSafely(() => faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URL), 'Face Expression');
      await this.loadModelSafely(() => faceapi.nets.ageGenderNet.loadFromUri(this.MODEL_URL), 'Age Gender');
      
      console.log('Models loaded successfully');
      this.modelsLoaded = true;
    } catch (error) {
      console.error('Error loading models:', error);
      throw new Error('Failed to load face detection models');
    }
  }

  private async loadModelSafely(loadFn: () => Promise<void>, modelName: string): Promise<void> {
    try {
      await loadFn();
      console.log(`${modelName} model loaded successfully`);
    } catch (error) {
      console.error(`Error loading ${modelName} model:`, error);
      throw error;
    }
  }

  async detectFaces(image: HTMLImageElement | HTMLVideoElement): Promise<FaceDetection[]> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded yet');
    }

    try {
      console.log('Starting face detection...');
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 416, // Adjust for better detection
        scoreThreshold: 0.4 // Lower threshold for better detection
      });
      
      const detections = await faceapi
        .detectAllFaces(image, detectionOptions)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      console.log(`Detected ${detections.length} faces`);
      return detections.map((detection) => this.mapDetection(detection));
    } catch (error) {
      console.error('Error during face detection:', error);
      throw new Error('Face detection failed');
    }
  }

  private mapDetection(detection: any): FaceDetection {
    return {
      id: uuidv4(),
      detection: {
        box: {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height,
        },
      },
      landmarks: {
        positions: detection.landmarks.positions.map((position: any) => ({
          x: position.x,
          y: position.y
        })),
        jawOutline: detection.landmarks.getJawOutline().map((position: any) => ({
          x: position.x,
          y: position.y
        }))
      },
      age: Math.round(detection.age),
      gender: detection.gender,
      genderProbability: detection.genderProbability,
      expressions: detection.expressions
    };
  }
}

export default new FaceDetectionService();
