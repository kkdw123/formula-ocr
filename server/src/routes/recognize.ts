import { Router } from 'express';
import { recognizeWithGemini } from '../services/geminiService.js';

export const recognizeRouter = Router();

/**
 * POST /api/recognize
 * 接收图片 Base64，调用 Gemini Flash 识别公式，返回 LaTeX
 */
recognizeRouter.post('/recognize', async (req, res) => {
  try {
    const { imageBase64, mimeType, apiKey } = req.body;

    if (!imageBase64 || !mimeType) {
      res.status(400).json({
        success: false,
        latex: '',
        error: '缺少必要参数 imageBase64 或 mimeType',
      });
      return;
    }

    const result = await recognizeWithGemini(imageBase64, mimeType, apiKey);

    if (result.error) {
      res.json({
        success: false,
        latex: '',
        error: result.error,
      });
      return;
    }

    res.json({
      success: true,
      latex: result.latex,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '识别过程发生错误';
    res.status(500).json({
      success: false,
      latex: '',
      error: message,
    });
  }
});
