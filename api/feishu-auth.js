// Vercel API函数：获取飞书访问令牌
export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ code: -1, msg: 'Method not allowed' });
  }

  try {
    console.log('🔐 Vercel: 开始获取飞书访问令牌...');
    console.log('📋 请求方法:', req.method);
    console.log('📋 请求头:', JSON.stringify(req.headers, null, 2));
    
    // 从Vercel环境变量读取配置（注意：没有VITE_前缀）
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;
    
    console.log('🔧 环境变量检查:', { 
      appId: appId ? `存在(${appId.substring(0, 8)}...)` : '缺失',
      appSecret: appSecret ? `存在(${appSecret.substring(0, 8)}...)` : '缺失',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('FEISHU'))
    });
    
    if (!appId || !appSecret) {
      console.error('❌ 飞书配置缺失:', { appId: !!appId, appSecret: !!appSecret });
      return res.status(500).json({ 
        code: -1, 
        msg: '飞书配置缺失，请检查环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET' 
      });
    }

    // 调用飞书API获取访问令牌
    const requestBody = {
      app_id: appId,
      app_secret: appSecret
    };
    
    console.log('📤 发送请求到飞书API...');
    console.log('🔗 请求URL:', 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal');
    console.log('📦 请求体:', { ...requestBody, app_secret: '***隐藏***' });
    
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 飞书API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 飞书API HTTP错误:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📄 飞书API响应数据:', { ...data, tenant_access_token: data.tenant_access_token ? '***隐藏***' : undefined });
    
    if (data.code !== 0) {
      console.error('❌ 飞书API返回错误:', data);
      return res.status(400).json(data);
    }

    console.log('✅ Vercel: 飞书访问令牌获取成功');
    
    // 返回令牌信息
    res.status(200).json(data);

  } catch (error) {
    console.error('❌ Vercel: 获取飞书访问令牌失败:', error);
    res.status(500).json({ 
      code: -1, 
      msg: `获取访问令牌失败: ${error.message}` 
    });
  }
} 