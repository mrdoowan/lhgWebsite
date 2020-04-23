import React from "react";
import { NavLink } from "react-router-dom";
import './Navigation.css';

const Navigation = () => {
    return (
        <div className="row">
            <div className='column'>
                <NavLink className='navBar' to="/">Home</NavLink>
                <NavLink className='navBar' to="/about">About</NavLink>
                <NavLink className='navBar' to="/leagues">Leagues</NavLink>
                <NavLink className='navBar' to="/schedule">Schedule</NavLink>
            </div>
            <div className='column'>Search Bar here</div>
        </div>
    );
};

export default Navigation;