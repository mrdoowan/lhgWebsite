import React from 'react';
import { Link } from 'react-router-dom';
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
    rowHeader: {
        padding: theme.spacing(5),
    },
    midHeader: {
        textAlign: 'middle',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    leftHeader: {
        textAlign: 'left',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    rowBorder: {
        padding: theme.spacing(5),
    },
    colBans: {
        width: "50%",
        margin: '0 5px 0 5px',
    },
    layoutBans: {
        border: '1px solid black',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        wordWrap: 'break-word',
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
    },
    colRole: {
        width: "10%",
        textAlign: 'left',
    },
    colPlayer: {
        width: "10%",
        textAlign: 'left',
    },
    colGames: {
        width: "7%",
        textAlign: 'center',
    },
    colKda: {
        width: "7%",
        textAlign: 'center',
    },
    colKP: {
        width: "7%",
        textAlign: 'center',
    },
    colDmg: {
        width: "7%",
        textAlign: 'center',
    },
    colGold: {
        width: "7%",
        textAlign: 'center',
    },
    colVs: {
        width: "7%",
        textAlign: 'center',
    },
    colChamps: {
        width: "38%",
        textAlign: 'center',
    },
    layoutChamps: {
        width: "100%",
        textAlign: 'center',
    },
    link: {
        color: 'blue',
    },
}));

export default function TeamScouting({ scouting }) {
    const classes = useStyles();
    const { BannedAgainstTeam, BannedByTeam, GamesPlayed, PlayerLog } = scouting;

    // Sort object by Most banned to Least banned
    let bansAgainstTeamKeys = Object.keys(BannedAgainstTeam).sort((a,b) => { return BannedAgainstTeam[b] - BannedAgainstTeam[a] });
    let bansByTeamKeys = Object.keys(BannedByTeam).sort((a,b) => { return BannedByTeam[b] - BannedByTeam[a] });

    let champsBanAgainst = (
        bansAgainstTeamKeys.map((Id) => (<ChampionSquare key={Id} id={Id} withBans={true} bans={BannedAgainstTeam[Id]} />))
    );
    let champsBanBy = (
        bansByTeamKeys.map((Id) => (<ChampionSquare key={Id} id={Id} withBans={true} bans={BannedByTeam[Id]} />))
    );

    let playerList = [];
    for (let i = 0; i < Object.keys(PlayerLog).length; ++i) {
        let role = Object.keys(PlayerLog)[i];
        for (let j = 0; j < Object.values(PlayerLog[role]).length; ++j) {
            let playerObject = Object.values(PlayerLog[role])[j];
            playerObject['Role'] = role;
            playerList.push(playerObject);
        }
    }
    let sortedPlayerList = playerList.sort((a,b) => { return b.GamesPlayed - a.GamesPlayed });

    return (
        <Paper elevation={0} className={classes.paper}>
            <p className={classes.title}>Games Played: {GamesPlayed}</p>
            <table>
                <thead>
                    <tr className={classes.rowHeader}>
                        <td className={classes.midHeader}>Bans Against Team</td>
                        <td className={classes.midHeader}>Bans By Team</td>
                    </tr>
                </thead>
                <tbody>
                    <tr className={classes.rowBorder}>
                        <td className={classes.colBans}>
                            <div className={classes.layoutBans}>
                                {champsBanAgainst}
                            </div>
                        </td>
                        <td className={classes.colBans}>
                            <div className={classes.layoutBans}>
                                {champsBanBy}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br /><br />
            <table>
                <thead>
                    <tr className={classes.rowHeader}>
                        <td className={classes.leftHeader}>Role</td>
                        <td className={classes.leftHeader}>Player</td>
                        <td className={classes.midHeader}>Games</td>
                        <td className={classes.midHeader}>KDA</td>
                        <td className={classes.midHeader}>KP%</td>
                        <td className={classes.midHeader}>DMG%</td>
                        <td className={classes.midHeader}>GOLD%</td>
                        <td className={classes.midHeader}>VS%</td>
                        <td className={classes.midHeader}>Champs Played</td>
                    </tr>
                </thead>
                <tbody>
                {sortedPlayerList.map((player) => (
                    <tr key={`${player.Role}-${player.ProfileName}`} className={classes.rowHeader}>
                        <td className={classes.colRole}>{player.Role}</td>
                        <td className={classes.colPlayer}><Link className={classes.link} to={`/profile/${player.ProfileName}`}>{player.ProfileName}</Link></td>
                        <td className={classes.colGames}>{player.GamesPlayed}</td>
                        <td className={classes.colKda}>{player.TotalKdaPlayer}</td>
                        <td className={classes.colKP}>{(player.KillPctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colDmg}>{(player.DamagePctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colDmg}>{(player.GoldPctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colVs}>{(player.VsPctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colChamps}></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Paper>
    )
}