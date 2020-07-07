import React from 'react';
import { Helmet } from "react-helmet";

export default function HelmetComponent({ title, description, image, url }) {

    return (
        <Helmet>
            <title>{(title) ? `${title} - LHG Leagues` : "LHG Competitive Leagues"}</title>
            {(description) ? <meta name="description" content={description} /> : null}
            {/* Og - Open Graph */}
            {(title) ? <meta property="og:title" content={title} /> : null}
            {(description) ? <meta property="og:description" content={description} /> : null}
            {(image) ? <meta property="og:image" content={image} /> : null}
            {(url) ? <meta property="og:url" content={url} /> : null}
            <meta property="og:site_name" content="LHG Competitive Leagues" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:type" content="website" />
            {/* Twitter */}
            {(title) ? <meta name="twitter:title" content={title} /> : null}
            {(description) ? <meta name="twitter:description" content={description} /> : null}
            {(image) ? <meta name="twitter:image" content={image} /> : null}
        </Helmet>
    );
}