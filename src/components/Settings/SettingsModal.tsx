import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemePreset, FontSizePreset } from '../../context/ThemeContext';
import { useVoice } from '../../context/VoiceContext';
import { X, Sliders, Volume2, Monitor, Eye, Database, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hairColor: string;
  setHairColor: (color: string) => void;
  eyeColor: string;
  setEyeColor: (color: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  hairColor,
  setHairColor,
  eyeColor,
  setEyeColor
}) => {
  const { 
    theme, setThemePreset, darkMode, toggleDarkMode, 
    fontSize, setFontSizePreset, highContrast, toggleHighContrast 
  } = useTheme();

  const {
    speechEnabled, setSpeechEnabled, voices, 
    selectedVoiceName, setSelectedVoiceName, 
    speechRate, setSpeechRate
  } = useVoice();

  if (!isOpen) return null;

  const themePresets: { id: ThemePreset; name: string; class: string }[] = [
    { id: 'indigo', name: 'Indigo Aura', class: 'bg-indigo-500' },
    { id: 'cyber', name: 'Cyber Neon', class: 'bg-cyan-500' },
    { id: 'sakura', name: 'Sakura Blush', class: 'bg-pink-500' },
    { id: 'emerald', name: 'Forest Emerald', class: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-primary-text">Companion Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-primary-text/60 hover:text-primary-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Panel */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* 1. Theme Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs">
              <Monitor className="w-4 h-4" />
              <span>Display & Theme</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Preset selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60">Color Scheme</label>
                <div className="flex gap-2.5">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setThemePreset(preset.id)}
                      className={`w-7 h-7 rounded-full ${preset.class} transition-all duration-300 border-2 ${
                        theme === preset.id ? 'border-primary-text scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Dark mode toggle */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-xs text-primary-text/60">Appearance Mode</label>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-primary-text text-xs font-semibold transition-all duration-300"
                >
                  <span className="flex items-center gap-1.5">
                    {darkMode ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                    {darkMode ? 'Dark Cyber' : 'Light Crystal'}
                  </span>
                  <span className="text-[10px] uppercase text-indigo-300/40 font-bold">Toggle</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Avatar Customization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs">
              <Eye className="w-4 h-4" />
              <span>Customize Avatar</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60 flex items-center gap-1.5">
                  Hair Tint
                  <span className="w-3 h-3 rounded border border-white/20" style={{ backgroundColor: hairColor }} />
                </label>
                <input
                  type="color"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  className="w-full h-9 rounded-xl bg-white/5 cursor-pointer p-0.5 border border-white/5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60 flex items-center gap-1.5">
                  Eye/Pupil Color
                  <span className="w-3 h-3 rounded border border-white/20" style={{ backgroundColor: eyeColor }} />
                </label>
                <input
                  type="color"
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  className="w-full h-9 rounded-xl bg-white/5 cursor-pointer p-0.5 border border-white/5"
                />
              </div>
            </div>
          </div>

          {/* 3. Text to Speech / Voice Customization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs">
              <Volume2 className="w-4 h-4" />
              <span>Speech & Voice</span>
            </div>

            <div className="space-y-4">
              {/* Enable / Disable Read aloud */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-semibold text-primary-text">Auto-Read Responses</h4>
                  <p className="text-xs text-primary-text/50">Read Aira's text aloud using voice synthesis</p>
                </div>
                <input
                  type="checkbox"
                  checked={speechEnabled}
                  onChange={(e) => setSpeechEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {speechEnabled && (
                <>
                  {/* Select Voice */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-primary-text/60">Voice Profile</label>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => setSelectedVoiceName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/5 dark:bg-black/30 border border-white/5 focus:outline-none text-primary-text font-medium"
                    >
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name} className="dark:bg-slate-900 text-black dark:text-white">
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Speech Rate Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-primary-text/60">Speaking Speed</label>
                      <span className="font-semibold text-accent-color">{speechRate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer bg-white/10 rounded-lg h-2"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4. Accessibility Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider text-xs">
              <span className="text-md font-extrabold font-sans">A</span>
              <span>Accessibility Helpers</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-primary-text/60">Text Size</label>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  {(['normal', 'lg', 'xl'] as FontSizePreset[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSizePreset(size)}
                      className={`flex-1 py-1 text-xs rounded-lg font-semibold capitalize transition-all ${
                        fontSize === size ? 'bg-white/15 text-primary-text' : 'text-primary-text/50 hover:text-primary-text'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-xs text-primary-text/60">High Contrast Mode</label>
                <button
                  onClick={toggleHighContrast}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all border ${
                    highContrast 
                      ? 'bg-yellow-400 text-black border-yellow-300' 
                      : 'bg-white/5 border-white/5 hover:border-white/10 text-primary-text'
                  }`}
                >
                  {highContrast ? 'Disable Contrast' : 'Enable High Contrast'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. Cloud Integration Status */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-indigo-300/40 font-semibold uppercase tracking-wider text-[10px]">
              <Database className="w-3.5 h-3.5" />
              <span>Infrastructure Engine</span>
            </div>
            
            <div className="mt-2 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-semibold text-primary-text">Supabase cloud</h4>
                <p className="text-[10px] text-primary-text/40">Used for Auth, File storage, and Chat saves</p>
              </div>
              
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                import.meta.env.VITE_SUPABASE_URL 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {import.meta.env.VITE_SUPABASE_URL ? 'ONLINE' : 'GUEST MODE'}
              </span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
