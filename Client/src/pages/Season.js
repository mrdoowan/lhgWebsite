import React, { Component } from 'react';
// Components
import SeasonHeader from '../components/SeasonHeader';
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
        fetch('/api/season/information/name/' + params.seasonShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({ 
                    season: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { season, statusCode } = this.state;

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Season" />) :
            (<Markup data={season} component={<SeasonHeader info={season} />} code={statusCode} />)
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