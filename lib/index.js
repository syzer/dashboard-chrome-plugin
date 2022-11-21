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
  match, split, concat, tap, flip, ifElse, toPairs, sortBy, head, fromPairs
} from 'ramda'

export const msgToCategory = cond([
  [_(prop('message'), includes('not_found_no_permission')), always('not_found_no_permission')],
  [_(prop('message'), includes('ActionController::UnknownHttpMethod')), always('ActionController:UnknownHttpMethod')],
  [_(propOr('', 'userAgent'), includes('Cypress')), always('CypressTests')],
  [_(prop('message'), test(/fum\//)), always('TODO:PostOnOpsFrChannel')],
  [_(propOr('', 'app'), test(/wqwa/)), always('Andy:SaidToIgnore')],
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
  [_(prop('message'), allPass([
    includes('/subscriptions/'),
    includes('400')
  ])), always('payments:Subscription')],
  [_(propOr('', 'path'), includes('/value/')), always('Entry:Value')],
  [_(propOr('', 'path'), includes('/checkout')), always('Payment:Subscription')],
  [_(prop('message'), includes('InfluxDB')), ifElse(
    _(prop('message'), includes('ConnectionError')),
    always('InfluxDB:429'),
    always('InfluxDB')
  )],
  [_(propOr('', 'proc'), includes('racecar_asset_history')), always('InfluxDb:RacecarAssetHistory')],
  [_(propOr('', 'proc'), includes('mqtt_inbound')), always('Mqtt:Inbound:DynoCrash')],
  [_(prop('message'), includes('getaddrinfo')), always('DnsDown')],
  [_(prop('message'), includes('kafka')), always('Kafka')],
  [_(prop('message'), includes('bdih')), always('Bdih')],
  [_(prop('message'), includes('category="UpdateEHAssetDetailsWorker"')), always('Bdih')],
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
  [_(prop('message'), includes('Certbot\\')), always('Opc')], // OPC
  [_(prop('message'), includes('All renewals failed')), always('Opc')], // OPC
  [_(prop('message'), includes('creation of opc')), always('Opc:Create')], // OPC
  [_(prop('message'), includes('OpcUaServerCreationJob')), always('Opc:Create')], // OPC
  [_(prop('message'), includes('renew certificate')), always('Opc:Renew')], // OPC
  [_(propOr('', 'category'), includes('OpcUaServer')), always('Opc')], // OPC
  [_(anyPass([
    _(propOr('', 'category'), includes('SimCard')),
    _(propOr('', 'stackTrace'), test(/sim.card/i)),
  ])), always('SimCards')],
  [_(prop('message'), includes('Failed to process asset_values_processed')), always('asset_values_processed')],
  [_(prop('message'), includes('db backup')), always('DbBackupFailed')],
  [_(prop('message'), includes('MimeNegotiation::InvalidType')), always('MimeNegotiation:InvalidType')],
  [_(prop('message'), test(/v1\/instrumentations/)), always('instrumentations')], // todo weak
  [_(prop('message'), includes('.com/v1/batches')), always('batches')],
  [_(allPass([
    _(prop('message'), includes('RemoteServiceUnavailable')),
    _(propOr('', 'body'), includes('lvh.me:')),
  ])), always('RemoteServiceUnavailable:Hub')],
  [_(prop('message'), includes('RemoteServiceUnavailable')), always('RemoteServiceUnavailable')],
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
  [_(prop('message'), includes('Timed out while waiting')), always('Timeout')],
  [_(prop('message'), includes('Request timeout')), always('Timeout')],
  [_(prop('message'), includes('Net::OpenTimeout')), always('Timeout')],
  [_(prop('message'), includes('Net::ReadTimeout')), always('Timeout')],
  [_(prop('message'), includes('execution expired')), always('Timeout')],
  [_(prop('message'), includes('invalid login attempt')), always('InvalidLogin')],
  [_(prop('message'), includes('asset_values_backup_worker was')), always('AssetValuesBackupFailed:DavidSaidIgnoreIfOnce')],
  [_(prop('message'), includes('ArgumentError: wrong number of arguments (given 1')), always('TODO:DavidErrorWillFix')],
  [_(propOr('', 'proc'), includes('racecar_asset_values')), always('TODO:DavidErrorWillFix')],
  [_(prop('message'), includes('OmniAuth')), always('TODO:OmniAuth')],
  [_(prop('message'), includes('incompatible character encodings')), always('UTF-8')],
  [_(propEq('status', 500)),
    ifElse(
      propEq('app', 'entry'),
      always('500:Entry'),
      always('500')
    )],
  [_(prop('message'), includes('could not obtain a connection from the pool')), always('429')],
  [_(allPass([propEq('app', 'hub'), prop('category')])), _(prop('category'), concat('Hub:'))],
  [_(prop('app'), equals('entry')), always('Entry')],
  [_(prop('message'), includes('public/errors/500')), always('500:MissingTemplate')],
  [_(propEq('status', 503)), always('503')],
  [_(prop('message'), includes('invalid_request')), always('400')],
  [_(prop('message'), includes('returned status 400')), always('400')],
  // [_(propEq('category', 'produce')), always('category:produce')],
  [_(propOr('', 'app'), includes('value')), always('Value')],
  [T, _(prop('message'), trim)]
])

export const sortByKeys = _(toPairs, sortBy(head), fromPairs)
