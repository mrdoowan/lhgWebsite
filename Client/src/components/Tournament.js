import React from "react";
import './Basic.css';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TOURNAMENT RENDER HERE


// {MAIN}/tournament/:tournamentShortName
export const TournamentBase = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/players
export const TournamentPlayers = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament Players Data Table: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/teams
export const TournamentTeams = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament Team Data Table: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/pickbans
export const TournamentPickBans = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [Pick Bans]</p>
        </div>
    );
};