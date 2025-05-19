'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ClothingItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api/client';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const selectClothing = useAppStore((state) => state.selectClothing);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);
  
  // Handle sending a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      suggestions: [], // Initialize as empty array
    };
    
    addChatMessage(userMessage);
    setMessage('');
    
    try {
      // Send message to API
      const result = await apiClient.sendChatMessage(
        message,
        chatMessages
      );
      
      if (result.success && result.data) {
        // Make sure suggestions is at least an empty array if it's undefined
        const assistantMessage: ChatMessage = {
          ...result.data,
          suggestions: result.data.suggestions || [],
          timestamp: new Date(result.data.timestamp || new Date())
        };
        // Add AI response to chat
        addChatMessage(assistantMessage);
      } else {
        setError(result.error || 'Failed to get a response');
        console.error('Chat error:', result.error);
      }
    } catch (err) {
      setError('An error occurred while sending your message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle trying on a suggested item
  const handleTryOn = (item: ClothingItem) => {
    selectClothing(item.type, item);
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3">
            <h3 className="font-medium">Fashion Advisor</h3>
            <p className="text-xs text-blue-100">Ask for outfit suggestions or styling advice</p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>How can I help with your outfit today?</p>
                <p className="text-xs mt-2">Try asking:</p>
                <div className="mt-2 text-xs">
                  <button 
                    onClick={() => {
                      setMessage("What shirt goes with black pants?");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 mb-1 block w-full"
                  >
                    What shirt goes with black pants?
                  </button>
                  <button 
                    onClick={() => {
                      setMessage("Suggest a hijab that matches a white shirt");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 block w-full"
                  >
                    Suggest a hijab that matches a white shirt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div 
                      className={`px-3 py-2 rounded-lg max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    
                    <span className="text-xs text-gray-500 mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {/* Suggestions */}
                    {msg.role === 'assistant' && msg.suggestions && Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.suggestions.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleTryOn(item)}
                            className="flex items-center bg-blue-50 border border-blue-200 rounded-md px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                          >
                            <span className="mr-1">Try {item.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-600">
                    {error}
                  </div>
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`px-4 py-2 rounded-md ${
                  !message.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
} 