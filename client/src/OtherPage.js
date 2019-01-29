import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div style={{ padding: 30 }}>
      I'm some Other page
      <br></br>
      <Link to='/'>Go back home</Link>
    </div>
  );
};
