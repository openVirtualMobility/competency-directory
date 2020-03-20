import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import api from "../api";
import { sortAlphabetically } from "../utils";
import LocalizedStrings from "react-localization";
import backButton from "../assets/arrow-left.svg";
import saveButton from "../assets/save.svg";
import deleteButton from "../assets/x-octagon.svg";
import Select from "react-select";
import Footer from "../Footer";
var language = require("../languages/languages.json");
let strings = new LocalizedStrings(language);

const options = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "nl", label: "Dutch" },
  { value: "es", label: "Spanish" },
  { value: "it", label: "Italian" },
  { value: "fr", label: "France" }
];

const typeOptions = [
  { value: "Knowledge", label: "Knowledge" },
  { value: "Skill or Competence", label: "Skill or Competence" }
];

const reuseOptions = [
  { value: "1 Transversal", label: "1 Transversal" },
  {
    value: "2 Cross-sectoral",
    label: "2 Cross-sectoral"
  },
  { value: "3 Sector-specific", label: "3 Sector-specific" },
  {
    value: "4 Occupation-specific",
    label: "4 Occupation-specific"
  }
];

class New extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      entry: {
        id: "",
        language: "",
        skillReuseLevel: "",
        isEssentialPartOf: [],
        isOptionalPartOf: [],
        isSameAs: [],
        isSimilarTo: [],
        needsAsPrerequisite: [],
        description: {
          language: "",
          value: ""
        },
        altLabel: [],
        prefLabel: { language: "", value: "" }
      },
      setOpen: false,
      entryOptions: [],
      selectedEssentialPartOf: [],
      selectedOptionalPartOf: [],
      selectedsimilarTo: [],
      selectedNeedsAsRequisite: []
    };
  }

  async componentDidMount() {
    var lang = localStorage.getItem("language");
    if (!lang) lang = Object.getOwnPropertyNames(language).pop() || "en"; // in case of unset language use first or EN
    const getEntriesResponse = await api.getEntries(lang);
    const getEntriesData = await getEntriesResponse.json();
    const entries = sortAlphabetically(
      getEntriesData["@graph"],
      // Tell the sort function to sort by which attribute
      entry => entry.prefLabel.value
    );

    let response = await api.getEntryWithId(this.props.match.params.id, lang);
    strings.setLanguage(lang);

    // builds the objects that are used in the dropdown selection for the relations
    this.buildRelationsDropdown(entries, "");

    this.setState({
      loading: false
    });
  }

  async buildRelationsDropdown(entries, thisPrefLabel) {
    let newEntryOptions = [];
    entries.forEach(entry => {
      // does not allow to add own title to dropdown list for references dropdowns to select
      if (entry.prefLabel.value !== thisPrefLabel) {
        let newOption = { value: entry, label: entry.prefLabel.value };
        newEntryOptions.push(newOption);
      }
    });

    this.setState({
      entryOptions: newEntryOptions
    });
  }

  handleClickOpen = () => {
    this.setState({
      setOpen: true
    });
  };

  handleClose = () => {
    this.setState({
      setOpen: false
    });
  };

  save() {
    // builds the new entry and sends a request to api to update the matching one
    // we use this method to unify all fields and build a new entry object due to a limitation
    // in react we cannot udate nested objects in the root Object
    var entry = this.state.entry;
    entry.language = this.state.selectedLanguageOption.value;
    entry.skillType = this.state.selectedTypeOption.value;
    entry.skillReuseLevel = this.state.selectedReuseOption.value;

    // relations
    let essentials = [];
    this.state.selectedEssentialPartOf.forEach(item => {
      essentials.push(item.value.id);
    });
    entry.isEssentialPartOf = essentials;

    let optionals = [];
    this.state.selectedOptionalPartOf.forEach(item => {
      optionals.push(item.value.id);
    });
    entry.isOptionalPartOf = optionals;

    let similars = [];
    this.state.selectedsimilarTo.forEach(item => {
      similars.push(item.value.id);
    });
    entry.isSimilarTo = similars;

    let prerequisites = [];
    this.state.selectedNeedsAsRequisite.forEach(item => {
      prerequisites.push(item.value.id);
    });
    entry.needsAsPrerequisite = prerequisites;

    //because of a weird way the backend needs preflabel and description to be wrapped inside a array
    entry.prefLabel = [entry.prefLabel];
    entry.description = [entry.description];

    console.log(entry);
    api.createNew(entry);
  }

  delete = () => {
    this.handleClose();
  };

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
    return (
      <div>
        <Dialog
          open={this.state.setOpen}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {strings.deleteCompetency + "?"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Disagree
            </Button>
            <Button onClick={this.delete} color="primary" autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
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
                <p style={{ marginLeft: 5 }}>Go to Dashboard</p>
              </Button>
            </Link>
          </div>
          <div style={{ margin: 10, alignSelf: "flex-end" }}>
            <Button
              variant="contained"
              color="secondary"
              style={{ alignSelf: "flex-end", marginLeft: 10, marginRight: 10 }}
              onClick={() => this.handleClickOpen()}
            >
              <img src={deleteButton} alt="Logo" style={{ color: "red" }} />
              <p style={{ marginLeft: 5 }}>delete</p>
            </Button>

            <Button
              variant="contained"
              color="primary"
              style={{ alignSelf: "flex-end", marginLeft: 10, marginRight: 10 }}
              onClick={() => this.save()}
            >
              <img src={saveButton} alt="Logo" style={{ color: "red" }} />
              <p style={{ marginLeft: 5 }}>save</p>
            </Button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 20,
            outline: "none"
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "18px 12px",
              maxWidth: 800,
              height: "100vh"
            }}
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
              <div
                style={{
                  minWidth: "100%",
                  justifyContent: "flex-end",
                  zIndex: 2
                }}
              >
                <Select
                  value={this.state.selectedTypeOption}
                  defaultValue={this.state.selectedTypeOption}
                  onChange={e => {
                    console.log(e);
                    this.setState({
                      selectedTypeOption: e
                    });
                  }}
                  options={typeOptions}
                  placeholder="Select Type"
                />
              </div>

              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Title"
                value={this.state.entry.prefLabel.value}
                name="Title"
                onChange={e => {
                  let newEntry = this.state.entry;
                  newEntry.prefLabel.value = e.target.value;
                  this.setState({
                    entry: newEntry
                  });
                }}
              />
              <div
                style={{
                  minWidth: "100%",
                  justifyContent: "flex-end",
                  paddingTop: 5,
                  paddingBottom: 5,
                  zIndex: 3
                }}
              >
                <Select
                  value={this.state.selectedLanguageOption}
                  defaultValue={this.state.selectedLanguageOption}
                  onChange={e => {
                    this.setState({
                      selectedLanguageOption: e
                    });
                  }}
                  options={options}
                  placeholder="Select Language"
                />
              </div>
              <div
                style={{
                  minWidth: "100%",
                  justifyContent: "flex-end",
                  paddingTop: 5,
                  paddingBottom: 5,
                  zIndex: 2
                }}
              >
                <Select
                  value={this.state.selectedReuseOption}
                  defaultValue={this.state.selectedReuseOption}
                  onChange={e => {
                    this.setState({
                      selectedReuseOption: e
                    });
                  }}
                  options={reuseOptions}
                  placeholder="Reuse"
                />
              </div>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Description"
                value={this.state.entry.description.value}
                onChange={e => {
                  let newEntry = this.state.entry;
                  newEntry.description.value = e.target.value;
                  this.setState({
                    entry: newEntry
                  });
                }}
                name="Description"
                rows="9"
                multiline
              />
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography variant="subtitle1" style={{ paddingRight: 10 }}>
                  is Essential Part of:
                </Typography>
                <div
                  style={{
                    width: "60%",
                    justifyContent: "flex-end",
                    paddingTop: 5,
                    paddingBottom: 5
                  }}
                >
                  <Select
                    value={this.state.selectedEssentialPartOf}
                    defaultValue={this.state.selectedReuseOption}
                    onChange={e => {
                      this.setState({
                        selectedEssentialPartOf: e
                      });
                    }}
                    isMulti
                    options={this.state.entryOptions}
                    placeholder="select one or more"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography variant="subtitle1" style={{ paddingRight: 10 }}>
                  is Optional Part of:
                </Typography>
                <div
                  style={{
                    width: "60%",
                    justifyContent: "flex-end",
                    paddingTop: 5,
                    paddingBottom: 5
                  }}
                >
                  <Select
                    value={this.state.selectedOptionalPartOf}
                    defaultValue={this.state.selectedOptionalPartOf}
                    isMulti
                    onChange={e => {
                      this.setState({
                        selectedOptionalPartOf: e
                      });
                    }}
                    options={this.state.entryOptions}
                    placeholder="select one or more"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography variant="subtitle1" style={{ paddingRight: 10 }}>
                  is similar to:
                </Typography>
                <div
                  style={{
                    width: "60%",
                    justifyContent: "flex-end",
                    paddingTop: 5,
                    paddingBottom: 5
                  }}
                >
                  <Select
                    value={this.state.similarToOptions}
                    defaultValue={this.state.selectedsimilarTo}
                    onChange={e => {
                      this.setState({
                        selectedsimilarTo: e
                      });
                    }}
                    isMulti
                    options={this.state.entryOptions}
                    placeholder="select one or more"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography variant="subtitle1" style={{ paddingRight: 10 }}>
                  needs as prerequisite:
                </Typography>
                <div
                  style={{
                    width: "60%",
                    justifyContent: "flex-end",
                    paddingTop: 5,
                    paddingBottom: 5
                  }}
                >
                  <Select
                    value={this.state.selectedNeedsAsRequisite}
                    defaultValue={this.state.selectedNeedsAsRequisite}
                    onChange={e =>
                      this.setState({
                        selectedNeedsAsRequisite: e
                      })
                    }
                    options={this.state.entryOptions}
                    isMulti
                    placeholder="select one or more"
                  />
                </div>
              </div>
            </CardContent>
          </div>
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

export default New;
