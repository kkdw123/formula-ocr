import type { HistoryRecord, Provider } from '../types';

const HISTORY_KEY = 'formula_ocr_history';
const GEMINI_KEY_STORAGE = 'formula_ocr_api_key';
const MOONSHOT_KEY_STORAGE = 'formula_ocr_moonshot_key';
const SIMPLETEX_KEY_STORAGE = 'formula_ocr_simpletex_key';
const PROVIDER_STORAGE = 'formula_ocr_provider';

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
 * 从 localStorage 加载 Gemini API Key
 */
export function loadGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

/**
 * 保存 Gemini API Key 到 localStorage
 */
export function saveGeminiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(GEMINI_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
    }
  } catch {
    // 静默失败
  }
}

/**
 * 从 localStorage 加载 Moonshot API Key
 */
export function loadMoonshotKey(): string {
  try {
    return localStorage.getItem(MOONSHOT_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

/**
 * 保存 Moonshot API Key 到 localStorage
 */
export function saveMoonshotKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(MOONSHOT_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(MOONSHOT_KEY_STORAGE);
    }
  } catch {
    // 静默失败
  }
}

/**
 * 从 localStorage 加载识别引擎偏好
 */
export function loadProvider(): Provider {
  try {
    const val = localStorage.getItem(PROVIDER_STORAGE);
    if (val === 'moonshot') return 'moonshot';
    return 'gemini';
  } catch {
    return 'gemini';
  }
}

/**
 * 保存识别引擎偏好到 localStorage
 */
export function saveProvider(provider: Provider): void {
  try {
    localStorage.setItem(PROVIDER_STORAGE, provider);
  } catch {
    // 静默失败
  }
}

/**
 * 从 localStorage 加载 SimpleTex API Key
 */
export function loadSimpleTexKey(): string {
  try {
    return localStorage.getItem(SIMPLETEX_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

/**
 * 保存 SimpleTex API Key 到 localStorage
 */
export function saveSimpleTexKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(SIMPLETEX_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(SIMPLETEX_KEY_STORAGE);
    }
  } catch {
    // 静默失败
  }
}
