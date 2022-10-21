import { always, cond, includes, pipe as _, prop, propEq, propOr, T, test, trim } from 'ramda'

export const msgToCategory = cond([
  [_(prop('message'), includes('card payment')), always('payments')],
  [_(prop('message'), includes('chargebee')), always('payments')],
  [_(propOr('stackTrace', ''), includes('chargebee')), always('payments')],
  [_(prop('message'), includes('InfluxDB')), always('InfluxDB')],
  [_(prop('message'), includes('kafka')), always('Kafka')],
  [_(prop('message'), includes('bdih')), always('bdih')], // FR30
  [_(prop('message'), includes('Failed to process asset_values_processed')), always('asset_values_processed')],
  [_(prop('message'), includes('MimeNegotiation::InvalidType')), always('MimeNegotiation::InvalidType')],
  [_(prop('message'), test(/v1\/instrumentations/)), always('instrumentations')], // todo weak
  [_(prop('message'), includes('.com/v1/batches')), always('batches')],
  [_(prop('message'), includes('.com/internal/assetcentral')), always('assetcentral')],
  [_(prop('message'), includes('assetcentral')), always('assetcentral')], // I gave up
  [_(prop('message'), includes('eloqua.com')), always('eloqua.com')],
  [_(prop('message'), includes('Redis::CannotConnectError')), always('Redis::CannotConnectError')],
  [_(prop('message'), includes('Redis::TimeoutError')), always('Redis::CannotConnectError')],
  [_(prop('message'), includes('Timed out while waiting')), always('Timeout')],
  [_(prop('message'), includes('Request timeout')), always('Timeout')],
  [_(prop('message'), includes('Net::OpenTimeout')), always('Timeout')],
  [_(prop('message'), includes('Net::ReadTimeout')), always('Timeout')],
  [_(prop('message'), includes('ArgumentError: wrong number of arguments (given 1')), always('TODO:DavidErrorWillFix')],
  [_(prop('message'), includes('OmniAuth')), always('TODO:OmniAuth')],
  [_(propEq('status', 500)), always('500')],
  [_(propEq('status', 503)), always('503')],
  // [_(propEq('category', 'produce')), always('category:produce')],
  [T, _(prop('message'), trim)]
])
