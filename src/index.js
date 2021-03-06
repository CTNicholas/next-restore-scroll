import { useEffect } from 'react'
import Router from 'next/router'

/**
 * Restores the scroll position of every element selector passed as the second argument, in an array,
 * or a single element selector passed as a string. If the third argument is true, querySelectorAll
 * will be used instead of querySelector, and multiple elements found with the same selector shall
 * have their scroll position restored.
 * @param router {object} - The router object passed from the main app.js component
 * @param elementSelectors {string|string[]} - A single element selector string, or an array of element selector strings
 * @param selectMultipleOfElement {boolean} - Default: false. Select multiple elements from same selector? Default is false
 * @param restoreOnNew {boolean} - Default: true. When loading page with scroll position without using back/forward, reset position
 */
export default function restoreScrollPosition (router, elementSelectors, selectMultipleOfElement = false, restoreOnNew = false) {
  const prefix = 'next-restore-scroll:'
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
    sessionStorage.setItem(prefix + url, JSON.stringify(scrollPositions))
  }

  // Restore each scroll position from sessionStorage
  function restoreScrollPos (url) {
    const scrollPositions = JSON.parse(sessionStorage.getItem(prefix + url))
    if (scrollPositions) {
      forEachElement((selector, element) => {
        const scrollPos = scrollPositions[selector]
        if (scrollPos) {
          disableSmoothScrollCallback(element, () => {
            element.scrollTo(scrollPos.x, scrollPos.y)
          })
        }
      })
    }
  }

  // Scroll all elements to top
  function scrollAllToTop () {
    forEachElement((selector, element) => {
      disableSmoothScrollCallback(element, () => {
        element.scrollTo(0, 0)
      })
    })
  }

  // Disable smooth scroll (if enabled), run callback, re-enable (if previously enabled)
  function disableSmoothScrollCallback (element, func) {
    const smoothScroll = window.getComputedStyle(element).getPropertyValue('scroll-behavior')
    if (smoothScroll !== 'auto') {
      element.style.scrollBehavior = 'auto'
      func()
      element.style.scrollBehavior = smoothScroll
    } else {
      func()
    }
  }

  // Run when route changes
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      let shouldRestoreScroll = false
      window.history.scrollRestoration = 'manual'

      if (restoreOnNew) {
        restoreScrollPos(router.asPath)
      }

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
        } else {
          scrollAllToTop()
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
