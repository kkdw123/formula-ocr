import type { RecognizeRequest, RecognizeResponse, OmmlConvertRequest, OmmlResponse } from '../types';

// 开发环境用 Vite 代理（/api → localhost:3001），生产环境直接用相对路径
const API_BASE = '/api';

/**
 * 调用后端识别接口
 */
export async function recognizeApi(req: RecognizeRequest): Promise<RecognizeResponse> {
  const response = await fetch(`${API_BASE}/recognize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const text = await response.text();
    return { success: false, latex: '', error: text || `HTTP ${response.status}` };
  }

  const data: RecognizeResponse = await response.json();
  return data;
}

/**
 * 调用后端 OMML 转换接口
 */
export async function convertOmmlApi(req: OmmlConvertRequest): Promise<OmmlResponse> {
  const response = await fetch(`${API_BASE}/convert/omml`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const text = await response.text();
    return { success: false, omml: '', error: text || `HTTP ${response.status}` };
  }

  const data: OmmlResponse = await response.json();
  return data;
}
