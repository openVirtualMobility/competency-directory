import React, { Component } from 'react';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Link from '@material-ui/core/Link';
import Button from "@material-ui/core/Button";
import TextField from '@material-ui/core/TextField';
import api from "../api"
import LocalizedStrings from 'react-localization';
import backButton from "../assets/arrow-left.svg";
import editButton from "../assets/edit.svg";
var language = require("../languages/languages.json");
let strings = new LocalizedStrings(language)

class Edit extends Component {
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
                                <p style={{ marginLeft: 5 }}>Go to Dashboard</p>
                            </Button>
                        </Link>
                    </div>
                    <div style={{ margin: 10, alignSelf: "flex-end" }}>
                        <Button variant="outlined" style={{ alignSelf: "flex-end" }}
                            onClick={() => { console.log("SAVE TO API") }}

                        >
                            <img src={editButton} alt="Logo" />
                            <p style={{ marginLeft: 5 }}>save</p>
                        </Button>
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
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                label="Type"
                                value={this.state.entry.skillType}
                                name="Type"
                            // onChange={(e) => state.username = e.target.value}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                label="Title"
                                value={this.state.entry.prefLabel.value}
                                name="Title"
                            // onChange={(e) => state.username = e.target.value}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                label="Description"
                                value={this.state.entry.description.value}
                                name="Description"
                                rows="9"
                                multiline
                            // onChange={(e) => state.username = e.target.value}
                            />

                            <Typography
                                variant="h6"
                                component="h2"
                                style={{ lineHeight: 1.2 }}
                                gutterBottom
                            >
                                {this.state.entry.prefLabel.value}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
            </div >

        );
    }

    render() {
        return (
            // loading animation
            this.state.loading ? this.loadingAnimation() : this.entryPage()
        );
    }
}

export default Edit;