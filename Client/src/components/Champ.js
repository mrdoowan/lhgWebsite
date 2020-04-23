import React from "react";
import './Basic.css';

// If champName does not exist in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL CHAMPION RENDER HERE

// {MAIN}/champion
export const ChampionBase = () => {
    return (
        <div className="body">
            <p>Champion Main Page List</p>
        </div>
    );
};

// {MAIN}/champion/<champName>
export const ChampionName = (props) => {
    const champName = props.match.params.champName;

    return (
        <div className="body">
            <p>[{champName}] MAIN PAGE OF INFO [WIP]</p>
        </div>
    );
};