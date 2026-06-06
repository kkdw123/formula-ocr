import { Router } from 'express';
import { convertLatexToOmml } from '../services/ommlService.js';

export const convertRouter = Router();

/**
 * POST /api/convert/omml
 * 接收 LaTeX，转换为 OMML 格式
 */
convertRouter.post('/convert/omml', async (req, res) => {
  try {
    const { latex, displayMode } = req.body;

    if (!latex) {
      res.status(400).json({
        success: false,
        omml: '',
        error: '缺少必要参数 latex',
      });
      return;
    }

    const result = await convertLatexToOmml(latex, displayMode ?? false);

    if (result.error) {
      res.json({
        success: false,
        omml: '',
        error: result.error,
      });
      return;
    }

    res.json({
      success: true,
      omml: result.omml,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '转换过程发生错误';
    res.status(500).json({
      success: false,
      omml: '',
      error: message,
    });
  }
});
