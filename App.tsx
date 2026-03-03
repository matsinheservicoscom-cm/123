
import React, { useState, useEffect } from 'react';
import { AppState, ViewMode, UserTab } from './types';
import { MOCK_VIDEOS, MOCK_NEWS, MOCK_LIVE, FB_PAGE_URL, TV_SCHEDULE } from './constants';
import Layout from './components/Layout';
import UserHome from './components/UserApp/UserHome';
import AdminDashboard from './components/Admin/AdminDashboard';
import VideoPlayer from './components/VideoPlayer';
import { geminiService } from './services/geminiService';

const ADMIN_CODE = "TxopelaTv989827";

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [activeUserTab, setActiveUserTab] = useState<UserTab>('home');
  const [appState, setAppState] = useState<AppState>({
    videos: MOCK_VIDEOS,
    news: MOCK_NEWS,
    live: MOCK_LIVE,
    schedule: TV_SCHEDULE,
    favorites: []
  });
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  
  // Admin Auth States
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState(false);

  // Persistence simulation
  useEffect(() => {
    const saved = localStorage.getItem('txopela_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Always prioritize the hardcoded schedule for now as per user request
        setAppState({
          ...parsed,
          schedule: TV_SCHEDULE
        });
      } catch (e) {
        console.error("Failed to parse saved state");
      }
    }
  }, []);

  // Automatic Facebook Live Sync
  useEffect(() => {
    const checkLive = async () => {
      const liveStatus = await geminiService.checkFacebookLiveStatus(FB_PAGE_URL);
      if (liveStatus) {
        setAppState(prev => {
          const newState = {
            ...prev,
            live: {
              ...prev.live,
              status: liveStatus.isLive ? 'online' : 'offline',
              currentProgram: liveStatus.isLive ? liveStatus.currentProgram : prev.live.currentProgram,
              streamUrl: liveStatus.isLive ? liveStatus.streamUrl : prev.live.streamUrl
            }
          };
          localStorage.setItem('txopela_state', JSON.stringify(newState));
          return newState;
        });
      }
    };

    // Check on mount and every 3 minutes
    checkLive();
    const interval = setInterval(checkLive, 180000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateState = (newState: AppState) => {
    setAppState(newState);
    localStorage.setItem('txopela_state', JSON.stringify(newState));
  };

  const currentVideo = selectedVideoId 
    ? appState.videos.find(v => v.id === selectedVideoId) 
    : null;

  const currentNews = selectedNewsId
    ? appState.news.find(n => n.id === selectedNewsId)
    : null;

  const handleTabChange = (tab: UserTab) => {
    setActiveUserTab(tab);
    setSelectedVideoId(null);
    setSelectedNewsId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleView = () => {
    if (viewMode === 'admin') {
      setViewMode('user');
    } else {
      setShowAdminAuth(true);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode === ADMIN_CODE) {
      setViewMode('admin');
      setShowAdminAuth(false);
      setAuthCode("");
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  return (
    <Layout 
      viewMode={viewMode} 
      onToggleView={handleToggleView}
      activeTab={activeUserTab}
      onTabChange={handleTabChange}
    >
      {/* Admin Authentication Overlay */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
            
            <button 
              onClick={() => { setShowAdminAuth(false); setAuthCode(""); setAuthError(false); }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-600/20">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="text-2xl font-black text-white">Acesso Restrito</h2>
              <p className="text-sm text-slate-400">Insira o código de verificação para gerenciar a TxopelaTv.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <input 
                  autoFocus
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Código de Verificação"
                  className={`w-full bg-slate-950 border ${authError ? 'border-red-500 animate-shake' : 'border-slate-700'} rounded-2xl px-5 py-4 text-center text-lg font-mono tracking-[0.5em] focus:border-red-500 outline-none transition-all placeholder:tracking-normal placeholder:text-sm`}
                />
                {authError && (
                  <p className="text-[10px] text-red-500 font-bold uppercase text-center animate-bounce">Código Incorreto</p>
                )}
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-95"
              >
                AUTENTICAR
              </button>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'user' ? (
        <div className="relative h-full">
          {/* Video Modal */}
          {currentVideo && (
            <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Transmitindo agora</span>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{currentVideo.title}</h3>
                </div>
                <button onClick={() => setSelectedVideoId(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-red-600 text-white transition-all shadow-lg active:scale-90">
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <div className="w-full aspect-video bg-black shadow-2xl flex-shrink-0">
                <VideoPlayer url={currentVideo.url} title={currentVideo.title} autoPlay={true} />
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-950 no-scrollbar pb-24">
                <div className="p-5 md:p-8 space-y-6 max-w-4xl mx-auto">
                  <div className="space-y-2">
                    <h1 className="text-xl md:text-3xl font-black text-white leading-tight">{currentVideo.title}</h1>
                    {currentVideo.author && (
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{currentVideo.author}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                    <span className="bg-red-600 px-3 py-1 rounded-md font-bold uppercase tracking-wider">{currentVideo.category}</span>
                    <span className="text-slate-400 font-medium">{currentVideo.views.toLocaleString()} visualizações</span>
                  </div>
                  
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/50">
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{currentVideo.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* News Modal */}
          {currentNews && (
            <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto no-scrollbar">
              <div className="relative w-full h-64 md:h-[500px] flex-shrink-0">
                <img src={currentNews.image} className="w-full h-full object-cover" alt={currentNews.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Informação Txopela</span>
                  <button onClick={() => setSelectedNewsId(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-600 text-white backdrop-blur-xl transition-all shadow-2xl border border-white/20 active:scale-90">
                    <span className="text-2xl font-light">✕</span>
                  </button>
                </div>
                <div className="absolute bottom-6 left-6 right-6 max-w-4xl mx-auto">
                   <div className="flex items-center gap-3 text-slate-300 text-xs font-bold uppercase mb-3 tracking-widest">
                     <span className="text-blue-500">Publicado em:</span>
                     <span>{currentNews.date}</span>
                   </div>
                   <h1 className="text-2xl md:text-5xl font-black leading-tight text-white drop-shadow-2xl">{currentNews.title}</h1>
                </div>
              </div>
              <article className="max-w-4xl mx-auto w-full p-6 md:p-12 space-y-10 pb-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">{currentNews.author.charAt(0)}</div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black">Escrito por</p>
                      <h4 className="font-bold text-white">{currentNews.author}</h4>
                    </div>
                  </div>
                </div>
                <div className="text-slate-300 text-lg md:text-xl leading-relaxed space-y-8 whitespace-pre-wrap font-light antialiased">{currentNews.content}</div>
              </article>
            </div>
          )}
          
          <UserHome 
            state={appState} 
            activeTab={activeUserTab}
            onPlayVideo={(id) => setSelectedVideoId(id)}
            onOpenNews={(id) => setSelectedNewsId(id)}
            onTabChange={handleTabChange}
          />
        </div>
      ) : (
        <AdminDashboard 
          state={appState} 
          onUpdateState={handleUpdateState} 
        />
      )}
    </Layout>
  );
};

export default App;
