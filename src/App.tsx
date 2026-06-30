import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceProvider } from './context/VoiceContext';
import { ChatProvider } from './context/ChatContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { ChatContainer } from './components/Chat/ChatContainer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout: React.FC = () => {
  const { user, loading, loginGuest } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Avatar Customization States
  const [hairColor, setHairColor] = useState(() => {
    return localStorage.getItem('aira_hair_color') || '#a855f7';
  });
  const [eyeColor, setEyeColor] = useState(() => {
    return localStorage.getItem('aira_eye_color') || '#06b6d4';
  });

  // Save color customization updates
  useEffect(() => {
    localStorage.setItem('aira_hair_color', hairColor);
    localStorage.setItem('aira_eye_color', eyeColor);
  }, [hairColor, eyeColor]);

  // Adjust sidebar automatically on resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // run on initial mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0f19] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 mb-4"
        />
        <p className="text-sm font-semibold tracking-wider text-indigo-300">BOOTING AIRA CORE ENGINE...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex overflow-hidden relative">
      
      {/* 1. Glassmorphic Sidebar (Drawer-style on mobile) */}
      <div className={`
        fixed md:relative top-0 bottom-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          onOpenAuth={() => setIsAuthOpen(true)} 
        />
      </div>

      {/* Sidebar background drawer overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-25 md:hidden"
        />
      )}

      {/* 2. Main Interface Console */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        {user ? (
          <ChatContainer 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            hairColor={hairColor}
            eyeColor={eyeColor}
          />
        ) : (
          /* Landing/Welcome Screen for Guest/Non-Authenticated users */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
            {/* Glowing Aura Spheres */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl" />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-primary-text max-w-lg leading-tight">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Aira AI</span>
            </h2>
            
            <p className="text-sm text-primary-text/60 mt-3 max-w-md leading-relaxed">
              Your futuristic 2D animated AI virtual girl companion. Combining multimodal intelligence, emotional reactions, customizable styles, and speech integration.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <User className="w-4 h-4" />
                Get Started
              </button>
              <button
                onClick={() => {
                  // Instant guest login shortcut
                  loginGuest('Companion');
                }}
                className="w-full py-3 px-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 text-primary-text font-bold text-sm transition-all duration-300 hover:bg-white/10"
              >
                Guest Quick-start
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Settings Dashboard Modal Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            hairColor={hairColor}
            setHairColor={setHairColor}
            eyeColor={eyeColor}
            setEyeColor={setEyeColor}
          />
        )}
      </AnimatePresence>

      {/* 4. Credentials Authentication Overlay */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <VoiceProvider>
          <ChatProvider>
            <MainLayout />
          </ChatProvider>
        </VoiceProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
