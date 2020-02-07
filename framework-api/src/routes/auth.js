import Router from 'koa-router'
import * as jsonld from 'jsonld'
import * as database from '../database/database'
import crypto from "crypto"
import jwt from "jsonwebtoken"
var keys = require("../keys.json");

const auth = new Router({
  prefix: '/auth',
})



auth
  .get('/', async (ctx, next) => {
    let data = {"rest": "work"}
    console.log(data)
    ctx.data = data
    await next()
  })
  .post('/login', async (ctx, next) => {
    // getting the body object, undefined if no body provided
    let body = ctx.request.body;
    let password = body.password;
    console.log("PASSWORD: ", password);
    console.log("PASSWORD TYPE ", typeof password);
    console.log(body)
    // hash password with sha256 algorithm
    let hashedPwd = crypto.createHash('sha256').update(body.password).digest('base64');

    // check if the user exists
    var userAuthenticated;

    // getting the user out of the database
    await database.getUserWithUsernameAndPassword(body.username, hashedPwd)
    .then(results => {
      // checking if the records are 0, means there are no users with the username
      if (results.records.length === 0) {
        userAuthenticated = false;
        // if the records are not zero that means the user exists
      } else {
        userAuthenticated = true;
      }
    })
    if (userAuthenticated) {
      console.log(keys.JWT_PRIV_KEY)
      let payload = {"username": body.username}
      let jwtToken = jwt.sign(payload, keys.JWT_PRIV_KEY)

      // calculate the JWT
      ctx.body = {"Status": "Auth Success", "token": jwtToken}
      ctx.status = 200;
    } else {
      ctx.body = {"Status": "Auth Failed"}
    }
    await next()
  })
  .post('/register', async (ctx, next) => {
    // getting the body object, undefined if no body provided
    let body = ctx.request.body;
    var userExists;

    // getting the user out of the database
    await database.getUserWithUsername(body.username)
    .then(results => {
      // checking if the records are 0, means there are no users with the username
      if (results.records.length === 0) {
        userExists = false;
        // if the records are not zero that means the user exists
      } else {
        userExists = true;
      }
    })

    // check if username already exists
    if ( userExists ) {
      ctx.status = 400
      ctx.body = "User with username Exists already"
      await next()
    // if the user does not exist yet, hash password and create it
    } else {
      // hash password with sha256 algorithm
      let hashedPwd = crypto.createHash('sha256').update(body.password).digest('base64');
      // creating a user inside the database and return as object
      let { createdUser } = await database.createUser(body.username, hashedPwd);
      // calculate the JWT
      let payload = {"username": body.username}
      let jwtToken = jwt.sign(payload, keys.JWT_PRIV_KEY)
      // calculate the JWT
      ctx.body = {"Status": "User Created", "token": jwtToken}
      ctx.status = 200;
      await next()
    }
  })
export { auth }
