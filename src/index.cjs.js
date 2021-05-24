const react = require('react')
const { useEffect } = react
const Router = require('next/router')

/**
 * Restores the scroll position of every element selector passed as the second argument, in an array,
 * or a single element selector passed as a string. If the third argument is true, querySelectorAll
 * will be used instead of querySelector, and multiple elements found with the same selector shall
 * have their scroll position restored.
 * @param router {object} - The router object passed from the main app.js component
 * @param elementSelectors {string|string[]} - A single element selector string, or an array of element selector strings
 * @param selectMultipleOfElement {boolean} - Select multiple elements from same selector? Default is false
 */
module.exports = function restoreScrollPosition (router, elementSelectors, selectMultipleOfElement = false) {
  let selectors
  selectors = Array.isArray(elementSelectors) ? elementSelectors : [elementSelectors]

  // Pass each selector and element as `func` arguments
  function forEachElement (func) {
    selectors.map((selector, count) => {
      if (!selectMultipleOfElement) {
        func(selector, document.querySelector(selector))
      } else {
        [...document.querySelectorAll(selector)].forEach(element => {
          func(`${selector}_${count}`, element)
        })
      }
    })
  }

  // Save each scroll position to sessionStorage
  function saveScrollPos (url) {
    const scrollPositions = {}
    forEachElement((selector, element) => {
      scrollPositions[selector] = {
        x: element.scrollLeft,
        y: element.scrollTop
      }
    })
    sessionStorage.setItem(url, JSON.stringify(scrollPositions))
  }

  // Restore each scroll position from sessionStorage
  function restoreScrollPos (url) {
    const scrollPositions = JSON.parse(sessionStorage.getItem(url))
    if (scrollPositions) {
      forEachElement((selector, element) => {
        const scrollPos = scrollPositions[selector]
        if (scrollPos) {
          element.scrollTo(scrollPos.x, scrollPos.y)
        }
      })
    }
  }

  // Run when route changes
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      let shouldRestoreScroll = false
      window.history.scrollRestoration = 'manual'
      restoreScrollPos(router.asPath)

      const onBeforeUnload = event => {
        saveScrollPos(router.asPath)
        delete event['returnValue']
      }

      const onRouteChangeStart = () => {
        saveScrollPos(router.asPath)
      }

      const onRouteChangeComplete = url => {
        if (shouldRestoreScroll) {
          shouldRestoreScroll = false
          restoreScrollPos(url)
        }
      }

      // Apply to router
      window.addEventListener('beforeunload', onBeforeUnload)
      Router.events.on('routeChangeStart', onRouteChangeStart)
      Router.events.on('routeChangeComplete', onRouteChangeComplete)
      Router.beforePopState(() => {
        shouldRestoreScroll = true
        return true
      })

      // Clean up
      return () => {
        window.removeEventListener('beforeunload', onBeforeUnload)
        Router.events.off('routeChangeStart', onRouteChangeStart)
        Router.events.off('routeChangeComplete', onRouteChangeComplete)
        Router.beforePopState(() => true)
      }
    }
  }, [router])
}
