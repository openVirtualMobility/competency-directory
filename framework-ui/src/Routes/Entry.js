import React, { Component } from 'react';
import api from "../api"

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    console.log(this.props.match.params.id)
    let response = await api.getEntryWithId(this.props.match.params.id);
    response.json().then(data => {
      // do something with your data
      console.log(data);
    });
  }

  render() {
    return (
      <h1>{this.props.match.params.id}</h1>
    );
  }
}

export default Entry;
