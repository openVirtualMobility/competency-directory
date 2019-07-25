import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { Route } from "react-router-dom";

export default class Entry extends Component {

  componentDidMount() {
    // console.log('Fetch API here: ', this.props.match.params.id);
    console.log("DID MOUNT!")
  }
  
  render() {
    return (
      <div>
        <h1>Entry</h1>
      </div>
    );
  }

}