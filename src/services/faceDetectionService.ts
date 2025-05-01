
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
      await faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(this.MODEL_URL);
      console.log('Models loaded successfully');
      this.modelsLoaded = true;
    } catch (error) {
      console.error('Error loading models:', error);
      throw new Error('Failed to load face detection models');
    }
  }

  async detectFaces(image: HTMLImageElement | HTMLVideoElement): Promise<FaceDetection[]> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded yet');
    }

    try {
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
      
      const detections = await faceapi
        .detectAllFaces(image, detectionOptions)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

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
