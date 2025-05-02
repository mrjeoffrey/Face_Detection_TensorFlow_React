
import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { ActionTypes } from '../store/types';
import { Button } from '@/components/ui/button';
import faceDetectionService from '../services/faceDetectionService';
import FaceOverlay from './FaceOverlay';
import { toast } from 'sonner';

const ImageUploader: React.FC = () => {
  const { state, dispatch } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to ensure face overlay is updated whenever the face detection state changes
  useEffect(() => {
    if (state.detection.faces.length > 0) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        // This forces a reflow which helps with positioning calculations
        if (containerRef.current) {
          containerRef.current.classList.add('force-reflow');
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.classList.remove('force-reflow');
            }
          }, 10);
        }
      }, 100);
    }
  }, [state.detection.faces]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          dispatch({ type: ActionTypes.DETECTION_CLEAR });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image || !imgRef.current) return;
    
    // Check if models are loaded before proceeding
    if (!state.models.isLoaded) {
      toast.error("Face detection models are not loaded yet. Please wait for models to load and try again.");
      dispatch({ 
        type: ActionTypes.DETECTION_FAILURE, 
        payload: 'Face detection models are not loaded yet. Please wait for models to load.' 
      });
      return;
    }
    
    try {
      dispatch({ type: ActionTypes.DETECTION_START });
      console.log("Analyzing image...");
      const detectedFaces = await faceDetectionService.detectFaces(imgRef.current);
      console.log("Faces detected:", detectedFaces);
      
      if (detectedFaces.length === 0) {
        toast.warning("No faces detected in the image. Try another image or adjust lighting.");
        dispatch({ 
          type: ActionTypes.DETECTION_SUCCESS,
          payload: []
        });
        return;
      }
      
      dispatch({ type: ActionTypes.DETECTION_SUCCESS, payload: detectedFaces });
      toast.success(`${detectedFaces.length} ${detectedFaces.length === 1 ? 'face' : 'faces'} detected`);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
      dispatch({ 
        type: ActionTypes.DETECTION_FAILURE, 
        payload: 'Failed to analyze image. Please try again.' 
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Image Analysis</h2>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <Button onClick={handleUploadClick} size="lg" className="text-lg">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            fill="currentColor" 
            className="mr-2" 
            viewBox="0 0 16 16"
          >
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
          </svg>
          Upload Image
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        
        {image && (
          <Button 
            onClick={analyzeImage} 
            variant="outline" 
            size="lg"
            className="text-lg"
            disabled={state.detection.isProcessing || !state.models.isLoaded}
          >
            {state.detection.isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : !state.models.isLoaded ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-b-transparent border-primary rounded-full animate-spin"></div>
                Loading Models...
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  fill="currentColor" 
                  className="mr-2" 
                  viewBox="0 0 16 16"
                >
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
                Analyze Faces
              </>
            )}
          </Button>
        )}
      </div>

      {state.detection.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{state.detection.error}</p>
        </div>
      )}
      
      {image && (
        <div ref={containerRef} className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <img
            ref={imgRef}
            src={image}
            alt="Uploaded image"
            className="max-w-full mx-auto"
            style={{ maxHeight: '600px' }}
            onLoad={(e) => {
              console.log("Image loaded successfully", {
                width: e.currentTarget.width,
                height: e.currentTarget.height,
                naturalWidth: e.currentTarget.naturalWidth,
                naturalHeight: e.currentTarget.naturalHeight,
                offsetWidth: e.currentTarget.offsetWidth,
                offsetHeight: e.currentTarget.offsetHeight,
              });
            }}
          />
        </div>
      )}
      
      <FaceOverlay />
    </div>
  );
};

export default ImageUploader;
