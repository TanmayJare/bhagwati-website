# Assets for bhagwati-temple-assets

Bucket: `bhagwati-temple-assets` · Region: `eu-north-1` (Stockholm) · Prefix: `heritage/` · AWS profile: `bhagwati`.
Edit these non-secret values in `scripts/s3.config.json`.

## Prepare and inspect

```powershell
npm.cmd run assets:prepare
npm.cmd run assets:dry-run
```

Preparation targets an **80% reduction in total asset bytes compared with the original photographs plus other deployed assets**. This is a measured byte reduction, not “quality 80”. The duplicated sorted folder is not counted as additional original data. The output includes both viewing images and thumbnails. Existing WebP compression is retained when it already meets the target; adaptive compression is available if the target is missed. Originals and local public files are untouched. The annual PDF is preserved byte-for-byte, SVG remains vector, and unused MP4 files are excluded. Some formats cannot individually be made 80% smaller without damaging content; the target applies to the complete website asset package.

Inspect `s3-assets/manifest.json` for actual sizes and savings. Files in `s3-assets/files/` have content hashes in their names. `src/data/assetPaths.json` maps local paths to those immutable remote object names. The uploader uses the exact manifest, so previous unreferenced prepared outputs are not uploaded.

## Configure credentials locally

An IAM user is not itself a credential source. Use a local AWS shared profile, or a locally configured AWS SSO/role profile. No AWS CLI is required by the Node uploader. Never put credentials in source code, the bucket configuration, chat, or a `VITE_` variable.

For an IAM access-key profile, create `%USERPROFILE%\.aws\credentials` on your own computer with:

```ini
[bhagwati]
aws_access_key_id = YOUR_LOCAL_ACCESS_KEY_ID
aws_secret_access_key = YOUR_LOCAL_SECRET_ACCESS_KEY
# aws_session_token = YOUR_SESSION_TOKEN_IF_USING_TEMPORARY_CREDENTIALS
```

These are placeholders. Enter actual values only into your local credentials file. If you already use another configured shared profile, change `profile` in `scripts/s3.config.json` or set `AWS_PROFILE` when launching the uploader.

The upload profile needs these permissions (a bucket policy or explicit deny can still restrict access):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::bhagwati-temple-assets",
      "Condition": { "StringLike": { "s3:prefix": ["heritage/*"] } }
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::bhagwati-temple-assets/heritage/*"
    }
  ]
}
```

Optional `s3:GetBucketPublicAccessBlock` on the bucket allows the uploader to report that setting. Customer-managed KMS encryption, if required by the bucket, also needs appropriate KMS permissions. Uploading does not require delete permissions or permission to change bucket policies or ACLs.

## Upload

```powershell
npm.cmd run assets:upload
```

The uploader uses the official AWS SDK, checks local content hashes, lists existing objects, skips already-uploaded immutable keys, uploads missing objects with explicit content types and `Cache-Control: public, max-age=31536000, immutable`, and verifies newly uploaded sizes and cache metadata. It does not delete objects, alter bucket access, or set public ACLs. A resumable result is written to `s3-assets/upload-result.json`; rerunning skips completed uploads.

## Serve assets

An upload credential does not make objects readable by website visitors. Keep bucket access settings unchanged until delivery is chosen. Prefer CloudFront with Origin Access Control and a private bucket for edge caching that reduces S3 origin requests. Direct S3 delivery needs the intended objects to permit anonymous reads. The uploader checks an anonymous URL and reports its status; do not switch the app to a URL returning 403.

CloudFront delivery is configured in the tracked `.env` file:

```dotenv
VITE_ASSET_BASE_URL=https://d3r1rz9vzkap30.cloudfront.net/heritage
```

The CloudFront origin path is empty, so the base URL includes `/heritage`. Keep S3 private and grant CloudFront OAC read access via its bucket policy. `scripts/s3.config.json` uses the same delivery base URL for post-upload verification. Restart Vite and rebuild with `npm.cmd run build` after changing the domain. To use local assets instead, put an empty `VITE_ASSET_BASE_URL=` override in `.env.local`.

Images use normal cross-origin image display. The View PDF link uses CloudFront; the Download PDF link intentionally keeps the same-origin local PDF so the browser honours its `download` attribute without requiring cross-origin fetch/CORS. The original PDF is retained byte-for-byte. Add CORS only if later browser features actually require cross-origin fetch or canvas access.

## Request reduction

- Thumbnails for gallery cards and collage tiles; full images only when the viewer opens.
- Lazy image loading and asynchronous decoding.
- Collage circulation and preloading stop off-screen and in hidden tabs.
- Only the next visible set is preloaded, using the same URLs as the rendered images.
- Content-hashed names allow one-year immutable browser/CDN caching without stale replacements.
- CloudFront edge caching reduces requests reaching S3 across visitors; file compression alone reduces bytes, not request count.

Sources: [AWS cache expiration](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html), [AWS S3 request/origin behaviour](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorS3Origin.html).
