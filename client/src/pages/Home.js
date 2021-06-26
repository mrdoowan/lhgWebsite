import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Components
import HomeComponent from '../components/Home/HomeComponent';
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';

// {MAIN}/
const HomePage = () => {
  // Init State
  const [leagueData, setLeagueData] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  // Mount component
  useEffect(() => {
    axios.get('/api/leagues/v1')
      .then((res) => {
        setStatusCode(res.status);
        setLeagueData(res.data);
      }).catch((err) => {
        setStatusCode(err.response.status);
      });
  }, []);

  const homeComponent = <HomeComponent leagueData={leagueData} />;

  return ((statusCode !== null && statusCode !== 200)
    ? (<Error code={statusCode} page="Match" />)
    : (<Markup data={leagueData} dataComponent={homeComponent} code={statusCode} />)
  );
};

export default HomePage;
