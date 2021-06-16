import React from 'react';
// Components
import HelmetComponent from './HelmetComponent';

export default function ProfileHelmet({ info, games, stats }) {
    // Meta Tags
    let metaSubtitle = "";
	let metaDescription = "";

    if (info && games) {
        metaSubtitle = "Player Game Log";

		if (Object.keys(games).length > 0) {
			const gamesString = (Object.keys(games.Matches).length) ? "games" : "game";
			metaDescription = `${Object.keys(games.Matches).length} ${gamesString} played in the ${games.SeasonName}`;
		}
    }
    else if (info && stats) {
        metaSubtitle = "Player Stats";

		if (Object.keys(stats).length > 0) {
			const rolesString = (Object.keys(stats.RoleStats).length > 1) ? "roles" : "role";
			metaDescription = `Stats in the ${stats.TournamentName} with ${Object.keys(stats.RoleStats).length} ${rolesString}: ${Object.keys(stats.RoleStats).join(", ")}`;
		}
    }
    else {
        metaSubtitle = "Player Summary";
		metaDescription = "Player Information";
    }

	const metaTitle = `${info.ProfileName} - ${metaSubtitle}`;

    return (
        <HelmetComponent
            title={metaTitle}
            description={metaDescription}
        />
    );
}
