import type { Request, Response, NextFunction } from 'express';

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[FormulaOCR Error]', err.message);

  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误',
  });
}
