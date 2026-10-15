# Shri Bhagavati Pratishthan — Heritage Archive

Standalone bilingual React + Vite + Tailwind CSS site with React Router and Lucide. Original supplied files are retained in `bhagavati_heritage_website_updated/`.

## Run

```sh
npm install
npm run dev
npm run check
npm run build
npm run preview
```

On PowerShell systems that block npm.ps1, use `npm.cmd` in place of `npm`. Vercel: framework Vite, build `npm run build`, output `dist`. `vercel.json` includes SPA rewrites. No backend or secrets are needed. `dist` is a complete static build.

See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for the prepared deployment settings and preview/production workflow. Production uses CloudFront for gallery images and excludes their duplicate copies from `dist`.

## Edit content

- `src/data/siteContent.js`: bilingual informational content and published bank records.
- `src/data/committee.js`: all 15 members of the 2026 committee, transcribed from page 2.
- `src/data/publications.js`: publications and local PDFs under `public/documents`.
- `src/locales/en.json` and `mr.json`: interface and homepage translations.

## Add photographs

The supplied `bhagwati-assets` collection is imported into the gallery: 234 photographs across 10 available years, with 175 homepage selections. The complete collection provides gallery photographs; the sorted collection determines the homepage selection, matched to the originals by SHA-256. Originals remain untouched. WebP images (up to 1920px) and smaller thumbnails (up to 640px) are stored by year under `public/images/gallery/`. The gallery and homepage share these files. MP4 files are excluded from this photo-only archive. Folder years take precedence over dates in WhatsApp export filenames; captions only use year and event folder labels. Three sideways 2007 images have explicit orientation corrections in the importer; other camera orientation metadata is handled by the decoder.

To refresh after adding source assets, run `node scripts/import-gallery.mjs`, then `npm run check` and `npm run build`. This regenerates the manifest and selected IDs while preserving homepage display settings. Alternatively, add files manually to `public/images/gallery/<year>/` and entries to `src/data/gallery.js`:

```js
{ id: '2026-001', year: 2026, src: '/images/gallery/2026/photo-001.jpg',
  title: { en: 'Verified title', mr: 'पडताळलेले शीर्षक' },
  caption: { en: 'Verified caption', mr: 'पडताळलेला तपशील' } }
```

Add IDs in the desired order to `selectedHomepagePhotoIds` in `src/data/selectedPhotos.js`. The homepage resolves the master manifest and never copies files. Invalid IDs are ignored by the UI and flagged by `npm run check`. Set `homepagePhotoConfig.mode` to `carousel`, `grid`, or `collage`. Carousel settings cover autoplay, duration, fade/slide transition, arrows and indicators. It pauses on hover/focus, while the lightbox is open, and initially for reduced-motion users. A pause button is also provided.

The default is a six-photo editorial collage. It automatically changes sets after a 7-second hold, with a 1.2-second crossfade. Incoming photographs decode before the transition starts. The layout adapts to a two-column mobile composition. Clicking any tile opens its original gallery photo. Autoplay pauses while the lightbox is open, and a pause/play control is available. Reduced-motion users start with autoplay paused. Adjust `interval` and `fadeDuration` in the homepage configuration.

The gallery derives years and counts from actual manifest entries. Lightbox supports previous/next, left/right keys, Escape, touch swipe, zoom, native modal focus trapping and focus restoration. Images load lazily and missing files show an accessible fallback.

## Source notes

All six pages of the supplied report were read. The cover identifies establishment as 2001. Page 2 explicitly labels the 2026 committee and contains the subscription and bank information. Page 3 has different signatories, anniversary references and festival dates; these have not been used as current event announcements. Pages 4–6 preserve annual subscriptions/donations in the linked original report. No undocumented ancestral history is asserted.

Account number `0011300004709` and IFSC `JSBL0000007` were visually checked against page 2. The printed bank section does not explicitly identify the account holder, and current account status cannot be established from a historical booklet. Confirm these directly with the Pratishthan before public release or transferring funds.

## Verification

For asset compression, S3 upload, local credential setup and cache configuration, see [S3-SETUP.md](S3-SETUP.md). Run `npm run assets:prepare`, then `npm run assets:dry-run` to validate the upload package without contacting AWS. Run `npm run assets:upload` with the configured local profile to upload.

`npm run check` validates asset references, photo IDs and year folders, selected IDs, publication files, committee count and matching locale keys. `npm test` runs browser interaction checks using locally installed Microsoft Edge. PDF rendering tools are development dependencies; the deployed site only includes static assets and browser code.
