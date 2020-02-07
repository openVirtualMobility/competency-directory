import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: 15
        }}
      >
        <div
          style={{
            width: "80%",
            alignSelf: "center",
            height: 2,
            backgroundColor: "#00abdf"
          }}
        ></div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "reg",
              width: "50%",
              margin: 10
            }}
          >
            <Typography>
              The creation of these resources has been (partially) funded by the
              ERASMUS+ grant program of the European Union under grant no.
              2017-1-DE01-KA203-003494. Neither the European Commission nor the
              project’s national funding agency DAAD are responsible for the
              content or liable for any losses or damage resulting of the use of
              these resources
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: 10,
              justifyContent: "center",
              height: 150
            }}
          >
            <img
              style={{ margin: 10, paddingBottom: 10, height: 80 }}
              src={require("./assets/erasmus+.png")}
              alt="logo of erasmus+"
            />
            <img
              style={{ margin: 10 }}
              src={require("./assets/openVM-logo.png")}
              alt="logo of openVM"
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "40%",
            alignSelf: "center",
            alignItems: "center"
          }}
        >
          <Link
            style={{ margin: 10 }}
            href="https://www.beuth-hochschule.de/impressum"
          >
            {this.props.strings.impressum}
          </Link>
          <Link
            style={{ margin: 10 }}
            href="https://www.beuth-hochschule.de/datenschutz"
          >
            {this.props.strings.privacy}
          </Link>
        </div>
      </div>
    );
  }
}

export default Footer;
