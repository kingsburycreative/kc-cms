# 60 result: stopped, the brief's cause does not match Next's source

No files changed. No tests added. No mutation run.

The brief says the clone of `request.nextUrl` picks up `https` from the forwarded proto while `initUrl` stays `http://localhost:3000`. Next 16.2.1 does not work that way.

- `resolve-routes.js:114-116`: `initUrl` takes its protocol from `socket.encrypted || x-forwarded-proto` and its host from `opts.hostname || 'localhost'`.
- `next-server.js:1132`: the URL the middleware sees is `${initProtocol}://${this.fetchHostname || 'localhost'}:${this.port}...`, and `initProtocol` is set from the same variable (`resolve-routes.js:121`).
- `adapter.js:105-153`: `request.url` and `request.nextUrl` both come from that URL, so they share one origin. Switching to `request.url` would send the same `https://localhost:3000` rewrite, and nothing would change.
- A relative rewrite will not work either: `adapter.js:287` parses it with `new NextURL`.

So the two origins can only differ in the host part (`opts.hostname`, the router server's, against `this.hostname`, the Next server's, for example `0.0.0.0` from `HOSTNAME`), or in the protocol if `x-forwarded-proto` changes between the two steps. I could not check which from here.

Next step: on the box, log `initURL` against `request.url` for one short address, or check `HOSTNAME` and the start command. Then re-brief with the cause that is actually seen.
