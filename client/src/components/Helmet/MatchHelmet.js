import React from 'react';
// Components
import HelmetComponent from './HelmetComponent';

export default function MatchHelmet({ match, type }) {
  // Meta Tags
  const blueShortName = match.Teams['100'].TeamShortName;
  const redShortName = match.Teams['200'].TeamShortName;
  const tourneyTabName = match.TournamentTabName;
  const blueTeamName = match.Teams['100'].TeamName;
  const redTeamName = match.Teams['200'].TeamName;
  const tourneyName = match.TournamentName;

  return (
    <HelmetComponent
      title={`${blueShortName} vs ${redShortName} - ${tourneyTabName} - Match ${type}`}
      description={`${blueTeamName} [Blue] vs. ${redTeamName} [Red] - Tournament: ${tourneyName}`}
    />
  );
}
