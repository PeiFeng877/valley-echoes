// LLM调用日志记录工具
import { feishuAPI } from './feishuApi';

export interface LLMCallLog {
  id: string;
  timestamp: string;
  inputWord: string;
  request: {
    model: string;
    prompt: string;
    parameters: any;
  };
  response?: {
    opposite: string;
    quote: string;
    rawContent: string;
    reasoningContent?: string;
    usage?: any;
  };
  error?: {
    message: string;
    details: any;
  };
  duration: number;
  status: 'pending' | 'success' | 'error';
}

class LLMLogger {
  private logs: LLMCallLog[] = [];
  private maxLogs = 100; // 最多保存100条日志

  // 开始记录一次LLM调用
  startCall(inputWord: string, model: string, prompt: string, parameters: any): string {
    const id = `llm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const log: LLMCallLog = {
      id,
      timestamp: new Date().toISOString(),
      inputWord,
      request: {
        model,
        prompt,
        parameters
      },
      duration: Date.now(),
      status: 'pending'
    };

    this.logs.unshift(log);
    
    // 保持日志数量在限制范围内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    console.group(`🤖 LLM调用开始 [${inputWord}]`);
    console.log('📝 调用ID:', id);
    console.log('🕐 时间:', new Date(log.timestamp).toLocaleString());
    console.log('🎯 输入词语:', inputWord);
    console.log('🧠 模型:', model);
    console.log('💭 提示词:', prompt);
    console.log('⚙️ 参数:', parameters);
    console.groupEnd();

    // 发送到飞书表格 - 开始状态
    this.sendToFeishu(log).catch(error => {
      console.warn('⚠️ 发送飞书日志失败（开始）:', error);
      console.warn('📊 错误详情:', {
        message: error.message,
        stack: error.stack,
        logId: id,
        inputWord: inputWord
      });
    });

    return id;
  }

  // 记录成功响应
  logSuccess(
    id: string, 
    opposite: string, 
    quote: string, 
    rawContent: string, 
    reasoningContent?: string,
    usage?: any
  ) {
    const log = this.logs.find(l => l.id === id);
    if (!log) return;

    log.duration = Date.now() - log.duration;
    log.status = 'success';
    log.response = {
      opposite,
      quote,
      rawContent,
      reasoningContent,
      usage
    };

    console.group(`✅ LLM调用成功 [${log.inputWord}] - ${log.duration}ms`);
    console.log('📝 调用ID:', id);
    console.log('🎯 对立词:', opposite);
    console.log('📜 箴言:', quote);
    console.log('📄 原始响应:', rawContent);
    if (reasoningContent) {
      console.log('🧠 推理过程:', reasoningContent);
    }
    if (usage) {
      console.log('📊 Token使用:', usage);
    }
    console.log('⏱️ 耗时:', `${log.duration}ms`);
    console.groupEnd();

    // 发送到飞书表格 - 成功状态
    this.sendToFeishu(log).catch(error => {
      console.warn('⚠️ 发送飞书日志失败（成功）:', error);
      console.warn('📊 错误详情:', {
        message: error.message,
        stack: error.stack,
        logId: id,
        inputWord: log.inputWord,
        responseData: { opposite, quote }
      });
    });

    // 触发日志更新事件
    this.notifyLogUpdate();
  }

  // 记录错误
  logError(id: string, error: any) {
    const log = this.logs.find(l => l.id === id);
    if (!log) return;

    log.duration = Date.now() - log.duration;
    log.status = 'error';
    log.error = {
      message: error.message || 'Unknown error',
      details: error
    };

    console.group(`❌ LLM调用失败 [${log.inputWord}] - ${log.duration}ms`);
    console.log('📝 调用ID:', id);
    console.error('💥 错误信息:', error.message);
    console.error('🔍 错误详情:', error);
    console.log('⏱️ 耗时:', `${log.duration}ms`);
    console.groupEnd();

    // 发送到飞书表格 - 错误状态
    this.sendToFeishu(log).catch(sendError => {
      console.warn('⚠️ 发送飞书日志失败（错误）:', sendError);
      console.warn('📊 错误详情:', {
        sendErrorMessage: sendError.message,
        sendErrorStack: sendError.stack,
        originalError: error.message,
        logId: id,
        inputWord: log.inputWord
      });
    });

    // 触发日志更新事件
    this.notifyLogUpdate();
  }

  // 发送日志到飞书表格
  private async sendToFeishu(log: LLMCallLog): Promise<void> {
    if (!feishuAPI.isEnabled()) {
      return;
    }

    try {
      const record = {
        call_id: log.id,
        timestamp: new Date(log.timestamp).getTime(), // Unix时间戳（毫秒）
        input_word: log.inputWord,
        opposite_word: log.response?.opposite || '',
        quote: log.response?.quote || '', // AI生成的箴言/注解
        status: this.getStatusText(log.status),
        duration_ms: log.status !== 'pending' ? log.duration : undefined,
        token_usage: log.response?.usage?.total_tokens || undefined,
        error_message: log.error?.message || '',
        reasoning_process: log.response?.reasoningContent || '',
        model_name: log.request.model
      };

      await feishuAPI.createLogRecord(record);
    } catch (error) {
      // 不影响主流程，只是静默失败
      console.debug('飞书日志发送失败:', error);
    }
  }

  // 获取状态文本
  private getStatusText(status: string): string {
    switch (status) {
      case 'pending': return '进行中';
      case 'success': return '成功';
      case 'error': return '失败';
      default: return status;
    }
  }

  // 获取所有日志
  getAllLogs(): LLMCallLog[] {
    return [...this.logs];
  }

  // 获取最近的日志
  getRecentLogs(count: number = 10): LLMCallLog[] {
    return this.logs.slice(0, count);
  }

  // 获取统计信息
  getStats() {
    const total = this.logs.length;
    const success = this.logs.filter(l => l.status === 'success').length;
    const error = this.logs.filter(l => l.status === 'error').length;
    const pending = this.logs.filter(l => l.status === 'pending').length;
    
    const avgDuration = this.logs
      .filter(l => l.status !== 'pending')
      .reduce((sum, log) => sum + log.duration, 0) / (total - pending) || 0;

    return {
      total,
      success,
      error,
      pending,
      successRate: total > 0 ? (success / total * 100).toFixed(1) : '0.0',
      avgDuration: Math.round(avgDuration)
    };
  }

  // 导出日志为JSON
  exportLogs(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      stats: this.getStats(),
      logs: this.logs
    }, null, 2);
  }

  // 清空日志
  clearLogs() {
    this.logs = [];
    console.log('🧹 日志已清空');
    this.notifyLogUpdate();
  }

  // 手动同步所有日志到飞书
  async syncAllToFeishu(): Promise<number> {
    if (!feishuAPI.isEnabled()) {
      console.log('📴 飞书日志功能未启用');
      return 0;
    }

    let syncCount = 0;
    console.log('🔄 开始同步所有日志到飞书...');

    for (const log of this.logs) {
      try {
        await this.sendToFeishu(log);
        syncCount++;
      } catch (error) {
        console.error(`同步日志失败 ${log.id}:`, error);
      }
    }

    console.log(`✅ 已同步 ${syncCount}/${this.logs.length} 条日志到飞书`);
    return syncCount;
  }

  // 日志更新通知（用于UI更新）
  private logUpdateCallbacks: Array<() => void> = [];
  
  onLogUpdate(callback: () => void) {
    this.logUpdateCallbacks.push(callback);
  }

  private notifyLogUpdate() {
    this.logUpdateCallbacks.forEach(callback => callback());
  }
}

// 创建全局日志实例
export const llmLogger = new LLMLogger();

// 在浏览器控制台中添加便捷方法
if (typeof window !== 'undefined') {
  (window as any).llmLogger = {
    getLogs: () => llmLogger.getAllLogs(),
    getStats: () => llmLogger.getStats(),
    exportLogs: () => {
      const logs = llmLogger.exportLogs();
      console.log('📁 日志导出完成，可复制以下内容保存：');
      console.log(logs);
      return logs;
    },
    clearLogs: () => llmLogger.clearLogs(),
    syncToFeishu: () => llmLogger.syncAllToFeishu()
  };
  
  console.log('🔧 LLM日志工具已加载，可在控制台使用：');
  console.log('   - window.llmLogger.getLogs() - 获取所有日志');
  console.log('   - window.llmLogger.getStats() - 获取统计信息');
  console.log('   - window.llmLogger.exportLogs() - 导出日志');
  console.log('   - window.llmLogger.clearLogs() - 清空日志');
  console.log('   - window.llmLogger.syncToFeishu() - 手动同步到飞书');
} 