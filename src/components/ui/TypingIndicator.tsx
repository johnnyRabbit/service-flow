import { useState, useEffect, useRef } from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  name?: string;
  variant?: 'ai' | 'user';
}

export function TypingIndicator({ isTyping, name = 'Assistente IA', variant = 'ai' }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className={`flex ${variant === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${
        variant === 'user'
          ? 'bg-green-600 text-white rounded-br-sm'
          : 'bg-white border border-gray-200 rounded-bl-sm'
      }`}>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full animate-bounce ${
            variant === 'user' ? 'bg-white' : 'bg-primary-500'
          }`} style={{ animationDelay: '0ms' }}></span>
          <span className={`w-2 h-2 rounded-full animate-bounce ${
            variant === 'user' ? 'bg-white' : 'bg-primary-500'
          }`} style={{ animationDelay: '150ms' }}></span>
          <span className={`w-2 h-2 rounded-full animate-bounce ${
            variant === 'user' ? 'bg-white' : 'bg-primary-500'
          }`} style={{ animationDelay: '300ms' }}></span>
        </div>
        <span className={`text-xs ${variant === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
          {name} está a escrever...
        </span>
      </div>
    </div>
  );
}
