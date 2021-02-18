import React from 'react';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchSetup from '../../components/Match/MatchSetup';

export default function MatchSetupSkeleton({ setupData }) {

    const setupComponent = (<MatchSetup setupData={setupData} />);
    const setupEmpty = "There is no Setup logged for this Match.";

    return (
        <div className="match-setup__skeleton-root">
            <DataWrapper 
                data={setupData} 
                component={setupComponent} 
                emptyMessage={setupEmpty} 
            />
        </div>
    )
}