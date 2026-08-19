# Lokalac

Lokalac is a multilingual Fresh 2 application for reporting and reviewing
local-community issues. It stores issue data in Deno KV and processed WebP
images in pluggable filesystem or S3 storage.

## Requirements

- Deno 2
- A writable filesystem for local development
- Managed Deno KV and AWS S3 for Deno Deploy

Install the locked dependencies:

```sh
deno install --frozen
```

## Configuration

Copy the example environment file and replace every authentication placeholder:

```sh
cp .env.example .env
```

| Variable                   | Purpose                                       | Default                 |
| -------------------------- | --------------------------------------------- | ----------------------- |
| `KV_STORAGE_DIR`           | Directory containing the Deno KV SQLite files | `data`                  |
| `UPLOAD_DIR`               | Directory containing processed issue images   | `upload`                |
| `IMAGE_STORAGE`            | Image backend: `filesystem` or `s3`           | Environment-dependent   |
| `UPLOAD_BUCKET`            | S3 bucket used for processed images           | Required for S3         |
| `AWS_REGION`               | Region containing the upload bucket           | Required for S3         |
| `UPLOAD_PREFIX`            | Optional S3 key prefix                        | Current Deploy timeline |
| `BASIC_AUTH_USERNAME`      | Username for protected administrative routes  | Required                |
| `BASIC_AUTH_PASSWORD_HASH` | Argon2id hash for the administrator password  | Required                |

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

Locally, issue records are stored below `KV_STORAGE_DIR`, and processed images
are stored below `UPLOAD_DIR`. On Deno Deploy, pathless `Deno.openKv()` uses the
managed database assigned to the current timeline, and images are stored in S3.
S3 keys are scoped by `DENO_TIMELINE`, keeping production, branch, and preview
uploads separate.

`deno task dev` runs migrations before starting the local server. On Deno
Deploy, configure `deno task migrate` as the pre-deploy command. Each migration
commits its mutations and completion marker atomically. Completed migrations are
safe to run again, and concurrent runners converge on the same state. Index
repair and failed image cleanup are explicit maintenance tasks:

```sh
deno task repair:indexes
deno task cleanup:images
```

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

The test suite uses in-memory or temporary KV databases, temporary upload
directories, and a mock S3 client. It covers authentication, submission
validation, persistence and pagination, upload confinement and cleanup,
translation parity, and migration recovery.

## Deno Deploy

Use the current Deno Deploy platform at `console.deno.com`:

1. Create an application from this GitHub repository using the Fresh preset.
2. Provision a managed Deno KV database and assign it to the application.
3. Create separate private S3 buckets for production and development uploads.
4. Run `deno deploy setup-aws --org <org> --app <app>` and grant each Deploy
   context access only to its corresponding bucket.
5. Set `UPLOAD_BUCKET` and `AWS_REGION` in the Production and Development
   contexts. `IMAGE_STORAGE=s3` is selected automatically on Deno Deploy.
6. Use `deno task build` as the build command and `deno task migrate` as the
   pre-deploy command.

The application refuses to start on Deno Deploy with filesystem image storage.
AWS SDK v3 obtains short-lived credentials from the configured cloud connection;
do not add long-lived AWS access keys to Deploy environment variables.

Pull requests use the Development context. Managed KV provides timeline-specific
databases, while `DENO_TIMELINE` provides the matching S3 prefix. Production
uses its own database timeline, bucket, and production-only IAM role.

For occasional local investigation against managed KV, use Deno's tunnel:

```sh
deno task --tunnel dev
```

The tunneled local database can be shared by developers. Normal development and
CI should therefore continue using local storage.

## Self-hosted deployment

Build the client and server bundles, then start the generated server bound to
the loopback interface:

```sh
deno install --frozen
deno task build
deno task migrate
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

## Backup and recovery

For Deno Deploy, enable managed KV continuous backup to a dedicated backup
bucket and enable S3 versioning on the image bucket. Record the deployed Git
revision with recovery documentation, and periodically verify restoration into a
non-production environment.

For a self-hosted installation, the KV database and uploads form one logical
dataset and must be backed up together.

The KV database and uploads form one logical dataset and must be backed up
together.

1. Stop the application to prevent database writes and image changes.
2. Copy the entire `KV_STORAGE_DIR`, including SQLite sidecar files.
3. Copy the entire `UPLOAD_DIR` into the same timestamped backup set.
4. Record the deployed Git revision with the backup.
5. Restart the application and verify `/issues` loads.

Use filesystem permissions and encrypted off-host storage appropriate for the
submitted issue data. Regularly test that backups can be restored.

### Self-hosted recovery

1. Stop the application.
2. Move the damaged storage directories aside; do not overwrite the only copy.
3. Restore both the KV and upload directories from the same backup set.
4. Restore the recorded application revision, or a compatible newer revision.
5. Confirm ownership and read/write permissions.
6. Run `deno task migrate`, start the application, then run
   `deno task repair:indexes` and `deno task cleanup:images`.
7. Verify issue listing, image loading, authentication, and a test submission
   before returning the service to traffic.

If startup reports a migration error, stop and preserve the restored data and
logs. Resolve the underlying filesystem, capacity, or data problem before
retrying; do not manually mark a migration as complete.
