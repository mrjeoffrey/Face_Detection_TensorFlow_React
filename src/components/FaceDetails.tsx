
import React from 'react';
import { useStore } from '../store/store';
import { Card } from '@/components/ui/card';

const FaceDetails: React.FC = () => {
  const { state } = useStore();
  const { faces } = state.detection;

  if (!state.webcam.isActive) {
    return (
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="64" 
          height="64" 
          fill="currentColor" 
          className="text-gray-300 mb-4" 
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
        </svg>
        <h3 className="text-xl font-bold mb-2">No Face Data</h3>
        <p className="text-gray-600">Start the webcam to detect faces</p>
      </Card>
    );
  }

  if (faces.length === 0) {
    return (
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="64" 
          height="64" 
          fill="currentColor" 
          className="text-gray-300 mb-4" 
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M12.331 9.5a1 1 0 0 1 0 1A4.998 4.998 0 0 1 8 13a4.998 4.998 0 0 1-4.33-2.5A1 1 0 0 1 4.535 9h6.93a1 1 0 0 1 .866.5zM7 6.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S5.552 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.552 5 10 5s1 .672 1 1.5z"/>
        </svg>
        <h3 className="text-xl font-bold mb-2">Looking for faces...</h3>
        <p className="text-gray-600">Position yourself in front of the camera</p>
      </Card>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-4">Detected Faces: {faces.length}</h2>
      
      {faces.map((face) => (
        <Card key={face.id} className="p-4 mb-4">
          <h3 className="text-xl font-bold mb-2">
            {face.gender && face.age && (
              <span>{face.gender} • {face.age} years</span>
            )}
          </h3>
          
          {face.expressions && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Emotions:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(face.expressions).map(([emotion, value]) => (
                  <div key={emotion} className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="capitalize">{emotion}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Position</h4>
              <p>X: {Math.round(face.detection.box.x)}</p>
              <p>Y: {Math.round(face.detection.box.y)}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Size</h4>
              <p>Width: {Math.round(face.detection.box.width)}px</p>
              <p>Height: {Math.round(face.detection.box.height)}px</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FaceDetails;
