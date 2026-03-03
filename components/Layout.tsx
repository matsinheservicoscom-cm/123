
import React from 'react';
import { ViewMode, UserTab } from '../types';
import { 
  Home, 
  Radio, 
  Video, 
  Newspaper, 
  Facebook, 
  Youtube, 
  Instagram, 
  Lock, 
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  viewMode: ViewMode;
  onToggleView: () => void;
  activeTab: UserTab;
  onTabChange: (tab: UserTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, viewMode, onToggleView, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors duration-300 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onTabChange('home')}
        >
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
            <span className="font-bold text-xl">T</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">TxopelaTv</h1>
            <p className="text-[8px] text-red-500 font-bold uppercase tracking-tighter">O Seu Mundo em Movimento</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleView}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'admin' 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40'
            }`}
          >
            {viewMode === 'admin' ? <Users size={16} /> : <Lock size={16} />}
            <span className="hidden sm:inline">
              {viewMode === 'admin' ? 'Ver como Usuário' : 'Ir para Admin'}
            </span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-medium">1,240 Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        {/* Social Icons - Bottom Left */}
        <div className="fixed bottom-24 md:bottom-12 left-6 z-40 flex flex-col gap-4">
          <SocialIcon href="https://web.facebook.com/Machonane" icon={<Facebook size={20} />} color="bg-blue-600" label="Facebook" />
          <SocialIcon href="https://www.youtube.com/@TxopelaTv" icon={<Youtube size={20} />} color="bg-red-600" label="YouTube" />
          <SocialIcon href="https://www.instagram.com/TxopelaTv" icon={<Instagram size={20} />} color="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" label="Instagram" />
          <SocialIcon href="https://www.tiktok.com/@TxopelaTv" icon={<span className="font-black text-sm">d</span>} color="bg-black border border-slate-700" label="TikTok" />
        </div>
      </main>

      {/* Mobile Nav for User App */}
      {viewMode === 'user' && (
        <nav className="md:hidden sticky bottom-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 flex justify-around py-3">
          <NavItem 
            icon={<Home size={20} />} 
            label="Início" 
            active={activeTab === 'home'} 
            onClick={() => onTabChange('home')} 
          />
          <NavItem 
            icon={<Radio size={20} />} 
            label="Ao Vivo" 
            active={activeTab === 'live'} 
            onClick={() => onTabChange('live')} 
          />
          <NavItem 
            icon={<Video size={20} />} 
            label="Vídeos" 
            active={activeTab === 'videos'} 
            onClick={() => onTabChange('videos')} 
          />
          <NavItem 
            icon={<Newspaper size={20} />} 
            label="Notícias" 
            active={activeTab === 'news'} 
            onClick={() => onTabChange('news')} 
          />
        </nav>
      )}
    </div>
  );
};

const SocialIcon = ({ href, icon, color, label }: { href: string, icon: React.ReactNode, color: string, label: string }) => (
  <motion.a 
    whileHover={{ scale: 1.2, y: -4 }}
    whileTap={{ scale: 0.9 }}
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white shadow-xl transition-all ring-2 ring-white/10 hover:ring-white/30`}
    title={label}
  >
    {icon}
  </motion.a>
);

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-red-500 scale-110 font-bold' : 'text-slate-400 opacity-70'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);

export default Layout;
