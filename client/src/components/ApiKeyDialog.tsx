import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormulaStore } from '../store/useFormulaStore';

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

function ApiKeyDialog({ open, onClose }: ApiKeyDialogProps) {
  const { apiKey, setApiKey } = useFormulaStore();
  const [inputKey, setInputKey] = useState(apiKey);

  /** 保存 API Key */
  const handleSave = () => {
    setApiKey(inputKey.trim());
    onClose();
  };

  /** 关闭时重置输入 */
  const handleClose = () => {
    setInputKey(apiKey);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>API Key 配置</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          type="password"
          label="Gemini API Key"
          placeholder="输入你的 Google Gemini API Key..."
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          sx={{ mt: 1 }}
          helperText="API Key 将保存在浏览器本地存储中"
        />

        <Accordion sx={{ mt: 2 }} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="primary">
              如何获取 API Key？
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
              4. 复制生成的 API Key 粘贴到上方输入框
            </Typography>
          </AccordionDetails>
        </Accordion>
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
