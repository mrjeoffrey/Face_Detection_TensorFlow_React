
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
            height: `${face.detection.box.height}px`
          }}
        >
          <div 
            className="absolute -top-8 left-0 bg-primary text-white px-2 py-1 text-xs rounded"
            style={{ minWidth: '120px' }}
          >
            {face.gender && face.age && (
              <div>
                {face.gender} ({Math.round(face.genderProbability! * 100)}%), {face.age} years
              </div>
            )}
            {face.expressions && (
              <div>
                {getTopEmotion(face.expressions)}
              </div>
            )}
          </div>
          
          {face.landmarks?.positions?.map((position, index) => (
            <div
              key={index}
              className="absolute w-1 h-1 bg-green-500 rounded-full"
              style={{
                left: position.x - face.detection.box.x - 2,
                top: position.y - face.detection.box.y - 2,
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
