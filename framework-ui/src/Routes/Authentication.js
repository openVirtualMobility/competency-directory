import React from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';


export default function Authentication() {
  return (
    <div>
      <h1>Authentication</h1>
      <p>checks if a jwt token is inside local storage and if not open the login form</p>
      <Link href="Register" variant="body2">
        <Button
          variant="contained"
          color="primary"
        >
          Go to Registration
          </Button>
      </Link>
      <Link href="Login" variant="body2">
        <Button
          variant="contained"
          color="primary"
        >
          Go to Login
          </Button>
      </Link>
    </div>
  );
}