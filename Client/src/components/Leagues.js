import React, { Component } from 'react';
import './League.css';

// {MAIN}/leagues
export class Leagues extends Component {
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
            console.log(this.state);
        })
        .catch(err => console.error(err));
    }

    renderLeagueTable() {
        return this.state.leagues.map((season) => {
            const { SeasonTime, Champions, Premier, Academy } = season;
            return (
                <tr>
                    <td class="cell-time">{SeasonTime}</td>
                    <td class="cell-name">{Champions ? Champions.ShortName : ''}</td>
                    <td class="cell-name">{Premier ? Premier.ShortName : ''}</td>
                    <td class="cell-name">{Academy ? Academy.ShortName : ''}</td>
                </tr>
            );
        });
    }

    render() {
        let leagueMarkUp = this.state.leagues ? (
            <table class="tg">
                <tr>
                    <th class="head-blank"></th>
                    <th class="head-cl">Champions</th>
                    <th class="head-pl">Premier</th>
                    <th class="head-al">Academy</th>
                </tr>
                {this.renderLeagueTable()}
            </table>
        ) : (<div></div>);

        return (
            <div>
                <div class="body">
                    <p>List of All LHG Leagues</p>
                </div>
                {leagueMarkUp}
            </div>
        );
    }
}