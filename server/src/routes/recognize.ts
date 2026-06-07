import { Router } from 'express';
import { recognizeWithGemini } from '../services/geminiService.js';
import { recognizeWithMoonshot } from '../services/moonshotService.js';
import { recognizeWithSimpleTex } from '../services/simpletexService.js';

export const recognizeRouter = Router();

type Provider = 'gemini' | 'moonshot' | 'simpletex';

/**
 * POST /api/recognize
 * 接收图片 Base64，调用指定识别引擎，返回 LaTeX
 * body: { imageBase64, mimeType, apiKey, provider }
 */
recognizeRouter.post('/recognize', async (req, res) => {
  try {
    const { imageBase64, mimeType, apiKey, provider } = req.body;

    if (!imageBase64 || !mimeType) {
      res.status(400).json({
        success: false,
        latex: '',
        error: '缺少必要参数 imageBase64 或 mimeType',
      });
      return;
    }

    const engine: Provider = provider === 'moonshot' ? 'moonshot'
      : provider === 'simpletex' ? 'simpletex'
      : 'gemini';

    let result: { latex: string; error?: string };
    switch (engine) {
      case 'moonshot':
        result = await recognizeWithMoonshot(imageBase64, mimeType, apiKey);
        break;
      case 'simpletex':
        result = await recognizeWithSimpleTex(imageBase64, mimeType, apiKey);
        break;
      default:
        result = await recognizeWithGemini(imageBase64, mimeType, apiKey);
    }

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
