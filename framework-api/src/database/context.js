var config = require("../config.json");

export const context = {
  '@context': {
    id: '@id',
    value: '@value',
    type: '@type',
    language: '@language',
    hasAssociation: 'http://data.europa.eu/esco/model#hasAssociation',
    isEssentialSkillFor: 'http://data.europa.eu/esco/model#isEssentialSkillFor',
    isOptionalSkillFor: 'http://data.europa.eu/esco/model#isOptionalSkillFor',
    referenceLanguage: 'http://data.europa.eu/esco/model#referenceLanguage',
    skillReuseLevel: 'http://data.europa.eu/esco/model#skillReuseLevel',
    skillType: 'http://data.europa.eu/esco/model#skillType',
    description: 'http://purl.org/dc/terms/description',
    modified: 'http://purl.org/dc/terms/modified',
    status: 'http://purl.org/iso25964/skos-thes#status',
    altLabel: 'http://www.w3.org/2004/02/skos/core#altLabel',
    inScheme: 'http://www.w3.org/2004/02/skos/core#inScheme',
    prefLabel: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    topConceptOf: 'http://www.w3.org/2004/02/skos/core#topConceptOf',
    label: {
      '@id': config.baseurl+'/context/referenceType',
      '@type': 'http://schema.org/Text',
    },
    isEssentialPartOf: config.baseurl+'/context/isEssentialPartOf',
    isOptionalPartOf: config.baseurl+'/context/isOptionalPartOf',
    needsAsPrerequisite: config.baseurl+'/context/needsAsPrerequisite',
    isSimilarTo: config.baseurl+'/context/isSimilarTo',
    isSameAs: config.baseurl+'/context/isSameAs',
    key: 'http://schema.org/Text',
  },
}
