export const getIdFromUrl = url => {
  var slicedurl = url.slice(-2)
  var parsedurl = parseInt(slicedurl)
  var finalId
  if (!isNaN(parsedurl)) {
    finalId = parsedurl
  } else {
    slicedurl = url.slice(-1)
    parsedurl = parseInt(slicedurl)
    finalId = parsedurl
  }
  return finalId
}
