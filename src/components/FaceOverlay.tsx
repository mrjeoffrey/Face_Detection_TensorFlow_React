
import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';

const FaceOverlay: React.FC = () => {
  const { state } = useStore();
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });
  const [containerScale, setContainerScale] = useState(1);
  
  useEffect(() => {
    // Function to calculate position adjustments when faces are detected
    const updatePositionAdjustments = () => {
      const imageElement = document.querySelector('img[alt="Uploaded image"]') as HTMLImageElement;
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      // Figure out which element (video or image) is active and visible
      const activeElement = imageElement?.offsetParent ? imageElement : videoElement?.offsetParent ? videoElement : null;
      
      if (activeElement) {
        // Get the actual rendered dimensions of the image/video
        const elementRect = activeElement.getBoundingClientRect();
        const parentRect = activeElement.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
        
        // Calculate offsets and scaling factors
        const xOffset = parentRect.left - elementRect.left;
        const yOffset = parentRect.top - elementRect.top;
        
        // Calculate scale if the image/video is being resized
        const scaleX = elementRect.width / activeElement.offsetWidth;
        
        setContainerOffset({ x: xOffset, y: yOffset });
        setContainerScale(scaleX);
        
        console.log('FaceOverlay adjustments:', { 
          element: activeElement === imageElement ? 'image' : 'video',
          offset: { x: xOffset, y: yOffset }, 
          scale: scaleX 
        });
      }
    };
    
    // Update position whenever faces are detected
    if (state.detection.faces.length > 0) {
      updatePositionAdjustments();
      // Also set up a small delay to ensure image/video is fully rendered
      const timeoutId = setTimeout(updatePositionAdjustments, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [state.detection.faces]);

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
            left: `${face.detection.box.x * containerScale + containerOffset.x}px`,
            top: `${face.detection.box.y * containerScale + containerOffset.y}px`,
            width: `${face.detection.box.width * containerScale}px`,
            height: `${face.detection.box.height * containerScale}px`,
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
                left: (position.x - face.detection.box.x) * containerScale,
                top: (position.y - face.detection.box.y) * containerScale,
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
