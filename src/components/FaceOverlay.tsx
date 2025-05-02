
import React from 'react';
import { useStore } from '../store/store';

const FaceOverlay: React.FC = () => {
  const { state } = useStore();
  
  // Show face overlay for both webcam and uploaded images
  if (state.detection.faces.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {state.detection.faces.map((face) => (
        <div
          key={face.id}
          className="absolute border-2 border-primary"
          style={{
            left: `${face.detection.box.x}px`,
            top: `${face.detection.box.y}px`,
            width: `${face.detection.box.width}px`,
            height: `${face.detection.box.height}px`,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.5)'
          }}
        >
          <div 
            className="absolute -top-8 left-0 bg-primary text-white px-2 py-1 text-xs rounded"
            style={{ 
              minWidth: '120px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            {face.gender && face.age && (
              <div className="font-medium">
                {face.gender} ({Math.round(face.genderProbability! * 100)}%), {face.age} years
              </div>
            )}
            {face.expressions && (
              <div className="font-medium mt-0.5">
                {getTopEmotion(face.expressions)}
              </div>
            )}
          </div>
          
          {face.landmarks?.positions?.map((position, index) => (
            <div
              key={index}
              className="absolute w-1.5 h-1.5 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: position.x - face.detection.box.x,
                top: position.y - face.detection.box.y,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.5)'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

function getTopEmotion(expressions: Record<string, number>): string {
  let topEmotion = '';
  let maxValue = 0;
  
  Object.entries(expressions).forEach(([emotion, value]) => {
    if (value > maxValue) {
      maxValue = value;
      topEmotion = emotion;
    }
  });
  
  return `${topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1)} (${Math.round(maxValue * 100)}%)`;
}

export default FaceOverlay;
