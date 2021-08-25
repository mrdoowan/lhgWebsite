// npm modules
import React, { useEffect, useState } from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
import { 
  getCurrentVersion,
  getVersionByPatch,
} from '../service/StaticCalls';
import NoImage from '../static/no-image.png';

const useStyles = makeStyles((theme) => ({
  tableName: {
    borderCollapse: 'collapse',
  },
  columnImage: {
    width: '25%',
    textAlign: 'right',
    padding: 0,
    margin: 0,
  },
  columnName: {
    width: '75%',
    textAlign: 'left',
    verticalAlign: 'middle',
    wordWrap: 'break-word',
    padding: 5,
    margin: 5,
  },
  columnImgBan: {
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  columnBan: {
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  spacing: {
    padding: theme.spacing(0.25),
  },
  layoutChamps: {
    border: '1px solid black',
    width: '100%',
    alignItems: 'middle',
    justifyContent: 'middle',
    wordWrap: 'break-word',
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(1),
  },
}));

// If version is blank, grab most recent DDragon Version.
export default function ItemSquare({
  id,
  patch = null,
  version = null,
  withName = false,
  vertical = false,
  num = 0,
  width = 30,
  height = 30,
}) {
  const classes = useStyles();

  const currentVersion = getCurrentVersion();
  const patchVersion = getVersionByPatch(patch);
  const ddragonVersion = (!patch) ? ((!version) ? currentVersion : version) : patchVersion;
  const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${id}.png`;
  // since we can get itemIds that = 0, we want to render a blank square
  const imgComponent = (!id || !ddragonVersion || id === 0) ? 
    <img src={NoImage} className={classes.spacing} alt={id} width={width} height={height} /> : 
    <img className={classes.spacing} src={imgUrl} alt={id} width={width} height={height} />;

  return (withName) ? (
    <div>
      {imgComponent} ITEM_NAME
    </div>
  ) : (vertical) ? (
    <div className={classes.spacing}>
      {imgComponent}<br />
      {num}
    </div>
  ) : (
    <span>
      {imgComponent}
    </span>
  );
}
