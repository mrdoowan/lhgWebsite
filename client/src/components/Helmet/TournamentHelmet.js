import React from 'react';
// Components
import HelmetComponent from './HelmetComponent';

export default function TournamnetHelmet({ info, players, teams, pickbans, games }) {
    const metaTitle = `${info.TournamentName} - ${
        (info && players) ? "Complete Player Stats" :
        (info && teams) ? "Complete Team Stats" :
        (info && pickbans) ? "Pick/Ban Stats" :
        (info && games) ? "List of Games" :
        "Overall Information"
    }`;

    const metaDescription = (info && players) ? (
        `Stats for ${players.PlayerList.length} players in a Data Grid (KDA, GDIFF@15, DPM, Solo Kills, etc.)`
    ) : (info && teams) ? (
        `Stats for ${teams.TeamList.length} teams in a Data Grid (K:D Ratio, DRAG%, GDIFF@15, etc.)`
    ) : (info && pickbans) ? (
        `Stats for ${pickbans.PickBanList.length} champions in Draft Phase (Presence %, Picks, Bans, etc.)`
    ) : (info && games) ? (
        `${Object.values(games).length} games played in the Tournament`
    ) : (`Blue/Red Side Victory Percentage, Dragon Percentage, and Individual Game/Player/Team Leaderboards`);

    return (
        <HelmetComponent
            title={metaTitle}
            description={metaDescription}
        />
    );
}