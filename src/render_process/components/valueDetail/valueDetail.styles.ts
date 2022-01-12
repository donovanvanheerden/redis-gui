import { Grid, Select, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ValueContainer = styled(Grid)(({ theme: { spacing } }) => ({
  minWidth: spacing(28),
  height: '100vh',
}));

export const ButtonToolbar = styled(Toolbar)(({ theme: { spacing } }) => ({
  minHeight: spacing(),
}));

export const LanguageSelector = styled(Select)(({ theme: { spacing } }) => ({
  marginLeft: spacing(),
  '& .MuiSelect-select': {
    padding: spacing(1, 4, 1, 1),
  },
}));
