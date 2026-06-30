import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageSquare, Plus, Trash2, Edit3, Check, X, Search, 
  Settings, LogOut, Sparkles, User as UserIcon, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings, onOpenAuth }) => {
  const { 
    conversations, activeConversation, setActiveConversationId, 
    createConversation, deleteConversation, renameConversation,
    searchQuery, setSearchQuery
  } = useChat();
  const { user, logout, isGuest } = useAuth();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleCreate = async () => {
    await createConversation('New Conversation');
  };

  return (
    <aside className="w-80 h-full flex flex-col glass-panel border-r border-white/10 relative overflow-hidden z-20">
      {/* Decorative Aura background inside Sidebar */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-purple-500/10 filter blur-xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 filter blur-xl pointer-events-none" />

      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary-text via-indigo-400 to-cyan-400 select-none">
              AIRA AI
            </h1>
            <span className="text-[10px] text-indigo-300/60 font-semibold tracking-widest uppercase">
              Virtual Companion
            </span>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-cyan-300 transition-all duration-300 glow-btn"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Conversations */}
      <div className="p-4 relative z-10">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300/40" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 dark:bg-black/20 border border-white/5 focus:border-indigo-500/40 focus:outline-none text-sm text-primary-text placeholder-indigo-300/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Timeline Chat List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 relative z-10">
        <AnimatePresence initial={false}>
          {conversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => !isEditing && setActiveConversationId(conv.id)}
                className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-300 select-none ${
                  isActive 
                    ? 'bg-white/10 dark:bg-white/8 border border-white/10 shadow-md' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-cyan-400' : 'text-indigo-400/50 group-hover:text-indigo-400'
                  }`} />
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-black/40 border border-indigo-500/50 rounded px-1.5 py-0.5 text-xs text-primary-text focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className={`text-sm truncate ${
                      isActive ? 'text-primary-text font-medium' : 'text-primary-text/70'
                    }`}>
                      {conv.title}
                    </span>
                  )}
                </div>

                {/* Hover actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={(e) => saveRename(conv.id, e)}
                        className="p-1 rounded hover:bg-white/10 text-emerald-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={cancelRename}
                        className="p-1 rounded hover:bg-white/10 text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startRename(conv.id, conv.title, e)}
                        className="p-1 rounded hover:bg-white/10 text-indigo-300 hover:text-cyan-300 transition-colors"
                        title="Rename"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-indigo-300 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {conversations.length === 0 && (
          <div className="text-center py-8 text-xs text-indigo-300/40">
            No conversations found
          </div>
        )}
      </div>

      {/* User Session Profile footer */}
      <div className="p-4 border-t border-white/5 bg-white/5 dark:bg-black/10 relative z-10">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary-text truncate">
                  {user.user_metadata?.full_name || 'Companion'}
                </p>
                <p className="text-[10px] text-indigo-300/50 truncate">
                  {isGuest ? 'Guest User' : user.email}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg hover:bg-white/10 text-indigo-300 hover:text-cyan-300 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-white/10 text-indigo-300 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={onOpenAuth}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-primary-text/80 font-medium text-sm transition-all duration-300"
            >
              <UserIcon className="w-4 h-4" />
              Try local as Guest
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
