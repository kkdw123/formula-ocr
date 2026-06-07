/**
 * SimpleTex 公式识别服务
 * 文档: https://doc.simpletex.cn/zh/api/api_formula_recognition.html
 *
 * - 轻量模型: https://server.simpletex.cn/api/latex_ocr_turbo
 * - 标准模型: https://server.simpletex.cn/api/latex_ocr
 * - 认证方式: 请求头 { token: "<API_KEY>" }
 * - 请求格式: multipart/form-data，字段名 file
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const BASE_URL = 'https://server.simpletex.cn/api';
const DEFAULT_MODEL = 'latex_ocr'; // 标准模型；改为 latex_ocr_turbo 可用轻量模型

export interface SimpleTexResponse {
  status: boolean;
  res?: {
    latex: string;
    conf: number;
  };
  request_id?: string;
  message?: string;
}

/**
 * 使用 SimpleTex API 识别公式图片
 *
 * @param imageBase64 - 图片 base64 字符串（不含 data URI 前缀）
 * @param mimeType   - 图片 MIME 类型，如 image/png
 * @param clientApiKey - 用户在前端输入的 API Key（可选，优先使用环境变量）
 */
export async function recognizeWithSimpleTex(
  imageBase64: string,
  mimeType: string,
  clientApiKey?: string,
): Promise<{ latex: string; error?: string }> {
  const apiKey = process.env.SIMPLETEX_API_KEY || clientApiKey;

  if (!apiKey) {
    return {
      latex: '',
      error: '未提供 SimpleTex API Key，请在页面右上角 ⚙ 设置中输入 SimpleTex API Key',
    };
  }

  // 将 base64 写入临时文件
  const ext = mimeType === 'image/jpeg' ? '.jpg' : '.png';
  const tmpDir = os.tmpdir();
  const tmpPath = path.join(
    tmpDir,
    `simpletex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`,
  );

  try {
    const buf = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(tmpPath, buf);

    const url = `${BASE_URL}/${DEFAULT_MODEL}`;

    // 构造 multipart/form-data 请求体
    // Node 18+ 原生支持 FormData + fetch
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(tmpPath)], { type: mimeType });
    formData.append('file', blob, `image${ext}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        token: apiKey,
        // 注意：不要手动设置 Content-Type，让 fetch 自动设置（含 boundary）
      },
      body: formData as unknown as BodyInit,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return {
        latex: '',
        error: `SimpleTex API 请求失败 (${response.status}): ${text.slice(0, 200)}`,
      };
    }

    const data: SimpleTexResponse = await response.json();

    if (!data.status) {
      return {
        latex: '',
        error: `SimpleTex 识别失败: ${data.message || '未知错误'}`,
      };
    }

    const latex = data.res?.latex || '';
    if (!latex || latex === '[EMPTY]') {
      return { latex: '', error: '未在图片中检测到数学公式' };
    }

    return { latex };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SimpleTex API 调用失败';
    console.error('[SimpleTex] 错误:', message);
    return { latex: '', error: `识别失败: ${message}` };
  } finally {
    // 清理临时文件
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // ignore
    }
  }
}
