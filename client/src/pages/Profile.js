import React, { Component } from 'react';
import axios from 'axios';
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

    axios.get(`/api/profile/v1/information/name/${params.profileName}`)
      .then((res) => {
        if (this.statusCode === 200 || this.statusCode == null) {
          this.setState({ statusCode: res.status });
        }
        this.setState({ info: res.data });
      }).catch((err) => {
        this.setState({ statusCode: err.response.status })
      });
  }

  render() {
    const { info, statusCode } = this.state;

    const component = (<ProfileBaseSkeleton info={info} />);

    return (
      (statusCode != null && statusCode !== 200) ?
        (<Error code={statusCode} page="Profile" />) :
        (<Markup data={info} dataComponent={component} code={statusCode} />)
    )
  }
}

// {MAIN}/profile/:profileName/games
// {MAIN}/profile/:profileName/games/:seasonShortName
export class profileGames extends Component {
  state = {
    info: null,
    games: null,
    statusCode: null,
  }

  componentDidMount() {
    const { match: { params } } = this.props;

    axios.get(`/api/profile/v1/information/name/${params.profileName}`)
      .then((res) => {
        if (this.statusCode === 200 || this.statusCode == null) {
          this.setState({ statusCode: res.status });
        }
        this.setState({ info: res.data });
      }).catch((err) => {
        this.setState({ statusCode: err.response.status })
      });

    if (params.seasonShortName) {
      // Specific season
      axios.get(`/api/profile/v1/games/name/${params.profileName}/${params.seasonShortName}`)
        .then((res) => {
          if (this.statusCode === 200 || this.statusCode == null) {
            this.setState({ statusCode: res.status });
          }
          this.setState({ games: res.data });
        }).catch((err) => {
          this.setState({ statusCode: err.response.status })
        });
    }
    else {
      // Latest season
      axios.get(`/api/profile/v1/games/latest/name/${params.profileName}`)
        .then((res) => {
          if (this.statusCode === 200 || this.statusCode == null) {
            this.setState({ statusCode: res.status });
          }
          this.setState({ games: res.data });
        }).catch((err) => {
          this.setState({ statusCode: err.response.status })
        });
    }
  }

  render() {
    const { info, games, statusCode } = this.state;

    const component = (<ProfileGamesSkeleton info={info} games={games} />);

    return (
      (statusCode != null && statusCode !== 200) ?
        (<Error code={statusCode} page="Profile" />) :
        (<Markup data={info && games} dataComponent={component} code={statusCode} />)
    )
  }
}

// {MAIN}/profile/:profileName/stats
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
        }).catch((err) => {
          this.setState({ statusCode: err.response.status })
        });
      }).catch((err) => {
        this.setState({ statusCode: err.response.status })
      });

    if (params.tournamentShortName) {
      // Specific tournament
      axios.get(`/api/profile/v1/stats/name/${params.profileName}/${params.tournamentShortName}`)
        .then((res) => {
          if (this.statusCode === 200 || this.statusCode == null) {
            this.setState({ statusCode: res.status });
          }
          this.setState({ stats: res.data });
        }).catch((err) => {
          this.setState({ statusCode: err.response.status })
        });
    }
    else {
      // Latest tournament
      axios.get(`/api/profile/v1/stats/latest/name/${params.profileName}`)
        .then((res) => {
          if (this.statusCode === 200 || this.statusCode == null) {
            this.setState({ statusCode: res.status });
          }
          this.setState({ stats: res.data });
        }).catch((err) => {
          this.setState({ statusCode: err.response.status })
        });
    }

  }

  render() {
    const { stats, info, statusCode } = this.state;

    const component = (<ProfileStatsSkeleton info={info} stats={stats} />);

    return (
      (statusCode != null && statusCode !== 200) ?
        (<Error code={statusCode} page="Profile" />) :
        (<Markup data={info && stats} dataComponent={component} code={statusCode} />)
    )
  }
}
