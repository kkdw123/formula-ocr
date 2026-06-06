import type { HistoryRecord } from '../types';

const HISTORY_KEY = 'formula_ocr_history';
const API_KEY_STORAGE = 'formula_ocr_api_key';

/**
 * 从 localStorage 加载识别历史
 */
export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as HistoryRecord[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 保存识别历史到 localStorage
 */
export function saveHistory(history: HistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage 满或不可用，静默失败
  }
}

/**
 * 从 localStorage 加载 API Key
 */
export function loadApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

/**
 * 保存 API Key 到 localStorage
 */
export function saveApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // 静默失败
  }
}
