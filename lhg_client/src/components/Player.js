import React from "react";
import './Basic.css';

// If playerName is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/player/<playerName>
export const PlayerBase = (props) => {
    const playerName = props.match.params.playerName;

    return (
        <div className="body">
            <p>Player Name: {playerName}</p>
        </div>
    );
};

// {MAIN}/player/<playerName>/tournaments
export const PlayerTournaments = (props) => {
    const playerName = props.match.params.playerName;

    return (
        <div className="body">
            <p>Player Name: {playerName} [LIST OF TOURNAMENTS]</p>
        </div>
    );
};

// {MAIN}/player/<playerName>/games
export const PlayerGames = (props) => {
    const playerName = props.match.params.playerName;

    return (
        <div className="body">
            <p>Player Name: {playerName} [LIST OF GAMES]</p>
        </div>
    );
};

// {MAIN}/player/<playerName>/stats
export const PlayerStats = (props) => {
    const playerName = props.match.params.playerName;

    return (
        <div className="body">
            <p>Player Name: {playerName} [OVERALL STATS]</p>
        </div>
    );
};