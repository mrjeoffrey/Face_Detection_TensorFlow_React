
import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { ActionTypes } from '../store/types';
import FaceOverlay from './FaceOverlay';
import { toast } from 'sonner';

interface WebcamProps {
  onFrame?: (video: HTMLVideoElement) => void;
}

const Webcam: React.FC<WebcamProps> = ({ onFrame }) => {
  const { state, dispatch } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  useEffect(() => {
    if (state.webcam.isActive && videoRef.current && !streamRef.current) {
      startWebcam();
    } else if (!state.webcam.isActive && streamRef.current) {
      stopWebcam();
    }
  }, [state.webcam.isActive]);

  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (state.webcam.isLoading) {
      timeoutId = window.setTimeout(() => {
        if (state.webcam.isLoading) {
          if (initAttempts >= 2) {
            dispatch({ 
              type: ActionTypes.WEBCAM_START_FAILURE, 
              payload: 'Unable to start webcam after multiple attempts. Please check your camera permissions and try again.'
            });
            toast.error('Camera initialization failed. Please check your device settings and refresh the page.');
          } else {
            stopWebcam();
            setInitAttempts(prev => prev + 1);
            dispatch({ type: ActionTypes.WEBCAM_START });
            setTimeout(() => startWebcam(), 500);
          }
        }
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.webcam.isLoading, initAttempts]);

  const startWebcam = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support webcam access. Please try a different browser.');
      }
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.style.display = 'none';
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.style.display = 'block';
          }
        }, 100);
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                dispatch({ type: ActionTypes.WEBCAM_START_SUCCESS });
                setInitAttempts(0);
                toast.success('Webcam started successfully');
              })
              .catch((error) => {
                dispatch({ 
                  type: ActionTypes.WEBCAM_START_FAILURE, 
                  payload: `Error playing video: ${error.message}` 
                });
              });
          }
        };
        
        videoRef.current.onerror = (event) => {
          dispatch({ 
            type: ActionTypes.WEBCAM_START_FAILURE, 
            payload: 'Video element encountered an error'
          });
        };
      } else {
        dispatch({ 
          type: ActionTypes.WEBCAM_START_FAILURE, 
          payload: 'Video element not found'
        });
      }
    } catch (error: any) {
      let errorMessage = 'Could not access webcam. Please ensure you have granted permission.';
      
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No webcam detected. Please connect a webcam and try again.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Webcam access denied. Please grant permission in your browser settings.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Webcam is already in use by another application. Please close other applications using your webcam.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Webcam cannot satisfy the requested constraints. Try with different settings.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Webcam access was aborted. Please try again.';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Browser issue with accessing the webcam. Please try refreshing the page.';
      }
      
      toast.error(errorMessage);
      dispatch({ 
        type: ActionTypes.WEBCAM_START_FAILURE, 
        payload: errorMessage
      });
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    dispatch({ type: ActionTypes.WEBCAM_STOP });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onFrame && state.webcam.isActive && !state.detection.isProcessing) {
      onFrame(videoRef.current);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 rounded-lg shadow-lg h-full max-h-[600px]">
      <div className="flex items-center justify-center h-full">
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          className="max-w-full max-h-full"
          muted
          playsInline
          autoPlay
        />
        
        {!state.webcam.isActive && !state.webcam.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
            <div className="text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                fill="currentColor" 
                className="mx-auto mb-4 text-gray-300" 
                viewBox="0 0 16 16"
              >
                <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
              </svg>
              <p className="text-xl font-bold">Webcam Access Required</p>
              <p className="mb-4">Click "Start Webcam" to begin face detection</p>
            </div>
          </div>
        )}
        
        {state.webcam.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <div className="loading-spinner mb-4"></div>
            <p className="text-white text-lg">Starting webcam...</p>
            {initAttempts > 0 && (
              <p className="text-white text-sm mt-2">Attempt {initAttempts + 1}...</p>
            )}
          </div>
        )}
        
        {state.webcam.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center text-white p-4 max-w-md">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                fill="currentColor" 
                className="mx-auto mb-4 text-red-500" 
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              <p className="text-xl font-bold text-red-400 mb-2">Webcam Error</p>
              <p className="mb-4">{state.webcam.error}</p>
              <button 
                onClick={() => {
                  setInitAttempts(0);
                  dispatch({ type: ActionTypes.WEBCAM_START });
                  setTimeout(() => startWebcam(), 500);
                }}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <FaceOverlay />
      </div>
    </div>
  );
};

export default Webcam;
