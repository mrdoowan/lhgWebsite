import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
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
import { getTimeString } from '../../util/StringHelper';
import ChampionSquare from '../ChampionSquare';
import ItemSquare from '../ItemSquare';
import SpellSquare from '../SpellSquare';
import KillsImg from '../../static/Scoreboardicon_Kills.png';
import GoldImg from '../../static/Scoreboardicon_Gold.png';

const BLUE_TEAM = '100';
const RED_TEAM = '200';
const ROLE_TOP = 'Top';
const ROLE_BOT = 'Bottom';
const ROLE_SUP = 'Support';
const ROLE_MID = 'Middle';
const ROLE_JUN = 'Jungle';
const VICTORY = 'VICTORY';
const DEFEAT = 'DEFEAT';

const BLUE_HEX = '#1241CE';
const RED_HEX = '#CB2C31';
const BORDER_LEFT = `5px solid ${BLUE_HEX}`;
const BORDER_RIGHT = `5px solid ${RED_HEX}`;
const BORDER_GRAY = '1px solid gray';

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
  headerBorder: {
    borderLeft: BORDER_LEFT,
    borderRight: BORDER_RIGHT,
  },
  blueHeader: {
    backgroundColor: BLUE_HEX,
    color: 'white',
    fontSize: 20,
  },
  redHeader: {
    backgroundColor: RED_HEX,
    color: 'white',
    fontSize: 20,
  },
  noBorderHeader: {
    fontSize: 'large',
    borderStyle: 'none',
  },
  blueChampWrapper: {
    display: 'flex',
  },
  redChampWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  champColumn: {
    maxWidth: '84px',
  },
  spellColumn: {
    maxWidth: '44px',
  },
  nameColumn: {
    margin: 'auto 4px',
    color: 'blue',
    minWidth: 0,
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
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
  },
  blueBorderCell: {
    borderLeft: BORDER_LEFT,
    borderBottom: BORDER_GRAY,
    width: '19%',
  },
  redBorderCell: {
    borderRight: BORDER_RIGHT,
    borderBottom: BORDER_GRAY,
    width: '19%',
  },
  itemsCell: {
    border: BORDER_GRAY,
    width: '12%',
  },
  statsCell: {
    border: BORDER_GRAY,
    fontSize: 'medium',
    width: '5%',
  },
  roleCell: {
    fontSize: 'large',
    borderStyle: 'none',
    width: '8%',
  },
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
  // Key: Role 'string'
  // Value: participantId
  const blueRolesMap = {};
  const redRolesMap = {};

  for (const [key, value] of Object.entries(match.Teams[BLUE_TEAM].Players)) {
    switch (value.Role.toUpperCase()) {
      case ROLE_TOP.toUpperCase():
        blueRolesMap[ROLE_TOP] = key;
        break;
      case ROLE_BOT.toUpperCase():
        blueRolesMap[ROLE_BOT] = key;
        break;
      case ROLE_SUP.toUpperCase():
        blueRolesMap[ROLE_SUP] = key;
        break;
      case ROLE_MID.toUpperCase():
        blueRolesMap[ROLE_MID] = key;
        break
      case ROLE_JUN.toUpperCase():
        blueRolesMap[ROLE_JUN] = key;
        break;
      default: 
        break;
    }
  }

  for (const [key, value] of Object.entries(match.Teams[RED_TEAM].Players)) {
    switch (value.Role.toUpperCase()) {
      case ROLE_TOP.toUpperCase():
        redRolesMap[ROLE_TOP] = key;
        break;
      case ROLE_BOT.toUpperCase():
        redRolesMap[ROLE_BOT] = key;
        break;
      case ROLE_SUP.toUpperCase():
        redRolesMap[ROLE_SUP] = key;
        break;
      case ROLE_MID.toUpperCase():
        redRolesMap[ROLE_MID] = key;
        break
      case ROLE_JUN.toUpperCase():
        redRolesMap[ROLE_JUN] = key;
        break;
      default: 
        break;
    }
  }

  // Damage Distribution
  const damageDistribution = [
    {
      lane: ROLE_TOP,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_TOP]].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_TOP]].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_JUN,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_JUN]].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_JUN]].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_MID,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_MID]].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_MID]].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_BOT,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_BOT]].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_BOT]].DamageDealtPct) * 100,
    },
    {
      lane: ROLE_SUP,
      blueDamage: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_SUP]].DamageDealtPct) * 100,
      redDamage: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_SUP]].DamageDealtPct) * 100,
    },
  ];

  // Gold Distribution
  const goldDistribution = [
    {
      lane: ROLE_TOP,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_TOP]].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_TOP]].GoldPct) * 100
    },
    {
      lane: ROLE_JUN,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_JUN]].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_JUN]].GoldPct) * 100
    },
    {
      lane: ROLE_MID,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_MID]].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_MID]].GoldPct) * 100
    },
    {
      lane: ROLE_BOT,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_BOT]].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_BOT]].GoldPct) * 100
    },
    {
      lane: ROLE_SUP,
      blue: parseFloat(match.Teams[BLUE_TEAM].Players[blueRolesMap[ROLE_SUP]].GoldPct) * 100,
      red: parseFloat(match.Teams[RED_TEAM].Players[redRolesMap[ROLE_SUP]].GoldPct) * 100
    },
  ];

  /**
   * 
   * @param {number} gold 
   * @returns {string} Gold in string value (i.e. 10,123 -> 10.1k)
   */
  const simpleGoldString = (gold) => {
    let thousands = parseInt(gold / 1000);
    let hundreds = parseInt((gold % 1000) / 100);
    const tens = parseInt(gold % 100);
    if (tens >= 50) { 
      hundreds++;
      if (hundreds === 10) {
        hundreds = 0;
        thousands++;
      }
    } // Round up
    return `${thousands}.${hundreds}k`;
  }

  const blueTeamData = match.Teams[BLUE_TEAM];
  const redTeamData = match.Teams[RED_TEAM];
  const thisTeamData = (teamColor) => {
    return match.Teams[teamColor];
  }
  const thisPlayerData = (teamColor, role) => {
    const thisRolesMap = (teamColor === BLUE_TEAM) ? blueRolesMap : redRolesMap;
    return match.Teams[teamColor].Players[thisRolesMap[role]];
  }
  const roleArray = [ ROLE_TOP, ROLE_JUN, ROLE_MID, ROLE_BOT, ROLE_SUP ];
  const colorHeader = (teamColor) => { 
    return (teamColor === BLUE_TEAM) ? classes.blueHeader : classes.redHeader;
  }
  const teamTitle = (teamColor) =>  {
    return (teamColor === BLUE_TEAM) ? `${blueTeamName} [${blueWinString}]` : `[${redWinString}] ${redTeamName}`;
  }
  const killsIcon = <img src={KillsImg} alt="killLogo" width="30" height="30" />;
  const goldIcon = <img src={GoldImg} alt="goldLogo" width="30" height="30" />;
  const bansComponent = (teamColor) => {
    return <React.Fragment>
      <b>Bans: </b>
      {thisTeamData(teamColor).Bans.map((banId) => (
        <span key={`blueBanId${banId}`}><ChampionSquare id={banId} patch={patch} width="40" height="40" /></span>
      ))}
    </React.Fragment>;
  }
  const champComponent = (teamColor, role) => {
    return <span className={classes.champColumn}>
      <ChampionSquare id={thisPlayerData(teamColor, role).ChampId} patch={patch} width="80" height="80" />
    </span>;
  };
  const spellComponent = (teamColor, role) => {
    const playerData = thisPlayerData(teamColor, role);
    const summ1Id = (playerData.Spell1Id) ? playerData.Spell1Id : playerData.Summoner1Id;
    const summ2Id = (playerData.Spell2Id) ? playerData.Spell2Id : playerData.Summoner2Id;
    return <span className={classes.spellColumn}>
      <div><SpellSquare id={summ1Id} key={summ1Id} patch={patch} width="40" height="40" /></div>
      <div><SpellSquare id={summ2Id} key={summ2Id} patch={patch} width="40" height="40" /></div>
    </span>;
  }
  const nameComponent = (teamColor, role) => {
    const playerData = thisPlayerData(teamColor, role);
    return <span className={classes.nameColumn}>
      <a href={`/profile/${playerData.ProfileName}/games/${match.SeasonShortName}`}><b>{playerData.ProfileName}</b></a>
    </span>;
  }
  /**
   * @param {array} itemsList 
   * @returns JSX Element of the Item layout
   */
  const itemListComponent = (teamColor, role) => {
    const itemsList = thisPlayerData(teamColor, role).ItemsFinal;

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
  const kdaTableCell = (teamColor, role) => {
    const playerData = thisPlayerData(teamColor, role);
    return <TableCell className={classes.statsCell} align="center">{playerData.Kills}/{playerData.Deaths}/{playerData.Assists}</TableCell>;
  }
  const csTableCell = (teamColor, role) => {
    const playerData = thisPlayerData(teamColor, role);
    return <TableCell className={classes.statsCell} align="center">{playerData.CreepScore}</TableCell>;
  }
  const goldTableCell = (teamColor, role) => {
    const playerData = thisPlayerData(teamColor, role);
    return <TableCell className={classes.statsCell} align="center">{simpleGoldString(playerData.Gold)}</TableCell>;
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper} className={classes.paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow className={classes.headerBorder}>
                  <TableCell className={colorHeader(BLUE_TEAM)} colSpan={2}>{teamTitle(BLUE_TEAM)}</TableCell>
                  <TableCell className={colorHeader(BLUE_TEAM)} colSpan={2} align="center">{goldIcon} {simpleGoldString(blueTeamData.TeamGold)}</TableCell>
                  <TableCell className={colorHeader(BLUE_TEAM)} align="right"><div>{blueTeamData.TeamKills}</div></TableCell>
                  <TableCell className={classes.noBorderHeader} align="center"><div>{killsIcon}</div></TableCell>
                  <TableCell className={colorHeader(RED_TEAM)}><div>{redTeamData.TeamKills}</div></TableCell>
                  <TableCell className={colorHeader(RED_TEAM)} colSpan={2} align="center">{goldIcon} {simpleGoldString(redTeamData.TeamGold)}</TableCell>
                  <TableCell className={colorHeader(RED_TEAM)} colSpan={2} align="right">{teamTitle(RED_TEAM)}</TableCell>
                </TableRow>
                <TableRow className={classes.headerBorder}>
                  <TableCell className={colorHeader(BLUE_TEAM)} colSpan={2}>
                    {bansComponent(BLUE_TEAM)}
                  </TableCell>
                  <TableCell className={colorHeader(BLUE_TEAM)} align="center">K/D/A</TableCell>
                  <TableCell className={colorHeader(BLUE_TEAM)} align="center">CS</TableCell>
                  <TableCell className={colorHeader(BLUE_TEAM)} align="center">Gold</TableCell>
                  <TableCell className={classes.noBorderHeader} align="center">{getTimeString(match.GameDuration)}</TableCell>
                  <TableCell className={colorHeader(RED_TEAM)} align="center">Gold</TableCell>
                  <TableCell className={colorHeader(RED_TEAM)} align="center">CS</TableCell>
                  <TableCell className={colorHeader(RED_TEAM)} align="center">K/D/A</TableCell>
                  <TableCell className={colorHeader(RED_TEAM)} colSpan={2} align="right">
                    {bansComponent(RED_TEAM)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roleArray.map((roleString) => (
                  <TableRow key={`player${roleString}`}>
                    <TableCell className={classes.blueBorderCell}>
                      <div className={classes.blueChampWrapper}>
                        {champComponent(BLUE_TEAM, roleString)}
                        {spellComponent(BLUE_TEAM, roleString)}
                        {nameComponent(BLUE_TEAM, roleString)}
                      </div>
                    </TableCell>
                    <TableCell className={classes.itemsCell}>{itemListComponent(BLUE_TEAM, roleString)}</TableCell>
                    {kdaTableCell(BLUE_TEAM, roleString)}
                    {csTableCell(BLUE_TEAM, roleString)}
                    {goldTableCell(BLUE_TEAM, roleString)}
                    <TableCell className={classes.roleCell} align="center"><b>{roleString}</b></TableCell>
                    {goldTableCell(RED_TEAM, roleString)}
                    {csTableCell(RED_TEAM, roleString)}
                    {kdaTableCell(RED_TEAM, roleString)}
                    <TableCell className={classes.itemsCell}>{itemListComponent(RED_TEAM, roleString)}</TableCell>
                    <TableCell className={classes.redBorderCell} align="right">
                      <div className={classes.redChampWrapper}>
                        {nameComponent(RED_TEAM, roleString)}
                        {spellComponent(RED_TEAM, roleString)}
                        {champComponent(RED_TEAM, roleString)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
