import React from "react";
import HelmetComponent from "../components/Helmet/HelmetComponent";

const about = () => {
    return (<div className="body">
        <HelmetComponent
            title="About - LHG Competitive Leagues"
            description="About LHG Competitive Leagues"
        />
        <p>What do you need to know about LHG???</p>
    </div>);
};

export default about;