import axios from "axios";
class Api {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  fetch = (path, ...rest) =>
    fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json; charset=utf-8"
      },
      ...rest
    });

  fetchPost = (path, ...rest) =>
    fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      body: JSON.stringify({ username: "test", password: "cool" }),
      headers: {
        "Content-Type": "application/json;"
      },
      ...rest
    });

  getEntries = lang =>
    this.fetch("/entries?language=" + lang, {
      method: "GET",
      headers: {
        Accept: "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8"
      }
    });

  getEntryWithId = (id, lang) =>
    this.fetch(`/entries/${id}?language=${lang}`, {
      method: "GET"
    });

  deleteWithId = id =>
    axios
      .delete(`${this.baseUrl}/entries/${id}`)
      .then(function(response) {
        console.log("RESPONSE");
        console.log(response);
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });

  updateWithId = (id, entry) => {
    axios
      .patch(`${this.baseUrl}/entries/${id}`, entry)
      .then(function(response) {
        console.log("RESPONSE");
        console.log(response);
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  getReferenceTypes = () =>
    this.fetch("/referenceTypes", {
      method: "GET"
    });

  postLogin = (username, password) =>
    axios
      .post(`${this.baseUrl}/auth/login`, {
        username: username,
        password: password
      })
      .then(function(response) {
        console.log("RESPONSE");
        console.log(response);
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });

  postRegister = (username, password) =>
    axios
      .post(`${this.baseUrl}/auth/register`, {
        username: username,
        password: password
      })
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
}

export default new Api("http://localhost:6060");
