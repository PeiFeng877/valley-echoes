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
    return import.meta.env.VITE_ENABLE_FEISHU_LOG === 'true' && this.isConfigured();
  }

  // 获取访问令牌
  private async getAccessToken(): Promise<string> {
    // 如果token还未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      console.log('🔐 正在获取飞书访问令牌...');
      
      // 根据环境使用不同的API地址
      const apiUrl = import.meta.env.DEV 
        ? '/api/feishu/open-apis/auth/v3/tenant_access_token/internal'  // 开发环境使用代理
        : 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';  // 生产环境直接调用
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          app_secret: this.config.appSecret
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AccessTokenResponse = await response.json();
      
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
      
      console.log('📝 正在发送日志到飞书表格...', record);

      // 根据环境使用不同的API地址
      const apiUrl = import.meta.env.DEV 
        ? `/api/feishu/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`  // 开发环境使用代理
        : `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`;  // 生产环境直接调用

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
        // 详细的错误信息处理
        const errorText = await response.text();
        let errorDetail = '';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.msg || errorJson.message || '未知错误';
        } catch {
          errorDetail = errorText;
        }

        // 根据HTTP状态码提供具体的解决建议
        let suggestion = '';
        switch (response.status) {
          case 403:
            suggestion = `
权限不足！请检查：
1. 应用是否有 bitable:app:readwrite 权限
2. 应用是否已添加到表格并有编辑权限
3. 应用是否已发布并通过审核
4. App Token 和 Table ID 是否正确`;
            break;
          case 404:
            suggestion = `
资源未找到！请检查：
1. App Token 是否正确 (basc开头)
2. Table ID 是否正确 (tbl开头)
3. 表格是否存在且未被删除`;
            break;
          case 401:
            suggestion = `
认证失败！请检查：
1. App ID 和 App Secret 是否正确
2. Token 是否已过期
3. 应用配置是否正确`;
            break;
        }

        throw new Error(`HTTP ${response.status}: ${errorDetail}${suggestion}`);
      }

      const data: CreateRecordResponse = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`飞书API错误 ${data.code}: ${data.msg}`);
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

      // 根据环境使用不同的API地址
      const apiUrl = import.meta.env.DEV 
        ? `/api/feishu/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`  // 开发环境使用代理
        : `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`;  // 生产环境直接调用

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

      console.log('📡 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 响应内容:', errorText);
        
        let errorDetail = '';
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.msg || errorJson.message || '未知错误';
        } catch {
          errorDetail = errorText;
        }

        return {
          success: false,
          message: `HTTP ${response.status}: ${errorDetail}`
        };
      }

      // 获取并检查响应内容
      const responseText = await response.text();
      console.log('📄 完整响应内容:', responseText);

      let data: CreateRecordResponse;
      try {
        data = JSON.parse(responseText);
        console.log('📊 解析后的数据:', data);
      } catch (parseError) {
        console.error('❌ JSON解析失败:', parseError);
        return {
          success: false,
          message: `响应解析失败: ${responseText.substring(0, 100)}...`
        };
      }
      
      if (data.code !== 0) {
        console.error('❌ 飞书API返回错误码:', data.code, data.msg);
        return {
          success: false,
          message: `飞书API错误 ${data.code}: ${data.msg}`
        };
      }

      console.log('🎉 测试记录创建成功!');
      console.log('📋 记录ID:', data.data?.record?.record_id);
      
      return {
        success: true,
        message: `飞书连接测试成功！记录ID: ${data.data?.record?.record_id || '已创建'}`
      };

    } catch (error) {
      console.error('💥 测试连接异常:', error);
      
      return {
        success: false,
        message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 批量发送日志（未来扩展用）
  async batchCreateRecords(records: LogRecord[]): Promise<boolean> {
    // 飞书API支持批量创建，但需要特殊处理
    // 这里先用循环实现，后续可以优化
    let allSuccess = true;
    
    for (const record of records) {
      const success = await this.createLogRecord(record);
      if (!success) {
        allSuccess = false;
      }
    }
    
    return allSuccess;
  }
}

// 创建全局实例
export const feishuAPI = new FeishuAPI();

// 在浏览器控制台中添加测试方法
if (typeof window !== 'undefined') {
  (window as any).feishuAPI = {
    test: () => feishuAPI.testConnection(),
    isEnabled: () => feishuAPI.isEnabled(),
    isConfigured: () => feishuAPI.isConfigured()
  };
  
  console.log('🔧 飞书API工具已加载，可在控制台使用：');
  console.log('   - window.feishuAPI.test() - 测试飞书连接');
  console.log('   - window.feishuAPI.isEnabled() - 检查是否启用');
  console.log('   - window.feishuAPI.isConfigured() - 检查配置状态');
} 