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

function SeasonTableCell({ item }) {
    const classes = useStyles();

    if (!item) {
        return (<StyledTableCell align="center"></StyledTableCell>);
    }
    else {
        return (<StyledTableCell align="center"><Link className={classes.link} to={`/season/${item.ShortName}`}>{item.League}</Link></StyledTableCell>);
    }
}

export default function LeagueTable(props) {
    const classes = useStyles();
    const { seasonList } = props;
    
    return (
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="customized table">
            <TableHead>
                <TableRow>
                    <StyledTableCell className={classes.header} align="center">Season</StyledTableCell>
                    <StyledTableCell className={classes.header} align="center">LHGCL</StyledTableCell>
                    <StyledTableCell className={classes.header} align="center">LHGPL</StyledTableCell>
                    <StyledTableCell className={classes.header} align="center">LHGAL</StyledTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {seasonList.Leagues.map((season) => (
                <StyledTableRow key={season.SeasonTime}>
                    <StyledTableCell component="th" scope="row" align="center"><b>{season.SeasonTime}</b></StyledTableCell>
                    <SeasonTableCell item={season.Champions} />
                    <SeasonTableCell item={season.Premier} />
                    <SeasonTableCell item={season.Academy} />
                </StyledTableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    );
}