# Catalog Maker source handoff

Public site: https://catalog-maker-studio.swami1234.chatgpt.site

Admin: https://catalog-maker-studio.swami1234.chatgpt.site/admin/login

Demo email: `admin@gmail.com` · Password: `admin@123`

## Local setup

Use Node 24 and pnpm 11.25.0. Unzip, open a terminal in the extracted project directory, then run:

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
node scripts/setup-demo-env.mjs
pnpm exec wrangler d1 migrations apply DB --local --config wrangler.local.json --persist-to .wrangler/state
pnpm dev
```

Open http://localhost:5173. Use `/admin/login` for the demo account, or the local sign-in simulator with `seedy@sites.test`. The first catalog request creates 100 fictional sample products. Local D1/R2 data stays in `.wrangler/state`, separate from the deployed database. Do not run setup-demo-env again over existing secrets; changing CATALOG_SECRET prevents decrypting saved store connections.

For a local production build: `pnpm build`, then `pnpm start`. Wrangler prints its local URL. If its generated config requires a separate secrets file, copy `.dev.vars` to `dist/server/.dev.vars`; never commit either. The local sign-in simulator belongs to the development server; use the sample login when previewing the built Worker. Use localhost for local login cookies.

Verification:

```sh
node scripts/verify-catalog.mjs
node scripts/verify-admin-session.mjs
pnpm exec tsc --noEmit
```

## Hosting

This source retains the existing Sites project reference in `.openai/hosting.json`; the public deployment is already available. Hosting on another account requires a new hosting project and its own D1/R2 resources, migrated schema and runtime secrets. GitHub stores source; it does not host this Worker backend through GitHub Pages. Owner ChatGPT sign-in requires Sites dispatch. Other hosting should use the sample session login or replace owner identity integration with a trusted authentication provider.

## GitHub publishing

Once GitHub is connected, create a repository and push these files. Alternatively, after authenticating your own GitHub CLI, initialize this directory with `git init`, `git add .`, `git commit -m "Initial Catalog Maker source"`, then `gh repo create catalog-maker --public --source=. --remote=origin --push`. Choose private instead if desired. Review repository visibility before publishing.

## Package contents

Application source matches deployed commit `8c70dafdadf2ff25a068392ed7fbf2fdd780c175`. This handoff additionally includes SETUP.md, wrangler.local.json and the local demo environment generator. Generated compiler cache, dependencies, build output, credentials and local data are excluded. Install dependencies using the included lockfile. Existing license notices are retained.

See README.md and the accompanying system report for architecture, workflows, APIs, tests and current limitations.
