import React, { Component } from 'react';
import './Basic.css';

// {MAIN}/leagues
export class Leagues extends Component {
    constructor() {
        super();
        this.state = {
            leagues: {}
        }
    }

    componentDidMount() {
        fetch('/api/leagues/')
        .then(res => res.json())
        .then(leagues => {
            this.setState({ leagues });
            console.log(this.state);
        });
    }

    render() {
        let table = [];

        return (
            <div className="body">
                <p>List of All LHG Leagues</p>
                <table class="tg">

                </table>
            </div>
        );
    }
}