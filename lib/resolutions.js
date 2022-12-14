import {
  __,
  allPass,
  always,
  applySpec,
  assoc,
  concat,
  cond,
  equals,
  evolve, gt,
  includes,
  lensProp,
  over,
  pipe as _,
  prop, propOr,
  T
} from 'ramda'
import { msgToCategory } from './index.js'

// TODO maybe resolution() could work on higher level to have acces to count, or neybour errors?
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
        always('When over 100 errors check Kafka lags, InfluxDb, Grafana, and restart InfluxDb')],
      [allPass([
        _(msgToCategory, equals('500:Entry')),
        prop('path')
      ]), e => `open https://www.netilion.endress.com${e.path} to check if online` ],
      [T, always('')]
    ])
  )(e)
})
