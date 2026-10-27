# Add a client editor from the command line

Does what the Invite button on `/<owner>/<repo>/collaborators` does, for one
address on one `kingsburycreative` site, with no browser session. Run it on
the box as root, from the current release with the service's env file loaded:

```sh
ssh -i <key> root@<host> 'cd /srv/kc-cms/current && set -a && . /srv/kc-cms/shared/env && set +a && \
  node --import tsx scripts/add-editor.mts --repo kingsburycreative/<repo> --email <address> --name "<Full Name>" --dry-run'
```

Paths are the ones `server/deploy.sh` (kc-cms repo) sets up. `tsx` is a
runtime dependency, so `npm ci` installs it and `npm prune --omit=dev` keeps it.
Run once with `--dry-run` to see what it would do, then again without it.

- No account yet: creates the invite and sends the invite email.
- Has an account: adds them and sends the access email.
- Already invited or added: says so and sends nothing.
- Another owner, a bad address, or a repo the GitHub App is not installed on:
  refused, exit 1, nothing written or sent.

The email names "Kingsbury Creative" as the inviter. The script prints one
line and never the invite link.
