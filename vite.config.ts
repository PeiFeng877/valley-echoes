import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // 代理飞书API请求，解决跨域问题
      '/api/feishu': {
        target: 'https://open.feishu.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feishu/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 添加必要的请求头
            proxyReq.setHeader('Content-Type', 'application/json');
            console.log('🔄 代理飞书API请求:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ 飞书API响应:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 代理错误:', err.message, req.url);
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
