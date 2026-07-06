## 2023-11-20 - Adding ARIA label to mobile menu
**Learning:** Found an icon-only button without an ARIA label in the mobile navigation menu. Adding an ARIA label here is a critical accessibility improvement for screen readers since the button only contained a FontAwesome icon (`faBars`).
**Action:** Always ensure that any `<Button>` or interactive element containing only an icon (like `<FontAwesomeIcon />`) has a descriptive `aria-label` attribute.
