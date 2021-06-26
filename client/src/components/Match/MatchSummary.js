import React from 'react';
// MUI
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
  Chart,
  Series,
  CommonSeriesSettings,
  Legend,
  Title,
  Font,
  Label,
  Format,
} from 'devextreme-react/chart';

import ChampionSquare from '../ChampionSquare';
import ItemSquare from '../ItemSquare';
import SpellSquare from '../SpellSquare';

const StyledTableCellRed = withStyles((theme) => ({
  head: {
    backgroundColor: '#CB2C31',
    color: theme.palette.common.white,
    fontSize: 20,
  },
}))(TableCell);

const BLUE_TEAM = '100';
const RED_TEAM = '200';
const ROLE_TOP = 'TOP';
const ROLE_BOT = 'BOTTOM';
const ROLE_SUP = 'SUPPORT';
const ROLE_MID = 'MIDDLE';
const ROLE_JUN = 'JUNGLE';
const VICTORY = 'VICTORY';
const DEFEAT = 'DEFEAT';

const useStyles = makeStyles((theme) => ({
  paper: {
    height: '100%',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
  title: {
    marginTop: theme.spacing(2),
    'text-decoration': 'bold',
    fontSize: 'large',
  },
  blueHeader: {
    backgroundColor: '#1241CE',
    color: theme.palette.common.white,
    fontSize: 20,
  },
  redHeader: {
    backgroundColor: '#CB2C31',
    color: theme.palette.common.white,
    fontSize: 20,
  },
  spellColumn: {
    minWidth: '115px',
  },
  itemWrapper: {
    display: 'flex',
    width: '160px',
  },
  itemRow: {
    display: 'flex',
  },
  mainItems: {
    width: '75%'
  },
  trinketItem: {
    width: '25%',
    margin: 'auto 0',
  },
  singleItem: {
    width: '33.33333%'
  }
}));

export default function MatchSummary({ match }) {
  const classes = useStyles();

  const blueTeamName = match.Teams[BLUE_TEAM].TeamName;
  const redTeamName = match.Teams[RED_TEAM].TeamName;

  const blueWinString = match.Teams[BLUE_TEAM].Win ? VICTORY : DEFEAT;
  const redWinString = match.Teams[RED_TEAM].Win ? VICTORY : DEFEAT;

  const patch = match.GamePatchVersion;

  // Vision
  const visionData = [
    {
      visionType: 'Wards Placed',
      blueVision: match.Teams[BLUE_TEAM].TeamWardsPlaced,
      redVision: match.Teams[RED_TEAM].TeamWardsPlaced,
    },
    {
      visionType: 'Wards Cleared',
      blueVision: match.Teams[BLUE_TEAM].TeamWardsCleared,
      redVision: match.Teams[RED_TEAM].TeamWardsCleared,
    },
  ];

  // get player stats by role
  const blueRoles = {};
  const redRoles = {};

  for (const [key, value] of Object.entries(match.Teams[BLUE_TEAM].Players)) {
    switch (value.Role.toUpperCase()) {
      case ROLE_TOP:
        blueRoles.ROLE_TOP = key;
        break;
      case ROLE_BOT:
        blueRoles.ROLE_BOT = key;
        break;
      case ROLE_SUP:
        blueRoles.ROLE_SUP = key;
        break;
      case ROLE_MID:
        blueRoles.ROLE_MID = key;
        break
      case ROLE_JUN:
        blueRoles.ROLE_JUN = key;
        break;
      default: 
        break;
    }
  }

  for (const [key, value] of Object.entries(match.Teams[RED_TEAM].Players)) {
    switch (value.Role.toUpperCase()) {
      case ROLE_TOP:
        redRoles.ROLE_TOP = key;
        break;
      case ROLE_BOT:
        redRoles.ROLE_BOT = key;
        break;
      case ROLE_SUP:
        redRoles.ROLE_SUP = key;
        break;
      case ROLE_MID:
        redRoles.ROLE_MID = key;
        break
      case ROLE_JUN:
        redRoles.ROLE_JUN = key;
        break;
      default: 
        break;
    }
  }

  // Damage Distribution
  const damageDistribution = [
    {
      lane: ROLE_TOP,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_TOP].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_TOP].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_JUN,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_JUN].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_JUN].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_MID,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_MID].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_MID].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_BOT,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_BOT].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_BOT].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_SUP,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_SUP].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_SUP].DamageDealtPct) * 100,
    },
  ];

  // Gold Distribution
  const goldDistribution = [
    {
      lane: ROLE_TOP,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_TOP].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_TOP].GoldPct) * 100
    },
    {
      lane: ROLE_JUN,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_JUN].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_JUN].GoldPct) * 100
    },
    {
      lane: ROLE_MID,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_MID].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_MID].GoldPct) * 100
    },
    {
      lane: ROLE_BOT,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_BOT].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_BOT].GoldPct) * 100
    },
    {
      lane: ROLE_SUP,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRoles.ROLE_SUP].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRoles.ROLE_SUP].GoldPct) * 100
    },
  ];

  /**
   * @param {array} itemsList 
   * @returns JSX Element of the Item layout
   */
  const itemListComponent = (itemsList) => {
    const getItemSquare = (index) => {
      if (index < itemsList.length) {
        const itemId = itemsList[index];
        return <ItemSquare id={itemId} key={`${index}+${itemId}`} patch={patch} width="40" height="40" />
      }
      else {
        return <ItemSquare id={0} key={`${index}+null`} patch={patch} width="40" height="40" />
      }
    }

    return (
      <div className={classes.itemWrapper}>
        <span className={classes.mainItems}>
          <div className={classes.itemRow}>
            <span className={classes.singleItem}>{getItemSquare(0)}</span>
            <span className={classes.singleItem}>{getItemSquare(1)}</span>
            <span className={classes.singleItem}>{getItemSquare(2)}</span>
          </div>
          <div className={classes.itemRow}>
            <span className={classes.singleItem}>{getItemSquare(3)}</span>
            <span className={classes.singleItem}>{getItemSquare(4)}</span>
            <span className={classes.singleItem}>{getItemSquare(5)}</span>
          </div>
        </span>
        <span className={classes.trinketItem}>
          <div className={classes.singleItem}>{getItemSquare(6)}</div>
        </span>
      </div>
    );
  }

  /**
   * @param {number} teamColor  BLUE_TEAM or RED_TEAM
   * @returns JSX Element of the Team Table
   */
  const teamTableComponent = (teamColor) => {
    const colorHeader = (teamColor === BLUE_TEAM) ? 
      classes.blueHeader : classes.redHeader;
    const teamTitle = (teamColor === BLUE_TEAM) ? 
      `${blueTeamName} [${blueWinString}]` :
      `${redTeamName} [${redWinString}]`;

    return (
      <TableContainer component={Paper} className={classes.paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={colorHeader} colSpan={3}>{teamTitle}</TableCell>
              <TableCell className={colorHeader}>K/D/A</TableCell>
              <TableCell className={colorHeader}>CS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(match.Teams[teamColor].Players).map(([playerNum, player]) => (
              <TableRow key={playerNum}>
                <TableCell>
                  <ChampionSquare id={player.ChampId} patch={patch} width="40" height="40" />
                  <a href={`/profile/${player.ProfileName}/games/${match.SeasonShortName}`}>{player.ProfileName}</a>
                </TableCell>
                <TableCell className={classes.spellColumn}>
                  <SpellSquare id={player.Spell1Id} key={player.Spell1Id} patch={patch} width="40" height="40" />
                  <SpellSquare id={player.Spell2Id} key={player.Spell2Id} patch={patch} width="40" height="40" />
                </TableCell>
                <TableCell>
                  {itemListComponent(player.ItemsFinal)}
                </TableCell>
                <TableCell>{player.Kills}/{player.Deaths}/{player.Assists}</TableCell>
                <TableCell>{player.CreepScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {teamTableComponent(BLUE_TEAM)}
        </Grid>
        <Grid item xs={6}>
          {teamTableComponent(RED_TEAM)}
        </Grid>

        <Grid item xs={6}>
          <Paper elevation={3}>
            <Chart id="wardsChart" dataSource={visionData}>
              <CommonSeriesSettings argumentField="state" type="bar" hoverMode="allArgumentPoints" selectionMode="allArgumentPoints">
                <Label visible={true}>
                  <Format type="fixedPoint" precision={0} />
                </Label>
              </CommonSeriesSettings>
              <Title text="Vision">
                <Font color="black" />
              </Title>
              <Series argumentField="visionType" valueField="blueVision" name={blueTeamName} />
              <Series argumentField="visionType" valueField="redVision" name={redTeamName} />
              <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            </Chart>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper elevation={3}>
            <Chart id="damagePercentChart" dataSource={damageDistribution}>
              <CommonSeriesSettings argumentField="state" type="bar" hoverMode="allArgumentPoints" selectionMode="allArgumentPoints">
                <Label visible={true}>
                  <Format type="fixedPoint" precision={0} />
                </Label>
              </CommonSeriesSettings>
              <Title text="Damage Percentages by Role">
                <Font color="black" />
              </Title>
              <Series argumentField="lane" valueField="blueDamage" name={blueTeamName} />
              <Series argumentField="lane" valueField="redDamage" name={redTeamName} />
              <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            </Chart>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper elevation={3}>
            <Chart id="goldPercentChart" dataSource={goldDistribution}>
              <CommonSeriesSettings argumentField="state" type="bar" hoverMode="allArgumentPoints" selectionMode="allArgumentPoints">
                <Label visible={true}>
                  <Format type="fixedPoint" precision={0} />
                </Label>
              </CommonSeriesSettings>
              <Title text="Gold Percentages by Role">
                <Font color="black" />
              </Title>
              <Series argumentField="lane" valueField="blue" name={blueTeamName} />
              <Series argumentField="lane" valueField="red" name={redTeamName} />
              <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            </Chart>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
