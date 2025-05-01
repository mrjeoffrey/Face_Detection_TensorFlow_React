
export interface FaceDetection {
  id: string;
  landmarks?: {
    positions: Array<{ x: number; y: number }>;
    jawOutline: Array<{ x: number; y: number }>;
  };
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  age?: number;
  gender?: string;
  genderProbability?: number;
  expressions?: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  };
}

export interface AppState {
  webcam: {
    isActive: boolean;
    isLoading: boolean;
    error: string | null;
  };
  detection: {
    faces: FaceDetection[];
    isProcessing: boolean;
    error: string | null;
  };
  models: {
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
  };
}

export enum ActionTypes {
  WEBCAM_START = 'WEBCAM_START',
  WEBCAM_START_SUCCESS = 'WEBCAM_START_SUCCESS',
  WEBCAM_START_FAILURE = 'WEBCAM_START_FAILURE',
  WEBCAM_STOP = 'WEBCAM_STOP',
  
  MODELS_LOAD_START = 'MODELS_LOAD_START',
  MODELS_LOAD_SUCCESS = 'MODELS_LOAD_SUCCESS',
  MODELS_LOAD_FAILURE = 'MODELS_LOAD_FAILURE',
  
  DETECTION_START = 'DETECTION_START',
  DETECTION_SUCCESS = 'DETECTION_SUCCESS',
  DETECTION_FAILURE = 'DETECTION_FAILURE',
  DETECTION_CLEAR = 'DETECTION_CLEAR',
}

export type Action = 
  | { type: ActionTypes.WEBCAM_START }
  | { type: ActionTypes.WEBCAM_START_SUCCESS }
  | { type: ActionTypes.WEBCAM_START_FAILURE, payload: string }
  | { type: ActionTypes.WEBCAM_STOP }
  | { type: ActionTypes.MODELS_LOAD_START }
  | { type: ActionTypes.MODELS_LOAD_SUCCESS }
  | { type: ActionTypes.MODELS_LOAD_FAILURE, payload: string }
  | { type: ActionTypes.DETECTION_START }
  | { type: ActionTypes.DETECTION_SUCCESS, payload: FaceDetection[] }
  | { type: ActionTypes.DETECTION_FAILURE, payload: string }
  | { type: ActionTypes.DETECTION_CLEAR };
