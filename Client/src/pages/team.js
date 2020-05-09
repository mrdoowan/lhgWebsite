import React from "react";
import './Basic.css';

// If teamName is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TEAM RENDER HERE

// {MAIN}/team/:teamName
export const teamBase = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName}</p>
        </div>
    );
};

// {MAIN}/team/:teamName/players
export const teamPlayers = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [LIST OF PLAYERS]</p>
        </div>
    );
};

// {MAIN}/team/:teamName/scouting/:seasonShortName
export const teamScouting = (props) => {
    const teamName = props.match.params.teamName;
    const seasonName = props.match.params.seasonShortName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [SCOUTING PAGE IN {seasonName}]</p>
        </div>
    );
};

// {MAIN}/team/:teamName/games/:seasonShortName
export const teamGames = (props) => {
    const teamName = props.match.params.teamName;
    const seasonName = props.match.params.seasonShortName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [LIST OF GAMES IN {seasonName}]</p>
        </div>
    );
};

// {MAIN}/team/:teamName/stats/:tournamentShortName
export const teamStats = (props) => {
    const teamName = props.match.params.teamName;
    const tourneyName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [STATS PAGE IN {tourneyName}]</p>
        </div>
    );
};