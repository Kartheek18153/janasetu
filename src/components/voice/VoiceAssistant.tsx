import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { askAI, hasApiKey } from '../../services/aiService';
import {
  SparklesIcon, MicrophoneIcon, XMarkIcon, PaperAirplaneIcon, SpeakerWaveIcon,
} from '@heroicons/react/24/outline';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface Suggestion {
  text: string;
  link?: string;
}

const SUGGEST_LABELS: Record<string, string> = {
  fileGrievance: '📋 File a Grievance',
  track: '🔍 Track Grievance',
  schemes: '💡 Find Schemes',
  appointment: '📅 Book Appointment',
  announcement: '📢 Announcements',
  account: '👤 My Account',
};

const keywordMap: Record<string, Suggestion[]> = {
  grievance: [{ text: SUGGEST_LABELS.fileGrievance, link: '/file-grievance' }],
  complaint: [{ text: SUGGEST_LABELS.fileGrievance, link: '/file-grievance' }],
  track: [{ text: SUGGEST_LABELS.track, link: '/track' }],
  status: [{ text: SUGGEST_LABELS.track, link: '/track' }],
  scheme: [{ text: SUGGEST_LABELS.schemes, link: '/schemes' }],
  yojana: [{ text: SUGGEST_LABELS.schemes, link: '/schemes' }],
  appointment: [{ text: SUGGEST_LABELS.appointment, link: '/appointments' }],
  announcement: [{ text: SUGGEST_LABELS.announcement, link: '/announcements' }],
  account: [{ text: SUGGEST_LABELS.account, link: '/account' }],
  help: [
    { text: SUGGEST_LABELS.fileGrievance, link: '/file-grievance' },
    { text: SUGGEST_LABELS.schemes, link: '/schemes' },
    { text: SUGGEST_LABELS.appointment, link: '/appointments' },
    { text: SUGGEST_LABELS.track, link: '/track' },
  ],
};

function findKeywordMatches(text: string): Suggestion[] {
  const lower = text.toLowerCase();
  const found: Suggestion[] = [];
  for (const [keyword, items] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      for (const item of items) {
        if (!found.some(f => f.text === item.text)) found.push(item);
      }
    }
  }
  return found;
}

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [supported, setSupported] = useState(true);
  const [aiConfigured, setAiConfigured] = useState(hasApiKey());
  const [speaking, setSpeaking] = useState(false);
  const [voiceLang] = useState('en-US');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    setAiConfigured(hasApiKey());
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setSupported(false);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const stopAll = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    stopAll();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utteranceRef.current = utterance;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }, 30);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setChat(prev => [...prev, { role: 'user', text }]);
  }, []);

  const addAssistantMessage = useCallback((text: string) => {
    setChat(prev => [...prev, { role: 'assistant', text }]);
  }, []);

  const processQuery = useCallback(async (query: string) => {
    setProcessing(true);
    addUserMessage(query);

    try {
      let reply = '';
      if (aiConfigured) {
        reply = await askAI(query);
      }

      if (reply) {
        addAssistantMessage(reply);
      } else {
        const matches = findKeywordMatches(query);
        if (matches.length > 0) {
          const pageNames = matches.map(m => m.text).join(', ');
          addAssistantMessage(`I can help you with ${pageNames}. Please click a link below to go there.`);
        } else {
          const fallback = aiConfigured ? 'Sorry, the AI service is temporarily unavailable. Please try again.' : 'I can help with grievances, schemes, appointments, and more. Try asking me something!';
          addAssistantMessage(fallback);
        }
      }
    } finally {
      setProcessing(false);
    }
  }, [aiConfigured, addUserMessage, addAssistantMessage]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setTranscript('');
    setListening(true);
    transcriptRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }
      transcriptRef.current = finalText;
      setTranscript(finalText);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceLang]);

  useEffect(() => {
    if (!listening && transcriptRef.current) {
      const text = transcriptRef.current;
      transcriptRef.current = '';
      setTranscript('');
      processQuery(text);
    }
  }, [listening, processQuery]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, []);

  const handleSendText = () => {
    if (!input.trim() || processing) return;
    const text = input.trim();
    setInput('');
    processQuery(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const close = () => {
    if (listening) stopListening();
    stopAll();
    setOpen(false);
    setChat([]);
    setTranscript('');
    setInput('');
    setProcessing(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-500 text-white shadow-lg hover:bg-primary-400 hover:shadow-xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center active:scale-95 font-bold text-xl px-8 py-4 rounded-full gap-2"
        aria-label="Open Angie AI"
      >
        <SparklesIcon className="h-6 w-6" />
        <span>Angie AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-gray-900/40 animate-fade-in" onClick={close} />

          <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-slide-up flex flex-col bg-white" style={{ maxHeight: '80vh' }}>
            <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Angie</h3>
                  <span className="text-[10px] text-gray-500 font-medium">AI Assistant</span>
                </div>
              </div>
              <button onClick={close} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] bg-white">
                  {chat.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon className="h-8 w-8 text-primary-400" />
                      </div>
                      <p className="mb-1 text-gray-700 font-medium">How can I help you today?</p>
                      <p className="text-gray-500">Ask me about schemes, grievances, appointments & more.</p>
                      {!aiConfigured && (
                        <p className="text-amber-600 mt-3 text-xs">
                          Tip: Add VITE_GEMINI_API_KEY to .env for AI-powered answers
                        </p>
                      )}
                    </div>
                  )}
                  {chat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <span>{msg.text}</span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => {
                              if (speaking) { stopAll(); }
                              else { speak(msg.text); }
                            }}
                            className={`ml-2 inline-flex items-center gap-1 text-xs transition-colors align-bottom ${
                              speaking ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'
                            }`}
                            title={speaking ? 'Stop' : 'Read aloud'}
                          >
                            <SpeakerWaveIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {processing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
                        Thinking<span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-3 shrink-0 space-y-2 bg-white border-t border-gray-200">
                  {!supported ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center">
                      Voice recognition is not supported in your browser. Please use Chrome or Edge.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => listening ? stopListening() : startListening()}
                        disabled={processing}
                        className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          listening
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                        } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <MicrophoneIcon className={`h-5 w-5 ${listening ? 'animate-bounce' : ''}`} />
                      </button>
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                        <input
                          type="text"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={listening ? 'Listening...' : 'Ask me something...'}
                          disabled={processing}
                          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                        />
                        <button
                          onClick={() => { stopAll(); stopListening(); setProcessing(false); }}
                          disabled={!processing && !listening}
                          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                            processing || listening
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-transparent text-transparent pointer-events-none'
                          }`}
                          title="Stop"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleSendText}
                          disabled={!input.trim() || processing}
                          className="shrink-0 h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {transcript && (
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-400 font-medium">Recognized</p>
                      <p className="text-sm text-gray-700">{transcript}</p>
                    </div>
                  )}
                </div>
              </>
            </div>
        </div>
      )}
    </>
  );
}
