import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles, Plus, Loader2 } from 'lucide-react';
import { sendChat, createTodo } from '../api';
import type { ChatMessage, SuggestedTodo, Priority } from '../api';

interface ChatPanelProps {
  onTodoCreated: () => void;
}

export default function ChatPanel({ onTodoCreated }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedTodo[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setSuggestions([]);
    setLoading(true);
    scrollToBottom();

    try {
      const res = await sendChat(userMsg, messages);
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
      if (res.suggestedTodos?.length) setSuggestions(res.suggestedTodos);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Sorry, I had trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleAddSuggestion = async (s: SuggestedTodo) => {
    await createTodo(s.title, s.description ?? undefined, s.priority as Priority);
    setSuggestions(prev => prev.filter(x => x !== s));
    onTodoCreated();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-white/40">Powered by GPT-5.4</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Sparkles size={32} className="text-violet-400 mb-3" />
            <p className="text-sm text-white/60">Ask me anything about your tasks!</p>
            <p className="text-xs text-white/30 mt-1">I can suggest, organize, and help you prioritize.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-br-md'
                    : 'glass text-white/90 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full typing-dot" />
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full typing-dot" />
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full typing-dot" />
            </div>
          </motion.div>
        )}

        {/* Suggested todos */}
        <AnimatePresence>
          {suggestions.map((s, i) => (
            <motion.div
              key={`sug-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass rounded-xl p-3 border border-violet-500/20"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.title}</p>
                  {s.description && <p className="text-xs text-white/50 mt-0.5 truncate">{s.description}</p>}
                  <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    s.priority === 'Urgent' ? 'bg-red-500/20 text-red-300' :
                    s.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                    s.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>{s.priority}</span>
                </div>
                <button
                  onClick={() => handleAddSuggestion(s)}
                  className="shrink-0 w-7 h-7 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 flex items-center justify-center transition-colors"
                >
                  <Plus size={14} className="text-violet-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask your AI assistant..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center
                       disabled:opacity-30 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
          >
            {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
