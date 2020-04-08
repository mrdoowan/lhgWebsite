import React from "react";
import './Basic.css';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TOURNAMENT RENDER HERE


// {MAIN}/tournament/<tournamentShortName>
export const TournamentBase = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/rosters
export const TournamentRoster = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [ROSTER]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/scouting/<teamName>
export const TournamentScouting = (props) => {
    const shortName = props.match.params.tourneyShortName;
    const teamName = props.matchparams.teamName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [Scouting {teamName}]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/regular
export const TournamentRegular = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [REGULAR SEASON]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/playoffs
export const TournamentPost = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [POST SEASON]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/stats
export const TournamentStats = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [STATS]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/pickbans
export const TournamentPickBans = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [Pick Bans]</p>
        </div>
    );
};