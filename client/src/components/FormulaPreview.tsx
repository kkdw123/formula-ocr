import { Box, Typography, Paper } from '@mui/material';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useFormulaStore } from '../store/useFormulaStore';

function FormulaPreview() {
  const { latex } = useFormulaStore();

  /** 使用 KaTeX 渲染公式 */
  let renderedHtml = '';
  let renderError = '';

  if (latex.trim()) {
    try {
      renderedHtml = katex.renderToString(latex, {
        throwOnError: false,
        strict: false,
        displayMode: true,
      });
    } catch (err: unknown) {
      renderError = err instanceof Error ? err.message : '公式渲染失败';
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-start', mb: 1 }}>
        公式预览
      </Typography>

      {latex.trim() ? (
        renderError ? (
          <Typography variant="body2" color="error.main">
            {renderError}
          </Typography>
        ) : (
          <Box
            sx={{
              width: '100%',
              overflow: 'auto',
              '& .katex-display': { margin: 0 },
            }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          上传图片并识别后，公式将在此处渲染预览
        </Typography>
      )}
    </Paper>
  );
}

export default FormulaPreview;
