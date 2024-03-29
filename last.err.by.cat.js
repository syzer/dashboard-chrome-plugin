import { parseArgs } from "node:util";
import {
  __,
  always, apply, applySpec,
  assoc,
  chain, clamp,
  concat,
  converge,
  descend,
  divide, equals,
  evolve,
  filter, groupBy,
  head,
  ifElse,
  includes, isEmpty, join,
  juxt,
  last,
  length,
  map, max, median, multiply,
  pipe as _, pluck,
  prop, reduce,
  sortBy, split, subtract, takeLast,
  tap, uniqBy, unless,
  values, when
} from 'ramda'
import { createRequire } from "module";
import { errLengthsByDay, sum, foldValues, msgToCategory, omitValues, avg, chart, rescale } from './lib/index.js'
import { formatDistance } from 'date-fns'
import Identity from 'lodash-es/identity.js'
import { getDayFrom } from './db.js'

const average = converge(divide, [sum, length])

const require = createRequire(import.meta.url); // construct the require method
const data = require("./data/db.json") // use the require method


const {
  values: { message, env, errCat, debug },
} = parseArgs({
  options: {
    message: {
      type: "string",
      short: "m",
    },
    env: {
      type: "string",
      short: "e",
      default: "prod",
    },
    errCat: {
      type: "string",
      short: "c",
    },
    debug: {
      type: "boolean",
      short: "d",
      default: false,
    }
  },
})

_(
  prop(env),
  values,
  chain(values), // flatmap
  ifElse(
    always(message),
    filter(_(
      JSON.stringify,
      includes(message))),
    filter(_(
      msgToCategory,
      // eqBy(toLower, errCat))) // TODO strict or partial match?
      includes(errCat)))
  ),
  map(evolve({
    time: e => new Date(e)
  })),
  map(e => assoc('timeAgo', formatDistance(
      e.time,
      new Date(),
      { addSuffix: true }
    ), e)),
  sortBy(descend(prop('time'))),
  tap(_(length, String, concat('Err reported times: '), console.log)),
  uniqBy(_(
    prop('time'),
    e => e.toISOString(),
    split('T'),
    head)),
  tap(_(
    groupBy(_(prop('time'), getDayFrom)),
    map(_(
      pluck('length'),
      reduce(sum, 0),
      e => e || 1)),
    values, takeLast(60), map(clamp(0, 500)),
    applySpec({
      maxMedAvg: _(juxt([apply(Math.max), median, avg]), join(' | ')),
      chart: _(rescale, chart)}),
    console.log)),
  tap(_(length, String, concat('Err reported days: '), console.log)),
  tap(_(pluck('length'), reduce(max, 1), String, concat('Up to times a day: '), console.log)),
  tap(e =>
    unless(isEmpty, _(
      pluck('time'),
      sortBy(e => e.getTime()),
      juxt([always(new Date()), head]),
      unless(apply(equals), _(
        apply(subtract),
        divide(__, 1000 * 60 * 60 * 24),
        Math.ceil,
        duration => converge(divide, [length, always(duration)])(e),
        multiply(100),
        clamp(0, 100), // because same error category can be multiple times a day and would give 100+%
        e => e.toFixed(1),
        concat('Today theres % chance of that error: '), // assumes uniform distributions
        console.log
      ))))(e)),
  map(omitValues),
  tap(_(when(always(debug), _(foldValues, console.log)))),
  juxt([head, last]),
  ifElse(
    apply(equals),
    tap(_(head, console.log, always('Unicorn! Seen ONCE!!!'), console.log)),
    tap(console.log)),
)(data)
