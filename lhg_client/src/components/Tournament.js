import React from "react";
import './Basic.css';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TOURNAMENT RENDER HERE


// {MAIN}/tournament/:tournamentShortName
export const TournamentBase = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/pickbans
export const TournamentPickBans = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [Pick Bans]</p>
        </div>
    );
};