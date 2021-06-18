import React from 'react';
// Components
import HelmetComponent from './HelmetComponent';

export default function TeamHelmet({
  info, games, scouting, stats,
}) {
  let metaTitle = `${info.TeamName} -`;

  if (info) {
    if (games && scouting) {
      metaTitle = `${metaTitle} Team Game Log`;
    } else if (stats) {
      metaTitle = `${metaTitle} Team Stats`;
    }
  } else {
    metaTitle = `${metaTitle} Team Summary`;
  }

  const metaDescription = (info && games && scouting && (Object.keys(games).length > 0 || Object.keys(scouting).length > 0)) ? (
      `${Object.keys(games.Matches).length} game${(Object.keys(games.Matches).length) ? 's' : ''} played in the ${games.SeasonName}`
  ) : (info && stats && Object.keys(stats).length > 0) ? (
      `Stats in the ${stats.TournamentName} with Record (${stats.GamesWon}W - ${stats.GamesPlayed - stats.GamesWon}L)`
  ) : (`Team Information [${info.TeamShortName}]`);

  return (
    <HelmetComponent
      title={metaTitle}
      description={metaDescription}
    />
  );
}
