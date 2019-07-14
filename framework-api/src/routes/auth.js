import Router from 'koa-router'
import * as jsonld from 'jsonld'
import * as database from '../database/database'
import crypto from "crypto"

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
    let body = ctx.request.body;
    let hashedPwd = crypto.createHash('sha256').update(body.password).digest('base64');
    let { createdUser } = await database.createUser(body.username, hashedPwd);
    console.log(createdUser);
    ctx.data = createdUser;
  })
  .post('/register', async (ctx, next) => {
    
    ctx.data = data
    await next()
  })
  // .use(async (ctx, next) => {
  //   if (ctx.data.length < 1) {
  //     ctx.status = 404
  //     ctx.body = JSON.stringify({ error: 'Unknown Entry ID' })
  //     return undefined
  //   }
  //   await next()
  // })

export { auth }
