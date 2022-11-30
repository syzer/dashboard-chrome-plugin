import { always, applySpec, assoc, concat, cond, evolve, includes, lensProp, over, pipe as _, prop, T } from 'ramda'

export const evolveResolution = e => ({
  ...e,
  resolution: _(
    cond([
      [_(prop('message'), includes('Please contact administrator of the site you are trying to access.')),
        _(prop('id'), concat('Email to Infoserve when multiple times about id: '))],
      [T, always('')]
    ])
  )(e)
})
