import React, { Component } from "react";
import api from "./api";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Downshift from "downshift";
import Select from "react-select";
import { sortAlphabetically, searchRanked } from "./utils";
import { EntryCard } from "./EntryCard";
import { EntryModal } from "./EntryModal";
import Footer from "./Footer";
import LocalizedStrings from 'react-localization';
var language = require("./languages/languages.json");

const options = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Dutch' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'rom', label: 'Romanian' },
  { value: 'es', label: 'Spanish' }
];

let strings = new LocalizedStrings(language);


class Dashboard extends Component {
  state = {
    entries: [],
    referenceTypes: [],
    urlEntry: null,
    selectedOption: null,
  };

  async componentDidMount() {

    // settings the language
    let lang = localStorage.getItem("language");
    if (lang) {
      strings.setLanguage(lang);
    } else {
      lang = "en"
    }
    const getEntriesResponse = await api.getEntries(lang);
    const getEntriesData = await getEntriesResponse.json();
    const entries = sortAlphabetically(
      getEntriesData["@graph"],
      // Tell the sort function to sort by which attribute
      entry => entry.prefLabel.value
    );
    this.setState({ entries });

    const getReferenceTypesResponse = await api.getReferenceTypes();
    const getReferenceTypesData = await getReferenceTypesResponse.json();
    const referenceTypes = sortAlphabetically(
      getReferenceTypesData["@graph"],
      // Tell the sort function to sort by which attribute
      referenceType => referenceType.label
    );
    this.setState({ referenceTypes });
    // If there is an entry id present in the url on load open the modal with it
    const url = new URL(window.location);
    const urlEntry = url.searchParams.get("entry");
    if (urlEntry) {
      this.setState({ urlEntry });
      this.setPreSelectedEntry(urlEntry);
    }

    this.setEntryFromUrl();

    // Listen to history changes
    window.onpopstate = this.setEntryFromUrl;
  }

  // If an entry id is present in the url select this entry
  setEntryFromUrl = () => {
    const url = new URL(window.location);
    const urlEntry = url.searchParams.get("entry");
    if (urlEntry) {
      this.setState({ urlEntry });
      this.setPreSelectedEntry(urlEntry);
    }
  };

  // To a given entry id get the entry from the entries and select it
  setPreSelectedEntry = urlEntry => {
    const { entries } = this.state;
    const preSelectedEntry = entries.filter(({ id }) => urlEntry === id)[0];
    this.selectItem(preSelectedEntry);
    // Make sure the input field is still empty
    this.setEntriesState({ inputValue: "", isOpen: true });
  };

  // We have to modify Downshifts state handling behaviour
  stateReducer = (state, changes) => {
    // On modal close remove the entry from the url
    // These condirions are a hack to make sure it is only fired when closing the modal
    if (
      Object.keys(changes).length === 1 &&
      Object.keys(changes)[0] === "isOpen" &&
      changes.isOpen === false
    ) {
      const url = new URL(window.location);
      url.search = "";
      window.history.pushState({}, "", url.toString());
    }
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          inputValue: state.inputValue,
          isOpen: true
        };
      case Downshift.stateChangeTypes.changeInput:
        return {
          ...changes,
          isOpen: false
        };
      case Downshift.stateChangeTypes.mouseUp:
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.unknown:
        return state;
      default:
        return changes;
    }
  };

  handleChange = async selectedOption => {
    // saving current used language in localstorage
    localStorage.setItem("language", selectedOption.value);
    strings.setLanguage(selectedOption.value);
    this.setState({ selectedOption });
    const getEntriesResponse = await api.getEntries(selectedOption.value);
    const getEntriesData = await getEntriesResponse.json();
//    console.log(getEntriesData)
    const entries = sortAlphabetically(
      getEntriesData["@graph"],
      // Tell the sort function to sort by which attribute
      entry => entry.prefLabel.value
    );
    this.setState({ entries })
  };

  render() {
    const { entries, referenceTypes, urlEntry } = this.state;
    return (
      <div >
        <Downshift
          itemToString={item => (item ? item.prefLabel.value : "")}
          stateReducer={this.stateReducer}
          defaultIsOpen={!!urlEntry}
        >
          {downShift => {
            this.selectItem = downShift.selectItem;
            this.setEntriesState = downShift.setState;

            let renderEntries = entries;
            if (downShift.inputValue) {
              renderEntries = searchRanked(downShift.inputValue, renderEntries);
            }

            const gridItems = renderEntries.map((item, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={2}
                {...downShift.getItemProps({
                  item,
                  key: item.prefLabel.value + index
                })}
              >
                <EntryCard
                  item={item}
                  hasDetails
                  strings={strings}
                  setPreSelectedEntry={this.setPreSelectedEntry}
                  {...downShift.getItemProps({
                    index,
                    item,
                    raised:
                      downShift.highlightedIndex === index ||
                      downShift.selectedItem === item,
                    style: {
                      height: "100%",
                      cursor: "pointer",
                      position: "relative"
                    }
                  })}
                />
              </Grid>
            ));

            return (
              <div style={{ padding: "42px 36px" }}>
                <div style={{ display: "flex" }}>
                  <div style={{ flexGrow: 3 }}>
                    <Typography component="h2" variant="h2" gutterBottom>
                      {strings.openVM}
                    </Typography>
                  </div>
                  <div style={{ minWidth: "30%", justifyContent: "flex-end" }}>
                    <Select
                      value={this.state.selectedOption}
                      onChange={this.handleChange}
                      options={options}
                    />
                  </div>
                </div>

                <label {...downShift.getLabelProps()}>
                  {strings.searchEntries}:&nbsp;&nbsp;
              </label>
                <Input style={{width: strings.labelAndDescription.length+"ex", minWidth: "20ex"}}
                  {...downShift.getInputProps({
                    placeholder: strings.labelAndDescription
                  })}
                />
                <br />
                <br />
                <br />
                <Grid
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="stretch"
                  spacing={5}
                  {...downShift.getMenuProps()}
                >
                  {gridItems}
                </Grid>
                <EntryModal
                  setPreSelectedEntry={this.setPreSelectedEntry}
                  isOpen={downShift.isOpen}
                  selectedItem={downShift.selectedItem}
                  strings={strings}
                  referenceTypes={referenceTypes}
                  closeMenu={downShift.closeMenu}
                />
              </div>
            );
          }}
        </Downshift>
        <Footer strings={strings} />

      </div>

    );
  }
}

export default Dashboard;
