# RCO Metrics Dashboard (Demo)

Static demo version of the RCO Metrics Dashboard for portfolio display. The production version is a full-stack operations platform pulling live data from two Shopify stores via a Cloudflare Worker API backend.

**Live Demo:** [hhowell116.github.io/Demo-RCO-Metrics-Dashboard](https://hhowell116.github.io/Demo-RCO-Metrics-Dashboard/)

## Production Architecture

```
Browser  →  Firebase Auth (Google SSO, @rowecasaorganics.com only)
         →  Cloudflare Worker API  →  Shopify REST API (Retail + Wholesale stores)
                                   →  Cloudflare KV (response cache + historical data)
         →  Firebase Realtime DB (user presence, access logs, permissions)
```

### Backend (Cloudflare Worker)
- Paginated full order fetching via cursor-based pagination (no sampling)
- 10-minute response caching in Cloudflare KV to minimize Shopify API load
- Gift card exclusions and cross-day refund adjustments to match Shopify Analytics
- Timezone-aware date handling (Central Time via chicagoNow() helper)
- Automatic Shopify API token reauthentication
- Cron job every 6 hours for KPI data refresh (both stores)
- Nightly cron for top products, orders overview, and international geo backfills

### Frontend
- 14+ dashboard views loaded via iframes in a sidebar shell
- Chart.js for revenue/order visualizations and KPI trend charts
- jsvectormap for interactive world and US choropleth maps
- Firebase Authentication with Google SSO (domain-restricted)
- Firebase Realtime Database for live user presence and access logging

## Dashboards

| Dashboard | Description |
|-----------|-------------|
| Fulfillment KPI | Daily order counts, 4-day and 7-day fill rates, calendar heat map |
| Shipping Leaderboard | Employee rankings by products shipped (Full-Time, Part-Time, Wholesale) |
| Daily Metrics | Today's sales, orders, AOV, units, fulfillment progress (Retail + Wholesale) |
| Sales | Today, MTD, and YTD revenue/orders with combined totals |
| Top Products | 7-day and 30-day product rankings by units sold |
| Orders Overview | Monthly order summaries with calendar and chart views (1.3M+ orders since 2022) |
| Unfulfilled Orders | Breakdown by age for Retail and Wholesale |
| International | World + US maps showing order distribution across 40+ countries |
| Fulfillment Dashboard | Yesterday/Today fulfilled vs unfulfilled counts |
| Skip the Line | Priority order tracking |
| Admin Panel | User presence, access logs, role permissions matrix, user directory |

## Role-Based Access Control

5 roles with configurable permissions persisted to Firebase:

| Role | Dashboards | Revenue |
|------|-----------|---------|
| IT Admin | All + Admin Panel | Visible |
| C-Suite | All operational | Visible |
| Director | All operational | Restricted |
| Supervisor | All operational | Restricted |
| Employee | Shipping + International only | Restricted |

Permission toggles in the Admin Panel let IT Admins adjust which dashboards each role can see. Revenue/AOV fields show "Restricted" for roles without revenue access.

## Additional Features

- **TV Mode** — Fullscreen auto-rotation through dashboards for wall-mounted displays
- **Dark Mode** — Theme toggle with localStorage persistence
- **Guided Tour** — 14-step walkthrough triggered on first login
- **URL Deep Linking** — Shareable links to specific dashboards via URL hash
- **Responsive** — Scales for different screen sizes and zoom levels

## Tech Stack

| Tool | Purpose |
|------|---------|
| Shopify REST API | Live order, product, and fulfillment data (2 stores) |
| Cloudflare Workers | API backend with caching and cron jobs |
| Cloudflare KV | Response cache + historical data storage |
| Firebase Auth | Google SSO with domain restriction |
| Firebase Realtime DB | User presence, access logs, permission persistence |
| Chart.js | Revenue/order charts and KPI visualizations |
| jsvectormap | Interactive choropleth maps |
| Python | Backfill scripts for historical data (2022-2026) |
| JavaScript / HTML / CSS | Frontend dashboards |

## About This Demo

This is a static version with all API calls replaced by sample data, Firebase auth removed, and a demo IT Admin user. The production version runs at an internal URL restricted to @rowecasaorganics.com accounts.
