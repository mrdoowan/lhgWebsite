import React from 'react';
import { 
  isSessionDataLoaded,
  setSessionDataChamps,
  setSessionDataSpells,
  setSessionDataVersions
} from '../service/StaticCalls';
// Components
import Loading from './Loading';

// If data hasn't loaded yet, it will continue to remain as 'null'.
// Need a loading status as this is happening
export default function Markup({ data, code, dataComponent }) {
  // Set Session data on Markup
  setSessionDataVersions();
  setSessionDataChamps();
  setSessionDataSpells();

  let markup = null;
  if ((!data || isSessionDataLoaded()) && (!code || code === 200)) {
    markup = (<Loading />);
  } else if (data) {
    markup = (dataComponent);
  }

  return (
    <div>
      {markup}
    </div>
  );
}
