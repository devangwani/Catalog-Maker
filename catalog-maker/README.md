# Catalog Maker

A one-client mobile product catalog with separate product storage, source adapters, synchronization, internal APIs, and interchangeable Gallery and Studio designs.

## Stack

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, D1 (SQLite), Drizzle schema migrations, R2 image storage, Radix/Shadcn interface primitives, Lucide icons, and Sonner notifications.

## Architecture

Shopify GraphQL Admin API / WooCommerce REST API v3 → server-side adapters → normalized product records → atomic D1 synchronization → internal Catalog API → either customer design.

Customer visits do not contact the external stores. Source-specific identifiers enforce unique products; fingerprints prevent unchanged records being rewritten. Source data is fetched and validated before the catalog batch commits. Errors and completion times are stored in sync_runs. An unavailable store leaves synchronized product records intact. Products removed from the external source are retained but marked unavailable; admin-deleted records remain suppressed after subsequent syncs.

## Routes

- `/`: public mobile catalog.
- `/admin`: either the sample email/password login or ChatGPT sign-in with the server-side admin email allowlist. `/admin/login` is the email/password form.
- `GET /api/catalog?mode=config`: catalog name, WhatsApp number, active design and default currency.
- `GET /api/catalog?mode=categories`: visible collections and product counts.
- `GET /api/catalog?q=&category=&stock=1&sort=price-low&page=1&limit=24`: compact paged products. `sort=price-high` is also supported.
- `GET /api/catalog?mode=detail&id=...`: full product, images, variants, metadata and related products.
- `/api/admin`: protected administration data and validated write actions.
- `/api/upload`: protected image preparation upload; optimized WebP detail and thumbnail variants.
- `/api/images/products/...`: immutable cached R2 image delivery.

## Initial data and outstanding live work

The initial collection contains **100 fictional local sample products**: 50 from each simulated source. It uses three original AI-generated rug images, repeated across sample records. These are not real Shopify/WooCommerce imports and do not fulfill the assignment's external-store product requirement.

Store credentials are entered in Admin → Store connections, encrypted with AES-GCM under the CATALOG_SECRET runtime secret, and never returned to the browser. Use read-only credentials. Shopify requires the myshopify.com domain and an Admin API token with read_products and read_inventory. WooCommerce requires a public HTTPS store, WC REST v3 credentials and its actual currency. Adapters support pagination and variable products. The bounded synchronous implementation supports up to **500 products per store** and 2,100 variants per product. Larger catalogs need background jobs. Changing a connected store's domain after live imports is prevented to avoid identifier collisions.

The Shopify adapter pins 2026-07. References: https://shopify.dev/docs/api/admin-graphql/2026-07/queries/products and https://developer.woocommerce.com/docs/apis/rest-api/authentication . These references informed implementation; live credentials were unavailable during development.

After the first successful deployment, generate sample CSVs with `node scripts/generate-store-samples.mjs https://<published-origin>`. Import them into development stores, never a real merchandise collection. Each file contains 50 unique fictional products. Shopify import: Admin → Products → Import. WooCommerce import: Products → Import. Then enter API credentials in this catalog and run each live import. Recording the actual import, source update and synchronization workflow remains outstanding until real store access is supplied.

## Demonstration sequence

1. Open `/admin` using the authorized owner account.
2. Add/edit a product, its price, availability, description and images.
3. Create/reorder/hide a category or subcategory.
4. Connect real stores and import 50+ products each; check source counts.
5. Edit a real source product and synchronize. View counts/errors/times in Sync history.
6. Before store access, the labelled sample-source laboratory can demonstrate this flow locally.
7. Set the WhatsApp number with country code, no plus or spaces.
8. Save Gallery, browse the public catalog, then save Studio and reload the catalog.
9. Search/filter, open details and lightbox, save a wishlist and reload.
10. Select multiple products, review the message and open WhatsApp.
11. Repeat on mobile. Record video once live stores are available.

## Performance and reliability

24-product pages, small list payloads, cached page/detail results during a browser visit, details prefetched on pointer hover/focus, debounced search, skeletons while loading, native image lazy loading, 480px sample thumbnails and 1280px details, separate uploaded thumbnails/details, Shopify CDN width parameters, conditional ETag API responses, immutable R2 image caching, prepared SQL, category/source indexes, bounded retry for source rate limits and transient failures, and transactional catalog writes. WooCommerce remote images retain their source delivery unless reuploaded. Generic user-facing errors avoid revealing raw server failures.

Wishlist intentionally uses device-local browser storage, without customer login. Enquiry selection is session-local. WhatsApp links open a prefilled message; the customer sends it in WhatsApp. The app does not send WhatsApp messages automatically.

## Configuration

Production secrets are managed through Sites. `.env.example` documents the supported environment variables; neither credentials nor local runtime state is committed. ADMIN_EMAILS is a comma-separated server-side allowlist. CATALOG_SECRET must be 64 hex characters representing a 256-bit AES key. Optional Shopify/WooCommerce environment variables are a fallback to the encrypted admin connections.

Use Drizzle schema migrations; never apply runtime DDL. Hosting owns the actual D1 and R2 bindings; logical names are DB and BUCKET. Public access applies to the customer catalog while all admin reads/writes require an allowlisted signed-in identity. Dispatch must strip and inject authentication headers; do not expose the Worker directly behind an untrusted proxy that accepts arbitrary identity headers.

## Verification

`node node_modules/typescript/bin/tsc --noEmit`

`node scripts/verify-catalog.mjs`

`node <sites-plugin-root>/scripts/build-site.mjs`

The regression harness runs the actual adapter/sync/data functions against an in-memory SQLite implementation of the D1 interface and mocked HTTP source responses. It covers idempotent seed, price change detection, repeat synchronization, suppression, failed-sync history, preservation during source rejection, encrypted credential roundtrip, domain validation, Shopify/WooCommerce pagination and normalization, category index use, and synchronization locks. This is not proof of compatibility with a live merchant store.

Browser visual and mobile interaction QA, and WebMCP context validation, were unavailable in the authoring environment. The app exposes a feature-detected search_catalog WebMCP tool; it uses the same state as the visible search. Its runtime registration requires a supported browser.

## Optional features not implemented

Multi-client tenancy, scheduled/background sync, custom domains, advanced image CDN transforms, analytics, offline/PWA support and videos are not included. The present source/ID separation makes further adapters and designs possible without replacing the data model.

## Sample administrator login

The requested evaluation account uses ADMIN_DEMO_EMAIL and a salted PBKDF2-SHA256 password hash in the server runtime. The plain password is not included in the source. Successful email/password login creates a signed, eight-hour, HttpOnly, Secure, SameSite=Strict session cookie. Every admin API, upload and protected page checks the session server-side. Password changes invalidate existing sample sessions. Login has a database-backed per-IP limit of 10 attempts per 15 minutes. Sign out clears the sample session and ends any ChatGPT sign-in. The customer catalog remains public.
