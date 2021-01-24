import React, { Component, useState, useEffect } from 'react';
import axios from 'axios';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';
// Util
import MatchBaseSkeleton from '../util/Match/MatchBaseSkeleton';
import MatchStatsSkeleton from '../util/Match/MatchStatsSkeleton';
import MatchTimelineSkeleton from '../util/Match/MatchTimelineSkeleton';
import MatchBuildsSkeleton from '../util/Match/MatchBuildsSkeleton';
import MatchSetupSkeleton from '../util/Match/MatchSetupSkeleton';

// {MAIN}/match/:matchPId
export class matchBase extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        axios.get(`/api/match/v1/data/${params.matchPId}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ match: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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
        
        axios.get(`/api/match/v1/data/${params.matchPId}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ match: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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

        axios.get(`/api/match/v1/data/${params.matchPId}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ match: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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

        axios.get(`/api/match/v1/data/${params.matchPId}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ match: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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

export const MatchSetupPage = (props) => {
    // Init State
    const [matchSetupData, setMatchSetupData] = useState({});
    const [statusCode, setStatusCode] = useState(null);

    // Mount Component
    useEffect(() => {
        const { match: { params } } = props;

        axios.get(`/api/match/v1/setup/${params.matchPId}`)
        .then((res) => {
            if (statusCode === 200 || statusCode === null) {
                setStatusCode(res.status);
            }
            setMatchSetupData(res.data);
        }).catch(() => {
            setStatusCode(500);
        });
    }, []);

    const matchComponent = <MatchSetupSkeleton setupData={matchSetupData} />

    return ((statusCode !== null && statusCode !== 200) ? 
        (<Error code={statusCode} page="Match" />) : 
        (<Markup data={matchSetupData} dataComponent={matchComponent} code={statusCode} />)
    );
};