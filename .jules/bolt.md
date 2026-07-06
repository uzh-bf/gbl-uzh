## 2024-05-19 - Duplicate Keys in repeat Maps
**Learning:** Found a pattern where developers use Ramda's `repeat` to generate arrays of primitive values (like `repeat(1, storageUsed)`). This leads to a performance hit and duplicate keys in React if mapped over, since the array values are identical.
**Action:** When mapping over `repeat`-generated arrays, always use the `.map(_, idx)` index for the React `key` prop, instead of the item value itself.
