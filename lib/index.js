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
  startsWith, split, last, when, match, tap, mapObjIndexed, map, uniq, curryN, omit, mergeWith, descend
} from 'ramda'
import natural from 'natural'
import { camelCase, isArray } from 'lodash-es'
import { add } from 'date-fns'

const xTimeout = _(propOr('', 'app'), concat('Timeout:'))
const x = always
export const uniqDistance = 0.86
// export const uniqDistance = 0.90

export const msgToCategory = cond([
  [_(prop('message'), includes('not_found_no_permission')), x('not_found_no_permission')],
  [_(prop('message'), includes('ActionController::UnknownHttpMethod')), x('ActionController:UnknownHttpMethod')],
  [_(propOr('', 'userAgent'), includes('Cypress')), x('CypressTests')],
  [_(prop('message'), test(/fum\//)), x('TODO:PostOnOpsFrChannel')],
  [_(prop('message'), test(/fus\//)), x('TODO:PostOnOpsFrChannel')],
  [_(propOr('', 'category'), test(/BatchAutoStartStopJob/)), x('TODO:PostOnOpsFrChannel')],
  [_(propOr('', 'app'), test(/wqwa/)), x('Wqwa:IgnoreIt')],
  [_(propOr('', 'stackTrace'), includes('salesforce')), x('Salesforce')],
  [_(propOr('', 'path'), includes('support/ticket')), x('Salesforce')],
  [_(propOr('', 'stackTrace'), includes('invoice')), x('Payment:invoice')],
  [_(propOr('', 'stackTrace'), includes('chargebee')), x('Payment')],
  [_(propOr('', 'userAgent'), includes('ChargeBee')), x('Payment')],
  [_(propOr('', 'category'), includes('SubscriptionController')), x('Payment:SubscriptionController')],
  [_(prop('message'), includes('reseller')), x('Payment')],
  [_(prop('message'), includes('card payment')), x('Payment')],
  [_(prop('message'), includes('chargebee')), x('Payment')],
  [_(prop('message'), includes('not load subscriptions')), x('Payment')],
  [_(propOr('', 'category'), includes('SyncEloquaUserWorker')), x('eloqua.com')],
  [_(prop('message'), includes('Subscription response')), x('Payment:Subscription')],
  [_(propOr('', 'category'), includes('Chargebee')), x('Payment:ChargebeeCleanupWorker')],
  [_(propOr('', 'category'), includes('PaymentReminderWorker')), x('Payment:PaymentReminderWorker')],
  [_(prop('message'), allPass([
    includes('/subscriptions/'),
    includes('400')
  ])), x('payments:Subscription')],
  [_(propOr('', 'path'), includes('/value/')), x('Entry:Value')],
  [_(propOr('', 'path'), includes('/checkout')), x('Payment:Subscription')],
  [allPass([
    _(prop('message'), includes('Elasticsearch')),
    _(prop('message'), includes('429')),
  ]), x('Elastic:429')],
  [allPass([
    _(prop('message'), includes('429')),
    _(prop('message'), includes('bonsai.io'))
  ]), x('Elastic:429')],
  [_(propOr('', 'proc'), includes('influx2')), x('InfluxDb2')],
  [_(propOr('', 'proc'), includes('racecar_attribute_history')), x('AttributeHistory')],
  [_(prop('message'), includes('InfluxDB')), ifElse(
    _(prop('message'), includes('ConnectionError')),
    ifElse(
      _(propOr('', 'user'), includes('ass-level')),
      x('InfluxDb:429:AssLevel'),
      x('InfluxDb:429')),
    x('InfluxDb')
  )],
  [_(propOr('', 'proc'), includes('racecar_asset_history')), x('InfluxDb:RacecarAssetHistory')],
  [_(propOr('', 'proc'), includes('influx')), x('InfluxDb')],
  [_(propOr('', 'proc'), includes('mqtt_inbound')), x('Mqtt:Inbound:DynoCrash')],
  [_(prop('message'), includes('AbstractController::ActionNotFound')),
    _(propOr('', 'app'), concat('AbstractController::ActionNotFound:'))],
  [_(prop('message'), includes('Mqtt')), x('Mqtt')],
  [_(prop('message'), includes('getaddrinfo')), x('DnsDown')],
  [_(prop('message'), includes('kafka')), x('Kafka')],
  [_(prop('message'), includes('Kafka::DeliveryFailed')), x('Kafka')],
  [_(prop('message'), startsWith('Broker')), x('Kafka:Broker')],
  [_(prop('message'), includes('compute.amazonaws.com')), x('AWS:Lambda')],
  [_(prop('message'), includes('connect to broker')), x('Kafka:Broker')],
  [_(prop('message'), includes('topic subscription')), x('Kafka:Subscription')],
  [_(propOr('', 'stackTrace'), includes('eloqua/client')), x('eloqua.com')],
  [_(prop('message'), includes('eloqua.com')), x('eloqua.com')],
  [_(prop('message'), includes('bdih')), x('AssetCentral')],
  [_(prop('message'), includes('category="UpdateEHAssetDetailsWorker"')), x('AssetCentral')],
  [_(propOr('', 'stackTrace'), includes('bdih')), x('AssetCentral')],
  [_(prop('message'), test(/FWR30/i)), x('Fwr30')], // FWR30
  [allPass([
    _(propOr('', 'category'), test(/ProductLookupController|UpdateEHProductDocumentsWorker|EHAssetSpecificDataWorker/)),
    _(prop('message'), includes('RemoteServiceUnavailable'))
  ]), x('AssetCentral')], // assetcentral
  [_(prop('message'), includes('assetcentral')), x('AssetCentral')], // assetcentral
  [allPass([
    _(prop('message'), includes('RemoteServiceUnavailable')),
    _(propOr('', 'category'), includes('SubscribeEHAssetWorker')),
  ]), x('AssetCentral')],                                          // assetcentral
  [_(prop('message'), includes('ExecJS')), _(propOr('','app'), concat('ExecJS:'))],
  [_(prop('message'), includes('Certbot\\')), x('Opc:Renew')], // OPC
  [_(prop('message'), includes('All renewals failed')), x('Opc')], // OPC
  [_(prop('message'), includes('creation of opc')), x('Opc:Create')], // OPC
  [_(propOr('', 'stackTrace'), includes('update_nginx_certificate')), x('Opc:Renew')], // OPC
  [_(prop('message'), includes('OPC UA')), x('Opc:Renew')], // OPC
  [_(prop('message'), includes('OpcUaServerCreationJob')), x('Opc:Create')], // OPC
  [_(prop('message'), includes('renew certificate')), x('Opc:Renew')], // OPC
  [_(propOr('', 'category'), includes('OpcUaServer')), x('Opc')], // OPC
  [_(anyPass([
    _(propOr('', 'category'), includes('SimCard')),
    _(propOr('', 'stackTrace'), test(/sim.card/i)),
  ])), x('SimCards')],
  [_(prop('message'), includes('Failed to process asset_values_processed')), x('Influx:asset_values_processed')],
  [_(prop('message'), includes('db backup')), x('DbBackupFailed')],
  [_(prop('message'), includes('MimeNegotiation::InvalidType')), x('MimeNegotiation:InvalidType')],
  [_(prop('message'), test(/v1\/instrumentations/)), x('instrumentations')], // todo weak
  [_(prop('message'), test(/v1\/instrumentation\/specification/)), x('503:specification')],
  [_(prop('message'), includes('.com/v1/batches')), x('batches')],
  [_(prop('message'), test(/Flipper.*503/))
    , x('503:Flipper')],
  [_(allPass([
    _(prop('message'), includes('RemoteServiceUnavailable')),
    _(propOr('', 'category'), includes('SsoController')), // from app: id
  ])), x('503:Hub')],
  [_(allPass([
    _(prop('message'), includes('RemoteServiceUnavailable')),
    _(propOr('', 'body'), includes('lvh.me:')),
  ])), x('503:Hub')],
  [_(prop('message'), includes('RemoteServiceUnavailable')), _(
    propOr('', 'category'),
    concat('RemoteServiceUnavailable:'))],
  [_(prop('message'), includes('Redis::CannotConnectError')), x('Redis:CannotConnectError')],
  [_(prop('message'), includes('RedisClient::ConnectionError')), x('Redis:ConnectionError')],
  [_(allPass([
      _(prop('message'), includes('SSL')),
      anyPass([
        _(prop('message'), includes('redis')),
        propEq('app', 'value')
      ])
    ])),
    ifElse(
      propEq('app', 'value'), // could be regexp
      x('Redis:Down:Value'),
      x('Redis:Down'))],
  [_(prop('message'), includes('fastmeasuncon')), x('fastmeasuncon')],
  [_(prop('message'), includes('Redis::TimeoutError')), x('Redis:CannotConnectError')],
  [_(propOr('', 'path'), includes('health_check')), _(prop('path'), concat('HealthCheck:'))],
  [_(prop('message'), includes('Timed out while waiting')), xTimeout],
  [_(prop('message'), includes('Request timeout')), xTimeout],
  [_(prop('message'), includes('Net::OpenTimeout')), xTimeout],
  [_(prop('message'), includes('Net::ReadTimeout')), xTimeout],
  [_(prop('message'), includes('execution expired')), xTimeout],
  [_(prop('message'), includes('invalid login attempt')), x('InvalidLogin')],
  [_(prop('message'), includes('asset_values_backup_worker was')), x('AssetValuesBackupFailed:DavidSaidIgnoreIfOnce')],
  [_(prop('message'), includes('ArgumentError: wrong number of arguments (given 1')), x('TODO:DavidErrorWillFix')],
  [_(propOr('', 'proc'), includes('racecar_asset_values')),
    ifElse(
      _(prop('message'), includes('Failed to send')),
        x('Racecar:Kafka'),
        x('Racecar:Postgres'))],
  [_(prop('message'), includes('OmniAuth')), x('TODO:OmniAuth')],
  [_(prop('message'), includes('incompatible character encodings')), x('UTF-8')],
  [_(prop('message'), includes('deadlock')), _(propOr('', 'category'), concat('Deadlock:'))], // maybe to selective
  [_(prop('message'), test(/Concierge/i)), _(propOr('', 'category'), concat('Concierge:'))],
  [_(propOr('', 'headers'), test(/localhost/i)), _(propOr('', 'category'), concat('Localhost:'))],
  [_(prop('message'), includes('Errno::ECONNRESET')), x('ECONNRESET')],
  [_(prop('message'), includes('edge_devices')), x('EdgeDevice')],
  [_(propOr('', 'path'), includes('blog')), x('Blog')],
  [_(prop('message'), test(/oauth\/token/)), x('500:Token')],
  [_(propEq('status', 500)),
    ifElse(
      propEq('app', 'entry'),
      x('500:Entry'),
      x('500'))], // maybe to little selective
  [_(prop('message'), includes('could not obtain a connection from the pool')), x('429')],
  [_(allPass([propEq('app', 'hub'), prop('category')])), _(prop('category'), concat('Hub:'))],
  [_(prop('app'), equals('entry')), x('Entry')],
  [_(prop('message'), includes('public/errors/500')), x('500:MissingTemplate')],
  [_(propEq('status', 503)), _(propOr('', 'app'), concat('503:'))],
  [
    _(prop('message'), includes('status=')),
    _(prop('message'), split('status='), last, split(' '), head)],
  [_(prop('message'), includes('invalid_request')), x('400')],
  [_(prop('message'), includes('returned status 400')), x('400')],
  [_(propOr('', 'app'), includes('value')), x('Value')],
  [_(prop('category')), prop('category')],  // a hack to get the category
  [T, _(prop('message'), trim)]
])

export const sortByKeys = _(toPairs, sortBy(head), fromPairs)

export const uniqueCharsInLog = _(
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
  const x = uniqueCharsInLog(a)
  const y = uniqueCharsInLog(b)
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

  delete e.LogSize
  delete e['logzio-signature']
  delete e['_logzio_insights']

  return renameKeys(camelCase)(e)
}

const max = arr => arr.filter(Boolean).sort().shift()

// unique elements and adds length
// TODO this is clearly written poorly
export const countWith = (fn) => (arr) => {
  const uniques = uniqWith(fn, arr)
  const toKeys = reduce((acc, curr) =>
    assoc(uniqueCharsInLog(curr), { ...curr, length: curr.length || 0 }, acc), {})

  const counts = toKeys(uniques)
  const pairs = toPairs(counts)

  arr.forEach(e => {
    const key = uniqueCharsInLog(e)
    if (counts[key]) {
      counts[key].length = (e.length || counts[key].length + 1)
    } else {
      const found = pairs.find(([k, v]) => distance(uniqDistance)(e, v))
      if (found) {
        counts[found[0]].length = e.length || counts[found[0]].length + 1
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

export const mergeObjsLengthWith = fn => mergeWith((val1, val2) => _(
  when(isArray, _(
    () => [...val1, ...val2], // AKA concat
    countWith(fn)
  )))(val1, val2))

const isDate = (date) => {
  const d = new Date(date) // date is great.. instead using binary we use this weird sun calendar that won't scale beyond earth
  return d instanceof Date && !isNaN(d)
}

export const addDay = (days = 1) => when(
  isDate,
  _(
    e => new Date(e), // parseISO() moves one hour back
    date => add(date, { days }),
    e => e.toISOString(),
    split('T'),
    head))

export const omitValues = omit([
  'logzioSignature', 'logSize', 'logzioInsights', 'proc', 'errorCode', 'at', 'id'])

export const foldValues = _(
  map(omitValues),
  e => e.reduce((acc, curr) => {
    mapObjIndexed((v, k, o) => {
      acc[k] = acc[k] || []
      if (isDate(v) || !acc[k].find(e => natural.JaroWinklerDistance(v, e) > 0.82)) {
        acc[k].push(v)
      }
    })(curr)
    return map(uniq)(acc)
}, {}),
  map(v => v.length === 1 ? v[0] : v))
