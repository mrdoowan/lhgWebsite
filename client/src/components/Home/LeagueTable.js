import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
// Images
import IronEmblem from '../../static/Emblem_Iron.png';
import BronzeEmblem from '../../static/Emblem_Bronze.png';
import SilverEmblem from '../../static/Emblem_Silver.png';
import GoldEmblem from '../../static/Emblem_Gold.png';
import PlatinumEmblem from '../../static/Emblem_Platinum.png';
import DiamondEmblem from '../../static/Emblem_Diamond.png';
import MasterEmblem from '../../static/Emblem_Master.png';
import GrandmasterEmblem from '../../static/Emblem_Grandmaster.png';
import ChallengerEmblem from '../../static/Emblem_Challenger.png';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.disabledBackground,
    },
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
  header: {
    fontSize: 'large',
    width: '16.66%',
  },
  link: {
    color: 'blue',
  },
});

function SeasonTableCell({ list }) {
  const classes = useStyles();

  if (!list) {
    return (
      <StyledTableCell align="center" />
    );
  }

  return (
    <StyledTableCell align="center">
      {list.map((leagueObject) => (
        <React.Fragment key={`${leagueObject.ShortName}-${leagueObject.LeagueType}`}>
          <Link className={classes.link} to={`/season/${leagueObject.ShortName}`}>{leagueObject.LeagueType}</Link><br />
        </React.Fragment>
      ))}
    </StyledTableCell>
  );
}

export default function LeagueTable(props) {
  const classes = useStyles();
  const { seasonList } = props;

  const challengerImage = <img src={ChallengerEmblem} alt="Uncapped" width="50" height="50" />;
  const grandmasterImage = <img src={GrandmasterEmblem} alt="Uncapped" width="50" height="50" />;
  const masterImage = <img src={MasterEmblem} alt="Uncapped" width="50" height="50" />;
  const diamondImage = <img src={DiamondEmblem} alt="Diamond" width="50" height="50" />;
  const platinumImage = <img src={PlatinumEmblem} alt="Platinum" width="50" height="50" />;
  const goldImage = <img src={GoldEmblem} alt="Gold" width="50" height="50" />;
  const silverImage = <img src={SilverEmblem} alt="Silver" width="50" height="50" />;
  const bronzeImage = <img src={BronzeEmblem} alt="Bronze" width="50" height="50" />;
  const ironImage = <img src={IronEmblem} alt="Iron" width="50" height="50" />;

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell className={classes.header} align="center"><u>Split</u></StyledTableCell>
              <StyledTableCell className={classes.header} align="center">
                <span>
                  {challengerImage}
                  {grandmasterImage}
                </span>
              </StyledTableCell>
              <StyledTableCell className={classes.header} align="center">
                <span>
                  {diamondImage}
                  {masterImage}
                </span>
              </StyledTableCell>
              <StyledTableCell className={classes.header} align="center">{platinumImage}</StyledTableCell>
              <StyledTableCell className={classes.header} align="center">{goldImage}</StyledTableCell>
              <StyledTableCell className={classes.header} align="center">
                <span>
                  {silverImage}
                  {bronzeImage}
                  {ironImage}
                </span>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seasonList.Leagues.map((season) => (
              <StyledTableRow key={season.SeasonTime}>
                <StyledTableCell component="th" scope="row" align="center"><b>{season.SeasonTime}</b></StyledTableCell>
                <SeasonTableCell list={season.Uncapped} />
                <SeasonTableCell list={(season.Diamond) ? season.Diamond : season.Master} />
                <SeasonTableCell list={season.Platinum} />
                <SeasonTableCell list={season.Gold} />
                <SeasonTableCell list={season.Silver} />
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
