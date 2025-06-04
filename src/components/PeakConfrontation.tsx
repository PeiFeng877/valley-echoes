import React, { useEffect, useState } from 'react';

interface PeakConfrontationProps {
  leftWord: string;
  rightWord: string;
  quote: string;
  onNewThought: () => void;
}

export const PeakConfrontation: React.FC<PeakConfrontationProps> = ({
  leftWord,
  rightWord,
  quote,
  onNewThought
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Show prompt after 2.2s delay
    const promptTimer = setTimeout(() => setShowPrompt(true), 2200);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(promptTimer);
    };
  }, []);

  const handlePromptClick = () => {
    setIsDisintegrating(true);
    // Wait for disintegration animation to complete before returning
    setTimeout(() => {
      onNewThought();
    }, 350);
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative px-4 md:px-0">
      {/* Valley mist overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-valley-whisper/5 to-transparent" />
      
      <div 
        className={`relative z-10 w-full max-w-4xl mx-auto transition-all duration-800 ${
          isVisible ? 'animate-peak-rise' : 'opacity-0'
        }`}
      >
        
        {/* Peak confrontation layout */}
        <div className="flex items-center justify-center relative">
          
          {/* Left peak - original word */}
          <div 
            className="flex-1 text-right pr-4 md:pr-8"
            onMouseEnter={() => setHoveredSide('left')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <span className={`peak-word text-valley-stone transition-all duration-300 text-2xl md:text-3xl ${
              hoveredSide === 'left' ? 'animate-tension-pulse' : ''
            }`}>
              {leftWord}
            </span>
          </div>

          {/* Valley gap - the space between peaks */}
          <div className="flex-shrink-0 w-16 md:w-32 flex items-center justify-center">
            <div className="w-px h-16 md:h-24 bg-gradient-to-b from-transparent via-valley-whisper/40 to-transparent" />
          </div>

          {/* Right peak - opposite word */}
          <div 
            className="flex-1 text-left pl-4 md:pl-8"
            onMouseEnter={() => setHoveredSide('right')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <span className={`peak-word text-valley-stone transition-all duration-300 text-2xl md:text-3xl ${
              hoveredSide === 'right' ? 'animate-tension-pulse' : ''
            }`}>
              {rightWord}
            </span>
          </div>
        </div>

        {/* Quote - the echo between peaks */}
        <div className="text-center mt-12 md:mt-16 max-w-2xl mx-auto px-4">
          <div className="valley-quote leading-loose text-xs md:text-sm">
            {quote.split('\n').map((line, index) => (
              <div key={index} className="mb-2">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* 诗意交互文字 - 谷声既息，再抛一词 */}
        <div className="text-center mt-8 md:mt-12">
          {showPrompt && (
            <div 
              className={`valley-prompt ${isDisintegrating ? 'disintegrating' : ''}`}
              onClick={handlePromptClick}
            >
              {isDisintegrating ? (
                // 解体状态：每个字符分别动画
                "—— 谷声既息，再抛一词 ——".split('').map((char, index) => (
                  <span 
                    key={index}
                    className="valley-char-fragment text-xs md:text-sm"
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      animationDuration: '350ms'
                    }}
                  >
                    {char}
                  </span>
                ))
              ) : (
                // 正常状态：完整文字
                <span className="valley-prompt-text text-xs md:text-sm">—— 谷声既息，再抛一词 ——</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ambient cliff shadows - 移动端简化 */}
      <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-valley-stone/2 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-valley-stone/2 to-transparent pointer-events-none" />
      
      {/* Floating elements for atmosphere - 移动端位置调整 */}
      <div className="absolute bottom-10 md:bottom-20 left-1/4 w-1 h-1 rounded-full bg-valley-whisper/20 animate-breath" />
      <div className="absolute top-1/4 right-1/3 w-1 h-1 rounded-full bg-valley-echo/15 animate-breath" style={{ animationDelay: '1.5s' }} />
    </div>
  );
};
