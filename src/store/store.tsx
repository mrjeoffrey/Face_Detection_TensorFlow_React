
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AppState, Action, ActionTypes } from './types';

const initialState: AppState = {
  webcam: {
    isActive: false,
    isLoading: false,
    error: null,
  },
  detection: {
    faces: [],
    isProcessing: false,
    error: null,
  },
  models: {
    isLoaded: false,
    isLoading: false,
    error: null,
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionTypes.WEBCAM_START:
      return {
        ...state,
        webcam: {
          ...state.webcam,
          isLoading: true,
          error: null,
        },
      };
    case ActionTypes.WEBCAM_START_SUCCESS:
      return {
        ...state,
        webcam: {
          isActive: true,
          isLoading: false,
          error: null,
        },
      };
    case ActionTypes.WEBCAM_START_FAILURE:
      return {
        ...state,
        webcam: {
          isActive: false,
          isLoading: false,
          error: action.payload,
        },
      };
    case ActionTypes.WEBCAM_STOP:
      return {
        ...state,
        webcam: {
          isActive: false,
          isLoading: false,
          error: null,
        },
        detection: {
          ...state.detection,
          faces: [],
        },
      };
    case ActionTypes.MODELS_LOAD_START:
      return {
        ...state,
        models: {
          ...state.models,
          isLoading: true,
          error: null,
        },
      };
    case ActionTypes.MODELS_LOAD_SUCCESS:
      return {
        ...state,
        models: {
          isLoaded: true,
          isLoading: false,
          error: null,
        },
      };
    case ActionTypes.MODELS_LOAD_FAILURE:
      return {
        ...state,
        models: {
          isLoaded: false,
          isLoading: false,
          error: action.payload,
        },
      };
    case ActionTypes.DETECTION_START:
      return {
        ...state,
        detection: {
          ...state.detection,
          isProcessing: true,
          error: null,
        },
      };
    case ActionTypes.DETECTION_SUCCESS:
      return {
        ...state,
        detection: {
          faces: action.payload,
          isProcessing: false,
          error: null,
        },
      };
    case ActionTypes.DETECTION_FAILURE:
      return {
        ...state,
        detection: {
          ...state.detection,
          isProcessing: false,
          error: action.payload,
        },
      };
    case ActionTypes.DETECTION_CLEAR:
      return {
        ...state,
        detection: {
          faces: [],
          isProcessing: false,
          error: null,
        },
      };
    default:
      return state;
  }
}

// Create context
const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook for using the store
export const useStore = () => useContext(StoreContext);
