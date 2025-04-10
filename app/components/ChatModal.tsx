'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useChat } from '../context/ChatContext';

export default function ChatModal() {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    isMinimized, 
    setIsMinimized, 
    position, 
    setPosition 
  } = useChat();
  
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 384, height: 600 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = modalRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = modalRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragOffset.x;
      const newY = e.touches[0].clientY - dragOffset.y;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const modalWidth = modalRef.current?.offsetWidth || 0;
      const modalHeight = modalRef.current?.offsetHeight || 0;
      
      const boundedX = Math.min(Math.max(0, newX), windowWidth - modalWidth);
      const boundedY = Math.min(Math.max(0, newY), windowHeight - modalHeight);
      
      setPosition({ x: boundedX, y: boundedY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    setIsResizing(true);
    setResizeDirection(direction);
    e.stopPropagation();
  };

  const handleTouchResizeStart = (e: React.TouchEvent<HTMLDivElement>, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    setIsResizing(true);
    setResizeDirection(direction);
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const modalWidth = modalRef.current?.offsetWidth || 0;
      const modalHeight = modalRef.current?.offsetHeight || 0;
      
      const boundedX = Math.min(Math.max(0, newX), windowWidth - modalWidth);
      const boundedY = Math.min(Math.max(0, newY), windowHeight - modalHeight);
      
      setPosition({ x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (modalRef.current) {
          if (isDragging) {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const modalWidth = modalRef.current.offsetWidth;
            const modalHeight = modalRef.current.offsetHeight;
            
            const boundedX = Math.min(Math.max(0, newX), windowWidth - modalWidth);
            const boundedY = Math.min(Math.max(0, newY), windowHeight - modalHeight);
            
            setPosition({ x: boundedX, y: boundedY });
          }
          
          if (isResizing && resizeDirection) {
            const rect = modalRef.current.getBoundingClientRect();
            let newWidth = size.width;
            let newHeight = size.height;
            let newX = position.x;
            let newY = position.y;
            
            switch (resizeDirection) {
              case 'se':
                newWidth = Math.max(300, e.clientX - rect.left);
                newHeight = Math.max(400, e.clientY - rect.top);
                break;
              case 'sw':
                newWidth = Math.max(300, rect.right - e.clientX);
                newHeight = Math.max(400, e.clientY - rect.top);
                newX = e.clientX;
                break;
              case 'ne':
                newWidth = Math.max(300, e.clientX - rect.left);
                newHeight = Math.max(400, rect.bottom - e.clientY);
                newY = e.clientY;
                break;
              case 'nw':
                newWidth = Math.max(300, rect.right - e.clientX);
                newHeight = Math.max(400, rect.bottom - e.clientY);
                newX = e.clientX;
                newY = e.clientY;
                break;
            }
            
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            newWidth = Math.min(newWidth, windowWidth - newX);
            newHeight = Math.min(newHeight, windowHeight - newY);
            
            setSize({ width: newWidth, height: newHeight });
            setPosition({ x: newX, y: newY });
          }
        }
      };
      
      const handleGlobalTouchMove = (e: TouchEvent) => {
        if (modalRef.current) {
          if (isDragging) {
            e.preventDefault();
            const newX = e.touches[0].clientX - dragOffset.x;
            const newY = e.touches[0].clientY - dragOffset.y;
            
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const modalWidth = modalRef.current.offsetWidth;
            const modalHeight = modalRef.current.offsetHeight;
            
            const boundedX = Math.min(Math.max(0, newX), windowWidth - modalWidth);
            const boundedY = Math.min(Math.max(0, newY), windowHeight - modalHeight);
            
            setPosition({ x: boundedX, y: boundedY });
          }
          
          if (isResizing && resizeDirection) {
            e.preventDefault();
            const rect = modalRef.current.getBoundingClientRect();
            let newWidth = size.width;
            let newHeight = size.height;
            let newX = position.x;
            let newY = position.y;
            
            switch (resizeDirection) {
              case 'se':
                newWidth = Math.max(300, e.touches[0].clientX - rect.left);
                newHeight = Math.max(400, e.touches[0].clientY - rect.top);
                break;
              case 'sw':
                newWidth = Math.max(300, rect.right - e.touches[0].clientX);
                newHeight = Math.max(400, e.touches[0].clientY - rect.top);
                newX = e.touches[0].clientX;
                break;
              case 'ne':
                newWidth = Math.max(300, e.touches[0].clientX - rect.left);
                newHeight = Math.max(400, rect.bottom - e.touches[0].clientY);
                newY = e.touches[0].clientY;
                break;
              case 'nw':
                newWidth = Math.max(300, rect.right - e.touches[0].clientX);
                newHeight = Math.max(400, rect.bottom - e.touches[0].clientY);
                newX = e.touches[0].clientX;
                newY = e.touches[0].clientY;
                break;
            }
            
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            newWidth = Math.min(newWidth, windowWidth - newX);
            newHeight = Math.min(newHeight, windowHeight - newY);
            
            setSize({ width: newWidth, height: newHeight });
            setPosition({ x: newX, y: newY });
          }
        }
      };
      
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDirection(null);
      };
      
      const handleGlobalTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDirection(null);
      };
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, isResizing, resizeDirection, dragOffset, setPosition, position, size]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText('');

    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      addMessage(botMessage);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('payroll') || lowerInput.includes('salary') || lowerInput.includes('wage')) {
      return 'I can help calculate worker payroll. Please provide the worker\'s hourly rate and hours worked.';
    } else if (lowerInput.includes('event') || lowerInput.includes('schedule')) {
      return 'I can help you create a new event. Would you like to create an event for a specific project?';
    } else if (lowerInput.includes('document') || lowerInput.includes('contract')) {
      return 'I can help you manage documents. What type of document are you looking for?';
    } else if (lowerInput.includes('worker') || lowerInput.includes('employee')) {
      return 'I can help with worker management. Would you like to add a new worker or view existing workers?';
    } else if (lowerInput.includes('project')) {
      return 'I can help with project management. Would you like to create a new project or view existing ones?';
    } else {
      return 'I can help with worker calculations, creating events, and managing documents. Please be more specific about what you need.';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col
        ${isMinimized ? 'w-72 h-12' : ''} transition-all duration-200`}
      style={{ 
        zIndex: 1000,
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
        width: isMinimized ? '288px' : `${size.width}px`,
        height: isMinimized ? '48px' : `${size.height}px`,
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="drag-handle flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-move">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white select-none">Assistant</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div 
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize group"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            onTouchStart={(e) => handleTouchResizeStart(e, 'nw')}
          >
            <div className="absolute top-0 left-0 w-2 h-2 bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div 
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize group"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            onTouchStart={(e) => handleTouchResizeStart(e, 'ne')}
          >
            <div className="absolute top-0 right-0 w-2 h-2 bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div 
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize group"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            onTouchStart={(e) => handleTouchResizeStart(e, 'sw')}
          >
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            onTouchStart={(e) => handleTouchResizeStart(e, 'se')}
          >
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </>
      )}
    </div>
  );
}