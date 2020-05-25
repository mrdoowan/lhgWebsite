import React from "react";
// Components
import Loading from './Loading';

export default function Markup({ data, code, dataComponent }) {
    let markup = 
        (data == null && (code === 200 || code == null)) ? ( <Loading /> ) : 
        (data) ? ( dataComponent ) : 
        ('');

    return (
        <div>
            {markup}
        </div>
    );
}