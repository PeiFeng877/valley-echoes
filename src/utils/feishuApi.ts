// 飞书多维表格API工具
interface FeishuConfig {
  appId: string;
  appSecret: string;
  appToken: string;
  tableId: string;
}

interface AccessTokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

interface CreateRecordResponse {
  code: number;
  msg: string;
  data?: {
    record: {
      record_id: string;
      fields: any;
    };
  };
}

interface LogRecord {
  call_id: string;
  timestamp: number; // Unix时间戳
  input_word: string;
  opposite_word?: string;
  quote?: string; // AI生成的箴言/注解
  status: string;
  duration_ms?: number;
  token_usage?: number;
  error_message?: string;
  reasoning_process?: string;
  model_name?: string;
}

class FeishuAPI {
  private config: FeishuConfig;
  private accessToken: string = '';
  private tokenExpireTime: number = 0;

  constructor() {
    this.config = {
      appId: import.meta.env.VITE_FEISHU_APP_ID || '',
      appSecret: import.meta.env.VITE_FEISHU_APP_SECRET || '',
      appToken: import.meta.env.VITE_FEISHU_APP_TOKEN || '',
      tableId: import.meta.env.VITE_FEISHU_TABLE_ID || ''
    };
  }

  // 检查配置是否完整
  isConfigured(): boolean {
    return !!(this.config.appId && this.config.appSecret && 
             this.config.appToken && this.config.tableId);
  }

  // 检查是否启用飞书日志
  isEnabled(): boolean {
    const enabled = import.meta.env.VITE_ENABLE_FEISHU_LOG === 'true';
    const configured = this.isConfigured();
    console.log('🔍 飞书日志状态检查:', {
      VITE_ENABLE_FEISHU_LOG: import.meta.env.VITE_ENABLE_FEISHU_LOG,
      enabled,
      configured,
      finalResult: enabled && configured
    });
    return enabled && configured;
  }

  // 获取访问令牌
  private async getAccessToken(): Promise<string> {
    // 如果token还未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      console.log('🔐 正在获取飞书访问令牌...');
      console.log('🏗️ 运行环境:', import.meta.env.DEV ? '开发环境' : '生产环境');
      console.log('🔧 配置检查:', {
        appId: this.config.appId ? `存在(${this.config.appId.substring(0, 8)}...)` : '缺失',
        appSecret: this.config.appSecret ? `存在(${this.config.appSecret.substring(0, 8)}...)` : '缺失',
        appToken: this.config.appToken ? `存在(${this.config.appToken.substring(0, 8)}...)` : '缺失',
        tableId: this.config.tableId ? `存在(${this.config.tableId.substring(0, 8)}...)` : '缺失'
      });
      
      // 根据环境使用不同的API地址
      const apiUrl = import.meta.env.DEV 
        ? '/api/feishu/open-apis/auth/v3/tenant_access_token/internal'  // 开发环境使用代理
        : '/api/feishu-auth';  // 生产环境使用Vercel API函数
      
      console.log('🔗 API地址:', apiUrl);
      
      // 开发环境需要传递认证信息，生产环境由API函数从环境变量读取
      const requestBody = import.meta.env.DEV 
        ? JSON.stringify({
            app_id: this.config.appId,
            app_secret: this.config.appSecret
          })
        : JSON.stringify({}); // 生产环境的API函数从环境变量读取
      
      console.log('📦 请求体大小:', requestBody.length, '字符');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      console.log('📥 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP请求失败:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data: AccessTokenResponse = await response.json();
      console.log('📄 响应数据:', { ...data, tenant_access_token: data.tenant_access_token ? '***隐藏***' : undefined });
      
      if (data.code !== 0) {
        throw new Error(`飞书API错误 ${data.code}: ${data.msg}`);
      }

      this.accessToken = data.tenant_access_token;
      // 提前10分钟过期，确保不会在使用时过期
      this.tokenExpireTime = Date.now() + (data.expire - 600) * 1000;
      
      console.log('✅ 飞书访问令牌获取成功');
      return this.accessToken;

    } catch (error) {
      console.error('❌ 获取飞书访问令牌失败:', error);
      throw error;
    }
  }

  // 创建日志记录
  async createLogRecord(record: LogRecord): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log('📴 飞书日志功能未启用');
      return false;
    }

    try {
      const token = await this.getAccessToken();
      
      console.log('📝 正在发送日志到飞书表格...');
      console.log('🏗️ 运行环境:', import.meta.env.DEV ? '开发环境' : '生产环境');
      console.log('📦 记录数据:', JSON.stringify(record, null, 2));

      if (import.meta.env.DEV) {
        // 开发环境：使用代理
        const apiUrl = `/api/feishu/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: record
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CreateRecordResponse = await response.json();
        
        if (data.code !== 0) {
          throw new Error(`飞书API错误 ${data.code}: ${data.msg}`);
        }
      } else {
        // 生产环境：使用Vercel API函数
        console.log('🏭 生产环境：调用Vercel API函数创建记录...');
        const requestPayload = {
          appToken: this.config.appToken,
          tableId: this.config.tableId,
          fields: record,
          accessToken: token
        };
        console.log('📤 发送到Vercel API的数据:', {
          ...requestPayload,
          accessToken: token ? '***隐藏***' : '缺失',
          appToken: this.config.appToken ? `存在(${this.config.appToken.substring(0, 8)}...)` : '缺失'
        });
        
        const response = await fetch('/api/feishu-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        });

        console.log('📥 Vercel API响应状态:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Vercel API调用失败:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data: CreateRecordResponse = await response.json();
        console.log('📄 Vercel API响应数据:', JSON.stringify(data, null, 2));
        
        if (data.code !== 0) {
          console.error('❌ Vercel API返回业务错误:', data);
          throw new Error(`飞书API错误 ${data.code}: ${data.msg}`);
        }
      }

      console.log('✅ 日志已成功发送到飞书表格');
      return true;

    } catch (error) {
      console.error('❌ 发送飞书日志失败:', error);
      return false;
    }
  }

  // 测试连接
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: '飞书配置不完整，请检查环境变量'
      };
    }

    try {
      console.log('🧪 开始飞书连接测试...');
      
      // 第一步：获取token
      const token = await this.getAccessToken();
      console.log('✅ Token获取成功');
      
      // 第二步：发送测试记录
      const testRecord: LogRecord = {
        call_id: `test_${Date.now()}`,
        timestamp: Date.now(), // Unix时间戳（毫秒）
        input_word: '测试连接',
        status: '测试',
        model_name: '连接测试'
      };

      console.log('📝 正在发送测试记录...', testRecord);

      if (import.meta.env.DEV) {
        // 开发环境：使用代理
        const apiUrl = `/api/feishu/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: testRecord
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            message: `HTTP ${response.status}: ${errorText}`
          };
        }

        const data: CreateRecordResponse = await response.json();
        
        if (data.code !== 0) {
          return {
            success: false,
            message: `飞书API错误 ${data.code}: ${data.msg}`
          };
        }
      } else {
        // 生产环境：使用Vercel API函数
        const response = await fetch('/api/feishu-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appToken: this.config.appToken,
            tableId: this.config.tableId,
            fields: testRecord,
            accessToken: token
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            message: `HTTP ${response.status}: ${errorText}`
          };
        }

        const data: CreateRecordResponse = await response.json();
        
        if (data.code !== 0) {
          return {
            success: false,
            message: `飞书API错误 ${data.code}: ${data.msg}`
          };
        }
      }

      return {
        success: true,
        message: '飞书连接测试成功！'
      };

    } catch (error) {
      console.error('💥 测试连接异常:', error);
      
      return {
        success: false,
        message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 批量创建记录（用于日志批处理）
  async batchCreateRecords(records: LogRecord[]): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    const batchSize = 5; // 每批处理5条记录
    const batches = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    let successCount = 0;
    
    for (const batch of batches) {
      const promises = batch.map(record => this.createLogRecord(record));
      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          successCount++;
        }
      });
      
      // 批次间延迟，避免频率限制
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 批量创建完成: ${successCount}/${records.length} 条记录成功`);
    return successCount > 0;
  }
}

// 创建全局实例
export const feishuAPI = new FeishuAPI();

// 在浏览器控制台中添加测试方法
if (typeof window !== 'undefined') {
  (window as any).feishuAPI = {
    test: () => feishuAPI.testConnection(),
    isEnabled: () => feishuAPI.isEnabled(),
    isConfigured: () => feishuAPI.isConfigured(),
    // 新增调试方法
    debug: () => {
      console.group('🔍 飞书API调试信息');
      console.log('🏗️ 运行环境:', import.meta.env.DEV ? '开发环境' : '生产环境');
      console.log('🔧 配置状态:', {
        appId: feishuAPI.isConfigured() ? '✅ 已配置' : '❌ 缺失',
        appSecret: feishuAPI.isConfigured() ? '✅ 已配置' : '❌ 缺失',
        appToken: feishuAPI.isConfigured() ? '✅ 已配置' : '❌ 缺失',
        tableId: feishuAPI.isConfigured() ? '✅ 已配置' : '❌ 缺失'
      });
      console.log('⚙️ 启用状态:', feishuAPI.isEnabled() ? '✅ 已启用' : '❌ 未启用');
      console.log('🌍 所有环境变量:', Object.keys(import.meta.env).filter(key => key.includes('FEISHU')));
      console.groupEnd();
      
      return {
        environment: import.meta.env.DEV ? 'development' : 'production',
        configured: feishuAPI.isConfigured(),
        enabled: feishuAPI.isEnabled(),
        config: {
          appId: !!feishuAPI['config'].appId,
          appSecret: !!feishuAPI['config'].appSecret,
          appToken: !!feishuAPI['config'].appToken,
          tableId: !!feishuAPI['config'].tableId
        }
      };
    }
  };
  
  console.log('🔧 飞书API工具已加载，可在控制台使用：');
  console.log('   - window.feishuAPI.test() - 测试飞书连接');
  console.log('   - window.feishuAPI.debug() - 显示调试信息');
  console.log('   - window.feishuAPI.isEnabled() - 检查是否启用');
  console.log('   - window.feishuAPI.isConfigured() - 检查配置状态');
} 