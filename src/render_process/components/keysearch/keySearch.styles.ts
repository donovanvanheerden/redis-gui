import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = makeStyles(({ breakpoints, spacing, palette }: Theme) =>
  createStyles({
    root: {
      minWidth: spacing(28),
      height: '100vh',
      borderRight: `1px solid ${palette.grey[300]}`,
    },
    keys: {
      overflow: 'hidden',
    },
  })
);

export default styles;
