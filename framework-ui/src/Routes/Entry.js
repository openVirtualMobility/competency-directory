import React, { Component, Fragment } from 'react';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Link from '@material-ui/core/Link';
import Chip from "@material-ui/core/Chip";
import Footer from "../Footer"
import Button from "@material-ui/core/Button";
import api from "../api"
import LocalizedStrings from 'react-localization';
import backButton from "../assets/arrow-left.svg";
import editButton from "../assets/edit.svg";
var language = require("../languages/languages.json");
var config = require("../config.json")
let strings = new LocalizedStrings(language)

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    console.log(this.props.match.params.id)
    var lang = localStorage.getItem("language")
    if (!lang) lang = Object.getOwnPropertyNames(language).pop() || "en";  // in case of unset language use first or EN
    let response = await api.getEntryWithId(this.props.match.params.id, lang);
    strings.setLanguage(lang)
    response.json().then(data => {
      console.log(data)
      // do something with your data
      this.setState({
        entry: data,
        loading: false
      })
    });
  }

  loadingAnimation = () => {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        margin: 20,
        outline: "none"
      }}>
        <Typography color="textSecondary" gutterBottom>
          loading
          </Typography>
      </div>
    )
  }

  entryPage = () => {
    return (
      <div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <div style={{ margin: 10 }}>

            <Link href="/Dashboard" variant="body2">
              <Button variant="outlined" style={{ alignSelf: "flex-end" }}>
                <img src={backButton} alt="Logo" />
                <p style={{ marginLeft: 5 }}>Go back</p>
              </Button>
            </Link>
          </div>
          <div style={{ margin: 10, alignSelf: "flex-end" }}>
            <Link href="/entries/23/edit">
              <Button variant="outlined" style={{ alignSelf: "flex-end" }}
                onClick={() => {
                  // this.props.history.push("/Dashboard")
                  // console.log(this.props)
                  // this.props.navigation.history.push("/entries/" + this.props.match.params.id + "/edit")
                }}
              >
                <img src={editButton} alt="Logo" />
                <p style={{ marginLeft: 5 }}>edit</p>
              </Button>
            </Link>

          </div>
        </div>


        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          margin: 20,
          outline: "none"
        }}>
          <Card
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, padding: "18px 12px", maxWidth: 420, }}
          >
            <CardContent
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "baseline",
                height: "100%",
                boxSizing: "border-box"
              }}
            >

              <Typography color="textSecondary" gutterBottom>
                {strings.type}: {this.state.entry.skillType}
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                style={{ lineHeight: 1.2 }}
                gutterBottom
              >
                {this.state.entry.prefLabel.value}
              </Typography>
              <Fragment>
                <Chip
                  label={strings.language + ": " + this.state.entry.prefLabel.language}
                  style={{ margin: "3px 7px 3px -1px", height: 22 }}
                />
                <Chip
                  label={strings.reuse + ": " + this.state.entry.skillReuseLevel.substr(2)}
                  style={{ margin: "3px 7px 18px -1px", height: 22 }}
                />
              </Fragment>
              <Typography variant="subtitle1">{strings.description}:</Typography>
              <Typography paragraph>
                {this.state.entry.description.value}
              </Typography>
              <Typography>
                {config.baseurl}/entries/{this.props.match.params.id}
              </Typography>
            </CardContent>
          </Card>
        </div>
        <Footer strings={strings} />
      </div>

    );
  }

  render() {
    return (
      // loading animation
      this.state.loading ? this.loadingAnimation() : this.entryPage()
    );
  }
}

export default Entry;
