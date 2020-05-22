import React from "react";
// Components
import Loading from './Loading';

export default function Markup({ data, component, code }) {
    let markup = 
        (data == null && code === 200) ? (<Loading />) : 
        (data) ? (component) : 
        ('');

    return (
        <div>
            {markup}
        </div>
    );
}