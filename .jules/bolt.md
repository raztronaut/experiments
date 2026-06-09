## 2025-02-12 - Optimize Date Formatting in React Components
**Learning:** In loops or multiple React components, repeatedly calling `new Date().toLocaleDateString()` incurs high parsing and allocation overhead.
**Action:** Instantiate a single `Intl.DateTimeFormat` with a specific locale (e.g., "en-US") outside the component and reuse its `.format(new Date())` method. This reduces memory footprint and fixes potential SSR hydration mismatch issues.
