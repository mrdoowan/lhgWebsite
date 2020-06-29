import React, { Component } from 'react';
import axios from 'axios';
// Components
import LeagueTable from '../components/League/LeagueTable';
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';

// {MAIN}/leagues
export class leagues extends Component {
    state = {
        leagues: null,
        statusCode: null,
    }

    componentDidMount() {

        axios.get(`/api/leagues/v1`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ leagues: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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