import axios from "axios"
class Api {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  fetch = (path, ...rest) =>
    fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      ...rest,
    });

    fetchPost = (path, ...rest) =>
    fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      body: JSON.stringify({username: "test", password: "cool"}),
      headers: {
        "Content-Type": "application/json;"
      },
      ...rest,
    });

  getEntries = () =>
    this.fetch("/entries", {
      method: "GET"
    });

  getReferenceTypes = () =>
    this.fetch("/referenceTypes", {
      method: "GET"
    });

  postLogin = (username, password) => 
  axios.post(`${this.baseUrl}/auth/login`, {
    username: username,
    password: password
  })
  .then(function (response) {
    return response;
  })
  .catch(function (error) {
    console.log(error);
  });

  postRegister = (username, password) => 
  axios.post(`${this.baseUrl}/auth/register`, {
    username: username,
    password: password
  })
  .then(function (response) {
    return response
  })
  .catch(function (error) {
    console.log(error);
  });
}



export default new Api("http://localhost:80");
