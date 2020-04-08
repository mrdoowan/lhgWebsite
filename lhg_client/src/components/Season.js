import React from "react";
import './Basic.css';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TOURNAMENT RENDER HERE


// {MAIN}/season/:seasonShortName
export const SeasonBase = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/roster
export const SeasonRoster = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [ROSTER]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/regular
export const SeasonRegular = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [REGULAR SEASON]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/playoffs
export const SeasonPlayoffs = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [POST SEASON]</p>
        </div>
    );
};