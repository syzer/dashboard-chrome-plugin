let values = {};
const secondsSince = (oldDate) =>
  Math.abs((new Date().getTime() - oldDate) / 1000);

chrome.runtime.onInstalled.addListener((e) => {
  console.debug('onInstalled', e)
  // chrome.storage.sync.set({ values });
});

const shallICareAboutErrors = (tab) => {
  const url = window?.location?.href

  if (!/app\.logz\.io/.test(url)) {
    return
  }

  const wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000))

  const isStage = /staging/.test(url)
  const isProd = !isStage

  // setTimeout(async () => {
  //   // TODO it's not working sometimes.. maybe remove it
  //   console.debug('scrolling 4000')
  //   console.debug(document.querySelector('table')?.scrollHeight)
  //   window.scrollTo(0, document.querySelector("table")?.scrollHeight || 2600)
  //   await wait(1)
  // }, 4000)

  console.debug('Logs finished')
}

const whoNeedsReact = () => {
  console.debug('onActivated url', window?.location?.href)
  const url = window?.location?.href

  if (!/dashboard\.netilion\.io/.test(url)) {
    return
  }

  chrome.storage.sync.get('values', ({ values = {} }) => {
    console.debug(values, 'values')
    const last = Object.keys(values).sort((a, b) => b - a)[0]
    if (!last) {
      return
    }

    const secondsSince = (oldDate) =>
      Math.abs((new Date().getTime() - oldDate) / 1000);

    const tenMin = Object.keys(values).reverse().find(e => secondsSince(e) > 10 * 60) || Object.keys(values)[0]
    if (!tenMin) {
      return
    }
    const { prodErr: oldErr, stageErr: oldStageErr } = values[tenMin]
    console.debug(oldErr, oldStageErr, 'oldErr, oldStageErr')

    const selector1 = `div.dashli-flex-text-value-value>div>span:nth-child(1)`
    const errorsNow = Array.from(document.querySelectorAll(selector1))
    const [prodErr, stageErr] = [...new Set(errorsNow.map(e => e.innerHTML))] // or grab 1st and 3rd value
    console.debug(prodErr, stageErr, 'prodErr, stageErr')

    document.querySelectorAll(selector1).forEach(e => {
      e.style.display = 'flex'
      e.style.fontSize = '15px'
      e.style.lineHeight = 'initial'
    })

    const delta = {
      prod: prodErr - oldErr,
      stage: stageErr - oldStageErr,
    }
    console.debug(delta, 'delta')

    const units = `span.dashli-flex-text-value-unit`
    const [prod, nope, stage] = Array.from(document.querySelectorAll(units))

    console.debug('units', document.querySelectorAll(units))

    const styleElement = (el, url, environment) => {
      el.style.fontSize = '100px'
      el.style.textDecoration = 'none'
      el.style.display = 'flex'
      const target = `${environment}Kibana`
      const hasLinkAlready = document.querySelector(`a[target=${target}]`)
      if (hasLinkAlready) {
        return
      }
      el.outerHTML = `<a href="${url}" target="${target}" class="logsLink" style="text-decoration: none; color:ghostwhite"> 
        ${el.outerHTML}
    </a>`
    }
    prod.innerHTML = delta.prod
    stage.innerHTML = delta.stage
    const prodUrl = `https://app-eu.logz.io/#/dashboard/kibana/discover/view/71e09880-f4a0-11e9-9eaa-738762dd3167?_a=(columns:!(app,message),filters:!(('$state':(store:appState),meta:(alias:KafkaRebalancing,disabled:!f,index:'logzioCustomerIndex*',key:message,negate:!t,params:(query:'*Error%20sending%20heartbeat:%20Kafka::RebalanceInProgress*'),type:phrase),query:(match:(message:(query:'*Error%20sending%20heartbeat:%20Kafka::RebalanceInProgress*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logzioCustomerIndex*',key:function_name,negate:!t,params:(query:connected-support),type:phrase),query:(match:(function_name:(query:connected-support,type:phrase))))),index:'logzioCustomerIndex*',interval:auto,query:(language:lucene,query:'app:%20(backup%20OR%20blog%20OR%20entry%20OR%20fwr30-lambda%20OR%20health%20OR%20hub%20OR%20analytics%20OR%20id%20OR%20inventory%20OR%20library%20OR%20technical-support%20OR%20value%20OR%20wqwa%20OR%20long-term-tests%20OR%20netilion-mqtt-kafka-gateway)%20AND%20(level:(error%20OR%20fatal)%20OR%20log_level:(error%20OR%20fatal%20OR%20ERROR%20OR%20FATAL)%20OR%20at:(error%20OR%20fatal)%20OR%20http_status:500)%20AND%20NOT%20_exists_:edge_device%20AND%20env:production'),sort:!(!('@timestamp',desc)))&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now%2Fd,to:now))&accountIds=true&switchToAccountId=407214`
    const stageUrl = `https://app-eu.logz.io/#/dashboard/kibana/discover/view/d7104bb0-e895-11e7-bbea-a306668ce3b3?_a=(columns:!(app,message),filters:!(('$state':(store:appState),meta:(alias:KafkaRebalancing,disabled:!f,index:'logzioCustomerIndex*',key:message,negate:!t,params:(query:'*Error%20sending%20heartbeat:%20Kafka::RebalanceInProgress*'),type:phrase),query:(match:(message:(query:'*Error%20sending%20heartbeat:%20Kafka::RebalanceInProgress*',type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logzioCustomerIndex*',key:function_name,negate:!t,params:(query:connected-support),type:phrase),query:(match:(function_name:(query:connected-support,type:phrase))))),index:'logzioCustomerIndex*',interval:auto,query:(language:lucene,query:'app:%20(backup%20OR%20blog%20OR%20entry%20OR%20fwr30-lambda%20OR%20health%20OR%20hub%20OR%20analytics%20OR%20id%20OR%20inventory%20OR%20library%20OR%20technical-support%20OR%20value%20OR%20wqwa%20OR%20long-term-tests%20OR%20netilion-mqtt-kafka-gateway)%20AND%20(level:(error%20OR%20fatal)%20OR%20log_level:(error%20OR%20fatal%20OR%20ERROR%20OR%20FATAL)%20OR%20at:(error%20OR%20fatal)%20OR%20http_status:500)%20AND%20NOT%20_exists_:edge_device%20AND%20env:staging'),sort:!(!('@timestamp',desc)))&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now%2Fd,to:now))&accountIds=true&switchToAccountId=407214`

    styleElement(prod, prodUrl, 'prod')
    styleElement(stage, stageUrl, 'stage')

    // document.querySelectorAll(cards).forEach(e => {

    // colors
    const getColor = (errorCount) => {
      if (errorCount > 150) {
        return '#d50c2f'
      }
      if (errorCount > 100) {
        return 'pink'
      }
      if (errorCount > 10) {
        return '#cece27'
      }
      return 'green'
    }
    document.querySelector('div.dashli-row>div:nth-child(1)').style.backgroundColor = getColor(delta.prod)
    document.querySelector('div.dashli-row>div:nth-child(2)').style.backgroundColor = getColor(delta.stage)
  })
  console.debug('ok')
}

chrome.tabs.onActivated.addListener(function(tab) {
  console.debug('onActivated', JSON.stringify(tab), tab.url, tab.tabId, 'info')

  chrome.scripting.executeScript({
    target: { tabId: tab.tabId },
    func: shallICareAboutErrors,
    args: [],
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.tabId },
    func: whoNeedsReact,
    args: [],
  });
})

const saveErrorsCount = (tab) => chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    // runs on actual page console
    setTimeout(() => {
      console.debug('savingErrorsCount')

      const selector1 = `div.dashli-flex-text-value-value>div>span:nth-child(1)`
      const [prodErr, stageErr] = [...new Set(Array.from(
        document.querySelectorAll(selector1))
          .map(e => e.innerHTML))]
      console.debug('stagingErr', prodErr, stageErr)

      chrome.storage.sync.get('values', ({ values = {} }) => {
        console.debug(values, 'values')
        chrome.storage.sync.set({
          values: {
            ...values,
            [new Date().getTime()]: {
              prodErr,
              stageErr,
            }
          }
        })
      })
      chrome.storage.sync.get('values', ({ values = {} }) => {
        console.debug(values, 'values2')
      })
    }, 1000)
  },
  args: [],
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === 'complete' && /dashboard\.netilion\.io/.test(tab.url)) {

    console.debug('tab updated', tab.url, tabId, info, new Date())
    saveErrorsCount(tab)
    setTimeout(whoNeedsReact, 2000)
    // TODO AKA throttle for poor
  }


})
