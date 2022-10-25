import {
  length,
  prop,
  values,
  pipe as _,
  tap,
  flatten,
  map,
  keys,
  count,
  uniqBy,
  join,
  head,
  tryCatch,
  concat, innerJoin, pluck, groupBy, filter, reject, evolve, pick, slice, propOr, __, always,
} from 'ramda'
import { createRequire } from "module";
import { getToday } from './db.js'
import { msgToCategory } from './lib/index.js'
import { formatDistance } from 'date-fns'

const require = createRequire(import.meta.url); // construct the require method
const data = require("./data/db.json") // use the require method

if (!['prod', 'stage'].includes(process.argv[2]) ) {
  throw 'Missing argument prod|stage'
}

const env = process.argv[2] // prod | stage

const errCat = process.argv[3] || 'payments' // SimCards

const recentDays = _(
  prop(env),
  e => {
    const f = { ...e }
    delete f[getToday()]
    return f
  },
  values,
  map(values),
  flatten,
  // tap(_(length, console.log)),
  // tap(_(head, console.log)),
)(data)

const tapFirst = tap(_(
  head,
  e => console.log(e)
))

const tapProp = property => tap(_(
  prop(property),
  tap(() => console.log(property, ':')),
  console.log))

console.log('errors to compare on env:', env, recentDays.length, recentDays.find(e => !e.message))

const todayErr = _(
  prop(env),
  prop(getToday()),
  values)(data)

const newErrors = _(
  prop(env),
  prop(getToday()),
  values,
  tap(_(
    length,
    errs => console.log('Today errs today so far on ', env, errs))), // erro today
  concat(recentDays),

  uniqBy(msgToCategory), // TODO union unique, or intersect
  // tap(_(e => pluck('message', e), console.log)),
  allErr => innerJoin(
    (record, message) =>
      msgToCategory(record) === msgToCategory({ message }),
    todayErr,
    pluck('message', allErr)
  ), // Maybe show each error and match?
  tapFirst,
  length,
  // tap(console.log)
)(data)

// console.log('newErrors from today', newErrors)

const matches = _(
  groupBy(msgToCategory), // TODO better with nn
  map(map(_(
    pick(['time', 'message']), // disable if need to match by category
    evolve({ time: e => new Date(e) })
  ))),
  // map(length)
  filter(e => e.length > 1),
)(recentDays)

// console.log(matches)

// Uncatagloged errors
_(
  // slice(100, 100),
  // filter(e => e.message.includes('CannotConnectError')),
  // tap(_(
  //   head,
  //   msgToCategory,
  //   console.log,
  //     () => console.log(matches['Redis::CannotConnectError'])
  //   )),
  reject(e => matches[msgToCategory(e)]),
  tap(_(
    length, e =>
    console.log('Uncataloged errors', e))),
  map(
    evolve({
      time: e => new Date(e)
    })),
  groupBy(msgToCategory),
  tap(_(map(length), console.log)),
  // console.log
  // tapProp('TODO:DavidErrorWillFix')
  // tapProp('1 renew failure(s), 0 parse failure(s)'),
  // tapProp('1 renew failure(s), 0 parse failure(s)'),
)(todayErr)

// Returning errors
_(
  // slice(100, 100),
  // filter(e => e.message.includes('CannotConnectError')),
  // tap(_(
  //   head,
  //   msgToCategory,
  //   console.log,
  //     () => console.log(matches['Redis::CannotConnectError'])
  //   )),
  filter(e => matches[msgToCategory(e)]),
  tap(_(length, e => console.log('Cataloged errors', e))),
  map(
    evolve({
      time: e => new Date(e)
    })),
  groupBy(msgToCategory),
  map(
    _(
      map(e => {
        e.firstSeen = formatDistance(
          // new Date('2020-12-04T15:39:40.000Z'),
          matches[msgToCategory(e)][0].time,
          new Date(),
          { addSuffix: true }
        )
        return e
      }),
      // pick(['time', 'message', 'firstSeen', 'path'])
    )),
  // tapProp('TODO:DavidErrorWillFix'),
  // tapProp('ActiveRecord::RecordNotFound: ActiveRecord::RecordNotFound'),
  tapProp(errCat),
  // tapProp('RemoteServiceUnavailable'),
  e => console.log('Returning errors categories', map(length, e)),
)(todayErr)
