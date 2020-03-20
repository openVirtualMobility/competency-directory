import { references } from './references'
import neo4j from 'neo4j-driver'

var config = require('../config.json')

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

export const createNewEntry = async newEntry => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()

  

  let prefLabel = newEntry.prefLabel.map(x => JSON.stringify(x))
  let altLabel = newEntry.altLabel.map(x => JSON.stringify(x))
  let description = newEntry.description.map(x => JSON.stringify(x))

  let props = newEntry
  let id = Math.floor(Math.random() * Math.floor(300)).toString()
  props.id = id
  props.prefLabel = prefLabel
  props.altLabel = altLabel
  props.description = description

  await session.writeTransaction(tx =>
    tx.run(
      `
      UNWIND $props AS entry
      CREATE (node:entry)
      SET node = entry
      `,
      { props }
    )
  )
  session.close()
  console.log(props)
}

export const deleteEntry = async id => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()

  let result = await session.run(
    'MATCH (entry: entry {id: $id}) detach delete entry',
    {
      id: id,
    }
  )

  return result
}

const updateRelation = async (id, secIds, relation) => {
  // go through each id and create a new relation for it
  secIds.map(async essId => {
    const driver = neo4j.driver(
      'bolt://db:7687',
      neo4j.auth.basic('neo4j', 'qwerqwer')
    )
    const session = driver.session()
    // since the id has the wrong format and we only need the last 2 digits we use a helper function to get the real ID
    var slicedId = essId.slice(-2)
    var parsedId = parseInt(slicedId)
    var finalId
    if (!isNaN(parsedId)) {
      finalId = parsedId
    } else {
      slicedId = id.slice(-1)
      parsedId = parseInt(slicedId)
      finalId = parsedId
    }
    // parse back to string
    finalId = finalId.toString()

    // Since we cannot use Arguments as Relationtypes we need to use a switch case and construct static queries beforehand
    switch (relation) {
      case 'isEssentialPartOf':
        var createResult = await session.writeTransaction(tx =>
          tx.run(
            'match (a:entry {id:$id}), (b:entry {id:$finalId}) create (a)-[r:isEssentialPartOf]->(b) return a, b, r',
            {
              id: id,
              finalId: finalId,
            }
          )
        )
        break
      case 'isOptionalPartOf':
        var createResult = await session.writeTransaction(tx =>
          tx.run(
            'match (a:entry {id:$id}), (b:entry {id:$finalId}) create (a)-[r:isOptionalPartOf]->(b) return a, b, r',
            {
              id: id,
              finalId: finalId,
            }
          )
        )
        break
      case 'isSimilarTo':
        var createResult = await session.writeTransaction(tx =>
          tx.run(
            'match (a:entry {id:$id}), (b:entry {id:$finalId}) create (a)-[r:isSimilarTo]->(b) return a, b, r',
            {
              id: id,
              finalId: finalId,
            }
          )
        )
        break
      case 'needsAsPrerequisite':
        var createResult = await session.writeTransaction(tx =>
          tx.run(
            'match (a:entry {id:$id}), (b:entry {id:$finalId}) create (a)-[r:needsAsPrerequisite]->(b) return a, b, r',
            {
              id: id,
              finalId: finalId,
            }
          )
        )
        break
      default:
        console.log(' sorry no matching relations')
    }
    session.close()
    driver.close()
  })
}

export const updateEntry = async (id, lang, newEntry) => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()

  let {
    description,
    skillReuseLevel,
    skillType,
    prefLabel,
    language,
    altLabel,
    isEssentialPartOf,
    isOptionalPartOf,
    isSimilarTo,
    needsAsPrerequisite,
  } = newEntry

  // some trickery since neo4j needs to interpret this as a Array
  // however when we return the Data to the User it will interpreted as a Object again
  // this is due to the fact that neo4j cannot work with nested objects and works with arrays instead
  // I hope you will not waste as much time on this as I did!
  prefLabel = [JSON.stringify(prefLabel)]
  altLabel = [JSON.stringify(altLabel)]
  description = [JSON.stringify(description)]

  id = id.toString()
  skillReuseLevel = skillReuseLevel.toString()
  skillType = skillType.toString()
  language = language.toString()

  var result = await session.writeTransaction(tx =>
    tx.run(
      'MATCH (currentNode {id: $id}) OPTIONAL MATCH (currentNode)-[relation]->(targetNode) set currentNode.skillReuseLevel=$skillReuseLevel, currentNode.skillType=$skillType, currentNode.prefLabel=$prefLabel, currentNode.altLabel=$altLabel, currentNode.description=$description return currentNode',
      {
        id: id,
        skillReuseLevel: skillReuseLevel,
        skillType: skillType,
        prefLabel: prefLabel,
        language: language,
        description: description,
        altLabel: altLabel,
      }
    )
  )
  session.close()

  // update the relations
  // this on is tricky due some limitations in neo4j we cannot simply update the relations
  // we need to delete the old one and create a new one
  // since neo4j has some more limitations we need to update the relations one by one

  // update isEssentialPartOf

  const essentialSession = driver.session()
  // delete any relations
  var result2 = await essentialSession.writeTransaction(tx => {
    tx.run(
      'MATCH (currentNode:entry {id: $id}) -[r:isEssentialPartOf]->(targetNode:entry) delete r return currentNode',
      {
        id: id,
      }
    )
    tx.run(
      'MATCH (currentNode:entry {id: $id}) -[r:isOptionalPartOf]->(targetNode:entry) delete r return currentNode',
      {
        id: id,
      }
    )
    tx.run(
      'MATCH (currentNode:entry {id: $id}) -[r:isSimilarTo]->(targetNode:entry) delete r return currentNode',
      {
        id: id,
      }
    )
    tx.run(
      'MATCH (currentNode:entry {id: $id}) -[r:needsAsPrerequisite]->(targetNode:entry) delete r return currentNode',
      {
        id: id,
      }
    )
  })
  essentialSession.close()

  driver.close()

  // if there are relations we can use create new relations
  if (isEssentialPartOf.length != 0) {
    updateRelation(id, isEssentialPartOf, 'isEssentialPartOf')
  }

  if (isOptionalPartOf.length != 0) {
    updateRelation(id, isOptionalPartOf, 'isOptionalPartOf')
  }

  if (isSimilarTo.length != 0) {
    updateRelation(id, isSimilarTo, 'isSimilarTo')
  }

  if (needsAsPrerequisite.length != 0) {
    updateRelation(id, needsAsPrerequisite, 'needsAsPrerequisite')
  }

  return result
}

export const getEntries = async (requestedId, language) => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )

  const session = driver.session()

  // constructing the query for the right language
  var languageClause = language
    ? `WHERE currentNode.language = "${language}"`
    : 'WHERE currentNode.language = "en"'

  // constructing query for specific id
  const whereClause = requestedId ? `currentNode.id = "${requestedId}"` : ''
  var dbClause = languageClause
  if (!whereClause == '') {
    dbClause = languageClause + ' AND ' + whereClause
  }

  var result = await session.writeTransaction(tx =>
    tx.run(
      `MATCH (currentNode) ${dbClause} OPTIONAL MATCH (currentNode)-[relation]->(targetNode) ${dbClause} RETURN currentNode, collect(relation), collect(targetNode)`
    )
  )
  if (result.records.length == 0) {
    // if no entries are found set default to english and query again
    // constructing the query for the right language
    var languageClause = 'WHERE currentNode.language = "en"'

    // constructing query for specific id
    const whereClause = requestedId ? `currentNode.id = "${requestedId}"` : ''
    var dbClause = languageClause
    if (!whereClause == '') {
      dbClause = languageClause + ' AND ' + whereClause
    }
    result = await session.writeTransaction(tx =>
      tx.run(
        `MATCH (currentNode) ${dbClause} OPTIONAL MATCH (currentNode)-[relation]->(targetNode) ${dbClause} RETURN currentNode, collect(relation), collect(targetNode)`
      )
    )
  }
  const { data: referenceTypes } = await getReferenceTypes()
  const referenceKeys = referenceTypes.map(({ id }) => id)
  const data = result.records
    .map(record => {
      const rawEntry = record.get('currentNode').properties
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
  return await session
    .run(
      'CREATE (user:User {username: {username}, password: { password }}) RETURN user',
      {
        username: username,
        // here would be the hashing
        password: password,
      }
    )
    .then(results => {
      return results.records
    })
}

export const getUserWithUsername = async username => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()
  return session.run('MATCH (user:User {username: {username}}) RETURN user', {
    username: username,
  })
}

export const getUserWithUsernameAndPassword = async (username, password) => {
  const driver = neo4j.driver(
    'bolt://db:7687',
    neo4j.auth.basic('neo4j', 'qwerqwer')
  )
  const session = driver.session()
  return session.run(
    'MATCH (user:User {username: {username}, password: {password}}) RETURN user',
    {
      username: username,
      password: password,
    }
  )
}
