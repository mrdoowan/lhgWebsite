import React from "react";
import './Basic.css';

// If teamName is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TEAM RENDER HERE

// {MAIN}/team/<teamName>
export const TeamBase = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName}</p>
        </div>
    );
};

// {MAIN}/team/<teamName>/players
export const TeamPlayers = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [LIST OF PLAYERS]</p>
        </div>
    );
};

// {MAIN}/team/<teamName>/tournaments
export const TeamTournaments = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [LIST OF TOURNAMENTS]</p>
        </div>
    );
};

// {MAIN}/team/<teamName>/games
export const TeamGames = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [LIST OF GAMES]</p>
        </div>
    );
};

// {MAIN}/team/<teamName>/stats
export const TeamStats = (props) => {
    const teamName = props.match.params.teamName;

    return (
        <div className="body">
            <p>Team PID: {teamName} [STATS PAGE]</p>
        </div>
    );
};