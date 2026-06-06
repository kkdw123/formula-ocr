import {
  Drawer,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { useFormulaStore } from '../store/useFormulaStore';

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const { history, restoreFromHistory } = useFormulaStore();

  /** 点击历史记录恢复到编辑区 */
  const handleSelect = (index: number) => {
    const record = history[index];
    if (record) {
      restoreFromHistory(record);
      onClose();
    }
  };

  /** 格式化时间 */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 标题栏 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              识别历史
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({history.length})
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* 历史列表 */}
        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {history.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                暂无识别历史
              </Typography>
            </Box>
          ) : (
            history.map((record, index) => (
              <ListItemButton
                key={record.id}
                onClick={() => handleSelect(index)}
                sx={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <ListItemAvatar>
                  <Box
                    component="img"
                    src={`data:image/png;base64,${record.imageBase64}`}
                    alt={record.imageName}
                    sx={{
                      width: 48,
                      height: 36,
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      border: '1px solid #e0e0e0',
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {record.latex}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {record.imageName} · {formatTime(record.timestamp)}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>
    </Drawer>
  );
}

export default HistoryPanel;
