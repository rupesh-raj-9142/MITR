import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useVoice } from '../../context/VoiceContext';
import { AiraAvatar } from '../Avatar/AiraAvatar';
import { MessageItem } from './MessageItem';
import { DocumentUpload } from './DocumentUpload';
import { 
  Mic, MicOff, Send, Volume2, VolumeX, 
  Trash2, Menu
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatContainerProps {
  onToggleSidebar: () => void;
  hairColor: string;
  eyeColor: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  onToggleSidebar, hairColor, eyeColor 
}) => {
  const { 
    activeConversation, messages, sendMessage, isThinking, 
    airaEmotion, setAiraEmotion, clearActiveConversation 
  } = useChat();

  const { 
    isSpeaking, isListening, speechEnabled, setSpeechEnabled, 
    startListening, stopListening, stopSpeaking 
  } = useVoice();

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedFile) return;

    const userText = input.trim();
    setInput('');
    
    // Cache attachment
    const attachment = selectedFile || undefined;
    setSelectedFile(null);

    await sendMessage(userText, attachment);
  };

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setSpeechEnabled(!speechEnabled);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setAiraEmotion('caring');
      startListening((transcript) => {
        if (transcript.trim()) {
          sendMessage(transcript.trim());
        }
      });
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden relative">
      
      {/* 1. Floating Avatar Viewport (Left/Top side) */}
      <div className="w-full md:w-[42%] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5 relative z-10 select-none bg-black/5 md:bg-transparent">
        {/* Responsive Toggle buttons for Mobile Navigation */}
        <div className="absolute top-4 left-4 md:hidden flex gap-2">
          <button 
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl glass-panel border border-white/10 text-primary-text"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Custom floating status tags */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* TTS Enable switch */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              speechEnabled 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                : 'bg-white/5 border-white/5 text-primary-text/40 hover:text-primary-text'
            }`}
            title={speechEnabled ? "Mute voice synthesis" : "Enable voice synthesis"}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => clearActiveConversation()}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-primary-text/40 hover:text-rose-400 hover:border-rose-500/20 transition-all duration-300"
            title="Clear active conversation screen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Companion Avatar Component */}
        <div className="w-full max-w-[280px] md:max-w-none flex flex-col items-center">
          <AiraAvatar 
            emotion={airaEmotion} 
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            hairColor={hairColor}
            eyeColor={eyeColor}
          />
          
          {/* Character visual status bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-1.5 rounded-full glass-panel border border-white/10 shadow flex items-center gap-2 text-xs font-semibold"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${
              isThinking 
                ? 'bg-purple-500 animate-ping' 
                : isListening 
                ? 'bg-rose-500 animate-pulse' 
                : isSpeaking 
                ? 'bg-cyan-400 animate-bounce' 
                : 'bg-emerald-400'
            }`} />
            <span className="text-primary-text/70 tracking-wide">
              {isThinking 
                ? 'Aira is analyzing...' 
                : isListening 
                ? 'Listening to you...' 
                : isSpeaking 
                ? 'Speaking...' 
                : `Aira (${airaEmotion.toUpperCase()})`}
            </span>
          </motion.div>
        </div>
      </div>

      {/* 2. Chat Timeline Viewport (Right/Bottom side) */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-black/10 dark:bg-black/15">
        
        {/* Navigation header info */}
        <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-primary-text truncate">
              {activeConversation?.title || 'Lounge Area'}
            </h3>
            <p className="text-[10px] text-indigo-300/40">
              Active Session • {messages.length} messages
            </p>
          </div>
        </div>

        {/* Message Log timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}

          {/* Typing indicator bubble */}
          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                AR
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[var(--msg-aira-bg)] text-[var(--msg-aira-text)] border border-white/5 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Console Input controls */}
        <div className="p-4 border-t border-white/5 bg-white/5 dark:bg-black/10">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            
            {/* Multi-Format File uploader */}
            <DocumentUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

            {/* Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Message Aira..."}
              disabled={isListening}
              className="flex-1 px-4.5 py-3 rounded-2xl bg-white/5 dark:bg-black/30 border border-white/5 focus:border-indigo-500/40 focus:outline-none text-sm text-primary-text placeholder-indigo-300/30 transition-all duration-300 disabled:opacity-50"
            />

            {/* Dictation voice input button */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                isListening 
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-500 animate-pulse' 
                  : 'bg-white/5 border-white/5 text-indigo-300 hover:text-cyan-300'
              }`}
              title="Dictate with voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send trigger button */}
            <button
              type="submit"
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 border border-transparent text-white shadow-lg shadow-indigo-500/15 transition-all duration-300 glow-btn"
            >
              <Send className="w-4 h-4" />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};
