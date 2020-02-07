import Koa from 'koa'
import Router from 'koa-router'
import serve from "koa-static"
import { context } from './database/context'
import { entries } from './routes/entries'
import { auth } from './routes/auth'
import cors from '@koa/cors'
import neo4j from 'neo4j-driver'
import * as db from './database/database'
import { referenceTypes } from './routes/referenceTypes'
import { escoExample } from './routes/escoExample'
import { competencies } from './database/competencies'
import { references } from './routes/references'
import { references as referenceData } from './database/references'
import koaBody from 'koa-body'
import koaSend from 'koa-send'


const app = new Koa()
const router = new Router()

app.use(serve("./build"))

// CORS
app.use(cors())

// logger
app.use(async (ctx, next) => {
  ctx.url = ctx.url.replace(/%22/g, "\"");
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

// detect GET of any deep-link by browsers (text/html clients) and send them the index.html instead
app.use(async (ctx, next) => {
  if (ctx.request.method != 'GET') {
    await next();
    return;
  }
  // in case client accepts html and json but html is of higher prio (lower index)  send the website
  // otherwise send the json API answer
  switch (ctx.accepts('html', 'json')) {
    case 'html':
      console.log("Sending default html page")
      await koaSend(ctx, 'index.html', { root: './build' });
      break;
    case 'json':
      await next();
      break;
    default:
      await next();
    // ctx.throw(406, 'client must accept html or json');
  }
});

// using the koa bodyParser
app.use(koaBody());

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})


// Set defaults for the api
app.use(async (ctx, next) => {
  ctx.type = 'application/json'
  await next()
})


// Context
router.get('/context', async (ctx, next) => {
  ctx.body = JSON.stringify(context)
  next()
})

// DB Driver and session setup
app.use(async (ctx, next) => {
  ctx.driver = neo4j.driver(  // 192.168.178.47
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  ctx.session = ctx.driver.session()
  await next()
  ctx.session.close()
  ctx.driver.close()
})

// TODO when auth works this path is only allowed for admins
router.get('/deleteAll', async (ctx, next) => {
  const result = await ctx.session.writeTransaction(tx =>
    tx.run('MATCH (n) DETACH DELETE n')
  )
  ctx.body = JSON.stringify(result)
  await next()
})


// TODO when auth works this path is only allowed for admins
router.get('/populate', async (ctx, next) => {
  const props = competencies.map(competency => ({
    ...competency,
    prefLabel: competency.prefLabel.map(x => JSON.stringify(x)),
    altLabel: competency.altLabel.map(x => JSON.stringify(x)),
    description: competency.description.map(x => JSON.stringify(x)),
  }))
  await ctx.session.writeTransaction(tx =>
    tx.run(
      `
      UNWIND $props AS entry
      CREATE (node:entry)
      SET node = entry
      `,
      { props }
    )
  )
  const { data: referenceTypes } = await db.getReferenceTypes()
  await referenceData.forEach(async ({ sourceId, referenceType, targetId }) => {
    const session = ctx.driver.session()
    const referenceTypeLabel = referenceTypes.reduce(
      (prev, { id, label }) => (id === referenceType ? label : prev),
      undefined
    )
    await session.writeTransaction(tx =>
      tx.run(
        `
        MATCH (a:entry),(b:entry)
        WHERE a.id = "${sourceId}" AND b.id = "${targetId}"
        CREATE (a)-[r:${referenceType} {label: "${referenceTypeLabel}"}]->(b)
        `
      )
    )
    session.close()
  })
  const result = await ctx.session.writeTransaction(tx =>
    tx.run(
      `MATCH (n)
      RETURN n`
    )
  )
  ctx.body = JSON.stringify(result)
  await next()
})

// Get all
router.get('/', async (ctx, next) => {
  const result = await ctx.session.writeTransaction(tx =>
    tx.run(
      `MATCH (n)
      RETURN n`
    )
  )
  ctx.body = JSON.stringify(result)
  await next()
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  // Entries
  .use(entries.routes())
  .use(entries.allowedMethods())
  // Authentication
  .use(auth.routes())
  .use(auth.allowedMethods())
  // References
  .use(references.routes())
  .use(references.allowedMethods())
  // ReferenceTypes
  .use(referenceTypes.routes())
  .use(referenceTypes.allowedMethods())
  // EscoExample
  .use(escoExample.routes())
  .use(escoExample.allowedMethods())

app.listen(6060)
