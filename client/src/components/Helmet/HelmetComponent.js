import React from 'react';
import { Helmet } from "react-helmet";

export default function HelmetComponent({ title, description, image, url }) {

    return (<head>
        <Helmet>
            <meta property="og:site_name" content="LHG Competitive Leagues" />
            {(title) ? <title>{title}</title> : null}
            {(title) ? <meta property="og:title" content={title} /> : null}
            {(title) ? <meta property="twitter:title" content={title} /> : null}
            {(description) ? <meta property="description" content={description} /> : null}
            {(description) ? <meta property="og:description" content={description} /> : null}
            {(description) ? <meta property="twitter:description" content={description} /> : null}
            {(image) ? <meta property="og:image" content={image} /> : null}
            {(image) ? <meta property="og:image" content={image} /> : null}
            {(url) ? <meta property="og:url" content={url} /> : null}
        </Helmet>
    </head>);
}