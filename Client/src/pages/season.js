import React, { Component } from 'react';
// Components
import SeasonHeader from '../components/SeasonHeader';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

// {MAIN}/season/:seasonShortName
export class seasonBase extends Component {
    state = {
        season: null
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/season/information/name/' + params.seasonShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                season: data
            });
            console.log(data);
        })
        .catch(err => console.error(err));
    }

    render() {
        const { season } = this.state;

        return (
            <div><SeasonHeader info={season} /></div>
        );
    }
}

// {MAIN}/tournament/<tournamentShortName>/roster
export const seasonRoster = (props) => {
    const shortName = props.match.params.seasonShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [ROSTER]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/regular
export const seasonRegular = (props) => {
    const shortName = props.match.params.seasonShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [REGULAR SEASON]</p>
        </div>
    );
};

// {MAIN}/tournament/<tournamentShortName>/playoffs
export const seasonPlayoffs = (props) => {
    const shortName = props.match.params.seasonShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [PLAYOFFS]</p>
        </div>
    );
};