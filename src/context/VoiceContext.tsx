import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface VoiceContextType {
  isSpeaking: boolean;
  isListening: boolean;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  speak: (text: string, onEndCallback?: () => void) => void;
  stopSpeaking: () => void;
  startListening: (onTranscript: (text: string) => void) => void;
  stopListening: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  setSelectedVoiceName: (name: string) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    return localStorage.getItem('aira_speech_enabled') !== 'false'; // default is true
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    return localStorage.getItem('aira_selected_voice') || '';
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    return Number(localStorage.getItem('aira_speech_rate')) || 1.0;
  });

  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
      
      // Auto-select a nice voice if not set (prefer Hindi)
      if (!selectedVoiceName && allVoices.length > 0) {
        const defaultChoice = 
          allVoices.find(v => v.lang.startsWith('hi-') || v.lang.startsWith('hi')) || // Prefer Hindi voice
          allVoices.find(v => v.name.toLowerCase().includes('hindi')) ||
          allVoices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Natural')) ||
          allVoices.find(v => v.lang.startsWith('en-') && (v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Female'))) ||
          allVoices.find(v => v.lang.startsWith('en')) ||
          allVoices[0];
        
        if (defaultChoice) {
          setSelectedVoiceName(defaultChoice.name);
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceName]);

  // Persist configurations
  useEffect(() => {
    localStorage.setItem('aira_speech_enabled', String(speechEnabled));
    localStorage.setItem('aira_selected_voice', selectedVoiceName);
    localStorage.setItem('aira_speech_rate', String(speechRate));
  }, [speechEnabled, selectedVoiceName, speechRate]);

  // Clean up speaking/listening on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Text to Speech
  const speak = (text: string, onEndCallback?: () => void) => {
    if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      onEndCallback?.();
      return;
    }

    stopSpeaking(); // stop any current audio

    // Remove markdown formatting tags from speech translation for cleaner audio
    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/<.*?>/g, '')
      .trim();

    if (!cleanText) {
      onEndCallback?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    synthesisUtteranceRef.current = utterance;

    // Set voice properties
    const activeVoice = voices.find(v => v.name === selectedVoiceName);
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    utterance.rate = speechRate;
    utterance.pitch = 1.05; // Cute, slightly elevated cartoon pitch

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEndCallback?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      onEndCallback?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech to Text (Recognition)
  const startListening = (onTranscript: (text: string) => void) => {
    if (typeof window === 'undefined') return;

    stopSpeaking(); // mute TTS when listening
    stopListening(); // reset any ongoing listener

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isSpeaking,
        isListening,
        speechEnabled,
        setSpeechEnabled,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        voices,
        selectedVoiceName,
        setSelectedVoiceName,
        speechRate,
        setSpeechRate,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
