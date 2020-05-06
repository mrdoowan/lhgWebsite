import React, { Component } from 'react';
import LeagueTable from '../components/LeagueTable';

// {MAIN}/leagues
export class leagues extends Component {
    state = {
        leagues: null
    }

    componentDidMount() {
        fetch('/api/leagues/')
        .then(res => res.json())
        .then(data => {
            this.setState({ 
                leagues: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        return (
            <div>
                {this.state.leagues ? (
                    <LeagueTable seasonList={this.state.leagues} />
                ) : (
                    <div></div>
                )}
            </div>
        );
    }
}