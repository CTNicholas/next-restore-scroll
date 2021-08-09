import { useEffect } from "react";
import Router from "next/router";
function restoreScrollPosition(router, elementSelectors, selectMultipleOfElement = false, restoreOnNew = false) {
  const prefix = "next-restore-scroll:";
  let selectors;
  selectors = Array.isArray(elementSelectors) ? elementSelectors : [elementSelectors];
  function forEachElement(func) {
    selectors.map((selector, count) => {
      if (!selectMultipleOfElement) {
        func(selector, document.querySelector(selector));
      } else {
        [...document.querySelectorAll(selector)].forEach((element) => {
          func(`${selector}_${count}`, element);
        });
      }
    });
  }
  function saveScrollPos(url) {
    const scrollPositions = {};
    forEachElement((selector, element) => {
      scrollPositions[selector] = {
        x: element.scrollLeft,
        y: element.scrollTop
      };
    });
    sessionStorage.setItem(prefix + url, JSON.stringify(scrollPositions));
  }
  function restoreScrollPos(url) {
    const scrollPositions = JSON.parse(sessionStorage.getItem(prefix + url));
    if (scrollPositions) {
      forEachElement((selector, element) => {
        const scrollPos = scrollPositions[selector];
        if (scrollPos) {
          disableSmoothScrollCallback(element, () => {
            element.scrollTo(scrollPos.x, scrollPos.y);
          });
        }
      });
    }
  }
  function scrollAllToTop() {
    forEachElement((selector, element) => {
      disableSmoothScrollCallback(element, () => {
        element.scrollTo(0, 0);
      });
    });
  }
  function disableSmoothScrollCallback(element, func) {
    const smoothScroll = window.getComputedStyle(element).getPropertyValue("scroll-behavior");
    if (smoothScroll !== "auto") {
      element.style.scrollBehavior = "auto";
      func();
      element.style.scrollBehavior = smoothScroll;
    } else {
      func();
    }
  }
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      let shouldRestoreScroll = false;
      window.history.scrollRestoration = "manual";
      if (restoreOnNew) {
        restoreScrollPos(router.asPath);
      }
      const onBeforeUnload = (event) => {
        saveScrollPos(router.asPath);
        delete event["returnValue"];
      };
      const onRouteChangeStart = () => {
        saveScrollPos(router.asPath);
      };
      const onRouteChangeComplete = (url) => {
        if (shouldRestoreScroll) {
          shouldRestoreScroll = false;
          restoreScrollPos(url);
        } else {
          scrollAllToTop();
        }
      };
      window.addEventListener("beforeunload", onBeforeUnload);
      Router.events.on("routeChangeStart", onRouteChangeStart);
      Router.events.on("routeChangeComplete", onRouteChangeComplete);
      Router.beforePopState(() => {
        shouldRestoreScroll = true;
        return true;
      });
      return () => {
        window.removeEventListener("beforeunload", onBeforeUnload);
        Router.events.off("routeChangeStart", onRouteChangeStart);
        Router.events.off("routeChangeComplete", onRouteChangeComplete);
        Router.beforePopState(() => true);
      };
    }
  }, [router]);
}
export {
  restoreScrollPosition as default
};
//# sourceMappingURL=next-restore-scroll.esm.js.map
