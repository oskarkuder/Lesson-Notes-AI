
export interface User {
  id: number;
  username: string;
  plan: 'free' | 'pro';
  googleId?: string;
}

export interface NoteData {
  id?: number;
  userId: number;
  title: string;
  summary: string;
  keyTopics: {
    topic: string;
    points: string[];
  }[];
  transcription: string;
  createdAt?: number;
}

export enum Status {
  LOADING = 'LOADING',
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY',
  AUTH = 'AUTH',
  PRICING = 'PRICING',
  CHECKOUT = 'CHECKOUT',
}

export type AppState = 
  | { status: Status.LOADING }
  | { status: Status.IDLE }
  | { status: Status.RECORDING }
  | { status: Status.GENERATING }
  | { status: Status.SUCCESS, note: NoteData }
  | { status: Status.HISTORY }
  | { status: Status.ERROR }
  | { status: Status.AUTH }
  | { status: Status.PRICING }
  | { status: Status.CHECKOUT };