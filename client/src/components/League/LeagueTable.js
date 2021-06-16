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
// Component
import HelmetComponent from '../Helmet/HelmetComponent';

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
        fontWeight: 'blue',
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
    
    return (<div>
        <HelmetComponent
            title="Leagues List"
            description={`Past Leagues held in LHG: ${seasonList.Leagues.map(a => a.SeasonTime).join(", ")}`}
        />
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell className={classes.header} align="center">Season</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">Uncapped</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">Diamond</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">Platinum</StyledTableCell>
                        <StyledTableCell className={classes.header} align="center">Gold</StyledTableCell>
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