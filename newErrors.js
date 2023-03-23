#!/usr/bin/env node

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
  concat,
  innerJoin,
  pluck,
  groupBy,
  filter,
  reject,
  evolve,
  pick,
  slice,
  propOr,
  __,
  always,
  when,
  find,
  applySpec,
  unless, isEmpty, identity, take, reduce, sum, add, uniq, pickBy, unapply, clamp, apply, median, takeLast, juxt,
} from 'ramda'
import { createRequire } from "module";
import { getToday } from './db.js'
import {
  addDay,
  avg,
  chart,
  errLengthsByDay, mode,
  msgToCategory,
  pickTruthy,
  sortByKeys,
  trimStackTrace
} from './lib/index.js'
import { formatDistance } from 'date-fns'
import { evolveResolution } from './lib/resolutions.js'

const require = createRequire(import.meta.url); // construct the require method
const data = require("./data/db.json") // use the require method

if (!['prod', 'stage'].includes(process.argv[2]) ) {
  throw 'Missing argument prod|stage'
}

const env = process.argv[2] // prod | stage

const errCat = process.argv[3] || 'payments' // SimCards
const dayDiff = process.argv[4] || 0  // -1 yesterday, 0 today
const dayGiven = addDay(dayDiff)(getToday())
console.log('For a day:', dayGiven) // maybe better api would be to actually use date string

const errs = _(
  prop(env),
  e => {
    const f = { ...e }
    delete f[dayGiven]
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
  tap(when(Boolean, _(msgToCategory, console.log))),
  console.log,
))

const tapProp = property => tap(_(
  // prop(property),
  e => _(
    keys,
    find(prop => prop.includes(property)),
    found => e[found]
  )(e),
  when(Boolean, _(
    tap(() => console.log(property, ':')),
    console.log))))

console.log('errors to compare on env:', env, errs.length, errs.find(e => !e.message))

const todayErr = _(
  prop(env),
  prop(dayGiven),
  values)(data)

const newErrors = _(
  prop(env),
  prop(dayGiven),
  values,
  tap(_(
    length,
    errs => console.log('Today errs today so far on ', env, errs))), // erro today
  concat(errs),

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
  filter(e => e.length >= 1),
)(errs)

const errCountByDay = _(
  errLengthsByDay,
)(errs)

const errVals = _(e => errCountByDay[e], values, takeLast(60), map(clamp(0, 500)))
const rescale = arr => _(map(e => {
  const max = median(arr) * 2 + 10
  return clamp(0, max)(e)
}))(arr)

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
    length, String, concat('Uncatalogued errors: '), console.log)),
  map(
    evolve({
      time: e => new Date(e),
      stackTrace: trimStackTrace
    })),
  // tap(_(head, msgToCategory, console.log)), // debug uncataloged errors
  groupBy(msgToCategory),
  tap(_(map(length), console.log)),
  tapProp(errCat)
)(todayErr)

// Returning errors
_(
  // filter(e => e.message.includes('CannotConnectError')), // debug uncataloged errors
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
      time: e => new Date(e),
      stackTrace: trimStackTrace
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
        e.charts = msgToCategory(e)
        return e
      }),
      // pick(['time', 'message', 'firstSeen', 'path'])
    )),
  sortByKeys,
  map(map(evolveResolution)), // maybe resolution() could work on higher level to have access to count, or neybour errors?
  tapProp(errCat),
  e => console.log('Returning errors categories',
    map(
      _(
        applySpec({
          totalLength: _(pluck('length'), reduce(add, 0)),
          resolution: _(pluck('resolution'), uniq, head),
          length,
          seen: _(pluck('firstSeen'), head),
          charts: _(pluck('charts'), head,  applySpec({
            maxMedianAvg: _(
              errVals,
              juxt([apply(Math.max), median, avg]),
              join(' | ')),
            chart: _(errVals, rescale, chart) }))
        }),
        e => pickTruthy(keys(e))(e),
        f => pickBy((v, k) => {
          if (k === 'length' && v === 1) return false
          if (k === 'totalLength' && v === 1) return false
          if (k !== 'length') return true
          return k === 'length' && f.totalLength !== f.length
        }, f))
      , e)),
  // tap(_(head, msgToCategory, console.log)), // debug uncataloged errors
)(todayErr)
