import * as React from 'react';
import useStyles from './valueDetail.styles';
import clsx from 'clsx';
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';

import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import CachedOutlinedIcon from '@material-ui/icons/CachedOutlined';
import ScheduleOutlinedIcon from '@material-ui/icons/ScheduleOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { Header } from '../header';

import * as monaco from 'monaco-editor';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

const ValueDetail = (props: Props): JSX.Element => {
  const redisValue = useSelector<RootState, string>(
    (state) => state.redis.value || ''
  );

  const monacoEditor = React.useRef<monaco.editor.IStandaloneCodeEditor>();
  const [size, setSize] = React.useState<{ height: number; width: number }>({
    height: 0,
    width: 0,
  });

  const [language, setLanguage] = React.useState('text');

  const monacoContainer = React.useRef<HTMLDivElement>();
  const classes = useStyles();

  const hasKey = false;

  React.useEffect(() => {
    if (!monacoEditor.current) {
      monacoEditor.current = monaco.editor.create(monacoContainer.current, {
        value: JSON.stringify({ test: 'hello', world: 'value' }),
        language,
      });
    }
  }, []);

  React.useEffect(() => {
    if (!monacoEditor.current) return;

    const model = monacoEditor.current.getModel();

    monaco.editor.setModelLanguage(model, language);
  }, [language]);

  React.useEffect(() => {
    if (!monacoEditor.current) return;

    monacoEditor.current.layout();
  }, [size]);

  React.useEffect(() => {
    if (!monacoEditor.current) return;

    monacoEditor.current.setValue(redisValue);
  }, [redisValue]);

  const calculateBounds = React.useCallback(() => {
    const width = document.querySelector('#value-container').clientWidth;
    const height =
      document.querySelector('#value-container').clientHeight -
      (document.querySelector('#value-toolbar') as HTMLElement).offsetTop -
      100;

    setSize({ width, height });
  }, []);

  React.useEffect(() => {
    calculateBounds();

    window.addEventListener('resize', calculateBounds);

    return () => {
      window.removeEventListener('resize', calculateBounds);
    };
  }, []);

  const handleLanguageChange = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setLanguage(event.target.value);
  };

  return (
    <Grid
      id="value-container"
      style={{ height: '100vh' }}
      xs={6}
      className={clsx(classes.root, props.className)}
      item
    >
      <Header title="Value Detail" className={classes.heading} />
      <Toolbar id="value-toolbar" className={classes.buttonToolbar}>
        <Tooltip title="Save">
          <span>
            <IconButton disabled={!hasKey}>
              <SaveOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Refresh">
          <span>
            <IconButton disabled={!hasKey}>
              <CachedOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Set Expiration">
          <span>
            <IconButton disabled={!hasKey}>
              <ScheduleOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Rename Key">
          <span>
            <IconButton disabled={!hasKey}>
              <EditOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <span>
            <IconButton disabled={!hasKey}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>
      <div style={{ ...size }} ref={monacoContainer} />
      <div style={{ display: 'flex', zIndex: 999 }}>
        <Toolbar id="language-change">
          <Typography>Language: </Typography>
          <Select value={language} onChange={handleLanguageChange}>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </Select>
        </Toolbar>
      </div>
    </Grid>
  );
};

export default ValueDetail;
