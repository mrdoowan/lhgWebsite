import React from "react";
// Components
import Loading from './Loading';

// If data hasn't loaded yet, it will continue to remain as 'null'.
// Need a loading status as this is happening
export default function Markup({ data, code, dataComponent }) {
    let markup = null;

	if (!data && (!code || code === 200)) {
		markup = (<Loading />);
	}
	else if (data) {
		markup = ( dataComponent );
	}

    return (
        <div>
            {markup}
        </div>
    );
}
