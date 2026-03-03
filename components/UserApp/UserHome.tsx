
import React, { useState } from 'react';
import { AppState, Category, UserTab, Video, News } from '../../types';
import VideoPlayer from '../VideoPlayer';

interface UserHomeProps {
  state: AppState;
  activeTab: UserTab;
  onPlayVideo: (id: string) => void;
  onOpenNews: (id: string) => void;
  onTabChange: (tab: UserTab) => void;
}

const UserHome: React.FC<UserHomeProps> = ({ state, activeTab, onPlayVideo, onOpenNews, onTabChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');

  const filteredVideos = selectedCategory === 'Todos' 
    ? state.videos 
    : state.videos.filter(v => v.category === selectedCategory);

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Live Hero - Condicional ao Status */}
      <section 
        className="relative h-64 md:h-[450px] rounded-2xl overflow-hidden group cursor-pointer border border-slate-800"
        onClick={() => onTabChange('live')}
      >
        <img 
          src={state.live.banner} 
          alt="Live Now" 
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${state.live.status === 'offline' ? 'grayscale opacity-50' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        
        {state.live.status === 'online' ? (
          <>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Ao Vivo</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-2 leading-tight">
                {state.live.currentProgram}
              </h2>
              <button className="bg-white text-slate-950 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                <span>▶</span> Assistir Agora
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <span className="text-2xl opacity-50">📡</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-300">Transmissão Offline</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Fique atento às nossas redes para a próxima live!</p>
          </div>
        )}
      </section>

      {/* Category Scroll */}
      <section className="no-scrollbar overflow-x-auto flex gap-3 pb-2">
        <button 
          onClick={() => setSelectedCategory('Todos')}
          className={`whitespace-nowrap px-6 py-2 border rounded-full text-sm font-medium transition-all ${
            selectedCategory === 'Todos' ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
          }`}
        >
          Todos
        </button>
        {Object.values(Category).map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-6 py-2 border rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Latest Videos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-1 h-6 bg-red-600 rounded-full"></span>
            {selectedCategory === 'Todos' ? 'Últimos Programas' : selectedCategory}
          </h3>
          <button onClick={() => onTabChange('videos')} className="text-sm text-red-500 font-medium">Ver tudo</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVideos.length > 0 ? filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={() => onPlayVideo(video.id)} />
          )) : (
            <div className="col-span-full py-10 text-center text-slate-500 italic">
              Nenhum vídeo encontrado nesta categoria.
            </div>
          )}
        </div>
      </section>

      {/* News Highlight */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Notícias em Destaque
          </h3>
          <button onClick={() => onTabChange('news')} className="text-sm text-blue-500 font-medium">Mais notícias</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.news.slice(0, 4).map((n) => (
            <NewsCard key={n.id} news={n} onClick={() => onOpenNews(n.id)} />
          ))}
        </div>
      </section>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-bold">Explorar Vídeos</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
        {['Todos', ...Object.values(Category)].map(c => (
           <button 
             key={c}
             onClick={() => setSelectedCategory(c as any)}
             className={`px-4 py-1.5 rounded-full text-sm font-medium border ${selectedCategory === c ? 'bg-red-600 border-red-600' : 'bg-slate-800 border-slate-700'}`}
           >
             {c}
           </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map(v => <VideoCard key={v.id} video={v} onPlay={() => onPlayVideo(v.id)} />)}
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-bold">Notícias Recentes</h2>
      <div className="grid grid-cols-1 gap-4">
        {state.news.map(n => <NewsCard key={n.id} news={n} onClick={() => onOpenNews(n.id)} />)}
      </div>
    </div>
  );

  const renderLive = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {state.live.status === 'online' ? (
        <div className="space-y-6">
          <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <VideoPlayer 
              url={state.live.streamUrl} 
              title={state.live.currentProgram} 
            />
            <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse z-10">AO VIVO</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-2">{state.live.currentProgram}</h2>
            <p className="text-slate-400">Emissão oficial TxopelaTv. Aproveite a melhor programação de Moçambique.</p>
            <div className="flex items-center gap-4 mt-6">
               <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700"></div>)}
               </div>
               <span className="text-sm text-slate-500 font-medium">Mais de 1.2k pessoas assistindo agora</span>
            </div>
          </div>

          {/* Grelha de Programação */}
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Grelha de Programação</h3>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 bg-slate-950 p-4 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <div className="col-span-6 pl-4">Nome do Programa</div>
                <div className="col-span-3 text-center">Dias</div>
                <div className="col-span-3 text-center">Hora</div>
              </div>
              <div className="divide-y divide-slate-800/50">
                {state.schedule.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 p-5 items-center hover:bg-slate-800/30 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="font-bold text-white text-sm md:text-base">{item.name}</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-xs md:text-sm text-slate-400 font-medium bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">{item.days}</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-xs md:text-sm font-black text-orange-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-orange-600/10 border border-orange-600/20 p-6 rounded-3xl flex items-center gap-6">
              <div className="text-3xl">💡</div>
              <p className="text-xs md:text-sm text-orange-200 leading-relaxed font-medium">
                A nossa programação é atualizada semanalmente. Fique atento aos horários para não perder os seus programas favoritos na TxopelaTv!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] p-12 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-slate-800">
              <span className="text-4xl grayscale opacity-30">📡</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Sinal Fora do Ar</h2>
            <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
              Neste momento não estamos transmitindo sinal ao vivo. Explore nossos vídeos gravados e notícias!
            </p>
            <button 
              onClick={() => onTabChange('home')}
              className="mt-8 bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all active:scale-95"
            >
              VOLTAR AO INÍCIO
            </button>
          </div>

          {/* Grelha de Programação mesmo quando offline */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Grelha de Programação</h3>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 bg-slate-950 p-4 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <div className="col-span-6 pl-4">Nome do Programa</div>
                <div className="col-span-3 text-center">Dias</div>
                <div className="col-span-3 text-center">Hora</div>
              </div>
              <div className="divide-y divide-slate-800/50">
                {state.schedule.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 p-5 items-center hover:bg-slate-800/30 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="font-bold text-white text-sm md:text-base">{item.name}</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-xs md:text-sm text-slate-400 font-medium bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">{item.days}</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-xs md:text-sm font-black text-orange-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24 max-w-7xl mx-auto">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'videos' && renderVideos()}
      {activeTab === 'news' && renderNews()}
      {activeTab === 'live' && renderLive()}
    </div>
  );
};

const VideoCard: React.FC<{ video: Video, onPlay: () => void }> = ({ video, onPlay }) => (
  <div className="group cursor-pointer space-y-3" onClick={onPlay}>
    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
      <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl">▶</div>
      </div>
    </div>
    <div>
      <h4 className="font-bold line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">{video.title}</h4>
      <p className="text-xs text-slate-500 mt-1">{video.views} visualizações • {video.category}</p>
    </div>
  </div>
);

const NewsCard: React.FC<{ news: News, onClick: () => void }> = ({ news, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 p-4 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
  >
    <div className="w-full md:w-48 h-32 overflow-hidden rounded-xl">
      <img src={news.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <p className="text-[10px] text-blue-500 font-bold uppercase mb-1 tracking-wider">{news.author}</p>
      <h4 className="text-lg font-bold mb-2 leading-tight group-hover:text-blue-400 transition-colors">{news.title}</h4>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{news.content}</p>
      <p className="text-[10px] text-slate-500 mt-3 font-medium">{news.date}</p>
    </div>
  </div>
);

export default UserHome;
