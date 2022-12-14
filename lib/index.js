import {
  allPass,
  always,
  cond,
  includes,
  pipe as _,
  prop,
  equals,
  propEq,
  propOr,
  T,
  test,
  trim,
  anyPass,
  concat,
  ifElse,
  toPairs,
  sortBy,
  head,
  fromPairs,
  uniqWith,
  values,
  evolve,
  repeat,
  __,
  join,
  pickAll,
  toLower,
  replace,
  pick,
  reduce,
  assoc,
  curry,
  keys,
  startsWith, split, last
} from 'ramda'
import * as R from 'ramda'
import natural from 'natural'
import { camelCase } from 'lodash-es'

const alwaysTimeout = _(propOr('', 'app'), concat('Timeout:'))

export const uniqDistance = 0.90

export const msgToCategory = cond([
  [_(prop('message'), includes('not_found_no_permission')), always('not_found_no_permission')],
  [_(prop('message'), includes('ActionController::UnknownHttpMethod')), always('ActionController:UnknownHttpMethod')],
  [_(propOr('', 'userAgent'), includes('Cypress')), always('CypressTests')],
  [_(prop('message'), test(/fum\//)), always('TODO:PostOnOpsFrChannel')],
  [_(propOr('', 'app'), test(/wqwa/)), always('Wqwa:IgnoreIt')],
  [_(propOr('', 'stackTrace'), includes('salesforce')), always('Salesforce')],
  [_(propOr('', 'stackTrace'), includes('invoice')), always('Payment:invoice')],
  [_(propOr('', 'stackTrace'), includes('chargebee')), always('Payment')],
  [_(propOr('', 'userAgent'), includes('ChargeBee')), always('Payment')],
  [_(propOr('', 'category'), includes('SubscriptionController')), always('Payment:SubscriptionController')],
  [_(prop('message'), includes('reseller')), always('Payment')],
  [_(prop('message'), includes('card payment')), always('Payment')],
  [_(prop('message'), includes('chargebee')), always('Payment')],
  [_(prop('message'), includes('not load subscriptions')), always('Payment')],
  [_(propOr('', 'category'), includes('SyncEloquaUserWorker')), always('eloqua.com')],
  [_(prop('message'), includes('Subscription response')), always('Payment:Subscription')],
  [_(propOr('', 'category'), includes('Chargebee')), always('Payment:ChargebeeCleanupWorker')],
  [_(propOr('', 'category'), includes('PaymentReminderWorker')), always('Payment:PaymentReminderWorker')],
  [_(prop('message'), allPass([
    includes('/subscriptions/'),
    includes('400')
  ])), always('payments:Subscription')],
  [_(propOr('', 'path'), includes('/value/')), always('Entry:Value')],
  [_(propOr('', 'path'), includes('/checkout')), always('Payment:Subscription')],
  [_(prop('message'), includes('InfluxDB')), ifElse(
    _(prop('message'), includes('ConnectionError')),
    always('InfluxDb:429'),
    always('InfluxDb')
  )],
  [_(propOr('', 'proc'), includes('racecar_asset_history')), always('InfluxDb:RacecarAssetHistory')],
  [_(propOr('', 'proc'), includes('influx')), always('InfluxDb')],
  [_(propOr('', 'proc'), includes('mqtt_inbound')), always('Mqtt:Inbound:DynoCrash')],
  [_(prop('message'), includes('getaddrinfo')), always('DnsDown')],
  [_(prop('message'), includes('kafka')), always('Kafka')],
  [_(prop('message'), includes('Kafka::DeliveryFailed')), always('Kafka')],
  [_(prop('message'), startsWith('Broker')), always('Kafka:Broker')],
  [_(prop('message'), includes('compute.amazonaws.com')), always('AWS:Lambda')],
  [_(prop('message'), includes('connect to broker')), always('Kafka:Broker')],
  [_(prop('message'), includes('topic subscription')), always('Kafka:Subscription')],
  [_(prop('message'), includes('bdih')), always('AssetCentral')],
  [_(prop('message'), includes('category="UpdateEHAssetDetailsWorker"')), always('AssetCentral')],
  [_(propOr('', 'stackTrace'), includes('bdih')), always('AssetCentral')],
  [_(prop('message'), test(/FWR30/i)), always('Fwr30')], // FWR30
  [allPass([
    _(propOr('', 'category'), includes('ProductLookupController')),
    _(prop('message'), includes('RemoteServiceUnavailable'))
  ]), always('AssetCentral')], // assetcentral
  [_(prop('message'), includes('assetcentral')), always('AssetCentral')], // assetcentral
  [allPass([
    _(prop('message'), includes('RemoteServiceUnavailable')),
    _(propOr('', 'category'), includes('SubscribeEHAssetWorker')),
  ]), always('AssetCentral')],                                          // assetcentral
  [allPass([
    _(prop('message'), includes('Elasticsearch')),
    _(prop('message'), includes('429')),
  ]), always('Elastic:429')],
  [_(prop('message'), includes('Certbot\\')), always('Opc:Renew')], // OPC
  [_(prop('message'), includes('All renewals failed')), always('Opc')], // OPC
  [_(prop('message'), includes('creation of opc')), always('Opc:Create')], // OPC
  [_(prop('message'), includes('OpcUaServerCreationJob')), always('Opc:Create')], // OPC
  [_(prop('message'), includes('renew certificate')), always('Opc:Renew')], // OPC
  [_(propOr('', 'category'), includes('OpcUaServer')), always('Opc')], // OPC
  [_(anyPass([
    _(propOr('', 'category'), includes('SimCard')),
    _(propOr('', 'stackTrace'), test(/sim.card/i)),
  ])), always('SimCards')],
  [_(prop('message'), includes('Failed to process asset_values_processed')), always('Influx:asset_values_processed')],
  [_(prop('message'), includes('db backup')), always('DbBackupFailed')],
  [_(prop('message'), includes('MimeNegotiation::InvalidType')), always('MimeNegotiation:InvalidType')],
  [_(prop('message'), test(/v1\/instrumentations/)), always('instrumentations')], // todo weak
  [_(prop('message'), includes('.com/v1/batches')), always('batches')],
  [_(allPass([
    _(prop('message'), includes('RemoteServiceUnavailable')),
    _(propOr('', 'body'), includes('lvh.me:')),
  ])), always('RemoteServiceUnavailable:Hub')],
  [_(prop('message'), includes('RemoteServiceUnavailable')), _(
    propOr('', 'category'),
    concat('RemoteServiceUnavailable:'))],
  [_(prop('message'), includes('eloqua.com')), always('eloqua.com')],
  [_(prop('message'), includes('Redis::CannotConnectError')), always('Redis:CannotConnectError')],
  [_(allPass([
      _(prop('message'), includes('SSL')),
      anyPass([
        _(prop('message'), includes('redis')),
        propEq('app', 'value')
      ])
    ])),
    ifElse(
      propEq('app', 'value'), // could be regexp
      always('Redis:Down:Value'),
      always('Redis:Down'))],
  [_(prop('message'), includes('Redis::TimeoutError')), always('Redis:CannotConnectError')],
  [_(prop('message'), includes('Timed out while waiting')), alwaysTimeout],
  [_(prop('message'), includes('Request timeout')), alwaysTimeout],
  [_(prop('message'), includes('Net::OpenTimeout')), alwaysTimeout],
  [_(prop('message'), includes('Net::ReadTimeout')), alwaysTimeout],
  [_(prop('message'), includes('execution expired')), alwaysTimeout],
  [_(prop('message'), includes('invalid login attempt')), always('InvalidLogin')],
  [_(prop('message'), includes('asset_values_backup_worker was')), always('AssetValuesBackupFailed:DavidSaidIgnoreIfOnce')],
  [_(prop('message'), includes('ArgumentError: wrong number of arguments (given 1')), always('TODO:DavidErrorWillFix')],
  [_(propOr('', 'proc'), includes('racecar_asset_values')), always('TODO:DavidErrorWillFix')],
  [_(prop('message'), includes('OmniAuth')), always('TODO:OmniAuth')],
  [_(prop('message'), includes('incompatible character encodings')), always('UTF-8')],
  [_(prop('message'), includes('deadlock')), _(propOr('', 'category'), concat('Deadlock:'))], // maybe to selective
  [_(propEq('status', 500)),
    ifElse(
      propEq('app', 'entry'),
      always('500:Entry'),
      always('500'))],
  [_(prop('message'), includes('could not obtain a connection from the pool')), always('429')],
  [_(allPass([propEq('app', 'hub'), prop('category')])), _(prop('category'), concat('Hub:'))],
  [_(prop('app'), equals('entry')), always('Entry')],
  [_(prop('message'), includes('public/errors/500')), always('500:MissingTemplate')],
  [_(propEq('status', 503)), always('503')],
  [
    _(prop('message'), includes('status=')),
    _(prop('message'), split('status='), last, split(' '), head)],
  [_(prop('message'), includes('invalid_request')), always('400')],
  [_(prop('message'), includes('returned status 400')), always('400')],
  [_(propOr('', 'app'), includes('value')), always('Value')],
  [_(prop('category')), prop('category')],  // a hack to get the category
  [T, _(prop('message'), trim)]
])

export const sortByKeys = _(toPairs, sortBy(head), fromPairs)

export const uniqueChars = _(
  evolve({
    app: _(repeat(__, 2), join('')),
    category: _(repeat(__, 5), join('')) // 5 more important than message.. because message sometimes is terse
  }),
  pickAll(['message', 'app', 'category']),
  values,
  join(''),
  toLower,
  replace(/[^a-z]/g, ''))

export const distance = (threshold = 0.87) => (a, b) => {
  const x = uniqueChars(a)
  const y = uniqueChars(b)
  return natural.JaroWinklerDistance(x, y) > threshold
}

export const renameKeys = curry((fn, obj) =>
  reduce((acc, key) =>
    assoc(fn(key), obj[key], acc), {}, keys(obj)))

export const formatLogs = e => {
  delete e._version
  delete e._score
  delete e._index
  delete e._source['Logplex-Drain-Token']
  // delete e._id  // 'eHns74MBjlIjmx3bJgbD.account-18342',
  delete e._type
  delete e._source.type // heroku
  // const score =
  delete e._source['User-Agent'] // 'logfwd',
  delete e._source.syslog5424_ver // 1
  delete e._source.syslog5424_app

  e.proc = e._source.syslog5424_proc
  delete e._source.syslog5424_proc

  delete e._source.syslog5424_host // host
  delete e._source.syslog5424_ts // '2022-10-19T11:06:14.092203+00:00',
  delete e._source.syslog5424_pri // 190
  delete e.sort
  delete e.fields
  delete e.highlight
  delete e._source.tags // [ '_logz_heroku_8080' ]
  e = {
    ...e._source,
    ...e
  }
  delete e._source
  delete e.request_id // '702df6f8-9a87-424e-b96a-d1800cd382e2',
  delete e.connect_time // 0.000,
  delete e.service // 30000ms
  if (e.service_time) {
    e.service_time = parseInt((e.service_time / 1).toFixed(0))
  }
  if (e.status) {
    e.status = parseInt(e.status)
  }

  delete e.http_status // same as status,
  delete e._logzio_pattern
  delete e.connect // 0ms
  delete e.bytes//  = 0, ... 944
  e.time = e["@timestamp"]
  delete e["@timestamp"]

  return renameKeys(camelCase)(e)
}

// unique elements and adds length
// TODO this is clearly written poorly
export const countWith = (fn) => (arr) => {
  const uniques = uniqWith(fn, arr)
  const toKeys = reduce((acc, curr) =>
    assoc(uniqueChars(curr), { ...curr, length: 0  }, acc), {})

  const counts = toKeys(uniques)
  const pairs = toPairs(counts)

  arr.forEach(e => {
    const key = uniqueChars(e)
    if (counts[key]) {
      counts[key].length++
    } else {
      const found = pairs.find(([k, v]) => distance(uniqDistance)(e, v))
      if (found) {
        counts[found[0]].length++
      }
    }
  })
  return _(values)(counts)
}

export const pickTruthy = keys => e => {
  const oKeys = Object.keys(e).filter(k => keys.includes(k))
  const truthy = oKeys.filter(k => e[k])
  return pick(truthy, e)
}
