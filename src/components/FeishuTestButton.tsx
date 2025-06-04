import React, { useState } from 'react';
import { feishuAPI } from '../utils/feishuApi';

export const FeishuTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    
    console.log('🎯 开始界面测试流程...');
    
    try {
      console.log('📞 调用feishuAPI.testConnection()...');
      const testResult = await feishuAPI.testConnection();
      console.log('📤 测试结果:', testResult);
      
      setResult(testResult);
      
      // 额外的成功验证
      if (testResult.success) {
        console.log('🎉 界面显示：测试成功！');
      } else {
        console.log('❌ 界面显示：测试失败:', testResult.message);
      }
      
    } catch (error) {
      console.error('💥 界面测试异常:', error);
      const errorResult = {
        success: false,
        message: `测试过程中出错: ${error instanceof Error ? error.message : '未知错误'}`
      };
      console.log('📤 设置错误结果:', errorResult);
      setResult(errorResult);
    } finally {
      console.log('⏹️ 测试流程结束');
      setTesting(false);
    }
  };

  // 检查配置状态
  const isConfigured = feishuAPI.isConfigured();
  const isEnabled = feishuAPI.isEnabled();

  return (
    <div className="fixed bottom-4 left-4 max-w-sm z-50">
      {/* 配置状态指示器 */}
      <div className="mb-2 text-xs">
        <div className={`flex items-center gap-2 ${isConfigured ? 'text-green-600' : 'text-red-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></span>
          飞书配置: {isConfigured ? '已配置' : '未配置'}
        </div>
        <div className={`flex items-center gap-2 ${isEnabled ? 'text-green-600' : 'text-gray-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          飞书日志: {isEnabled ? '已启用' : '已禁用'}
        </div>
      </div>

      {/* 测试按钮 */}
      <button
        onClick={handleTest}
        disabled={testing || !isConfigured}
        className={`px-4 py-2 rounded-lg shadow-lg text-sm transition-colors ${
          !isConfigured 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : testing
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {testing ? '测试中...' : '测试飞书连接'}
      </button>

      {/* 测试结果 */}
      {result && (
        <div 
          className={`mt-2 p-3 rounded-lg text-sm ${
            result.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">
              {result.success ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-medium">
                {result.success ? '连接成功' : '连接失败'}
              </div>
              <div className="text-xs mt-1 opacity-80">
                {result.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 说明信息 */}
      {!isConfigured && (
        <div className="mt-2 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs">
          <div className="font-medium mb-1">需要配置飞书参数：</div>
          <div className="space-y-1">
            <div>• VITE_FEISHU_APP_ID</div>
            <div>• VITE_FEISHU_APP_SECRET</div>
            <div>• VITE_FEISHU_APP_TOKEN</div>
            <div>• VITE_FEISHU_TABLE_ID</div>
            <div>• VITE_ENABLE_FEISHU_LOG=true</div>
          </div>
        </div>
      )}

      {isConfigured && !isEnabled && (
        <div className="mt-2 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs">
          飞书配置已就绪，但日志功能未启用。
          <br />
          请设置 VITE_ENABLE_FEISHU_LOG=true
        </div>
      )}
    </div>
  );
}; 