import React from "react";
import './Basic.css';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TOURNAMENT RENDER HERE


// {MAIN}/season/:seasonShortName
export const seasonBase = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/roster
export const seasonRoster = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [ROSTER]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/regular
export const seasonRegular = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [REGULAR SEASON]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/playoffs
export const seasonPlayoffs = (props) => {
    const shortName = props.match.params.tourneyShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [PLAYOFFS]</p>
        </div>
    );
};