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
import GoldEmblem from '../../static/Emblem_Gold.png';
import PlatinumEmblem from '../../static/Emblem_Platinum.png';
import DiamondEmblem from '../../static/Emblem_Diamond.png';
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
    },
    link: {
        color: 'blue',
    },
});

function SeasonTableCell({ list }) {
    const classes = useStyles();

    if (!list) {
        return (<StyledTableCell align="center"></StyledTableCell>);
    }
    else {
        return (<StyledTableCell align="center">{
            list.map((leagueObject) => {
                return (
                    <React.Fragment>
                        <Link className={classes.link} to={`/season/${leagueObject.ShortName}`}>{leagueObject.LeagueType}</Link><br />
                    </React.Fragment>
                );
            })}
            </StyledTableCell>
        );
    }
}

export default function LeagueTable(props) {
    const classes = useStyles();
    const { seasonList } = props;

    const challengerImage = <img src={ChallengerEmblem} alt='Uncapped' width="50" height="50" />;
    const diamondImage = <img src={DiamondEmblem} alt='Uncapped' width="50" height="50" />;
    const platinumImage = <img src={PlatinumEmblem} alt='Uncapped' width="50" height="50" />;
    const goldImage = <img src={GoldEmblem} alt='Uncapped' width="50" height="50" />;
    
    return (<div>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell className={classes.header} align="center"><u>Split</u></StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">{challengerImage}</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">{diamondImage}</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">{platinumImage}</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">{goldImage}</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {seasonList.Leagues.map((season) => (
                    <StyledTableRow key={season.SeasonTime}>
                        <StyledTableCell component="th" scope="row" align="center"><b>{season.SeasonTime}</b></StyledTableCell>
                        <SeasonTableCell list={season.Uncapped} />
                        <SeasonTableCell list={season.Diamond} />
                        <SeasonTableCell list={season.Platinum} />
                        <SeasonTableCell list={season.Gold} />
                    </StyledTableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    </div>);
}