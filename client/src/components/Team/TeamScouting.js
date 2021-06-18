import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
// Components
import ChampionSquare from '../ChampionSquare';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#BEBEBE',
    },
    title: {
        padding: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: 'large',
    },
    midHeader: {
        textAlign: 'middle',
        fontWeight: 'bold',
    },
    leftHeader: {
        textAlign: 'left',
        fontWeight: 'bold',
        padding: theme.spacing(1),
    },
    rowBorder: {
        padding: theme.spacing(5),
        border: '1px solid black',
    },
    colBans: {
        width: "50%",
        margin: '0 5px 0 5px',
        border: '1px solid black',
    },
    layoutChamps: {
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
        padding: theme.spacing(1),
    },
    colPlayer: {
        width: "17%",
        textAlign: 'left',
        padding: theme.spacing(1),
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
        width: "31%",
        textAlign: 'center',
    },
    link: {
        color: 'darkBlue',
    },
}));

export default function TeamScouting({ scouting }) {
    const classes = useStyles();
    const { BannedAgainstTeam, BannedByTeam, GamesPlayed, PlayerLog } = scouting;

    // Sort object by Most banned to Least banned
    const bansAgainstTeamKeys = Object.keys(BannedAgainstTeam).sort((a,b) => {
		return BannedAgainstTeam[b] - BannedAgainstTeam[a]
	});
    const bansByTeamKeys = Object.keys(BannedByTeam).sort((a,b) => {
		return BannedByTeam[b] - BannedByTeam[a]
	});

    const champsBanAgainst = (
        bansAgainstTeamKeys.map((Id) => (<ChampionSquare key={Id} id={Id} vertical={true} num={BannedAgainstTeam[Id]} />))
    );
    const champsBanBy = (
        bansByTeamKeys.map((Id) => (<ChampionSquare key={Id} id={Id} vertical={true} num={BannedByTeam[Id]} />))
    );

    const playerList = [];

	for (let i of Object.keys(PlayerLog)) {
		const role = Object.keys(PlayerLog)[i];

		for (let j of Object.values(PlayerLog[role])) {
			const playerObject = Object.values(PlayerLog[role])[j];
			playerObject['Role'] = role;
            playerList.push(playerObject);
		}
	}

    const sortedPlayerList = playerList.sort((a,b) => {
		return b.GamesPlayed - a.GamesPlayed
	});

    return (
        <Paper variant="outlined" square className={classes.paper}>
            <p className={classes.title}>Games Played: {GamesPlayed}</p>
            <table>
                <thead>
                    <tr className={classes.rowBorder}>
                        <td className={classes.midHeader}>Bans Against Team</td>
                        <td className={classes.midHeader}>Bans By Team</td>
                    </tr>
                </thead>
                <tbody>
                    <tr className={classes.rowBorder}>
                        <td className={classes.colBans}>
                            <div className={classes.layoutChamps}>
                                {champsBanAgainst}
                            </div>
                        </td>
                        <td className={classes.colBans}>
                            <div className={classes.layoutChamps}>
                                {champsBanBy}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br /><br />
            <table>
                <thead>
                    <tr className={classes.rowBorder}>
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
                    <tr key={`${player.Role}-${player.ProfileName}`} className={classes.rowBorder}>
                        <td className={classes.colRole}>{player.Role}</td>
                        <td className={classes.colPlayer}><Link className={classes.link} to={`/profile/${player.ProfileName}/games/${scouting.SeasonShortName}`}>{player.ProfileName}</Link></td>
                        <td className={classes.colGames}>{player.GamesPlayed}</td>
                        <td className={classes.colKda}>{player.TotalKdaPlayer}</td>
                        <td className={classes.colKP}>{(player.KillPctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colDmg}>{(player.DamagePctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colDmg}>{(player.GoldPctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colVs}>{(player.VsPctPlayer*100).toFixed(2)}%</td>
                        <td className={classes.colChamps}>
                            <div className={classes.layoutChamps}>
                                {sortPlayedChamps(player.ChampsPlayed).map((champ) => (
                                    <ChampionSquare key={champ.ChampId} id={champ.ChampId} vertical={true} num={champ.GamesPlayed} />
                                ))}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Paper>
    )
}

function sortPlayedChamps(champsObject) {
    const champList = [];
	for (let i of Object.keys(champsObject)) {
		const champId = Object.keys(champsObject)[i];
		const champStats = champsObject[Id];
        champStats['ChampId'] = champId;
        champList.push(champStats);
	}

    return champList.sort((a,b) => {
		return b.GamesPlayed - a.GamesPlayed
	});
}
