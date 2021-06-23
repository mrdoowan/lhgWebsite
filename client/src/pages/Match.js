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
import MatchSetupListSkeleton from '../util/Match/MatchSetupListSkeleton';

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

    const matchComponent = <MatchBaseSkeleton match={match} />

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

    const matchComponent = <MatchStatsSkeleton match={match} />

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

    const matchComponent = <MatchTimelineSkeleton match={match} />

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

    const matchComponent = <MatchBuildsSkeleton match={match} />

    return ((statusCode != null && statusCode !== 200) ?
      (<Error code={statusCode} page="Match" />) :
      (<Markup data={match} dataComponent={matchComponent} code={statusCode} />)
    );
  }
}

export const MatchSetupPage = (props) => {
  // Init State
  const [matchSetupData, setMatchSetupData] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const { match: { params } } = props;

  // Mount Component
  useEffect(() => {
    axios.get(`/api/match/v1/setup/data/${params.matchPId}`)
      .then((res) => {
        setStatusCode(res.status);
        setMatchSetupData(res.data);
      }).catch((err) => {
        setStatusCode(err.response.status);
      });
  }, [params]);

  const matchSetupComponent = <MatchSetupSkeleton setupData={matchSetupData} />

  return ((statusCode !== null && statusCode !== 200) ?
    (<Error code={statusCode} page="Match" />) :
    (<Markup data={matchSetupData} dataComponent={matchSetupComponent} code={statusCode} />)
  );
};

export const MatchSetupListPage = () => {
  // Init State
  const [matchSetupListData, setMatchSetupListData] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  // Mount Component
  useEffect(() => {
    axios.get(`/api/match/v1/setup/list`)
      .then((res) => {
        setStatusCode(res.status);
        setMatchSetupListData(res.data);
      }).catch((err) => {
        setStatusCode(err.response.status);
      });
  }, []);

  const matchSetupListComponent = <MatchSetupListSkeleton setupListData={matchSetupListData} />

  return ((statusCode !== null && statusCode !== 200) ?
    (<Error code={statusCode} page="Match" />) :
    (<Markup data={matchSetupListData} dataComponent={matchSetupListComponent} code={statusCode} />)
  );
}
