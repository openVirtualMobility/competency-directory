import React, { Component } from "react";
import Dashboard from "./Dashboard"
import Login from "./Login"
import Register from "./Register"
import Authentication from "./Routes/Authentication"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
class App extends Component {
  state = {
  };

  render() {
    return (
      <Router>
        <Route exact path="/" component={Authentication} />
        <Route exact path="/Login" component={Login} />
        <Route exact path="/Register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
      </Router>
    );
  }
}

export default App;
