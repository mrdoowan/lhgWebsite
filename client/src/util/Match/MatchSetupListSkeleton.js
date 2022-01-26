import React from 'react';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchSetupList from '../../components/Match/MatchSetupList';

export default function MatchSetupListSkeleton({ setupListData }) {
  const setupListComponent = (<MatchSetupList setupListData={setupListData} />);
  const setupListEmpty = 'There is no Setup List data.';

  return (
    <div className="match-setup-list__skeleton-root">
      <DataWrapper
        data={setupListData}
        component={setupListComponent}
        emptyMessage={setupListEmpty}
      />
    </div>
  );
}
