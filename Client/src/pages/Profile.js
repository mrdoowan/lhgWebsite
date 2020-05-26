import React, { Component } from 'react';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';
// Util
import ProfileBaseSkeleton from '../util/Profile/ProfileBaseSkeleton';
import ProfileGamesSkeleton from '../util/Profile/ProfileGamesSkeleton';
import ProfileStatsSkeleton from '../util/Profile/ProfileStatsSkeleton';

// {MAIN}/profile/:profileName
export class profileBase extends Component {
    state = {
        info: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/profile/v1/information/name/' + params.profileName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ info: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, statusCode } = this.state;

        let component = (<ProfileBaseSkeleton info={info} />);

        return (
            (statusCode != null && statusCode !== 200) ?
            (<Error code={statusCode} page="Profile" />) : 
            (<Markup data={info} dataComponent={component} code={statusCode} />)
        )
    }
}

// {MAIN}/profile/:profileName/games/:seasonShortName
export class profileGames extends Component {
    state = {
        info: null,
        games: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/profile/v1/information/name/' + params.profileName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ info: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/profile/v1/games/name/' + params.profileName + '/' + params.seasonShortName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ games: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, games, statusCode } = this.state;

        let component = (<ProfileGamesSkeleton info={info} games={games} />);

        return (
            (statusCode != null && statusCode !== 200) ?
            (<Error code={statusCode} page="Profile" />) : 
            (<Markup data={info} dataComponent={component} code={statusCode} />)
        )
    }
}

// {MAIN}/profile/:profileName/stats/:tournamentShortName
export class profileStats extends Component {
    state = {
        info: null,
        stats: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/profile/v1/information/name/' + params.profileName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ info: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/profile/v1/stats/name/' + params.profileName + '/' + params.seasonShortName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ stats: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { stats, info, statusCode } = this.state;

        let component = (<ProfileStatsSkeleton info={info} stats={stats} />);

        return (
            (statusCode != null && statusCode !== 200) ?
            (<Error code={statusCode} page="Profile" />) : 
            (<Markup data={info} dataComponent={component} code={statusCode} />)
        )
    }
}