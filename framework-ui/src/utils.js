export const setEntryInUrl = id => {
  var slicedId = id.slice(-2);
  var parsedId = parseInt(slicedId);
  var finalId;
  if (!isNaN(parsedId)) {
    finalId = parsedId;
  } else {
    slicedId = id.slice(-1);
    parsedId = parseInt(slicedId);
    finalId = parsedId;
  }

  const url = new URL(window.location);
  url.search = `?${finalId}`;
  window.history.pushState({}, "", url.toString());
};

export const navigateTo = route => {
  const url = new URL(window.location);
  url.search = `${route}`;
  window.history.pushState({}, "", url.toString());
};

export const sortAlphabetically = (array, getAttribute) => {
  if (!array) {
    console.log("No array data to sort");
    return [];
  }
  return array.sort((a, b) => {
    var nameA = getAttribute(a).toUpperCase(); // ignore upper and lowercase
    var nameB = getAttribute(b).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
};

export const searchRanked = (searchForInput, data) => {
  const rankedEntries = data
    .map(item => {
      let found = 0;
      searchForInput = searchForInput.toLowerCase();
      let title = item.prefLabel.value.toLowerCase();
      if (title.includes(searchForInput)) {
        found = found + 5;
      }
      let description = item.description.value.toLowerCase();
      if (description.includes(searchForInput)) {
        found = found + 2;
      }
      found =
        found +
        searchForInput.split(" ").reduce((prev, curr) => {
          return title.includes(curr)
            ? prev + 1
            : description.includes(curr)
            ? prev + 1
            : prev;
        }, 0);
      return { ranking: found, value: item };
    })
    .sort((a, b) => b.ranking - a.ranking);

  const highestRanking = rankedEntries.reduce(
    (highestRanking, { ranking }) =>
      ranking > highestRanking ? ranking : highestRanking,
    0
  );

  return rankedEntries
    .slice(
      0,
      Math.floor(data.length / (highestRanking * (searchForInput.length / 12)))
    )
    .map(({ value }) => value);
};
