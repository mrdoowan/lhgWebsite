import React from "react";
import './Basic.css';

// If riotMatchID is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/match/<riotMatchID>
export const MatchBase = (props) => {
    const matchPID = props.match.params.matchPID;

    return (
        <div className="body">
            <p>Match Page for ID: {matchPID}</p>
        </div>
    );
};