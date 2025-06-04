# 维谷 · 气质与交互箴言

> 把世界最锋利的冲突，安放进最沉静的峡谷

## 🌟 项目简介

这是一个基于AI驱动的词语哲学思辨应用。用户输入任何词语，AI会找到其对立概念，并生成富有诗意的哲理箴言，呈现概念间的冲突与和谐。

### ✨ 核心特性

- **AI驱动的对立词生成**：使用DeepSeek-R1推理模型，为任何输入词语找到深层对立概念
- **动态哲理箴言**：AI创作独特的诗意箴言，体现概念间的冲突与平衡
- **优雅的交互体验**：词语坠落动画、峰峦对峙的视觉隐喻
- **完整的日志系统**：详细记录AI调用过程，包括推理内容和性能指标
- **现代化技术栈**：React + TypeScript + Vite + Tailwind CSS

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- DeepSeek API密钥

### 安装步骤

1. **克隆项目**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **安装依赖**
```bash
npm install
```

3. **配置API密钥**

创建 `.env` 文件并添加以下内容：
```env
# DeepSeek AI API Configuration
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
```

**获取API密钥方式：**
- 访问 [DeepSeek开放平台](https://platform.deepseek.com/api_keys)
- 注册/登录账户
- 创建API Key
- 复制密钥并替换上面的 `sk-your-deepseek-api-key-here`

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:8080 开始体验！

## 🎯 使用方法

1. **输入词语**：在首页输入任何中文词语，如"自由"、"爱情"、"勇气"等
2. **观察坠落**：词语会有坠落动画效果，模拟投向峡谷
3. **AI思考**：DeepSeek-R1模型会进行深度推理，寻找对立概念
4. **查看结果**：两个对立词语如山峰对峙，中间显示哲理箴言
5. **日志查看**：点击右下角"查看日志"按钮，查看AI调用的详细过程

## 🔧 技术特性

### AI集成
- **模型**：DeepSeek-R1-0528 (deepseek-reasoner)
- **推理能力**：支持Chain of Thought推理过程
- **错误处理**：完善的降级和备用方案
- **性能监控**：详细的调用统计和性能指标

### 日志系统
- **实时记录**：记录每次AI调用的完整过程
- **推理过程**：保存AI的思考过程(reasoning_content)
- **性能统计**：成功率、平均响应时间等指标
- **日志导出**：支持导出JSON格式的详细日志
- **控制台集成**：可在浏览器控制台使用便捷命令

**控制台命令：**
```javascript
// 获取所有日志
window.llmLogger.getLogs()

// 获取统计信息
window.llmLogger.getStats()

// 导出日志
window.llmLogger.exportLogs()

// 清空日志
window.llmLogger.clearLogs()
```

### 架构设计
- **组件化**：模块化的React组件设计
- **类型安全**：完整的TypeScript类型定义
- **样式系统**：Tailwind CSS + 自定义主题色彩
- **状态管理**：React Hooks状态管理
- **错误边界**：优雅的错误处理机制

## 📁 项目结构

```
src/
├── components/           # React组件
│   ├── Valley.tsx       # 主组件
│   ├── WordInput.tsx    # 词语输入组件
│   ├── PeakConfrontation.tsx  # 对峙展示组件
│   ├── LogViewer.tsx    # 日志查看组件
│   └── ui/              # UI基础组件
├── utils/
│   └── logger.ts        # 日志记录工具
├── pages/
│   └── Index.tsx        # 页面组件
└── main.tsx             # 应用入口
```

## 🎨 设计理念

### 视觉隐喻
- **峡谷概念**：用峡谷比喻思想的深度探索空间
- **山峰对峙**：对立概念如两座山峰相望
- **词语坠落**：思考过程的动态表现
- **诗意表达**：古典美学与现代技术的结合

### 交互哲学
- **沉静氛围**：淡雅的色彩和缓慢的动画
- **深度思辨**：鼓励用户思考概念的多元性
- **诗意体验**：将技术包装为艺术体验

## 🛠️ 开发指南

### 环境配置
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

### 自定义配置

**修改AI参数**：在 `src/components/Valley.tsx` 中调整：
```typescript
const parameters = {
  model: "deepseek-reasoner",
  max_tokens: 1000,      // 最大输出长度
  temperature: 0.8       // 创造性程度
};
```

**样式定制**：在 `tailwind.config.ts` 中修改主题色彩

## 📊 性能监控

### 日志记录内容
- **请求参数**：模型、提示词、参数配置
- **响应内容**：对立词、箴言、原始响应
- **推理过程**：AI的思考链条(reasoning_content)
- **性能指标**：响应时间、Token使用量
- **错误信息**：详细的错误堆栈和上下文

### 统计指标
- 总调用次数
- 成功/失败次数和比率
- 平均响应时间
- Token使用统计

## 🔒 注意事项

1. **API密钥安全**：请勿将API密钥提交到代码仓库
2. **成本控制**：每次AI调用会消耗Token，请合理使用
3. **网络环境**：确保能正常访问DeepSeek API服务
4. **浏览器兼容**：建议使用现代浏览器以获得最佳体验

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

Copyright © 2025 Lovable, Inc.

---

**项目网址**: https://lovable.dev/projects/0104d516-e4c9-44d0-bdaa-abbdf030bd57

**技术栈**: Vite + React + TypeScript + shadcn-ui + Tailwind CSS + DeepSeek AI
