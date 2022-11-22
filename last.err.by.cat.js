import { parseArgs } from "node:util";
import {
  length,
  prop,
  values,
  pipe as _,
  tap,
  flatten,
  map,
  filter,
  __,
  always,
  chain, eqBy, ifElse,
  includes,
  toLower, evolve, sortBy, concat, juxt, head, last, descend, assoc
} from 'ramda'
import { createRequire } from "module";
import { getToday } from './db.js'
import { msgToCategory } from './lib/index.js'
import { format, formatDistance, formatDuration, startOfDay } from 'date-fns'


const require = createRequire(import.meta.url); // construct the require method
const data = require("./data/db.json") // use the require method

const {
  values: { message, env, errCat },
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
  juxt([head, last]),
  tap(console.log)
)(data)

// TODO
// {
//   app: 'hub',
//   env: 'staging',
//   message: "NoMethodError: undefined method `reseller?' for nil:NilClass",
//   at: 'error',
//   stackTrace: "/app/app/models/subscription.rb:166:in `active_users'\n" +
//   category: 'CleanupUnreadableSubscriptionAssetsWorker',
//   id: 'DerSg4QB5R1W-CXwfTnB.account-753034',
//   proc: 'worker.2',
//   time: 2022-11-17T04:22:00.390Z,
//   firstSeen: '27 days ago'
// },
