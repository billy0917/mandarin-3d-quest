
import React from 'react';

// Augment global JSX (common in older TS/React or standard JSX setups)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
      'a-cursor': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-mixin': any;
      'a-sky': any;
      'a-plane': any;
      'a-box': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-cone': any;
      'a-text': any;
      'a-image': any;
      'a-ring': any;
      'a-circle': any;
      'a-animation': any;
      'a-torus': any;
      [elemName: string]: any;
    }
  }
  
  // Add global variable for Joystick communication
  interface Window {
    JOYSTICK_VECTOR: { x: number; y: number };
  }
}

// Augment React module (sometimes required depending on React types version)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
      'a-cursor': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-mixin': any;
      'a-sky': any;
      'a-plane': any;
      'a-box': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-cone': any;
      'a-text': any;
      'a-image': any;
      'a-ring': any;
      'a-circle': any;
      'a-animation': any;
      'a-torus': any;
      [elemName: string]: any;
    }
  }
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type ShapeType = 'sphere' | 'box' | 'cone' | 'cylinder' | 'torus';

export interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuizData {
  id: string;
  question: string;
  chineseChar: string;
  pinyin: string;
  shape: ShapeType;
  position: Vector3;
  options: [QuizOption, QuizOption];
}
