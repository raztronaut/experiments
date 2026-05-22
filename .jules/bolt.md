## 2024-05-22 - Fast Reading Time Estimation for MDX
**Learning:** Using complex NLP libraries like `reading-time-estimator` for MDX articles can cause memory allocation bottlenecks during build. A simple regex word count `text.match(/\S+/g)?.length` avoids large string allocations.
**Action:** Use regex word counting instead of NLP libraries for fast and lightweight reading time estimations.
