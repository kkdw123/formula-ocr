import { TextField } from '@mui/material';
import { useFormulaStore } from '../store/useFormulaStore';

function LatexEditor() {
  const { latex, setLatex } = useFormulaStore();

  return (
    <TextField
      fullWidth
      multiline
      minRows={4}
      maxRows={8}
      label="LaTeX 代码"
      placeholder="识别结果将显示在此处，也可手动输入 LaTeX 代码..."
      value={latex}
      onChange={(e) => setLatex(e.target.value)}
      sx={{
        '& .MuiInputBase-input': {
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          fontSize: '0.9rem',
        },
      }}
    />
  );
}

export default LatexEditor;
