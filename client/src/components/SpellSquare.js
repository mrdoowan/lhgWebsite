// npm modules
import React, { useEffect, useState } from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
import NoImage from '../static/no-image.png';
import {
  getSpellIds,
  getVersionList
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
export default function SpellSquare({
  id,
  patch = null,
  version = null,
  withName = false,
  vertical = false,
  num = 0,
  width = 30,
  height = 30,
}) {
  const [versionList, setVersionList] = useState(null);
  const [spellByIds, setSpellByIds] = useState(null);
  const classes = useStyles();
  useEffect(() => {
    getVersionList().then((data) => { setVersionList(data); });
    getSpellIds().then((data) => { setSpellByIds(data); });
  }, []);

  const getCurrentVersion = () => {
    return (versionList) ? versionList[0] : null;
  }
  
  const getVersionByPatch = (patch) => {
    if (!versionList) { return null; }
    if (patch) {
      for (const DDragonVersion of versionList) {
        if (DDragonVersion.includes(patch)) {
          return DDragonVersion;
        }
      }
    }
    return versionList[0]; // Default latest patch
  }
  
  const getSpellUrlId = (id) => {
    if (!spellByIds) { return null; }
    if (!(id in spellByIds)) {
      return id;
    }
    return spellByIds[id]['id'];
  }

  const urlId = getSpellUrlId(id);
  const ddragonVersion = (!patch) ?
    ((!version) ? getCurrentVersion() : version) :
    getVersionByPatch(patch);
  const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/spell/${urlId}.png`;

  const imgComponent = (!urlId || !ddragonVersion) ? 
    <img src={NoImage} className={classes.spacing} alt={urlId} width={width} height={height} /> : 
    <img src={imgUrl} className={classes.spacing} alt={urlId} width={width} height={height} />

  return (withName) ? (
    <div>
      {imgComponent} SPELL_NAME
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
