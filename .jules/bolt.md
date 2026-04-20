## 2025-04-20 - Fast MDX Reading Time
**Learning:** Heavy NLP libraries for reading time estimation can cause severe garbage collection spikes when processing multiple articles.
**Action:** For reading time, use `text.match(/\S+/g)?.length` to count words instead of complex estimators to avoid memory spikes and reduce build times.
