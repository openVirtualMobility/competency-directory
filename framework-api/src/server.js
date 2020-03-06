import Koa from 'koa'
import Router from 'koa-router'
import { context } from './database/context'
import { entries } from './routes/entries'
import cors from '@koa/cors'
import neo4j from 'neo4j-driver'
import * as db from './database/database'
import { referenceTypes } from './routes/referenceTypes'
import { escoExample } from './routes/escoExample'
import { competencies } from './database/competencies'
import { references } from './routes/references'
import { references as referenceData } from './database/references'

const app = new Koa()
const router = new Router()

// CORS
app.use(cors())

// logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

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

  for await (let data of referenceData) {
    console.log(data)
    let sourceId = data.sourceId
    let referenceType = data.referenceType
    let targetId = data.targetId

    const session = ctx.driver.session()
    let referenceTypeLabel = ''
    // WE use a simple switch case
    switch (referenceType) {
      case 'isEssentialPartOf':
        referenceTypeLabel = 'is essential subskill/part of'
        break
      case 'isOptionalPartOf':
        referenceTypeLabel = 'is optional subskill/part of'
        break
      case 'needsAsPrerequisite':
        referenceTypeLabel = 'needs as prerequisite'
        break
      case 'isSimilarTo':
        referenceTypeLabel = 'is similar to'
        break
      case 'isSameAs':
        referenceTypeLabel = 'is same as'
        break
      default:
        console.log('no reference Label')
    }

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
  }

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
