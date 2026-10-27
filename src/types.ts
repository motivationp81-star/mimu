export type StudioCategory = 'general' | 'video' | 'music' | 'task' | 'ideas';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  category?: StudioCategory;
  isStreaming?: boolean;
  error?: boolean;
}

export interface VideoPromptParams {
  scene: string;
  camera: string;
  style: string;
  lighting: string;
  platform: string;
}

export interface MusicPromptParams {
  genre: string;
  mood: string;
  bpm: string;
  topic: string;
}

export interface TaskParams {
  task: string;
  timeAvailable: string;
  priority: string;
}
