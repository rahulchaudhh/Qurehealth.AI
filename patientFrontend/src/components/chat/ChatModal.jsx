import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Clock, Check, CheckCheck } from 'lucide-react';
import api from '../../api/axios'; // Patient's axios instance

const ChatModal = ({ isOpen, onClose, appointmentId, doctorName, doctorImage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchMessages = async (isInitial = false) => {
    if (!appointmentId) return;
    
    try {
      const lastMessageId = messages.length > 0 && !isInitial
        ? messages[messages.length - 1]._id 
        : undefined;
        
      const url = lastMessageId 
        ? `/appointments/${appointmentId}/messages?lastMessageId=${lastMessageId}`
        : `/appointments/${appointmentId}/messages`;
        
      const res = await api.get(url);
      
      if (res.data.success) {
        const data = res.data.data || [];
        if (isInitial) {
          setMessages(data);
          
          // Mark unread messages from doctor as read
          const unreadIds = data
            .filter(m => m.senderModel === 'Doctor' && !m.isRead)
            .map(m => m._id);
            
          if (unreadIds.length > 0) {
            markAsRead();
          }
        } else if (data.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id));
            const newMsgs = data.filter(m => !existingIds.has(m._id));
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (isInitial) setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load messages');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put(`/appointments/${appointmentId}/messages/read`);
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  };

  // Setup polling
  useEffect(() => {
    if (isOpen && appointmentId) {
      setLoading(true);
      fetchMessages(true);
      
      // Poll every 3 seconds for new messages
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(false);
      }, 3000);
    }
    
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [isOpen, appointmentId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageText = newMessage;
    setNewMessage(''); // Optimistic clear
    setSending(true);
    
    try {
      const res = await api.post(`/appointments/${appointmentId}/messages`, {
        text: messageText
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
      setNewMessage(messageText); // Restore input on failure
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden border border-gray-100"
        style={{ height: '85vh', maxHeight: '700px' }}
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 h-[72px]">
          <div className="flex items-center gap-3">
            <div className="relative">
              {doctorImage ? (
                <img src={doctorImage} alt="Doctor" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {doctorName?.charAt(0) || 'D'}
                </div>
              )}
              {/* Online indicator dot - assuming they might be online if it's appointment time */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-none">Dr. {doctorName}</h3>
              <p className="text-xs text-green-600 font-medium mt-1">Consultation Chat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 flex justify-between items-center shrink-0">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-700">×</button>
          </div>
        )}

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col gap-4">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 text-center max-w-[250px]">
                Send a message to Dr. {doctorName} regarding your appointment.
              </p>
            </div>
          ) : (
            <>
              {/* Security info bubble */}
              <div className="flex justify-center mb-2">
                <span className="bg-blue-50/80 text-blue-600/80 text-[10px] font-medium px-4 py-1.5 rounded-full border border-blue-100/50 flex items-center gap-1.5">
                  <Clock size={10} />
                  Chat is securely encrypted and saved to your medical history
                </span>
              </div>
              
              {messages.map((msg, index) => {
                const isMe = msg.senderModel === 'Patient';
                
                // Group messages from same sender if close in time
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const showAvatar = !isMe && (!prevMsg || prevMsg.senderModel !== 'Doctor');
                
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {/* Doctor Avatar */}
                      {!isMe && (
                        <div className="w-7 h-7 flex-shrink-0">
                          {showAvatar && (
                            doctorImage ? (
                              <img src={doctorImage} alt="Dr" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                {doctorName?.charAt(0) || 'D'}
                              </div>
                            )
                          )}
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div className={`relative px-4 py-2.5 rounded-2xl ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                      }`}>
                        <p className="text-[13px] leading-relaxed break-words">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isMe ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            msg.isRead 
                              ? <CheckCheck size={10} className="text-blue-200" />
                              : <Check size={10} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-1" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full max-h-32 min-h-[44px] py-3 px-4 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
                style={{ height: '44px' }}
                onInput={(e) => {
                  e.target.style.height = '44px';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                newMessage.trim() && !sending
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send size={16} className={newMessage.trim() ? "ml-0.5" : ""} />
              )}
            </button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
