// react-markdown 8 still references the pre-React-19 global JSX namespace.
// Keep this compatibility bridge aligned with packages/ui/src/global.d.ts.
import * as React from 'react'

declare global {
  namespace JSX {
    type Element = React.JSX.Element
    type ElementClass = React.JSX.ElementClass
    type IntrinsicElements = React.JSX.IntrinsicElements
  }
}
