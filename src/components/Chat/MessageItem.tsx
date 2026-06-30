import { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import type { Message } from '../../context/ChatContext';
import { Copy, Check, Heart, ThumbsUp, Laugh, Info, Frown, FileText, Image as ImageIcon } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { addMessageReaction } = useChat();
  const [copied, setCopied] = useState(false);

  const isAira = message.sender === 'aira';

  // Copy code utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom regex-based Markdown formatter
  const formatMarkdown = (text: string) => {
    if (!text) return '';

    // Split text by code blocks to avoid formatting content inside pre tags
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        // Code Block
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : 'code';
        const codeContent = match ? match[2].trim() : part.slice(3, -3).trim();

        return (
          <div key={i} className="my-3 rounded-xl border border-white/5 bg-black/35 overflow-hidden text-xs font-mono relative group">
            <div className="flex justify-between items-center px-4 py-2 bg-black/25 text-indigo-300 border-b border-white/5">
              <span className="uppercase text-[10px] font-bold tracking-widest">{lang || 'source'}</span>
              <button
                onClick={() => copyToClipboard(codeContent)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto"><code className="text-cyan-300">{codeContent}</code></pre>
          </div>
        );
      }

      // Inline formatting
      let formatted = part;

      // Escape HTML
      formatted = formatted
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Bold (**text**)
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary-text">$1</strong>');
      
      // Italics (*text*)
      formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

      // Inline code (`code`)
      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/20 dark:bg-black/30 text-indigo-300 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

      // Bullet Lists (- item)
      formatted = formatted.replace(/^\s*-\s+(.*?)$/gm, '<li class="list-disc ml-5 mb-1">$1</li>');

      // Headers (### text)
      formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold text-primary-text mt-3 mb-1">$1</h3>');
      formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold text-primary-text mt-4 mb-2 border-b border-white/5 pb-1">$1</h2>');
      formatted = formatted.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold text-primary-text mt-5 mb-3">$1</h1>');

      // Tables (simple conversion)
      // (Skipped for simplicity, but raw tables display fine or can be mapped if needed)

      return (
        <span 
          key={i} 
          dangerouslySetInnerHTML={{ __html: formatted }} 
          className="whitespace-pre-wrap leading-relaxed block"
        />
      );
    });
  };

  const reactionEmojis = [
    { icon: <ThumbsUp className="w-3 h-3 text-cyan-400" />, label: '👍' },
    { icon: <Heart className="w-3 h-3 text-rose-400" />, label: '❤️' },
    { icon: <Laugh className="w-3 h-3 text-amber-400" />, label: '😂' },
    { icon: <Info className="w-3 h-3 text-blue-400" />, label: '😮' },
    { icon: <Frown className="w-3 h-3 text-indigo-400" />, label: '😢' },
  ];

  return (
    <div className={`flex w-full ${isAira ? 'justify-start' : 'justify-end'} mb-4 relative group`}>
      
      {/* Reaction floating bar trigger (Aira's messages only) */}
      {isAira && (
        <div className="absolute -top-3 left-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <div className="flex gap-1.5 px-2.5 py-1 rounded-full glass-panel border border-white/10 shadow-lg scale-90 origin-bottom-left">
            {reactionEmojis.map((r, idx) => (
              <button
                key={idx}
                onClick={() => addMessageReaction(message.id, r.label)}
                className="hover:scale-125 transition-transform text-xs"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile Icon / Logo */}
      {isAira && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md mr-3 flex-shrink-0">
          AR
        </div>
      )}

      {/* Bubble Panel */}
      <div className="max-w-[75%] flex flex-col">
        <div 
          className={`px-4.5 py-3 rounded-2xl shadow-sm border ${
            isAira 
              ? 'bg-[var(--msg-aira-bg)] text-[var(--msg-aira-text)] border-white/5 rounded-tl-none' 
              : 'bg-[var(--msg-user-bg)] text-[var(--msg-user-text)] border-indigo-500/20 rounded-tr-none'
          }`}
        >
          {/* File Attachment Rendering */}
          {message.attachment && (
            <div className="mb-2.5 p-2 rounded-xl bg-black/10 dark:bg-black/20 border border-white/5 flex items-center gap-2.5">
              {message.attachment.type.startsWith('image/') ? (
                <>
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-primary-text">{message.attachment.name}</p>
                    <a 
                      href={message.attachment.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      View Image
                    </a>
                  </div>
                  <img 
                    src={message.attachment.url} 
                    alt="Attachment Preview" 
                    className="w-10 h-10 object-cover rounded-lg border border-white/10"
                  />
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-primary-text">{message.attachment.name}</p>
                    <a 
                      href={message.attachment.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Formatted Markdown Content */}
          <div className="prose">{formatMarkdown(message.content)}</div>

          {/* Reaction Stamp */}
          {message.reaction && (
            <div className="mt-1.5 flex justify-end">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 dark:bg-black/35 border border-white/10 shadow text-xs">
                {message.reaction}
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-[9px] text-indigo-300/40 mt-1 px-1.5 ${!isAira ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
