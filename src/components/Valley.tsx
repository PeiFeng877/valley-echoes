import React, { useState, useEffect } from 'react';
import { WordInput } from './WordInput';
import { PeakConfrontation } from './PeakConfrontation';
import { LogViewer } from './LogViewer';
import { FeishuTestButton } from './FeishuTestButton';
import OpenAI from 'openai';
import { llmLogger } from '../utils/logger';
import { feishuAPI } from '../utils/feishuApi';

// 扩展OpenAI的消息类型以支持reasoning_content
interface DeepSeekMessage {
  content: string | null;
  reasoning_content?: string;
  role: string;
}

interface DeepSeekChoice {
  message: DeepSeekMessage;
  index: number;
  finish_reason: string | null;
}

interface DeepSeekResponse {
  choices: DeepSeekChoice[];
  usage?: any;
}

interface ValleyState {
  mode: 'input' | 'falling' | 'confrontation' | 'loading';
  inputWord: string;
  oppositeWord: string;
  quote: string;
  error?: string;
}

// DeepSeek AI 配置
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-your-api-key-here', // 请替换为你的API密钥
  dangerouslyAllowBrowser: true // 允许在浏览器中使用
});

const Valley: React.FC = () => {
  const [state, setState] = useState<ValleyState>({
    mode: 'input',
    inputWord: '',
    oppositeWord: '',
    quote: ''
  });

  const handleWordSubmit = async (word: string) => {
    setState(prev => ({ ...prev, inputWord: word, mode: 'falling', error: undefined }));
    
    // Simulate word falling animation
    setTimeout(async () => {
      setState(prev => ({ ...prev, mode: 'loading' }));
      
      try {
        const result = await generateConfrontationWithAI(word);
        setState(prev => ({
          ...prev,
          oppositeWord: result.opposite,
          quote: result.quote,
          mode: 'confrontation'
        }));
      } catch (error) {
        console.error('AI调用失败:', error);
        setState(prev => ({
          ...prev,
          error: 'AI服务暂时不可用，请稍后再试',
          mode: 'input'
        }));
      }
    }, 1200);
  };

  const handleNewThought = () => {
    setState({
      mode: 'input',
      inputWord: '',
      oppositeWord: '',
      quote: '',
      error: undefined
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient representing valley walls */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-gray-50 to-white" />
      
      {/* Subtle mountain silhouettes */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-valley-mist/10 to-transparent" />
      <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-bl from-valley-stone/5 to-transparent" />
      
      <div className="relative z-10 h-screen flex items-center justify-center">
        {state.mode === 'input' && (
          <div className="w-full">
            <WordInput onSubmit={handleWordSubmit} />
            {state.error && (
              <div className="text-center mt-8">
                <p className="text-red-500 text-sm">{state.error}</p>
              </div>
            )}
          </div>
        )}
        
        {state.mode === 'falling' && (
          <div className="animate-word-fall">
            <span className="peak-word text-valley-stone">
              {state.inputWord}
            </span>
          </div>
        )}
        
        {state.mode === 'loading' && (
          <div className="flex items-center justify-center">
            {/* 三颗微光圆点 - 冷金色石英 */}
            <div className="flex space-x-4">
              <div className="thinking-dot thinking-dot-1"></div>
              <div className="thinking-dot thinking-dot-2"></div>
              <div className="thinking-dot thinking-dot-3"></div>
            </div>
          </div>
        )}
        
        {state.mode === 'confrontation' && (
          <PeakConfrontation
            leftWord={state.inputWord}
            rightWord={state.oppositeWord}
            quote={state.quote}
            onNewThought={handleNewThought}
          />
        )}
      </div>
      
      {/* Breathing ambient elements */}
      <div className="absolute bottom-10 left-10 w-2 h-2 rounded-full bg-valley-whisper/30 animate-breath" />
      <div className="absolute top-20 right-20 w-1 h-1 rounded-full bg-valley-echo/20 animate-breath" style={{ animationDelay: '2s' }} />
      
      {/* Log Viewer Component - 隐藏，保留功能 */}
      {false && <LogViewer />}
      
      {/* Feishu Test Button - 隐藏，保留功能 */}
      {false && <FeishuTestButton />}
    </div>
  );
};

// 使用DeepSeek AI生成词语对立关系
const generateConfrontationWithAI = async (word: string): Promise<{ opposite: string; quote: string }> => {
  const systemPrompt = `峡谷只回应美德相撞。
来词坠谷，拾一等量正当之峰与之对峙。
忌贬义/否词。
仅回两行：
峰：<对峙词>
谷：一句刻其张力
其余沉默。`;

  const userPrompt = word; // 只包含用户输入的词语

  const parameters = {
    model: "deepseek-reasoner",
    max_tokens: 1000,
    temperature: 0.8
  };

  // 开始记录日志
  const logId = llmLogger.startCall(word, parameters.model, `系统：${systemPrompt}\n用户：${userPrompt}`, parameters);

  try {
    const response = await openai.chat.completions.create({
      model: parameters.model,
      messages: [
        {
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      max_tokens: parameters.max_tokens,
      temperature: parameters.temperature
    }) as DeepSeekResponse;

    const responseText = response.choices[0].message.content;
    const reasoningContent = response.choices[0].message.reasoning_content;
    const usage = response.usage;
    
    // 解析新的响应格式
    if (responseText) {
      const lines = responseText.trim().split('\n');
      let opposite = '';
      let quote = '';

      // 解析 "峰：<对立词>" 格式
      const peakLine = lines.find(line => line.startsWith('峰：') || line.includes('峰：'));
      if (peakLine) {
        opposite = peakLine.replace(/^峰：/, '').trim();
      }

      // 解析 "谷：<箴言>" 格式  
      const valleyLine = lines.find(line => line.startsWith('谷：') || line.includes('谷：'));
      if (valleyLine) {
        quote = valleyLine.replace(/^谷：/, '').trim();
      }

      // 如果成功解析出内容
      if (opposite && quote) {
        // 记录成功日志
        llmLogger.logSuccess(
          logId, 
          opposite, 
          quote, 
          responseText, 
          reasoningContent,
          usage
        );
        
        return { opposite, quote };
      }

      // 如果解析失败，尝试更宽松的解析
      console.log('🔄 标准解析失败，尝试宽松解析...');
      
      // 寻找包含"峰"或"："的行作为对立词
      for (const line of lines) {
        if (line.includes('峰') && line.includes('：')) {
          opposite = line.split('：')[1]?.trim() || '';
          break;
        }
      }
      
      // 寻找包含"谷"或较长的行作为箴言
      for (const line of lines) {
        if (line.includes('谷') && line.includes('：')) {
          quote = line.split('：')[1]?.trim() || '';
          break;
        } else if (!opposite && line.length > 10) {
          // 如果没找到明确的格式，较长的行可能是箴言
          quote = line.trim();
        }
      }

      if (opposite && quote) {
        console.log('✅ 宽松解析成功');
        llmLogger.logSuccess(logId, opposite, quote, responseText, reasoningContent, usage);
        return { opposite, quote };
      }
    }

    // 解析失败的情况
    const parseError = new Error('无法从AI响应中解析出峰谷格式');
    llmLogger.logError(logId, {
      ...parseError,
      rawResponse: responseText,
      reasoningContent,
      expectedFormat: '峰：<对立词>\\n谷：<箴言>'
    });
    
    throw parseError;

  } catch (error) {
    // 记录API调用错误
    llmLogger.logError(logId, error);
    
    console.error('DeepSeek AI调用失败:', error);
    
    // 备用方案：使用新格式的预设回复
    const fallbackPairs: Record<string, { opposite: string; quote: string }> = {
      '自由': { 
        opposite: '秩序', 
        quote: '自由若无度，必侵蚀秩序；秩序若极致，遂束缚自由。' 
      },
      '光明': { 
        opposite: '深邃', 
        quote: '光明照亮表象，深邃孕育真理。' 
      },
      '希望': { 
        opposite: '现实', 
        quote: '希望牵引未来，现实锚定当下。' 
      }
    };
    
    const fallbackResult = fallbackPairs[word] || {
      opposite: '沉静',
      quote: `每个美德都有其对峙之峰，在思想的峡谷中回响。`
    };

    // 为备用方案也记录日志
    console.log(`🔄 使用备用方案: ${word} -> ${fallbackResult.opposite}`);
    
    return fallbackResult;
  }
};

export default Valley;
