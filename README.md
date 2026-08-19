# Lokalac

Lokalac is a multilingual Fresh 2 application for reporting and reviewing
local-community issues. It stores issue data in Deno KV and processed WebP
images on the local filesystem.

## Requirements

- Deno 2
- A filesystem location writable by the application
- An HTTPS reverse proxy such as Caddy for production

Install the locked dependencies:

```sh
deno install --frozen
```

## Configuration

Copy the example environment file and replace every authentication placeholder:

```sh
cp .env.example .env
```

| Variable                   | Purpose                                       | Default  |
| -------------------------- | --------------------------------------------- | -------- |
| `KV_STORAGE_DIR`           | Directory containing the Deno KV SQLite files | `data`   |
| `UPLOAD_DIR`               | Directory containing processed issue images   | `upload` |
| `BASIC_AUTH_USERNAME`      | Username for protected administrative routes  | Required |
| `BASIC_AUTH_PASSWORD_HASH` | Argon2id hash for the administrator password  | Required |

The storage directory names should be relative to the application's working
directory. Environment variables override values loaded from `.env`. Local
environment files, database files, and uploads are excluded from Git.

Generate the password hash interactively so the plaintext password is neither a
command-line argument nor stored in shell history:

```sh
deno run -A scripts/hash-password.ts
```

Copy the resulting Argon2id string into `BASIC_AUTH_PASSWORD_HASH`. Basic Auth
credentials are only encoded in transit, so production administrative traffic
must use HTTPS.

## Storage and migrations

Issue records, indexes, categories, types, and community data are stored below
`KV_STORAGE_DIR`. Uploaded images are validated, converted to WebP, and stored
below `UPLOAD_DIR` in one directory per issue.

Migrations run automatically before the server starts. Each migration commits
its mutations and completion marker atomically. Completed migrations are safe to
run again, and concurrent application startups converge on the same state.
Startup also inspects and repairs issue secondary indexes.

Do not start an older application release against storage that has already been
migrated by a newer release unless that release explicitly documents rollback
compatibility.

## Development

After configuring `.env`, start the Vite development server:

```sh
deno task dev
```

The root URL redirects to `/issues`. Supported interface languages are Serbian
Latin, Serbian Cyrillic, and Hungarian.

## Tests and quality checks

Run the same checks enforced independently by CI:

```sh
deno fmt --check .
deno lint .
deno check
deno task test
deno task build
```

The test suite uses temporary KV databases and upload directories. It covers
authentication, submission validation, persistence and pagination, upload
confinement and cleanup, translation parity, and migration recovery.

## Deployment

Build the client and server bundles, then start the generated server bound to
the loopback interface:

```sh
deno install --frozen
deno task build
deno task start
```

Run those commands from the same working directory used to resolve the storage
paths. Persist `.env`, `KV_STORAGE_DIR`, and `UPLOAD_DIR` across deployments.
The process must have read/write access to both storage directories.

Terminate TLS with a reverse proxy and do not expose port 8000 publicly. A
minimal Caddy configuration is:

```caddyfile
lokalac.example.com {
	reverse_proxy 127.0.0.1:8000
}
```

Point the hostname to the server and expose only ports 80 and 443. After HTTPS
and every relevant subdomain have been verified, HSTS can be enabled:

```caddyfile
lokalac.example.com {
	header Strict-Transport-Security "max-age=31536000; includeSubDomains"
	reverse_proxy 127.0.0.1:8000
}
```

Only use `includeSubDomains` when every subdomain is permanently HTTPS-capable.

## Backup

The KV database and uploads form one logical dataset and must be backed up
together.

1. Stop the application to prevent database writes and image changes.
2. Copy the entire `KV_STORAGE_DIR`, including SQLite sidecar files.
3. Copy the entire `UPLOAD_DIR` into the same timestamped backup set.
4. Record the deployed Git revision with the backup.
5. Restart the application and verify `/issues` loads.

Use filesystem permissions and encrypted off-host storage appropriate for the
submitted issue data. Regularly test that backups can be restored.

## Recovery

1. Stop the application.
2. Move the damaged storage directories aside; do not overwrite the only copy.
3. Restore both the KV and upload directories from the same backup set.
4. Restore the recorded application revision, or a compatible newer revision.
5. Confirm ownership and read/write permissions.
6. Start the application. Startup migrations and index inspection run
   automatically.
7. Verify issue listing, image loading, authentication, and a test submission
   before returning the service to traffic.

If startup reports a migration error, stop and preserve the restored data and
logs. Resolve the underlying filesystem, capacity, or data problem before
retrying; do not manually mark a migration as complete.
