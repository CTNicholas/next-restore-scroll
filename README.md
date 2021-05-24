# next-restore-scroll

After switching routes in [Next.js](https://github.com/vercel/next.js/), via the forward and back buttons, the scroll position can be lost. This is often
because only the body tag will have its position restored, and sometimes the main scrolling window is another
element. This package can fix this, and it can also restore the scroll position of any other elements in the page, after using dynamic next/router links.

### How it works

`next-restore-scroll` simply saves the scroll position of the chosen element(s) in `sessionStorage` before the next router page is changed, and then applies the scroll position after the route has loaded.

## Install

```shell
npm install next-restore-scroll
```

## How to use

This package can be used in any React component, though I'd advise only using it once per project, and adding all scrollable elements to the second argument.

_app.js:

```jsx
import restoreScrollPosition from 'next-restore-scroll'

export default function App ({ Component, pageProps, router }) {
  restoreScrollPosition(router, '#scrolling-element')
  return (
    ...
  )
}
```

Anywhere else:

```jsx
import { useRouter } from 'next/router'
import restoreScrollPosition from 'next-restore-scroll'

export default function Layout () {
  const router = useRouter()
  restoreScrollPosition(router, '#scrolling-element')
  return (
    ...
  )
}
```

### Examples

Restore scroll position of one element :

```js
restoreScrollPosition(router, '#scrolling-wrapper')
```

Restore scroll position of multiple elements:

```js
restoreScrollPosition(router, ['#scrolling-wrapper', '#scrolling-panel'])
```

Restore scroll position of multiple elements retrieved with the same selector:

```js
restoreScrollPosition(router, '.scrolling-element', true)
```

Restore scroll position of a mixture of elements:

```js
restoreScrollPosition(router, ['#scrolling-wrapper', '.scrolling-element', '.scrolling-box'], true)
```

### Syntax

```js
restoreScrollPosition(router, elementSelectors[, selectMultipleOfElement])
```

<dl>
  <dt>router</dt>
  <dd>The next/router object. Can be retrieved with useRouter().</dd>
  <dt>elementSelectors</dt>
  <dd>String or string array. The CSS selectors for the scrolling element(s).</dd>
  <dt>selectMultipleOfElement (optional)</dt>
  <dd>Boolean, default is false. If true, querySelectorAll will be used, instead of querySelector, and multiple elements selected by the same selector will have their position restored, instead of just the first.</dd>
</dl>

