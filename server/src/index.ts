import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { recognizeRouter } from './routes/recognize.js';
import { convertRouter } from './routes/convert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(rateLimitMiddleware);

// API 路由
app.use('/api', recognizeRouter);
app.use('/api', convertRouter);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// 托管前端静态文件（生产环境）
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback：所有非 API 请求返回 index.html
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 全局错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[FormulaOCR] 运行在 http://localhost:${PORT}`);
});
