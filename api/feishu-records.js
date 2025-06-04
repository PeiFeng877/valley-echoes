// Vercel API函数：创建飞书表格记录
export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ code: -1, msg: 'Method not allowed' });
  }

  try {
    console.log('📝 Vercel: 开始创建飞书表格记录...');
    console.log('📋 请求方法:', req.method);
    console.log('📋 请求头:', JSON.stringify(req.headers, null, 2));
    console.log('📋 请求体大小:', JSON.stringify(req.body).length, '字符');
    
    // 从请求体获取参数
    const { appToken, tableId, fields, accessToken } = req.body;
    
    console.log('📦 请求参数:', {
      appToken: appToken ? `存在(${appToken.substring(0, 8)}...)` : '缺失',
      tableId: tableId ? `存在(${tableId.substring(0, 8)}...)` : '缺失',
      fields: fields ? `存在(${Object.keys(fields).length}个字段)` : '缺失',
      accessToken: accessToken ? `存在(${accessToken.substring(0, 8)}...)` : '缺失'
    });
    
    if (!appToken || !tableId || !fields) {
      console.error('❌ 参数验证失败:', { appToken: !!appToken, tableId: !!tableId, fields: !!fields });
      return res.status(400).json({ 
        code: -1, 
        msg: '参数缺失：需要 appToken, tableId, fields' 
      });
    }

    // 如果没有传入accessToken，需要先获取
    let token = accessToken;
    if (!token) {
      // 从环境变量读取配置
      const appId = process.env.FEISHU_APP_ID;
      const appSecret = process.env.FEISHU_APP_SECRET;
      
      if (!appId || !appSecret) {
        return res.status(500).json({ 
          code: -1, 
          msg: '飞书配置缺失，请检查环境变量' 
        });
      }

      // 获取访问令牌
      const authResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret
        })
      });

      if (!authResponse.ok) {
        throw new Error(`获取访问令牌失败: HTTP ${authResponse.status}`);
      }

      const authData = await authResponse.json();
      if (authData.code !== 0) {
        throw new Error(`获取访问令牌失败: ${authData.msg}`);
      }

      token = authData.tenant_access_token;
      console.log('✅ Vercel: 访问令牌获取成功');
    }

    // 创建表格记录
    const apiUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    
    console.log('📝 正在发送记录到飞书表格...');
    console.log('🔗 API URL:', apiUrl);
    console.log('📦 字段数据:', JSON.stringify(fields, null, 2));
    console.log('🔑 使用Token:', token ? `存在(${token.substring(0, 8)}...)` : '缺失');
    
    const requestPayload = { fields: fields };
    console.log('📤 完整请求负载:', JSON.stringify(requestPayload, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('📥 飞书记录API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 飞书API请求失败:', response.status, errorText);
      console.error('❌ 请求详情:', {
        url: apiUrl,
        method: 'POST',
        headers: { 'Authorization': token ? 'Bearer ***' : '缺失', 'Content-Type': 'application/json' },
        bodySize: JSON.stringify(requestPayload).length
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📄 飞书记录API响应数据:', JSON.stringify(data, null, 2));
    
    if (data.code !== 0) {
      console.error('❌ 飞书API返回错误:', data);
      return res.status(400).json(data);
    }

    console.log('✅ Vercel: 飞书表格记录创建成功');
    
    // 返回创建结果
    res.status(200).json(data);

  } catch (error) {
    console.error('❌ Vercel: 创建飞书表格记录失败:', error);
    res.status(500).json({ 
      code: -1, 
      msg: `创建记录失败: ${error.message}` 
    });
  }
} 