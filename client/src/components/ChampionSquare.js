// npm modules
import React, { useEffect, useState } from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
import NoImage from '../static/no-image.png';
import {
  getChampName,
  getChampUrlId,
  getCurrentVersion,
  getVersionByPatch,
} from '../service/StaticCalls';

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
export default function ChampionSquare({
  id,
  patch = null,
  version = null,
  withName = false,
  vertical = false,
  num = 0,
  width = 30,
  height = 30,
}) {
  const [urlId, setUrlId] = useState(null);
  const [name, setName] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [patchVersion, setPatchVersion] = useState(null);
  useEffect(() => {
    getChampUrlId(id).then((data) => { setUrlId(data); });
    getChampName(id).then((data) => { setName(data); });
    getCurrentVersion().then((data) => { setCurrentVersion(data); });
    getVersionByPatch(patch).then((data) => { setPatchVersion(data); });
  }, []);
  const classes = useStyles();

  const ddragonVersion = (!patch) ? ((!version) ? currentVersion : version) : patchVersion;
  const urlImg = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${urlId}.png`;

  const imgComponent = (!urlId || !ddragonVersion) ? 
    <img src={NoImage} className={classes.spacing} alt={urlId} width={width} height={height} /> : 
    <img src={urlImg} className={classes.spacing} alt={urlId} width={width} height={height} />

  return (withName) ? (
    <div>
      {imgComponent} {name}
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
