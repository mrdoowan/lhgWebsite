import React, { Component } from 'react';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';
// Util
import MatchBaseSkeleton from '../util/Match/MatchBaseSkeleton';
import MatchStatsSkeleton from '../util/Match/MatchStatsSkeleton';
import MatchTimelineSkeleton from '../util/Match/MatchTimelineSkeleton';
import MatchBuildsSkeleton from '../util/Match/MatchBuildsSkeleton';

// {MAIN}/match/:matchPId
export class matchBase extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/v1/' + params.matchPId)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ match: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { match, statusCode } = this.state;

        let matchComponent = <MatchBaseSkeleton match={match} />

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Match" />) :
            (<Markup data={match} dataComponent={matchComponent} code={statusCode} />)
        );
    }
}

// {MAIN}/match/:matchPId/stats
export class matchStats extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/v1/' + params.matchPId)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ match: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { match, statusCode } = this.state;

        let matchComponent = <MatchStatsSkeleton match={match} />

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Match" />) :
            (<Markup data={match} dataComponent={matchComponent} code={statusCode} />)
        );
    }
}

// {MAIN}/match/:matchPId/timeline
export class matchTimeline extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/v1/' + params.matchPId)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ match: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { match, statusCode } = this.state;

        let matchComponent = <MatchTimelineSkeleton match={match} />

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Match" />) :
            (<Markup data={match} dataComponent={matchComponent} code={statusCode} />)
        );
    }
}

// {MAIN}/match/:matchPId/builds
export class matchBuilds extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/v1/' + params.matchPId)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ match: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { match, statusCode } = this.state;

        let matchComponent = <MatchBuildsSkeleton match={match} />

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Match" />) :
            (<Markup data={match} dataComponent={matchComponent} code={statusCode} />)
        );
    }
}