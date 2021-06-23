import React from 'react';
// Components
import HelmetComponent from './HelmetComponent';

export default function SeasonHelmet({ info }) {
  const metaTitle = info.SeasonName;
  const metaDescription = `Information for the ${info.SeasonName}`;

  return (
    <HelmetComponent
      title={metaTitle}
      description={metaDescription}
    />
  );
}
