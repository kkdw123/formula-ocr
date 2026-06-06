import { AppBar, Toolbar, Typography, IconButton, Popover, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useState } from 'react';

interface HeaderProps {
  onOpenApiKeyDialog: () => void;
}

function Header({ onOpenApiKeyDialog }: HeaderProps) {
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo + 标题 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              fontStyle: 'italic',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            fx
          </Box>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            FormulaOCR
          </Typography>
          <Typography
            variant="body2"
            sx={{ ml: 1, opacity: 0.8, display: { xs: 'none', sm: 'inline' } }}
          >
            公式识别与格式转换
          </Typography>
        </Box>

        {/* API Key 配置按钮 */}
        <IconButton color="inherit" onClick={onOpenApiKeyDialog} title="API Key 配置">
          <SettingsIcon />
        </IconButton>

        {/* 使用说明按钮 */}
        <IconButton
          color="inherit"
          onClick={(e) => setHelpAnchor(e.currentTarget)}
          title="使用说明"
        >
          <HelpOutlineIcon />
        </IconButton>

        {/* 使用说明 Popover */}
        <Popover
          open={Boolean(helpAnchor)}
          anchorEl={helpAnchor}
          onClose={() => setHelpAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, maxWidth: 320 }}>
            <Typography variant="subtitle2" gutterBottom>
              使用说明
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              1. 上传/拖拽/粘贴公式图片
              <br />
              2. 点击「开始识别」或粘贴后自动识别
              <br />
              3. 识别结果以 LaTeX 形式展示，可手动编辑
              <br />
              4. 下方自动转换为 Word OMML / MathML / Mathematica / MATLAB / AsciiMath 等格式
              <br />
              5. 点击复制按钮即可复制转换结果
              <br />
              6. 点击右上角齿轮图标配置 API Key
            </Typography>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
