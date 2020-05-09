import React from "react";
import './Basic.css';

// If profileName is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/profile/:profileName
export const profileBase = (props) => {
    const profileName = props.match.params.profileName;

    return (
        <div className="body">
            <p>Profile Name: {profileName}</p>
        </div>
    );
};

// {MAIN}/profile/:profileName/champs
export const profileChamps = (props) => {
    const profileName = props.match.params.profileName;

    return (
        <div className="body">
            <p>Profile Name: {profileName} [LIST OF CHAMPS]</p>
        </div>
    );
};

// {MAIN}/profile/:profileName/games/:seasonShortName
export const profileGames = (props) => {
    const profileName = props.match.params.profileName;
    const seasonName = props.match.params.seasonShortName;

    return (
        <div className="body">
            <p>Profile Name: {profileName} [LIST OF GAMES IN {seasonName}]</p>
        </div>
    );
};

// {MAIN}/profile/:profileName/stats/:tournamentShortName
export const profileStats = (props) => {
    const profileName = props.match.params.profileName;
    const tourneyName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>Profile Name: {profileName} [OVERALL STATS IN {tourneyName}]</p>
        </div>
    );
};