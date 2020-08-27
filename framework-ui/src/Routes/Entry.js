import React, { Component, Fragment } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Chip from "@material-ui/core/Chip";
import Footer from "../Footer";
import Button from "@material-ui/core/Button";
import api from "../api";
import LocalizedStrings from "react-localization";
import backButton from "../assets/arrow-left.svg";
import editButton from "../assets/edit.svg";
import { sortAlphabetically } from '../utils'
import List from '@material-ui/core/List'
import { Route } from 'react-router'
import ListItem from '@material-ui/core/ListItem'
var language = require("../languages/languages.json");
var config = require("../config.json");
let strings = new LocalizedStrings(language);

class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entry: {},
      loading: true,
      referenceTypes: []
    };
  }

  async componentDidMount() {

    const getReferenceTypesResponse = await api.getReferenceTypes();
    const getReferenceTypesData = await getReferenceTypesResponse.json();
    const referenceTypes = sortAlphabetically(
      getReferenceTypesData["@graph"],
      // Tell the sort function to sort by which attribute
      referenceType => referenceType.label
    );
    var lang = localStorage.getItem("language");
    if (!lang) lang = Object.getOwnPropertyNames(language).pop() || "en"; // in case of unset language use first or EN
    let response = await api.getEntryWithId(this.props.match.params.id, lang);
    strings.setLanguage(lang);
    response.json().then(data => {
      console.log(data);
      // do something with your data
      this.setState({
        entry: data,
        loading: false,
        referenceTypes: referenceTypes
      });
    });
  }

  loadingAnimation = () => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          margin: 20,
          outline: "none"
        }}
      >
        <Typography color="textSecondary" gutterBottom>
          loading
        </Typography>
      </div>
    );
  };

  entryPage = () => {

    const {
      id,
      skillType,
      skillReuseLevel,
      prefLabel,
      altLabel,
      description,
      language,
      ...rest
    } = this.state.entry;
    delete rest["@context"];  // remove as this is not a referenceType

    let references = [];
    // Only render references if types are provided
    if (this.state.referenceTypes) {
      for (let referenceKey in rest) {
        const referenceTitle = this.state.referenceTypes.reduce(
          (prev, { key, label }) => (key === referenceKey ? label : prev),
          ""
        );
        const referenceTitleUpperFirst =
          referenceTitle.charAt(0).toUpperCase() + referenceTitle.substr(1);
        const referenceItems =
          typeof rest[referenceKey] === "string"
            ? [rest[referenceKey]]
            : rest[referenceKey];
        if (referenceItems.length > 0) {
          references.push(
            <Fragment key={referenceTitleUpperFirst}>
              <Typography variant="subtitle1">
                {referenceTitleUpperFirst}:
              </Typography>
              <List>
                {referenceItems.map(id => (
                  <Route render={({ history }) => (
                    <div key={id}>
                      <ListItem>
                        <Link href={id.toLowerCase()} style={{fontSize: "smaller"}}>
                          {id.toLowerCase()}
                        </Link>
                      </ListItem>
                    </div>

                  )} />
                ))}
              </List>
            </Fragment>
          );
        }
      }
    }

    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <div style={{ margin: 10 }}>
            <Link href="/Dashboard" variant="body2">
              <Button variant="outlined" style={{ alignSelf: "flex-end" }}>
                <img src={backButton} alt="Logo" />
                <p style={{ marginLeft: 5 }}>{strings.goBack}</p>
              </Button>
            </Link>
          </div>
          {/* <div style={{ margin: 10, alignSelf: "flex-end" }}>
            <Link href="/entries/23/edit">
              <Button variant="outlined" style={{ alignSelf: "flex-end" }}>
                <img src={editButton} alt="Logo" />
                <p style={{ marginLeft: 5 }}>edit</p>
              </Button>
            </Link>
          </div> */}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            margin: 20,
            outline: "none"
          }}
        >
          <Card
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, padding: "18px 12px", maxWidth: 420 }}
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
                  label={
                    strings.language +
                    ": " +
                    this.state.entry.prefLabel.language
                  }
                  style={{ margin: "3px 7px 3px -1px", height: 22 }}
                />
                <Chip
                  label={
                    strings.reuse +
                    ": " +
                    this.state.entry.skillReuseLevel.substr(2)
                  }
                  style={{ margin: "3px 7px 18px -1px", height: 22 }}
                />
              </Fragment>
              <Typography variant="subtitle1">
                {strings.description}:
              </Typography>
              <Typography paragraph>
                {this.state.entry.description.value}
              </Typography>
              <Typography paragraph>
                URL: {config.baseurl}/entries/{this.props.match.params.id}
              </Typography>
              {references}
            </CardContent>
          </Card>
        </div>
        <Footer strings={strings} />
      </div>
    );
  };

  render() {
    return (
      // loading animation
      this.state.loading ? this.loadingAnimation() : this.entryPage()
    );
  }
}

export default Entry;
