import React from "react";
// Components
import Loading from './Loading';

// If data hasn't loaded yet, it will continue to remain as 'null'.
// Need a loading status as this is happening
export default function Markup({ data, code, dataComponent }) {
    const markup =
        (!data && (code === 200 || !code)) ? ( <Loading /> ) :
        (data) ? ( dataComponent ) :
        ('');

    return (
        <div>
            {markup}
        </div>
    );
}
