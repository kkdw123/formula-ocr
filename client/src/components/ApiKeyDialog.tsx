import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Link,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormulaStore } from '../store/useFormulaStore';
import type { Provider } from '../types';

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

function ApiKeyDialog({ open, onClose }: ApiKeyDialogProps) {
  const {
    provider,
    geminiApiKey,
    moonshotApiKey,
    simpletexApiKey,
    setProvider,
    setGeminiApiKey,
    setMoonshotApiKey,
    setSimpleTexApiKey,
  } = useFormulaStore();

  const [localProvider, setLocalProvider] = useState<Provider>(provider);
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);
  const [localMoonshotKey, setLocalMoonshotKey] = useState(moonshotApiKey);
  const [localSimpleTexKey, setLocalSimpleTexKey] = useState(simpletexApiKey);

  const handleSave = () => {
    setProvider(localProvider);
    setGeminiApiKey(localGeminiKey.trim());
    setMoonshotApiKey(localMoonshotKey.trim());
    setSimpleTexApiKey(localSimpleTexKey.trim());
    onClose();
  };

  const handleClose = () => {
    setLocalProvider(provider);
    setLocalGeminiKey(geminiApiKey);
    setLocalMoonshotKey(moonshotApiKey);
    setLocalSimpleTexKey(simpletexApiKey);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>API Key 配置</DialogTitle>
      <DialogContent>
        {/* 引擎选择 */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
          识别引擎
        </Typography>
        <ToggleButtonGroup
          value={localProvider}
          exclusive
          onChange={(_, val) => val && setLocalProvider(val)}
          fullWidth
          size="small"
        >
          <ToggleButton value="simpletex">SimpleTex - 公式专用</ToggleButton>
          <ToggleButton value="moonshot">月之暗面 (Kimi)</ToggleButton>
          <ToggleButton value="gemini">Google Gemini</ToggleButton>
        </ToggleButtonGroup>

        {/* Moonshot API Key */}
        {localProvider === 'moonshot' && (
          <>
            <TextField
              fullWidth
              type="password"
              label="Moonshot API Key"
              placeholder="sk-..."
              value={localMoonshotKey}
              onChange={(e) => setLocalMoonshotKey(e.target.value)}
              sx={{ mt: 2 }}
              helperText="API Key 将保存在浏览器本地存储中"
            />
            <Accordion sx={{ mt: 2 }} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="primary">
                  如何获取 Moonshot API Key？
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  1. 访问{' '}
                  <Link
                    href="https://platform.moonshot.cn/console/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Moonshot 开放平台
                  </Link>
                  <br />
                  2. 注册/登录账号（支持微信扫码）
                  <br />
                  3. 进入「API Keys」页面，点击「创建 API Key」
                  <br />
                  4. 复制生成的 Key（格式 sk-...）粘贴到上方输入框
                  <br />
                  <Box component="span" sx={{ color: 'success.main' }}>
                    新用户注册即送免费额度，国内直连无需代理！
                  </Box>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* Gemini API Key */}
        {localProvider === 'gemini' && (
          <>
            <TextField
              fullWidth
              type="password"
              label="Gemini API Key"
              placeholder="AIza..."
              value={localGeminiKey}
              onChange={(e) => setLocalGeminiKey(e.target.value)}
              sx={{ mt: 2 }}
              helperText="API Key 将保存在浏览器本地存储中"
            />
            <Accordion sx={{ mt: 2 }} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="primary">
                  如何获取 Gemini API Key？
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  1. 访问{' '}
                  <Link
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google AI Studio
                  </Link>
                  <br />
                  2. 使用 Google 账号登录
                  <br />
                  3. 点击「创建 API Key」按钮
                  <br />
                  4. 复制生成的 Key（格式 AIza...）粘贴到上方输入框
                  <br />
                  <Box component="span" sx={{ color: 'warning.main' }}>
                    注意：Gemini 需要配置代理才能在国内访问
                  </Box>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* SimpleTex API Key */}
        {localProvider === 'simpletex' && (
          <>
            <TextField
              fullWidth
              type="password"
              label="SimpleTex API Token"
              placeholder="在 SimpleTex 平台获取的 Token"
              value={localSimpleTexKey}
              onChange={(e) => setLocalSimpleTexKey(e.target.value)}
              sx={{ mt: 2 }}
              helperText="API Token 将保存在浏览器本地存储中"
            />
            <Accordion sx={{ mt: 2 }} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" color="primary">
                  如何获取 SimpleTex API Token？
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  1. 访问{' '}
                  <Link
                    href="https://platform.simpletex.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SimpleTex 开放平台
                  </Link>
                  <br />
                  2. 注册/登录账号
                  <br />
                  3. 进入「用户中心」→「开放平台」开通 API 权限
                  <br />
                  4. 在「API 管理」中创建应用，获取 Token
                  <br />
                  <Box component="span" sx={{ color: 'success.main' }}>
                    新用户赠送免费额度：轻量模型 2000次/天，标准模型 500次/天
                  </Box>
                  <br />
                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                    说明：SimpleTex 是专业的数学公式识别服务，识别准确率高于通用 AI 模型
                  </Box>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button variant="contained" onClick={handleSave}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApiKeyDialog;
