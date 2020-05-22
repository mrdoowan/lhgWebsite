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
});

function SeasonTableCell({ item }) {
    if (!item) {
        return (<StyledTableCell align="center"></StyledTableCell>);
    }
    else {
        return (<StyledTableCell align="center"><Link to={`/season/${item.ShortName}`}>{item.League}</Link></StyledTableCell>);
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
                    <StyledTableCell align="center">Season Time</StyledTableCell>
                    <StyledTableCell align="center"></StyledTableCell>
                    <StyledTableCell align="center"></StyledTableCell>
                    <StyledTableCell align="center"></StyledTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {seasonList.map((season) => (
                <StyledTableRow key={season.SeasonTime}>
                    <StyledTableCell component="th" scope="row" align="center">{season.SeasonTime}</StyledTableCell>
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