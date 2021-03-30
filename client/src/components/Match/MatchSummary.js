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

const StyledTableCellBlue = withStyles((theme) => ({
    head: {
        backgroundColor: "#1241CE",
        color: theme.palette.common.white
    }
}))(TableCell);

const StyledTableCellRed = withStyles((theme) => ({
    head: {
        backgroundColor: "#CB2C31",
        color: theme.palette.common.white
    }
}))(TableCell);

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        marginTop: theme.spacing(2),
        'text-decoration': 'bold',
        fontSize: 'large',
    },
}));

export default function MatchSummary({ match }) {
    const classes = useStyles();
    console.log(match);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <StyledTableCellBlue>Player</StyledTableCellBlue>
                                <StyledTableCellBlue></StyledTableCellBlue>
                                <StyledTableCellBlue></StyledTableCellBlue>
                                <StyledTableCellBlue>KDA</StyledTableCellBlue>
                                <StyledTableCellBlue>CS</StyledTableCellBlue>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(match.Teams['100'].Players).map(([playerNum, player]) => (
                                <TableRow key={playerNum}>
                                    <TableCell>{player.ProfileName}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{player.Kills}/{player.Deaths}/{player.Assists}</TableCell>
                                    <TableCell>{player.CreepScore}</TableCell>
                                </TableRow>
                                ))}
                                
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={6}>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <StyledTableCellRed>Player</StyledTableCellRed>
                                <StyledTableCellRed></StyledTableCellRed>
                                <StyledTableCellRed></StyledTableCellRed>
                                <StyledTableCellRed>KDA</StyledTableCellRed>
                                <StyledTableCellRed>CS</StyledTableCellRed>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(match.Teams['200'].Players).map(([playerNum, player]) => (
                                <TableRow key={playerNum}>
                                    <TableCell>{player.ProfileName}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{player.Kills}/{player.Deaths}/{player.Assists}</TableCell>
                                    <TableCell>{player.CreepScore}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    )
}