
import React from 'react';
import { useStore } from '../store/store';
import { ActionTypes } from '../store/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Controls: React.FC = () => {
  const { state, dispatch } = useStore();

  const toggleWebcam = () => {
    if (state.webcam.isActive) {
      dispatch({ type: ActionTypes.WEBCAM_STOP });
    } else {
      dispatch({ type: ActionTypes.WEBCAM_START });
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-wrap gap-4">
        <Button
          size="lg"
          variant={state.webcam.isActive ? "destructive" : "default"}
          className="text-lg flex-grow"
          onClick={toggleWebcam}
          disabled={state.webcam.isLoading}
        >
          {state.webcam.isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full animate-spin"></div>
              Starting...
            </>
          ) : state.webcam.isActive ? (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="currentColor" 
                className="mr-2" 
                viewBox="0 0 16 16"
              >
                <path d="M6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5h-3z"/>
              </svg>
              Stop Webcam
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
                <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
              </svg>
              Start Webcam
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default Controls;
