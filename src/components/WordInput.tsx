import React, { useState, useRef, useEffect } from 'react';

interface WordInputProps {
  onSubmit: (word: string) => void;
}

export const WordInput: React.FC<WordInputProps> = ({ onSubmit }) => {
  const [word, setWord] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim()) {
      onSubmit(word.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-8 md:px-8 px-4">
      {/* Valley opening quote */}
      <div className="text-center mb-16 md:mb-16 mb-12 animate-fade-in">
        <h1 className="font-serif-sc text-xl md:text-xl text-lg font-light text-valley-stone mb-4 tracking-wider">
          维谷
        </h1>
        <p className="valley-quote text-valley-echo mb-8 md:mb-8 mb-6 md:text-sm text-xs leading-relaxed">
          把世界最锋利的冲突，安放进最沉静的峡谷
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="写下一词，投向谷底"
            className="valley-input w-full py-4 px-2 text-center md:text-xl text-lg"
            maxLength={20}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
          
          {/* Animated underline */}
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-valley-stone transition-all duration-500 ${
            isFocused ? 'w-full' : 'w-0'
          }`} />
        </div>

        {/* Subtle instruction */}
        <div className="text-center mt-8 md:mt-8 mt-6">
          <p className="text-valley-whisper text-sm md:text-sm text-xs font-light tracking-wide px-4">
            {word ? '按下回车，让词语坠入峡谷' : '静候你的思考'}
          </p>
        </div>
      </form>

      {/* Ambient elements - 移动端隐藏或调整位置 */}
      <div className="absolute top-1/4 left-8 opacity-20 hidden md:block">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-valley-whisper to-transparent" />
      </div>
      <div className="absolute top-1/3 right-12 opacity-15 hidden md:block">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-valley-echo to-transparent" />
      </div>
      
      {/* 移动端简化的装饰元素 */}
      <div className="absolute top-1/4 left-4 opacity-15 md:hidden">
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-valley-whisper to-transparent" />
      </div>
      <div className="absolute top-1/3 right-4 opacity-10 md:hidden">
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-valley-echo to-transparent" />
      </div>
    </div>
  );
};
