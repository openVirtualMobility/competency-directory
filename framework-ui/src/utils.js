export const setEntryInUrl = id => {
  var slicedId = id.slice(-2);
  var parsedId = parseInt(slicedId);
  if (! isNaN(parsedId)) {
    var finalId = parsedId 
  } else {
    slicedId = id.slice(-1);
    parsedId = parseInt(slicedId);
    var finalId = parsedId
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
        return []
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
        }
    );
}

export const searchRanked = (searchForInput, data) => {
  const rankedEntries = data
    .map(item => {
      let found = 0;
      if (item.prefLabel.value.includes(searchForInput)) {
        found = found + 5;
      }
      if (item.description.value.includes(searchForInput)) {
        found = found + 5;
      }
      found =
        found +
        searchForInput.split(" ").reduce((prev, curr) => {
          return item.prefLabel.value.includes(curr)
            ? prev + 1
            : item.description.value.includes(curr)
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
      Math.floor(data.length / (highestRanking * (searchForInput.length / 6)))
    )
    .map(({ value }) => value);
};
