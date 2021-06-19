import React, { Component } from 'react';
// Components
import Error from '../components/ErrorComponent';

// 404 - URL Not found
class Error404 extends Component {
  render() {
    return (
      <Error code={404} />
    );
  }
}

export default Error404;
