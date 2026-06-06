import rateLimit from 'express-rate-limit';

/** 速率限制中间件：60次/分钟/IP */
export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: '请求过于频繁，请稍后再试',
  },
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});
