
export enum Category {
  NEWS = 'Notícias',
  SPORTS = 'Esportes',
  SHOWS = 'Programas',
  MOVIES = 'Filmes',
  LIFESTYLE = 'Estilo de Vida'
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: Category;
  author?: string; // Novo campo para Autoridade ou Fonte
  views: number;
  publishedAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  date: string;
}

export interface LiveStream {
  id: string;
  status: 'online' | 'offline';
  streamUrl: string;
  streamKey?: string;
  rtmpServer?: string;
  currentProgram: string;
  banner: string;
}

export interface ScheduleItem {
  id: string;
  name: string;
  days: string;
  time: string;
}

export interface AppState {
  videos: Video[];
  news: News[];
  live: LiveStream;
  schedule: ScheduleItem[];
  favorites: string[];
}

export type ViewMode = 'user' | 'admin';
export type UserTab = 'home' | 'live' | 'videos' | 'news';
