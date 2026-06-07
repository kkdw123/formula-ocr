import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

import Header from './components/Header';
import ImageDropzone from './components/ImageDropzone';
import LatexEditor from './components/LatexEditor';
import FormulaPreview from './components/FormulaPreview';
import FormatConverter from './components/FormatConverter';
import ApiKeyDialog from './components/ApiKeyDialog';
import HistoryPanel from './components/HistoryPanel';
import { useFormulaStore } from './store/useFormulaStore';

// 注册前端格式转换器
import { converterRegistry } from './converters';
import { MathMLConverter } from './converters/mathmlConverter';
import { MathematicaConverter } from './converters/mathematicaConverter';
import { MATLABConverter } from './converters/matlabConverter';
import { AsciiMathConverter } from './converters/asciimathConverter';

// 注册转换器
converterRegistry.register('mathml', new MathMLConverter());
converterRegistry.register('mathematica', new MathematicaConverter());
converterRegistry.register('matlab', new MATLABConverter());
converterRegistry.register('asciimath', new AsciiMathConverter());

function App() {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const provider = useFormulaStore((s) => s.provider);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Header onOpenApiKeyDialog={() => setApiKeyDialogOpen(true)} />

      {/* 主体 */}
      <Container maxWidth="md" sx={{ flex: 1, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 图片输入区 */}
          <Box sx={{ position: 'relative' }}>
            <ImageDropzone />
            <IconButton
              size="small"
              onClick={() => setHistoryPanelOpen(true)}
              title="识别历史"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <HistoryIcon />
            </IconButton>
          </Box>

          {/* LaTeX 编辑区 + 公式预览区 */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LatexEditor />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormulaPreview />
            </Grid>
          </Grid>

          {/* 格式转换结果区 */}
          <FormatConverter />
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 1.5,
          px: 3,
          textAlign: 'center',
          bgcolor: '#fafafa',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Powered by {provider === 'simpletex' ? 'SimpleTex' : provider === 'moonshot' ? '月之暗面 (Kimi)' : 'Gemini Flash'} · 开源项目
        </Typography>
      </Box>

      {/* API Key 配置弹窗 */}
      <ApiKeyDialog
        open={apiKeyDialogOpen}
        onClose={() => setApiKeyDialogOpen(false)}
      />

      {/* 识别历史面板 */}
      <HistoryPanel
        open={historyPanelOpen}
        onClose={() => setHistoryPanelOpen(false)}
      />
    </Box>
  );
}

export default App;
