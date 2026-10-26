# 60 result: stopped, no code changed

The brief's fix cannot work. Two places in the Next source show why.

1. `request.url` is normalized too. `spec-extension/request.js:50` stores `url: process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE ? url : nextUrl.toString()`, and the `url` getter (line 94) returns that value. So `new URL(request.url)` gives `https://localhost:3000`, the same as `nextUrl.clone()`. Line 42's `super(url)` keeps the raw URL only inside undici.
2. Even a raw `127.0.0.1` target gets turned back into localhost. `web/adapter.js:287-295` rebuilds the rewrite as a `NextURL`, which normalizes it to localhost. Its host then matches `request.nextUrl.host`, so the adapter writes the localhost URL back into `x-middleware-rewrite`. Nothing `proxy.ts` returns gets past that.

So the fix has to be in how the box starts Next, not in `proxy.ts`. My recommendation is to change kc-cms `server/deploy.sh` ExecStart from `-H 127.0.0.1` to `-H localhost`. The initUrl at `resolve-routes.js:116` then reads `https://localhost:3000`, which is the same origin the adapter writes, so the rewrite stays inside the app. I have not tested this. One more thing to check on the box: whether `localhost` resolves to `::1` there, which would change the address Next binds to. The other way is `experimental.trustHostHeader`, but that makes initUrl depend on the Host header, so it is riskier.

Files changed: none. Tests added: none. Mutation check: not run, because no code changed.
