import React, { Component } from 'react';
import axios from 'axios';
// Components
import SeasonHeader from '../components/Season/SeasonHeader';
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

// {MAIN}/season/:seasonShortName
export class seasonBase extends Component {
    state = {
        season: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        axios.get(`/api/season/v1/information/name/${params.seasonShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ season: res.data });
        }).catch(err => console.error(err));
    }

    render() {
        const { season, statusCode } = this.state;

        let component = (<SeasonHeader info={season} />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Season" />) :
            (<Markup data={season} dataComponent={component} code={statusCode} />)
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