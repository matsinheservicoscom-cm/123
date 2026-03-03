
import React, { useState, useEffect } from 'react';
import { AppState, Category, Video, News, LiveStream } from '../../types';
import { geminiService } from '../../services/geminiService';
import { FB_PAGE_URL } from '../../constants';

interface AdminDashboardProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

// Sub-components defined before use to avoid hoisting issues with strict type checking
const AdminNavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${
      active ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className="text-xl">{icon}</span>
    {label}
  </button>
);

const StatCard = ({ label, value, icon, color, onClick }: { label: string, value: any, icon: string, color: string, onClick?: () => void }) => {
  const colors: any = { 
    red: 'bg-red-500/10 text-red-500', 
    blue: 'bg-blue-500/10 text-blue-500', 
    green: 'bg-green-500/10 text-green-500',
    slate: 'bg-slate-500/10 text-slate-500'
  };
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex items-center gap-6 shadow-xl transition-all ${onClick ? 'cursor-pointer hover:border-red-600/50 hover:bg-slate-800/50 group' : ''}`}
    >
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl transition-transform ${onClick ? 'group-hover:scale-110' : ''} ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-3xl font-black mt-1">{value}</h3>
      </div>
    </div>
  );
};

const MaintenanceButton = ({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) => (
  <button onClick={onClick} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl text-left group hover:border-red-600/50 transition-all">
    <p className="font-bold group-hover:text-red-500 transition-colors">{title}</p>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </button>
);

// Fixed: Added optional children to the type definition to resolve the error "Property 'children' is missing" 
const FormGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{label}</label>
    {children}
  </div>
);

const FilePicker = ({ onFileSelect, currentFile, label, accept = "image/*" }: { onFileSelect: (base64: string) => void, currentFile?: string, label: string, accept?: string }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isVideo = currentFile?.startsWith('data:video');

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{label}</label>
      <div className="relative group">
        <div className={`w-full aspect-video rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-red-600/50 ${currentFile ? 'border-solid' : ''}`}>
          {currentFile ? (
            isVideo ? (
              <video src={currentFile} className="w-full h-full object-cover" controls />
            ) : (
              <img src={currentFile} className="w-full h-full object-cover" alt="Preview" />
            )
          ) : (
            <div className="text-center p-6">
              <span className="text-4xl mb-2 block">{accept.includes('video') ? '🎥' : '🖼️'}</span>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arraste ou clique para carregar</p>
              <p className="text-[10px] text-slate-600 mt-1">{accept.includes('video') ? 'MP4, WebM ou OGG' : 'PNG, JPG ou WEBP'}</p>
            </div>
          )}
          <input 
            type="file" 
            accept={accept} 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        {currentFile && (
          <button 
            onClick={(e) => { e.preventDefault(); onFileSelect(''); }}
            className="absolute top-4 right-4 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'news' | 'live' | 'stats' | 'social'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // States for Video Management
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [vTitle, setVTitle] = useState('');
  const [vAuthor, setVAuthor] = useState('');
  const [vCategory, setVCategory] = useState<Category>(Category.SHOWS);
  const [vUrl, setVUrl] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vThumb, setVThumb] = useState('');

  // States for News Management
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [nTitle, setNTitle] = useState('');
  const [nAuthor, setNAuthor] = useState('');
  const [nContent, setNContent] = useState('');
  const [nImage, setNImage] = useState('');

  // States for Live Control
  const [liveTitle, setLiveTitle] = useState(state.live.currentProgram);
  const [liveStreamUrl, setLiveStreamUrl] = useState(state.live.streamUrl);
  const [liveRTMP, setLiveRTMP] = useState(state.live.rtmpServer || '');
  const [liveKey, setLiveKey] = useState(state.live.streamKey || '');
  const [liveBanner, setLiveBanner] = useState(state.live.banner);
  const [saveStatus, setSaveStatus] = useState(false);

  // Sync state helpers
  useEffect(() => {
    setLiveTitle(state.live.currentProgram);
    setLiveStreamUrl(state.live.streamUrl);
    setLiveRTMP(state.live.rtmpServer || '');
    setLiveKey(state.live.streamKey || '');
    setLiveBanner(state.live.banner);
  }, [state.live]);

  // Filters
  const filteredVideos = state.videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNews = state.news.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ACTIONS
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideo) {
      const updatedVideos = state.videos.map(v => 
        v.id === editingVideo.id 
          ? { ...v, title: vTitle, author: vAuthor, category: vCategory, url: vUrl, description: vDesc, thumbnail: vThumb } 
          : v
      );
      onUpdateState({ ...state, videos: updatedVideos });
      setEditingVideo(null);
    } else {
      const newVideo: Video = {
        id: Date.now().toString(),
        title: vTitle,
        author: vAuthor,
        category: vCategory,
        url: vUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: vDesc,
        thumbnail: vThumb || `https://picsum.photos/seed/${Date.now()}/800/450`,
        views: 0,
        publishedAt: new Date().toISOString().split('T')[0]
      };
      onUpdateState({ ...state, videos: [newVideo, ...state.videos] });
    }
    setIsAddingVideo(false);
    // Reset fields
    setVTitle(''); setVAuthor(''); setVUrl(''); setVDesc(''); setVThumb('');
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVTitle(video.title);
    setVAuthor(video.author || '');
    setVCategory(video.category);
    setVUrl(video.url);
    setVDesc(video.description);
    setVThumb(video.thumbnail);
    setIsAddingVideo(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews) {
      const updatedNews = state.news.map(n => 
        n.id === editingNews.id 
          ? { ...n, title: nTitle, author: nAuthor, content: nContent, image: nImage } 
          : n
      );
      onUpdateState({ ...state, news: updatedNews });
      setEditingNews(null);
    } else {
      const newNewsItem: News = {
        id: 'n' + Date.now().toString(),
        title: nTitle,
        author: nAuthor,
        content: nContent,
        image: nImage || `https://picsum.photos/seed/news${Date.now()}/800/600`,
        date: new Date().toLocaleDateString('pt-MZ')
      };
      onUpdateState({ ...state, news: [newNewsItem, ...state.news] });
    }
    setIsAddingNews(false);
    setNTitle(''); setNAuthor(''); setNContent(''); setNImage('');
  };

  const handleEditNews = (news: News) => {
    setEditingNews(news);
    setNTitle(news.title);
    setNAuthor(news.author);
    setNContent(news.content);
    setNImage(news.image);
    setIsAddingNews(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLiveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      ...state,
      live: {
        ...state.live,
        currentProgram: liveTitle,
        streamUrl: liveStreamUrl,
        rtmpServer: liveRTMP,
        streamKey: liveKey,
        banner: liveBanner
      }
    });
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleToggleLiveStatus = () => {
    onUpdateState({
      ...state,
      live: { ...state.live, status: state.live.status === 'online' ? 'offline' : 'online' }
    });
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm("Deseja ELIMINAR este vídeo definitivamente?")) {
      const updatedVideos = state.videos.filter(v => v.id !== id);
      onUpdateState({ ...state, videos: updatedVideos });
      alert("Vídeo removido com sucesso!");
    }
  };

  const handleDeleteNews = (id: string) => {
    if (window.confirm("Deseja ELIMINAR esta notícia definitivamente?")) {
      const updatedNews = state.news.filter(n => n.id !== id);
      onUpdateState({ ...state, news: updatedNews });
      alert("Notícia removida com sucesso!");
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col flex-shrink-0">
        <div className="p-8 space-y-10">
          <div>
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Administração</h2>
            <nav className="space-y-1">
              <AdminNavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon="📊" label="Painel Geral" />
              <AdminNavItem active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon="🔴" label="Controle Sinal TV" />
              <AdminNavItem active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon="📽️" label="Adicionar Vídeos" />
              <AdminNavItem active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon="📰" label="Adicionar Notícias" />
              <AdminNavItem active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon="🔗" label="Facebook Sync" />
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 pb-32">
        
        {/* Global Search Bar */}
        {(activeTab === 'videos' || activeTab === 'news') && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative max-w-2xl">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input 
                type="text" 
                placeholder="Pesquisar no acervo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-red-600 outline-none transition-all shadow-xl"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Painel Executivo</h1>
              <p className="text-slate-500 mt-2">Gestão centralizada da plataforma TxopelaTv.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Acervo de Vídeos" value={state.videos.length} icon="🎬" color="red" onClick={() => setActiveTab('videos')} />
              <StatCard label="Artigos no Portal" value={state.news.length} icon="📰" color="blue" onClick={() => setActiveTab('news')} />
              <StatCard label="Estado do Sinal" value={state.live.status === 'online' ? 'NO AR' : 'OFFLINE'} icon="📡" color={state.live.status === 'online' ? 'green' : 'slate'} onClick={() => setActiveTab('live')} />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">⚡ Ações Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MaintenanceButton 
                   title="+ Adicionar Novo Vídeo" 
                   desc="Abre o formulário de publicação de vídeo imediatamente." 
                   onClick={() => { setActiveTab('videos'); setIsAddingVideo(true); setEditingVideo(null); }}
                />
                <MaintenanceButton 
                   title="+ Publicar Nova Notícia" 
                   desc="Abre o redator de notícias para uma nova matéria." 
                   onClick={() => { setActiveTab('news'); setIsAddingNews(true); setEditingNews(null); }}
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-400">⚙️ Ferramentas de Manutenção</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MaintenanceButton 
                   title="Limpar Catálogo" 
                   desc="Apaga todos os vídeos e redefini o acervo." 
                   onClick={() => {
                     if (window.confirm("Deseja apagar TODOS os vídeos? Esta ação não pode ser desfeita.")) {
                       onUpdateState({...state, videos: []});
                       alert("Catálogo limpo!");
                     }
                   }}
                />
                <MaintenanceButton 
                   title="Limpar Notícias" 
                   desc="Remove todos os artigos do portal imediatamente." 
                   onClick={() => {
                     if (window.confirm("Deseja apagar TODAS as notícias? Esta ação não pode ser desfeita.")) {
                       onUpdateState({...state, news: []});
                       alert("Portal de notícias limpo!");
                     }
                   }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-black">Configuração de Sinal</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FB Sync Ativo</span>
                  </div>
                  <button 
                    onClick={handleToggleLiveStatus}
                    className={`px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-xl ${
                      state.live.status === 'online' 
                        ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' 
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {state.live.status === 'online' ? '🔴 SINAL ONLINE' : '⚪ SINAL OFFLINE'}
                  </button>
                </div>
             </div>

             <form onSubmit={handleSaveLiveConfig} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Título do Programa">
                    <input required value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} className="admin-input" placeholder="Ex: Jornal da Noite" />
                  </FormGroup>
                  <FormGroup label="URL de Transmissão (Público)">
                    <input required value={liveStreamUrl} onChange={(e) => setLiveStreamUrl(e.target.value)} className="admin-input" placeholder="URL para o player" />
                  </FormGroup>
                  <FormGroup label="Servidor RTMP">
                    <input value={liveRTMP} onChange={(e) => setLiveRTMP(e.target.value)} className="admin-input font-mono text-xs" placeholder="rtmp://..." />
                  </FormGroup>
                  <FormGroup label="Chave de Fluxo">
                    <input value={liveKey} onChange={(e) => setLiveKey(e.target.value)} type="password" className="admin-input font-mono text-xs" placeholder="Chave secreta" />
                  </FormGroup>
                  <div className="md:col-span-2">
                    <FormGroup label="Banner da Live (Link da Imagem)">
                      <input value={liveBanner} onChange={(e) => setLiveBanner(e.target.value)} className="admin-input" placeholder="URL da imagem de fundo" />
                    </FormGroup>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button type="submit" className={`px-10 py-3 rounded-2xl font-black text-xs transition-all ${saveStatus ? 'bg-green-600' : 'bg-red-600 hover:scale-105 shadow-xl shadow-red-900/20'}`}>
                    {saveStatus ? 'CONFIGURAÇÕES SALVAS! ✓' : 'ATUALIZAR SINAL'}
                  </button>
                </div>
             </form>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">Gerir Acervo de Vídeos</h2>
              <button 
                onClick={() => {
                  setIsAddingVideo(!isAddingVideo);
                  if (editingVideo) {
                    setEditingVideo(null);
                    setVTitle(''); setVAuthor(''); setVUrl(''); setVDesc(''); setVThumb('');
                  }
                }}
                className={`px-8 py-3 rounded-2xl font-black text-xs shadow-xl transition-all ${isAddingVideo ? 'bg-slate-800 text-white' : 'bg-red-600 hover:bg-red-500'}`}
              >
                {isAddingVideo ? 'CANCELAR' : '+ ADICIONAR VÍDEO'}
              </button>
            </div>

            {isAddingVideo && (
              <form onSubmit={handleAddVideo} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                  <h3 className="text-xl font-bold text-red-500">{editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preencha os dados abaixo</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-6">
                    <FilePicker 
                      label="Arquivo de Vídeo (MP4/WebM)" 
                      currentFile={vUrl} 
                      onFileSelect={setVUrl} 
                      accept="video/*"
                    />
                    <FilePicker 
                      label="Capa do Vídeo (Opcional)" 
                      currentFile={vThumb} 
                      onFileSelect={setVThumb} 
                      accept="image/*"
                    />
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Dica de Upload</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Você pode carregar o arquivo de vídeo diretamente ou colar um link do YouTube abaixo.</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup label="Título do Vídeo">
                        <input required value={vTitle} onChange={(e) => setVTitle(e.target.value)} className="admin-input" placeholder="Título atraente" />
                      </FormGroup>
                      <FormGroup label="Autor / Fonte">
                        <input required value={vAuthor} onChange={(e) => setVAuthor(e.target.value)} className="admin-input" placeholder="Ex: Machonane News" />
                      </FormGroup>
                      <FormGroup label="Categoria">
                        <select value={vCategory} onChange={(e) => setVCategory(e.target.value as Category)} className="admin-input">
                          {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </FormGroup>
                      <FormGroup label="Link do Vídeo (YouTube/URL Externa)">
                        <input value={vUrl.startsWith('data:') ? '' : vUrl} onChange={(e) => setVUrl(e.target.value)} className="admin-input" placeholder="Ou cole o link aqui..." />
                      </FormGroup>
                    </div>
                    <FormGroup label="Descrição Completa">
                      <textarea required rows={4} value={vDesc} onChange={(e) => setVDesc(e.target.value)} className="admin-input resize-none" placeholder="Detalhes do conteúdo..." />
                    </FormGroup>
                    
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="bg-red-600 px-12 py-4 rounded-2xl font-black text-xs hover:scale-105 shadow-xl transition-all uppercase tracking-widest">
                        {editingVideo ? 'Salvar Alterações' : 'Publicar Agora'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(v => (
                <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group relative">
                  <img src={v.thumbnail} className="w-full aspect-video object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button onClick={() => handleEditVideo(v)} className="bg-blue-600 p-3 rounded-xl shadow-2xl hover:scale-110 transition-all">✏️</button>
                     <button onClick={() => handleDeleteVideo(v.id)} className="bg-red-600 p-3 rounded-xl shadow-2xl hover:scale-110 transition-all">🗑️</button>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{v.category}</span>
                    <h4 className="font-bold text-sm mt-1 truncate">{v.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">{v.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-blue-500">Portal de Notícias</h2>
              <button 
                onClick={() => {
                  setIsAddingNews(!isAddingNews);
                  if (editingNews) {
                    setEditingNews(null);
                    setNTitle(''); setNAuthor(''); setNContent(''); setNImage('');
                  }
                }}
                className={`px-8 py-3 rounded-2xl font-black text-xs shadow-xl transition-all ${isAddingNews ? 'bg-slate-800 text-white' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {isAddingNews ? 'CANCELAR' : '+ NOVA NOTÍCIA'}
              </button>
            </div>

            {isAddingNews && (
              <form onSubmit={handleAddNews} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                  <h3 className="text-xl font-bold text-blue-500">{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Portal de Informação</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-6">
                    <FilePicker 
                      label="Imagem de Capa da Notícia" 
                      currentFile={nImage} 
                      onFileSelect={setNImage} 
                      accept="image/*"
                    />
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Padrão Editorial</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Imagens de alta resolução ajudam no engajamento dos leitores do portal.</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup label="Título da Matéria">
                        <input required value={nTitle} onChange={(e) => setNTitle(e.target.value)} className="admin-input" placeholder="Título impactante" />
                      </FormGroup>
                      <FormGroup label="Redator / Fonte">
                        <input required value={nAuthor} onChange={(e) => setNAuthor(e.target.value)} className="admin-input" placeholder="Quem escreveu?" />
                      </FormGroup>
                    </div>
                    <FormGroup label="Conteúdo da Notícia">
                      <textarea required rows={12} value={nContent} onChange={(e) => setNContent(e.target.value)} className="admin-input resize-none leading-relaxed" placeholder="Escreva a notícia detalhadamente..." />
                    </FormGroup>
                    
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="bg-blue-600 px-12 py-4 rounded-2xl font-black text-xs hover:scale-105 shadow-xl transition-all uppercase tracking-widest">
                        {editingNews ? 'Salvar Alterações' : 'Lançar Notícia'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {filteredNews.map(n => (
                <div key={n.id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <img src={n.image} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shadow-xl" />
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{n.title}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase mt-1">{n.author} • {n.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditNews(n)} className="bg-blue-600/10 text-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-[0.1em]">EDITAR</button>
                    <button onClick={() => handleDeleteNews(n.id)} className="bg-red-600/10 text-red-500 px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.1em]">ELIMINAR</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-orange-500">Sincronização Facebook</h2>
                <p className="text-slate-500 mt-2">Importe conteúdos automaticamente da página oficial.</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 px-2">Página:</span>
                <code className="text-[10px] bg-slate-950 px-3 py-1 rounded-lg text-orange-400 font-mono">{FB_PAGE_URL}</code>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full"></div>
               
               <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl transition-all duration-1000 ${isSyncing ? 'bg-orange-600 animate-spin' : 'bg-slate-800'}`}>
                    {isSyncing ? '⏳' : '🔗'}
                  </div>
                  
                  <div className="max-w-md space-y-4">
                    <h3 className="text-2xl font-black">Sincronizar com Machonane</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Ao clicar no botão abaixo, a inteligência artificial da TxopelaTv irá analisar as publicações mais recentes no Facebook e criar automaticamente novos vídeos e notícias para o seu portal.
                    </p>
                  </div>

                  <button 
                    disabled={isSyncing}
                    onClick={async () => {
                      setIsSyncing(true);
                      const result = await geminiService.syncFacebookContent(FB_PAGE_URL);
                      if (result) {
                        onUpdateState({
                          ...state,
                          videos: [...result.videos, ...state.videos],
                          news: [...result.news, ...state.news]
                        });
                        alert("Sincronização concluída com sucesso! Novos conteúdos adicionados.");
                        setActiveTab('stats');
                      } else {
                        alert("Falha na sincronização. Verifique sua conexão ou tente novamente mais tarde.");
                      }
                      setIsSyncing(false);
                    }}
                    className={`px-12 py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all shadow-2xl ${
                      isSyncing 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-orange-600 hover:bg-orange-500 hover:scale-105 active:scale-95 shadow-orange-900/20'
                    }`}
                  >
                    {isSyncing ? 'SINCRONIZANDO...' : 'INICIAR SINCRONIZAÇÃO AGORA'}
                  </button>
                  
                  {isSyncing && (
                    <p className="text-[10px] font-black text-orange-500 animate-pulse uppercase tracking-[0.3em]">
                      A ler dados do Facebook e a gerar conteúdos...
                    </p>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">O que é sincronizado?</h4>
                <ul className="space-y-3">
                  {['Eventos e Festas', 'Notícias Locais', 'Vídeos de Entretenimento', 'Destaques de Estilo de Vida'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="text-orange-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Como funciona?</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Utilizamos a tecnologia Gemini para extrair o contexto das publicações e transformar posts simples em conteúdo rico para a sua plataforma de TV, incluindo descrições otimizadas e categorização inteligente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CSS Personalizado Embutido via Injeção do Estilo Global no index.html */}
        <style>{`
          .admin-input {
            width: 100%;
            background-color: #020617;
            border: 1px solid #1e293b;
            border-radius: 1rem;
            padding: 0.875rem 1.25rem;
            font-size: 0.875rem;
            color: white;
            outline: none;
            transition: all 0.2s;
          }
          .admin-input:focus {
            border-color: #ef4444;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }
          .admin-input::placeholder {
            color: #475569;
          }
        `}</style>

      </div>
    </div>
  );
};

export default AdminDashboard;
