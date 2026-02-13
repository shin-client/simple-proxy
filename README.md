# A simple and lightweight CORS proxy service deployed on Cloudflare Workers.

## Usage

```
https://your-worker.your-subdomain.workers.dev?url=<TARGET_URL>
```

### Examples

```
https://test-proxy.iamneyk.workers.dev/?url=https://api.mangadex.org/manga?limit=100
```

## Deploy to Cloudflare Workers

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **Workers & Pages**
3. Click **Create Application** → **Workers**
4. Choose **Drag and drop your files**, upload `worker.js` from this repository, then click **Deploy**

If you want to deploy via Github, fork or clone this repository, then choose **Import a repository** in step 4.

## Notes

Cloudflare Workers free plan has a limit of 100,000 requests/day, but it may works fine even if you exceed this limit.a
