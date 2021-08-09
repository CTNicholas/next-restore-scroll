var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  default: () => restoreScrollPosition
});
var import_react = __toModule(require("react"));
var import_router = __toModule(require("next/router"));
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
  (0, import_react.useEffect)(() => {
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
      import_router.default.events.on("routeChangeStart", onRouteChangeStart);
      import_router.default.events.on("routeChangeComplete", onRouteChangeComplete);
      import_router.default.beforePopState(() => {
        shouldRestoreScroll = true;
        return true;
      });
      return () => {
        window.removeEventListener("beforeunload", onBeforeUnload);
        import_router.default.events.off("routeChangeStart", onRouteChangeStart);
        import_router.default.events.off("routeChangeComplete", onRouteChangeComplete);
        import_router.default.beforePopState(() => true);
      };
    }
  }, [router]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=next-restore-scroll.cjs.js.map
