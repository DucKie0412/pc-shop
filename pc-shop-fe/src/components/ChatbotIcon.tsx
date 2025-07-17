"use client"
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { addMessage } from '@/lib/features/chatbotSlice';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatbotIcon() {
  const messages = useSelector((state: RootState) => state.chatbot.messages);
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Add initial assistant message if chat is empty
  useEffect(() => {
    if (open && messages.length === 0) {
      dispatch(addMessage({ role: 'assistant', content: 'Xin chào, bạn cần giúp gì nào?' }));
    }
    // eslint-disable-next-line
  }, [open, messages.length, dispatch]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    dispatch(addMessage({ role: 'user', content: input }));
    setLoading(true);
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    dispatch(addMessage({ role: 'assistant', content: data.reply }));
    setInput('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-4">
      {open && (
        <div className="bg-white border rounded-lg shadow-lg w-96 flex flex-col h-[500px]" style={{ height: 500 }}>
          <div className="p-2 border-b flex justify-between items-center">
            <span className="font-bold">Chat với Chatbot</span>
            <button onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span
                  className={msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}
                  style={{ borderRadius: 8, padding: 6, display: 'inline-block', maxWidth: 340 }}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-400">Đang trả lời...</div>}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={sendMessage} disabled={loading}>Gửi</button>
          </div>
        </div>
      )}
      <button
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 relative"
        onClick={() => setOpen(true)}
        aria-label="Open ChatBot"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-3 py-1 mr-3 shadow-lg whitespace-nowrap z-50">
            Chat với Chatbot
          </div>
        )}
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
} 