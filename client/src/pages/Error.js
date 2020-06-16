import React, { Component } from "react";
// Components
import Error from '../components/ErrorComponent';

// 404 - URL Not found
export class error404 extends Component {
    render() {
        return (
            <Error code={404} />
        )
    }
}