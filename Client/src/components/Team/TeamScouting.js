import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import ChampionSquare from '../ChampionSquare';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        padding: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: 'large',
    },
    row: {
        padding: theme.spacing(3),
    },
    banHeader: {
        width: "50%",
        textAlign: 'middle'
    },
    colBans: {
        width: "50%",
        textAlign: 'middle',
    },
}));

export default function TeamScouting({ scouting, seasonList }) {
    const classes = useStyles();
    const { BannedAgainstTeam, BannedByTeam } = scouting;

    // Sort object by Most banned to Least banned
    let bansAgainstTeamKeys = Object.keys(BannedAgainstTeam).sort((a,b) => { return BannedAgainstTeam[b] - BannedAgainstTeam[a] });
    let bansByTeamKeys = Object.keys(BannedByTeam).sort((a,b) => { return BannedByTeam[b] - BannedByTeam[a] });

    // let champsBanAgainst = (
    //     bansAgainstTeamKeys.map((Id) => (<ChampionSquare key={Id} id={Id} withBans={true} bans={BannedAgainstTeam[Id]} />))
    // );

    return (
        <Paper elevation={0} className={classes.paper}>
            <p>Games Played: {scouting.GamesPlayed}</p>
            <table className={classes.row}>
                <thead>
                    <tr className={classes.row}>
                        <td className={classes.banHeader}>Bans Against Team</td>
                        <td className={classes.banHeader}>Bans By Team</td>
                    </tr>
                </thead>
                <tbody>
                    <tr className={classes.row}>
                        <td className={classes.colBans}></td>
                        <td className={classes.colBans}></td>
                    </tr>
                </tbody>
            </table>
        </Paper>
    )
}