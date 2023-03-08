import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import {
  __,
  allPass,
  always, append,
  applySpec,
  assoc,
  concat,
  cond,
  equals,
  evolve, gt, ifElse,
  includes, join,
  lensProp,
  over,
  pipe as _,
  prop, propEq, propOr,
  T, tap
} from 'ramda'
import { msgToCategory } from './index.js'

const envToUrl = msg => propEq('env', 'staging')(msg)
  ? process.env.hubProdUrl
  : process.env.hubStageUrl

// TODO maybe resolution() could work on higher level to have access to count, or neighbour errors?
export const evolveResolution = e => ({
  ...e,
  resolution: _(
    cond([
      [_(prop('message'), includes('Please contact administrator of the site you are trying to access.')),
        _(prop('id'), concat('Email to Infoserve when multiple times about id: '))],
      [allPass([
        _(prop('message'), includes('bdih')),
        _(propOr(0, 'length'), gt(__, 100))
      ]),
        always('Email to Infoserve that bdih is down')],
      [allPass([
        _(msgToCategory, includes('InfluxDb')),
        _(propOr(0, 'length'), gt(__, 100))
        ]),
        cond([
          [_(msgToCategory, includes('InfluxDb2')), always('Check InfluxDb2')],
          [_(msgToCategory, includes('InfluxDb:429:Ass')),
            always('Email Eric that `Ass Fermentation` is doing crazy stuff')],
          [T, _(always('When over 100 errors check Kafka lags, InfluxDb, Grafana, and restart InfluxDb,'),
            append(' open https://console.aiven.io/project/netilion-staging-1/services/influx-staging-1/metrics ' +
              'because it might have CPU over 50%' ), join(''))],
        ])
      ],
      [allPass([
        _(msgToCategory, equals('500:Entry')),
        prop('path')
      ]), e => `open https://www.netilion.endress.com${e.path} to check if online`],
      [_(prop('message'), includes('Server Request Interrupted')),
        _(envToUrl, concat(`Go to heroku and check it restart/deploy was successful `))],
      [_(prop('message'), includes('App crashed')),
        _(envToUrl, concat(`Go to heroku and check it restart/deploy was successful `))],
      [T, always('')]
    ])
  )(e)
})
