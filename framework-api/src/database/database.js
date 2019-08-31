import { references } from './references'
import neo4j from 'neo4j-driver'

var config = require("../config.json")

export const getSkillTypes = async () =>
  Promise.resolve({
    meta: {},
    data: ['Knowledge', 'Skill or Competence'],
  })

export const getReferenceTypes = async () =>
  Promise.resolve({
    meta: {},
    data: [
      {
        id: 'isEssentialPartOf',
        label: 'is essential subskill/part of',
      },
      {
        id: 'isOptionalPartOf',
        label: 'is optional subskill/part of',
      },
      {
        id: 'needsAsPrerequisite',
        label: 'needs as prerequisite',
      },
      {
        id: 'isSimilarTo',
        label: 'is similar to',
      },
      {
        id: 'isSameAs',
        label: 'is same as',
      },
    ],
  })

export const getReusabilityLevel = async () =>
  Promise.resolve({
    meta: {},
    data: [
      { id: '1', value: 'Transversal' },
      { id: '2', value: 'Cross-sectoral' },
      { id: '3', value: 'Sector-specific' },
      { id: '4', value: 'Occupation-specific' },
    ],
  })

export const getReferences = async () => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()
  const { records } = await session.writeTransaction(tx =>
    tx.run(
      `MATCH (sourceNode)-[reference]-(targetNode) RETURN sourceNode.id, reference, targetNode.id`
    )
  )
  const data = records.map(entry => ({
    sourceID: `${config.baseurl}/entries/${entry.get('sourceNode.id')}`,
    referenceType: `${config.baseurl}/referenceTypes/${
      entry.get('reference').type
      }`,
    targetID: `${config.baseurl}/entries/${entry.get('targetNode.id')}`,
  }))
  session.close()
  driver.close()
  return Promise.resolve({
    meta: {},
    data,
  })
}

export const getEntries2 = async => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()

  return session.run(
    'MATCH (entry:Entry) RETURN entry'
  )
}

export const getEntries = async (requestedId, language) => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )

  const session = driver.session()

  // constructing the query for the right language
  var languageClause = language
    ? `WHERE entry.language = "${language}"`
    : 'WHERE entry.language = "en"'

  // constructing query for specific id
  const whereClause = requestedId
    ? `entry.id = "${requestedId}"`
    : ''
  var dbClause = languageClause
  if (!whereClause == '') {
    dbClause = languageClause + " AND " + whereClause
  }

  var result = await session.writeTransaction(tx =>
    tx.run(
      `MATCH (entry: Entry) ${dbClause} OPTIONAL MATCH (entry)-[relation]->(targetNode) ${dbClause} RETURN entry, collect(relation), collect(targetNode)`
    )
  )
  console.log(result.records.length)
  if (result.records.length == 0) {
    // if no entries are found set default to english and query again
    // constructing the query for the right language
    var languageClause = 'WHERE entry.language = "en"'

    // constructing query for specific id
    const whereClause = requestedId
      ? `entry.id = "${requestedId}"`
      : ''
    var dbClause = languageClause
    if (!whereClause == '') {
      dbClause = languageClause + " AND " + whereClause
    }
    result = await session.writeTransaction(tx =>
      tx.run(
        `MATCH (entry: Entry) ${dbClause} OPTIONAL MATCH (entry)-[relation]->(targetNode) ${dbClause} RETURN entry, collect(relation), collect(targetNode)`
      )
    )
  }
  const { data: referenceTypes } = await getReferenceTypes()
  const referenceKeys = referenceTypes.map(({ id }) => id)
  const data = result.records
    .map(record => {
      const rawEntry = record.get('entry').properties
      const rawReferences = record.get('collect(relation)')
      const targetNodes = record.get('collect(targetNode)')
      const references = Object.assign(
        {},
        ...referenceKeys.map(k => ({ [k]: [] }))
      )
      rawReferences.forEach(({ type }, index) => {
        references[type].push(
          `${config.baseurl}/entries/${targetNodes[index].properties.id}`
        )
      })
      return {
        ...rawEntry,
        id: `${config.baseurl}/entries/${rawEntry.id}`,
        prefLabel: rawEntry.prefLabel.map(x => JSON.parse(x)),
        altLabel: rawEntry.altLabel.map(x => JSON.parse(x)),
        description: rawEntry.description.map(x => JSON.parse(x)),
        ...references,
      }
    })
    .sort((a, b) => a.id - b.id)
  session.close()
  driver.close()
  return Promise.resolve({
    meta: {},
    data,
  })
}

export const createUser = async (username, password) => {

  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()
  return await session.run('CREATE (user:User {username: {username}, password: { password }}) RETURN user', {
    username: username,
    // here would be the hashing
    password: password,

  }).then(results => {
    return results.records;
  })
}

export const getUserWithUsername = async (username) => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()
  return session.run('MATCH (user:User {username: {username}}) RETURN user', {
    username: username
  })
}

export const getUserWithUsernameAndPassword = async (username, password) => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()
  return session.run('MATCH (user:User {username: {username}, password: {password}}) RETURN user', {
    username: username,
    password: password
  })
}