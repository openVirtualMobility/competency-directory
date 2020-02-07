import React, { Fragment } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { Route } from "react-router-dom"
import Link from '@material-ui/core/Link';

const onClick = (history, id) => {

  var slicedId = id.slice(-2);
  var parsedId = parseInt(slicedId);
  var finalId;
  if (!isNaN(parsedId)) {
    finalId = parsedId
  } else {
    slicedId = id.slice(-1);
    parsedId = parseInt(slicedId);
    finalId = parsedId
  }
  history.push(`entries/${finalId}`);

}

export const EntryCard = ({
  item,
  referenceTypes,
  strings,
  hasDetails,
  setPreSelectedEntry,
  ...props
}) => {
  const {
    id,
    skillType,
    skillReuseLevel,
    prefLabel,
    altLabel,
    description,
    ...rest
  } = item;
  let references = [];
  // Only render references if types are provided
  if (referenceTypes) {
    for (let referenceKey in rest) {
      const referenceTitle = referenceTypes.reduce(
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
            <List dense>
              {referenceItems.map(id => (
                <Route render={({ history }) => (
                  <div key={id}>

                    <ListItem>
                      <Link
                        onClick={e => {
                          console.log("ID IS", id);
                          history.push("entries/7")
                        }}
                      >
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
      <Card
        onClick={e => e.stopPropagation()}
        style={{ padding: "18px 12px", maxWidth: 420 }}
        {...props}
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
            {strings.type}: {skillType}
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            style={{ lineHeight: 1.2 }}
            gutterBottom
          >
            {prefLabel.value}
          </Typography>
          {!hasDetails && (
            <Fragment>
              <Chip
                label={strings.language + ":" + prefLabel.language}
                style={{ margin: "3px 7px 3px -1px", height: 22 }}
              />
              <Chip
                label={strings.reuse + ":" + skillReuseLevel.substr(2)}
                style={{ margin: "3px 7px 18px -1px", height: 22 }}
              />
            </Fragment>
          )}
          <Typography variant="subtitle1">{strings.description}:</Typography>
          <Typography paragraph>
            {hasDetails
              ? description.value.split(" ", 20).join(" ") + "..."
              : description.value}
          </Typography>


          {!hasDetails && (
            <Route render={({ history }) => (

              <Link
                to={`${id.toLowerCase()}`}
                onClick={onClick(history, id)}
              >
                {id.toLowerCase()}
              </Link>
            )} />
          )}
          {references}
          {hasDetails && (
            <div
              style={{
                flexGrow: 1,
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end"
              }}
            >
              <Button variant="outlined" style={{ alignSelf: "flex-end" }}>
                {strings.showDetails}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

  );
};
