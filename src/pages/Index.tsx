
import React, { useCallback } from 'react';
import { ActionTypes } from '../store/types';
import { useStore } from '../store/store';
import { StoreProvider } from '../store/store';
import Webcam from '../components/Webcam';
import FaceDetails from '../components/FaceDetails';
import Controls from '../components/Controls';
import ModelLoader from '../components/ModelLoader';
import ImageUploader from '../components/ImageUploader';
import faceDetectionService from '../services/faceDetectionService';

const FaceDetectionApp: React.FC = () => {
  const { state, dispatch } = useStore();
  
  const processVideoFrame = useCallback(async (video: HTMLVideoElement) => {
    if (!video || !state.models.isLoaded || state.detection.isProcessing) {
      return;
    }

    try {
      dispatch({ type: ActionTypes.DETECTION_START });
      const detectedFaces = await faceDetectionService.detectFaces(video);
      dispatch({ type: ActionTypes.DETECTION_SUCCESS, payload: detectedFaces });
    } catch (error) {
      dispatch({
        type: ActionTypes.DETECTION_FAILURE,
        payload: 'Face detection failed. Please try again.'
      });
    }
  }, [state.models.isLoaded, state.detection.isProcessing, dispatch]);

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">FaceSight AI</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Real-time facial recognition with emotion detection powered by TensorFlow.js
        </p>
      </div>
      
      <Controls />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[600px]">
          <Webcam onFrame={processVideoFrame} />
        </div>
        
        <div className="h-[600px]">
          <FaceDetails />
        </div>
      </div>
      
      <ImageUploader />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <StoreProvider>
      <ModelLoader>
        <FaceDetectionApp />
      </ModelLoader>
    </StoreProvider>
  );
};

export default Index;
