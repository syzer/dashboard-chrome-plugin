import * as dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: __dirname + '/../' + '.env' })
import {
  __,
  allPass,
  always, append,
  applySpec,
  assoc,
  concat,
  cond,
  equals,
  evolve, filter, find, flip, gt, head, ifElse,
  includes, join, juxt, last,
  lensProp,
  over,
  pipe as _,
  prop, propEq, propOr, replace, split,
  T, tap, test
} from 'ramda'
import { msgToCategory } from './index.js'

const envToUrl = _(
  ifElse(propEq('env', 'staging'),
    always(process.env.hubStageUrl),
    always(process.env.hubProdUrl)),
  flip(concat)(' '))

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
      [_(prop('message'), includes('not currently leader')),
        always('Kafka under maintenance? check email or heroku')],
      [_(prop('message'), includes('arcane-wildwood')),
        always('Internal DNS')],
      [allPass([
        _(prop('message'), includes('max_poll_exceeded')),
        // _(propOr(0, 'length'), gt(__, 10))
      ]),
        _(_(prop('message'), split(','), find(includes('topic=')), split('topic='), last, split('.'), last),
          concat(`
          1. Check kafka lags on dashboard.. if it's older than 5 min go to kafka monitor ${process.env.kafkaMonitorUrl} needs restarting 
          2. open heroku ${process.env.hubProd} and find hub dyno that needs rescaling: `)
        )
      ],
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
      [_(
        msgToCategory, test(/mqtt/i)),
        always(`Check email if there's planned heroku downtime`)],
      [allPass([
        _(msgToCategory, equals('500:Entry')),
        prop('path')
      ]), e => `open https://www.netilion.endress.com${e.path} to check if online`],
      [_(prop('message'), includes('Server Request Interrupted')),
        _(envToUrl, concat(`Go to heroku and check it restart/deploy was successful `))],
      [_(prop('message'), includes('App crashed')),
        _(envToUrl, concat(`Go to heroku and check it restart/deploy was successful `))],
      [_(msgToCategory, equals('504:hub')),
        _(
          juxt([
            _(prop('time'), e => e.toLocaleTimeString(), concat('Time: ')),
            _(envToUrl, replace('activity', 'metrics'), concat(`Go to heroku and check it maybe dynos restart? `))]),
          join(' '))],
      [T, always('')]
    ])
  )(e)
})
