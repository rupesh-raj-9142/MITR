import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useVoice } from './VoiceContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { AiraEmotion } from '../components/Avatar/AuraBg';

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  base64?: string; // used for guest-mode/local delivery to backend
}

export interface Message {
  id: string;
  sender: 'user' | 'aira';
  content: string;
  timestamp: string;
  emotion?: AiraEmotion;
  attachment?: FileAttachment;
  reaction?: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isThinking: boolean;
  airaEmotion: AiraEmotion;
  setAiraEmotion: (emotion: AiraEmotion) => void;
  createConversation: (title?: string) => Promise<string>;
  setActiveConversationId: (id: string) => void;
  sendMessage: (content: string, attachment?: FileAttachment) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  clearActiveConversation: () => void;
  addMessageReaction: (messageId: string, reaction: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const { speak } = useVoice();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [airaEmotion, setAiraEmotion] = useState<AiraEmotion>('default');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch conversations when user changes
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    loadConversations();
  }, [user]);

  // Load conversations based on mode (Supabase vs localStorage)
  const loadConversations = async () => {
    if (isSupabaseConfigured && supabase && !isGuest) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user?.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        const mapped = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updated_at,
        }));
        setConversations(mapped);
        
        // Auto-select latest conversation
        if (mapped.length > 0) {
          selectConversation(mapped[0].id);
        } else {
          // Create an initial one if empty
          await createConversation('Welcome to Aira AI');
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      }
    } else {
      // Guest Mode (localStorage)
      const stored = localStorage.getItem(`aira_convs_${user?.id}`);
      if (stored) {
        try {
          const convs = JSON.parse(stored);
          setConversations(convs);
          if (convs.length > 0) {
            selectConversation(convs[0].id);
          } else {
            await createConversation('New Conversation');
          }
        } catch {
          await createConversation('New Conversation');
        }
      } else {
        await createConversation('Welcome to Aira AI');
      }
    }
  };

  // Select a conversation and load its messages
  const selectConversation = async (id: string) => {
    const found = conversations.find(c => c.id === id);
    if (!found) return;

    setActiveConversation(found);

    if (isSupabaseConfigured && supabase && !isGuest) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(
          data.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            timestamp: m.created_at,
            emotion: m.emotion,
            attachment: m.attachment ? JSON.parse(m.attachment) : undefined,
            reaction: m.reaction || undefined
          }))
        );
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    } else {
      // Guest Local Mode
      const storedMsgs = localStorage.getItem(`aira_msgs_${id}`);
      if (storedMsgs) {
        try {
          setMessages(JSON.parse(storedMsgs));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    }
  };

  const createConversation = async (title = 'New Conversation') => {
    const newId = 'conv_' + Math.random().toString(36).substring(2, 11);
    const newConv: Conversation = {
      id: newId,
      title,
      updatedAt: new Date().toISOString(),
    };

    const updatedConvs = [newConv, ...conversations];
    setConversations(updatedConvs);
    setActiveConversation(newConv);
    setMessages([]);

    if (isSupabaseConfigured && supabase && !isGuest) {
      try {
        await supabase.from('conversations').insert({
          id: newId,
          user_id: user?.id,
          title,
        });
      } catch (err) {
        console.error('Error saving conversation to DB:', err);
      }
    } else {
      localStorage.setItem(`aira_convs_${user?.id}`, JSON.stringify(updatedConvs));
    }

    return newId;
  };

  const deleteConversation = async (id: string) => {
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);

    if (activeConversation?.id === id) {
      if (remaining.length > 0) {
        selectConversation(remaining[0].id);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
    }

    if (isSupabaseConfigured && supabase && !isGuest) {
      try {
        await supabase.from('conversations').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting conversation:', err);
      }
    } else {
      localStorage.setItem(`aira_convs_${user?.id}`, JSON.stringify(remaining));
      localStorage.removeItem(`aira_msgs_${id}`);
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    const updated = conversations.map(c => 
      c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
    );
    setConversations(updated);
    
    if (activeConversation?.id === id) {
      setActiveConversation({ ...activeConversation, title: newTitle });
    }

    if (isSupabaseConfigured && supabase && !isGuest) {
      try {
        await supabase
          .from('conversations')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.error('Error renaming conversation:', err);
      }
    } else {
      localStorage.setItem(`aira_convs_${user?.id}`, JSON.stringify(updated));
    }
  };

  const addMessageReaction = (messageId: string, reaction: string) => {
    const updatedMsgs = messages.map(m => m.id === messageId ? { ...m, reaction } : m);
    setMessages(updatedMsgs);

    if (activeConversation) {
      if (isSupabaseConfigured && supabase && !isGuest) {
        supabase
          .from('messages')
          .update({ reaction })
          .eq('id', messageId)
          .then(({ error }) => {
            if (error) console.error('Error saving reaction:', error);
          });
      } else {
        localStorage.setItem(`aira_msgs_${activeConversation.id}`, JSON.stringify(updatedMsgs));
      }
    }
  };

  const sendMessage = async (content: string, attachment?: FileAttachment) => {
    if (!activeConversation) return;

    const userMsgId = 'msg_user_' + Math.random().toString(36).substring(2, 11);
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachment,
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);

    // Save user message
    if (isSupabaseConfigured && supabase && !isGuest) {
      supabase.from('messages').insert({
        id: userMsgId,
        conversation_id: activeConversation.id,
        sender: 'user',
        content,
        attachment: attachment ? JSON.stringify(attachment) : null,
      }).then(({ error }) => {
        if (error) console.error('Error storing user message:', error);
      });
      
      // Update conversation updated_at
      supabase.from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversation.id)
        .then(() => {});
    } else {
      localStorage.setItem(`aira_msgs_${activeConversation.id}`, JSON.stringify(updatedMsgs));
      // update conversation timestamp locally
      const updatedConvs = conversations.map(c => 
        c.id === activeConversation.id ? { ...c, updatedAt: new Date().toISOString() } : c
      );
      setConversations(updatedConvs);
      localStorage.setItem(`aira_convs_${user?.id}`, JSON.stringify(updatedConvs));
    }

    // Trigger AI thinking cycle
    setIsThinking(true);
    setAiraEmotion('thinking');

    try {
      // Request backend AI server
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // We pass the context messages (history) to backend
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Append user prompt
      historyPayload.push({
        role: 'user',
        parts: [{ text: content }]
      });

      // Prepare body
      const bodyPayload: any = {
        message: content,
        history: historyPayload,
        userName: user?.user_metadata?.full_name || 'Companion'
      };

      if (attachment) {
        bodyPayload.attachment = {
          name: attachment.name,
          type: attachment.type,
          base64: attachment.base64
        };
      }

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error('AI backend server returned an error');
      }

      const data = await response.json();
      const aiEmotion: AiraEmotion = data.emotion || 'default';
      const aiContent: string = data.text || 'Sorry, I had trouble processing that response.';

      setAiraEmotion(aiEmotion);

      const aiMsgId = 'msg_ai_' + Math.random().toString(36).substring(2, 11);
      const aiMsg: Message = {
        id: aiMsgId,
        sender: 'aira',
        content: aiContent,
        timestamp: new Date().toISOString(),
        emotion: aiEmotion,
      };

      const finalMsgs = [...updatedMsgs, aiMsg];
      setMessages(finalMsgs);

      // Save AI message
      if (isSupabaseConfigured && supabase && !isGuest) {
        supabase.from('messages').insert({
          id: aiMsgId,
          conversation_id: activeConversation.id,
          sender: 'aira',
          content: aiContent,
          emotion: aiEmotion,
        }).then(({ error }) => {
          if (error) console.error('Error saving AI message:', error);
        });
      } else {
        localStorage.setItem(`aira_msgs_${activeConversation.id}`, JSON.stringify(finalMsgs));
      }

      // Read output aloud if voice is active
      speak(aiContent, () => {
        setAiraEmotion('default'); // return to gentle default breathing after speaking
      });

    } catch (err) {
      console.error('Error communicating with AI agent:', err);
      setAiraEmotion('confused');

      const errMsgId = 'msg_err_' + Math.random().toString(36).substring(2, 11);
      const errMsg: Message = {
        id: errMsgId,
        sender: 'aira',
        content: 'Oh dear! I had trouble connecting to my cyber server. Please check that the Node backend is running and Gemini is configured!',
        timestamp: new Date().toISOString(),
        emotion: 'sad',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const clearActiveConversation = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations: conversations.filter(c => 
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        activeConversation,
        messages,
        isThinking,
        airaEmotion,
        setAiraEmotion,
        createConversation,
        setActiveConversationId: selectConversation,
        sendMessage,
        deleteConversation,
        renameConversation,
        clearActiveConversation,
        addMessageReaction,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
