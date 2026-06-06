import { useState } from 'react';
import { Box, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import { useFormulaStore } from '../store/useFormulaStore';
import FormatCard from './FormatCard';
import type { FormatResults } from '../types';

/** Tab 标签定义 */
const TAB_LABELS = [
  { key: 'omml' as const, label: 'Word OMML' },
  { key: 'mathml' as const, label: 'MathML' },
  { key: 'mathematica' as const, label: 'Mathematica' },
  { key: 'matlab' as const, label: 'MATLAB' },
  { key: 'asciimath' as const, label: 'AsciiMath' },
  { key: 'latex' as const, label: 'LaTeX(原文)' },
];

function FormatConverter() {
  const [activeTab, setActiveTab] = useState(0);
  const { formatResults, latex, isConverting } = useFormulaStore();

  /** 获取当前 Tab 的内容 */
  const getTabContent = (key: string): string => {
    if (key === 'latex') return latex;
    return formatResults[key as keyof FormatResults] || '';
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: 1 }}
        >
          {TAB_LABELS.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
        {isConverting && <CircularProgress size={20} sx={{ mr: 2 }} />}
      </Box>

      <Box sx={{ p: 2 }}>
        <FormatCard
          content={getTabContent(TAB_LABELS[activeTab].key)}
          formatLabel={TAB_LABELS[activeTab].label}
        />
      </Box>
    </Paper>
  );
}

export default FormatConverter;
