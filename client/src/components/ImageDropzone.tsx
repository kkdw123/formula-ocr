import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useFormulaStore } from '../store/useFormulaStore';

/** 允许的文件类型 */
const ACCEPTED_TYPES: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
};

/** 最大文件大小 10MB */
const MAX_SIZE = 10 * 1024 * 1024;

function ImageDropzone() {
  const { imageBase64, imageName, isRecognizing, error, setImage, recognize } = useFormulaStore();
  const [pasteError, setPasteError] = useState('');

  /** 将文件转为 Base64 */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 去掉 data URI 前缀
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /** 处理文件拖拽/选择 */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setPasteError('');
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const base64 = await fileToBase64(file);
        setImage(base64, file.name);
      } catch {
        setPasteError('文件读取失败，请重试');
      }
    },
    [setImage],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  /** 监听全局粘贴事件 */
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          // 类型校验
          const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
          if (!validTypes.includes(file.type)) {
            setPasteError('不支持的图片格式，请使用 PNG/JPG/SVG/WebP');
            return;
          }

          // 大小校验
          if (file.size > MAX_SIZE) {
            setPasteError('图片大小超过 10MB 限制');
            return;
          }

          try {
            const base64 = await fileToBase64(file);
            setImage(base64, file.name || 'pasted-image.png');
            // 粘贴后自动触发识别
            setTimeout(() => {
              useFormulaStore.getState().recognize();
            }, 100);
          } catch {
            setPasteError('粘贴图片读取失败');
          }
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [setImage]);

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'primary.50' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          },
        }}
      >
        <input {...getInputProps()} />

        {imageBase64 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={`data:image/png;base64,${imageBase64}`}
              alt={imageName}
              sx={{
                maxWidth: 120,
                maxHeight: 80,
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            />
            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {imageName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                点击或拖拽更换图片 · Ctrl+V 粘贴
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={isRecognizing ? <CircularProgress size={16} color="inherit" /> : undefined}
              onClick={(e) => {
                e.stopPropagation();
                recognize();
              }}
              disabled={isRecognizing}
              sx={{ ml: 1 }}
            >
              {isRecognizing ? '识别中...' : '开始识别'}
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {isDragActive ? '释放以上传图片' : '拖拽图片到此处 / 点击上传 / Ctrl+V 粘贴'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              支持 PNG · JPG · SVG · WebP，最大 10MB
            </Typography>
          </Box>
        )}
      </Box>

      {/* 错误提示 */}
      {(error || pasteError) && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => setPasteError('')}>
          {error || pasteError}
        </Alert>
      )}
    </Box>
  );
}

export default ImageDropzone;
