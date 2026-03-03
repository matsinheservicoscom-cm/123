
import { Video, News, Category, LiveStream, ScheduleItem } from './types';

export const TV_SCHEDULE: ScheduleItem[] = [
  { id: 's1', name: 'Na Rota do Amor', days: 'Domingo', time: '14h/16h' },
  { id: 's2', name: 'Ritmo de Manha', days: '2 a 6', time: '9h/11h' },
  { id: 's3', name: 'Ponto de Encontro', days: '2 a 6', time: '11:30/13h' },
  { id: 's4', name: 'Ao Volante da Verdade', days: 'Sabado', time: '17h/19h' },
  { id: 's5', name: 'Bate-Papo na Rua', days: 'Domingo', time: '16:30/19h' },
  { id: 's6', name: 'Conversa no Txopela', days: 'Sabado', time: '13:30/16h' },
  { id: 's7', name: 'Rota Informativa', days: '2 a 6', time: '19:30/21h' },
  { id: 's8', name: 'Olhar Urbano Cidade', days: '2 a 6', time: '17:30/19h' },
  { id: 's9', name: 'Txopela Beat', days: 'Sabado', time: '11:30/13h' },
  { id: 's10', name: 'Aventuras do Dia', days: '2 a 6', time: '15h/17h' },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Destaques da Rodada: Moçambola 2024',
    description: 'Confira os melhores momentos da última jornada do campeonato nacional.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/sports1/800/450',
    category: Category.SPORTS,
    views: 1240,
    publishedAt: '2024-05-20'
  },
  {
    id: '2',
    title: 'Entrevista Exclusiva: O Futuro da Tecnologia',
    description: 'Especialistas discutem o impacto da IA no mercado de trabalho moçambicano.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/tech1/800/450',
    category: Category.SHOWS,
    views: 850,
    publishedAt: '2024-05-19'
  },
  {
    id: '3',
    title: 'Notícias da Tarde: Clima e Economia',
    description: 'Resumo das principais notícias do dia em Maputo e no mundo.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/news1/800/450',
    category: Category.NEWS,
    views: 3200,
    publishedAt: '2024-05-21'
  },
  {
    id: '4',
    title: 'Cozinha Criativa: Sabores de Inhambane',
    description: 'Aprenda a fazer pratos tradicionais com um toque moderno.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/food1/800/450',
    category: Category.LIFESTYLE,
    views: 450,
    publishedAt: '2024-05-18'
  }
];

export const MOCK_NEWS: News[] = [
  {
    id: 'n1',
    title: 'Nova ponte em Maputo será inaugurada próxima semana',
    content: 'A infraestrutura promete reduzir o congestionamento em 40% nas horas de ponta...',
    image: 'https://picsum.photos/seed/bridge/800/600',
    author: 'Txopela News Team',
    date: '2024-05-21'
  },
  {
    id: 'n2',
    title: 'Moçambique atrai investimentos em energia solar',
    content: 'Novos projetos no norte do país visam expandir o acesso à eletricidade...',
    image: 'https://picsum.photos/seed/solar/800/600',
    author: 'Economia Hoje',
    date: '2024-05-20'
  }
];

export const MOCK_LIVE: LiveStream = {
  id: 'live1',
  status: 'online',
  streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  streamKey: 'tx_play_live_882194',
  rtmpServer: 'rtmp://stream.txopelatv.com/live',
  currentProgram: 'Jornal da Noite - Edição Especial',
  banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200'
};

export const FB_PAGE_URL = "https://web.facebook.com/Machonane";
