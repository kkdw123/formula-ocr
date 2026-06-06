import { useState } from 'react';
import { Box, IconButton, Typography, Snackbar, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { copyToClipboard } from '../utils/clipboard';

interface FormatCardProps {
  content: string;
  formatLabel: string;
}

function FormatCard({ content, formatLabel }: FormatCardProps) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  /** 复制内容到剪贴板 */
  const handleCopy = async () => {
    if (!content) return;
    const success = await copyToClipboard(content);
    if (success) {
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* 内容展示区 */}
      <Box
        sx={{
          bgcolor: '#fafafa',
          borderRadius: 1,
          p: 2,
          pr: 5,
          maxHeight: 300,
          overflow: 'auto',
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          fontSize: '0.85rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          border: '1px solid #e8e8e8',
        }}
      >
        {content ? (
          content
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            等待转换...
          </Typography>
        )}
      </Box>

      {/* 复制按钮 */}
      <IconButton
        size="small"
        onClick={handleCopy}
        disabled={!content}
        title={`复制${formatLabel}`}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>

      {/* 复制成功提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          已复制到剪贴板
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default FormatCard;
