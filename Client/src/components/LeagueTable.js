import React from 'react';
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
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

const useStyles = makeStyles({
    table: {
        minWidth: 700,
    },
});

export default function LeagueTable(props) {
    const classes = useStyles();
    const { seasonList } = props;
    
    return (
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="customized table">
            <TableHead>
                <TableRow>
                    <StyledTableCell align="center">Season Time</StyledTableCell>
                    <StyledTableCell align="center">Champions</StyledTableCell>
                    <StyledTableCell align="center">Premier</StyledTableCell>
                    <StyledTableCell align="center">Academy</StyledTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {seasonList.map((season) => (
                <StyledTableRow key={season.SeasonTime}>
                <StyledTableCell component="th" scope="row">{season.SeasonTime}</StyledTableCell>
                <StyledTableCell align="center">{season.Champions ? season.Champions.ShortName : ''}</StyledTableCell>
                <StyledTableCell align="center">{season.Premier ? season.Premier.ShortName : ''}</StyledTableCell>
                <StyledTableCell align="center">{season.Academy ? season.Academy.ShortName : ''}</StyledTableCell>
                </StyledTableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    );
}