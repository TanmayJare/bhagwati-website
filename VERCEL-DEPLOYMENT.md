# Deploy Shri Bhagavati Pratishthan on Vercel

The project is prepared for Vercel. Publication has not been started.

## Project settings

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | Repository root (contains package.json) |
| Node.js version | 22.x |
| Install command | npm ci |
| Build command | npm run build |
| Output directory | dist |
| Public asset base URL | https://d3r1rz9vzkap30.cloudfront.net/heritage |

The public CloudFront URL is already in `.env`. If setting it in Vercel's environment settings, use `VITE_ASSET_BASE_URL` with the exact URL above for Production and Preview. Never add AWS credentials to Vercel; uploading assets is a separate local workflow.

## Deploy from Git

1. Push the application source to a Git repository. Keep the generated asset map and `.env`; both contain public configuration only. Exclude original photo folders, `.aws`, prepared S3 files, test output and node_modules. `.gitignore` covers sensitive/local state; `.vercelignore` also excludes unneeded deployment source.
2. In Vercel, choose **Add New → Project**, then import the repository.
3. Confirm the settings in the table and choose **Deploy** when ready.
4. Check the homepage, direct visits to `/gallery/2007` and `/heritage`, Marathi language switching, the collage, full-size photos, and the report view/download buttons.

## Deploy from this local workspace

When ready to publish using the Vercel CLI, run from the project root:

```powershell
npx vercel
```

Authenticate and link/create the intended Vercel project. This creates a preview deployment. Once reviewed, publish production with `npx vercel --prod`. These commands have not been run automatically.

## Build and delivery

`vercel.json` supplies the Vite configuration, SPA rewrites and cache headers for Vite's content-hashed bundles. `package.json` pins the Node major version to 22.x. `npm run build` runs Vite and `scripts/finalize-build.mjs`.

With CloudFront enabled, the finalizer verifies that every gallery photo and thumbnail has a remote mapping, then excludes only the generated `dist/images/gallery` copy. Original files and `public/` remain intact locally. The deployment keeps the goddess favicon, cover assets and original PDF download. Normal viewing images and the navbar logo use CloudFront. This reduces the Vercel output from roughly 58 MB to a few MB.

To build an entirely local version, set `VITE_ASSET_BASE_URL=` in `.env.local` and ensure `public/images/gallery/` is available. The finalizer then keeps the local gallery.

The goddess logo and favicon use the original annual-report illustration via a self-contained SVG frame. Regenerate with `node scripts/create-goddess-logo.mjs`. After asset changes, run `npm run assets:prepare` and `npm run assets:upload` locally before building the frontend.

References: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
