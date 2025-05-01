
# FaceSight AI - Face Detection App

Real-time facial recognition with emotion detection powered by TensorFlow.js

## Installation

1. Install dependencies:
```bash
npm install
```

2. **Important**: Download the face-api.js models
   
   Create a folder called `models` inside the `public` directory and download the required models from:
   https://github.com/justadudewhohacks/face-api.js/tree/master/weights

   You need the following model files in your `public/models` directory:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_expression_model-weights_manifest.json
   - face_expression_model-shard1
   - age_gender_model-weights_manifest.json
   - age_gender_model-shard1

3. Run the development server:
```bash
npm run dev
```

## Features

- Real-time face detection through webcam
- Upload and analyze images
- Detect gender, age, and emotions
- Multiple face detection support
- Responsive design for mobile and desktop

## Technology Stack

- React
- TypeScript
- TensorFlow.js (face-api.js)
- Tailwind CSS
- shadcn/ui components

## Project Structure

- `/src/components` - UI components
- `/src/services` - Services for face detection
- `/src/store` - State management
- `/src/pages` - App pages
