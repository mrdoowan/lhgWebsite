import React from 'react';
// Components
import HelmetComponent from './HelmetComponent';

export default function ProfileHelmet({ info, games, stats }) {
    // Meta Tags
    const metaTitle = `${info.ProfileName} - ${
        (info && games) ? "Player Game Log" :
        (info && stats) ? "Player Stats" :
        "Player Summary"
    }`;

    const metaDescription = (info && games && Object.keys(games).length > 0) ? (
        `${Object.keys(games.Matches).length} game${(Object.keys(games.Matches).length) ? 's' : ''} played in the ${games.SeasonName}`
    ) : (info && stats && Object.keys(stats).length > 0) ? (
        `Stats in the ${stats.TournamentName} with ${Object.keys(stats.RoleStats).length} role${(Object.keys(stats.RoleStats).length > 1) ? 's' : ''}: ${Object.keys(stats.RoleStats).join(", ")}`
    ) : ("Player Information");

    return (
        <HelmetComponent
            title={metaTitle}
            description={metaDescription}
        />
    );
}