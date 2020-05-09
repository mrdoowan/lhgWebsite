import React from "react";
import './Basic.css';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TOURNAMENT RENDER HERE


// {MAIN}/tournament/:tournamentShortName
export const tournamentBase = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/players
export const tournamentPlayers = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament Players Data Table: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/teams
export const tournamentTeams = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament Team Data Table: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/pickbans
export const tournamentPickBans = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [Pick Bans]</p>
        </div>
    );
};