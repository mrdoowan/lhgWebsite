import React, { Component } from 'react';
// Components
import LeagueTable from '../components/LeagueTable';
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';

// {MAIN}/leagues
export class leagues extends Component {
    state = {
        leagues: null,
        statusCode: null,
    }

    componentDidMount() {
        fetch('/api/leagues/')
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ leagues: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { leagues, statusCode } = this.state;

        let component = (<LeagueTable seasonList={leagues} />);

        return (
            (statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="League" />) :
            (<Markup data={leagues} dataComponent={component} code={statusCode} />)
        );
    }
}