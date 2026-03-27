# Reactive Product Search Dashboard

A small Angular project demonstrating signal-based data fetching and derived UI state with `httpResource` and `computed`.

## Overview

This project implements a product search flow with filtering, sorting, selection state, and derived metrics.

The request lifecycle is handled with `httpResource`, while the rest of the feature state is modeled with signals and computed values.

## Tech

- Angular
- Signals
- `httpResource`
- `computed`
- `linkedSignal`
- OnPush change detection

## Project structure

```text
src/app/
├─ app.ts
├─ app.html
├─ app.scss
├─ app.config.ts
└─ product-search/
   ├─ product-search.types.ts
   └─ product-search.store.ts
```

## Run locally

```bash
npm install
ng serve
```

Then open `http://localhost:4200`.
