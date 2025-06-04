import React, { useState, useEffect } from 'react';
import { llmLogger, LLMCallLog } from '../utils/logger';

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LLMCallLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LLMCallLog | null>(null);

  useEffect(() => {
    // 获取初始日志
    setLogs(llmLogger.getAllLogs());

    // 监听日志更新
    const updateLogs = () => {
      setLogs(llmLogger.getAllLogs());
    };

    llmLogger.onLogUpdate(updateLogs);
  }, []);

  const stats = llmLogger.getStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '🔄';
      default: return '⚪';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-valley-stone text-white px-4 py-2 rounded-lg shadow-lg hover:bg-valley-stone/80 transition-colors text-sm z-50"
      >
        查看日志 ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-valley-stone text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">LLM调用日志</h3>
            <div className="text-sm opacity-90 mt-1">
              总计: {stats.total} | 成功: {stats.success} | 失败: {stats.error} | 
              成功率: {stats.successRate}% | 平均耗时: {stats.avgDuration}ms
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const logs = llmLogger.exportLogs();
                navigator.clipboard.writeText(logs);
                alert('日志已复制到剪贴板');
              }}
              className="bg-valley-stone/70 hover:bg-valley-stone/50 px-3 py-1 rounded text-sm"
            >
              导出
            </button>
            <button
              onClick={() => {
                if (confirm('确定要清空所有日志吗？')) {
                  llmLogger.clearLogs();
                }
              }}
              className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
            >
              清空
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="bg-valley-stone/70 hover:bg-valley-stone/50 px-3 py-1 rounded text-sm"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="flex h-[calc(80vh-80px)]">
          {/* 日志列表 */}
          <div className="w-1/2 border-r overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">暂无日志</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedLog?.id === log.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{log.inputWord}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.status !== 'pending' ? `${log.duration}ms` : '进行中'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                  {log.response && (
                    <div className="text-sm text-gray-800 mt-1">
                      → {log.response.opposite}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 日志详情 */}
          <div className="w-1/2 overflow-y-auto">
            {selectedLog ? (
              <div className="p-4">
                <h4 className="font-medium mb-3">日志详情</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>调用ID:</strong> {selectedLog.id}
                  </div>
                  <div>
                    <strong>时间:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <strong>输入词语:</strong> {selectedLog.inputWord}
                  </div>
                  <div>
                    <strong>模型:</strong> {selectedLog.request.model}
                  </div>
                  <div>
                    <strong>状态:</strong> 
                    <span className={`ml-1 ${getStatusColor(selectedLog.status)}`}>
                      {getStatusIcon(selectedLog.status)} {selectedLog.status}
                    </span>
                  </div>
                  
                  {selectedLog.response && (
                    <>
                      <div>
                        <strong>对立词:</strong> {selectedLog.response.opposite}
                      </div>
                      <div>
                        <strong>箴言:</strong>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700 whitespace-pre-line">
                          {selectedLog.response.quote}
                        </div>
                      </div>
                      <div>
                        <strong>原始响应:</strong>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-32 overflow-y-auto">
                          {selectedLog.response.rawContent}
                        </div>
                      </div>
                      {selectedLog.response.reasoningContent && (
                        <div>
                          <strong>推理过程:</strong>
                          <div className="mt-1 p-2 bg-blue-50 rounded text-xs text-gray-700 max-h-48 overflow-y-auto">
                            {selectedLog.response.reasoningContent}
                          </div>
                        </div>
                      )}
                      {selectedLog.response.usage && (
                        <div>
                          <strong>Token使用:</strong>
                          <div className="mt-1 text-xs text-gray-600">
                            输入: {selectedLog.response.usage.prompt_tokens} | 
                            输出: {selectedLog.response.usage.completion_tokens} | 
                            总计: {selectedLog.response.usage.total_tokens}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedLog.error && (
                    <div>
                      <strong>错误信息:</strong>
                      <div className="mt-1 p-2 bg-red-50 rounded text-red-700 text-xs">
                        {selectedLog.error.message}
                      </div>
                    </div>
                  )}

                  <div>
                    <strong>提示词:</strong>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-32 overflow-y-auto">
                      {selectedLog.request.prompt}
                    </div>
                  </div>

                  <div>
                    <strong>参数:</strong>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {JSON.stringify(selectedLog.request.parameters, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-500 text-center">
                点击左侧日志查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 