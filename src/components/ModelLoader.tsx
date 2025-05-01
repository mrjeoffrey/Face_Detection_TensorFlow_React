
import React, { useEffect } from 'react';
import { useStore } from '../store/store';
import { ActionTypes } from '../store/types';
import faceDetectionService from '../services/faceDetectionService';

const ModelLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch } = useStore();

  useEffect(() => {
    loadFaceDetectionModels();
  }, []);

  const loadFaceDetectionModels = async () => {
    if (state.models.isLoaded || state.models.isLoading) {
      return;
    }

    dispatch({ type: ActionTypes.MODELS_LOAD_START });

    try {
      await faceDetectionService.loadModels();
      dispatch({ type: ActionTypes.MODELS_LOAD_SUCCESS });
    } catch (error) {
      console.error('Error loading models:', error);
      dispatch({
        type: ActionTypes.MODELS_LOAD_FAILURE,
        payload: 'Failed to load facial recognition models. Please refresh the page.'
      });
    }
  };

  if (state.models.isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="loading-spinner mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Loading Face Recognition Models</h2>
        <p className="text-gray-600 text-center max-w-md">
          Please wait while we load the necessary models for face detection. This may take a moment...
        </p>
      </div>
    );
  }

  if (state.models.error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50 p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="64" 
          height="64" 
          fill="currentColor" 
          className="text-red-500 mb-4" 
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
        <h2 className="text-xl font-bold text-red-600 mb-2">Model Loading Error</h2>
        <p className="text-center mb-4">{state.models.error}</p>
        <button 
          onClick={loadFaceDetectionModels}
          className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModelLoader;
