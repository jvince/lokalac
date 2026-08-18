# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno:
https://docs.deno.com/runtime/getting_started/installation

Then start the project in development mode:

```
deno task dev
```

This will watch the project directory and restart as necessary.

## Production HTTPS with Caddy

Administrative routes use HTTP Basic authentication. Basic authentication only
encodes credentials; it does not encrypt them. Production traffic must therefore
reach the application through HTTPS.

[Caddy](https://caddyserver.com/) can terminate TLS in front of the application,
automatically obtain and renew certificates, and redirect HTTP traffic to HTTPS.
Replace `lokalac.example.com` with a hostname whose DNS records point to the
server:

```caddyfile
lokalac.example.com {
	reverse_proxy 127.0.0.1:8000
}
```

Build the application and bind Deno only to the loopback interface so clients
cannot bypass Caddy and send credentials over plain HTTP:

```sh
deno task build
deno task start
```

Only Caddy's ports 80 and 443 should be exposed by the server firewall. Port 80
is needed for Caddy's automatic HTTP-to-HTTPS redirect and may also be used for
certificate validation; port 8000 must not be publicly reachable. Caddy sets
forwarding headers, including `X-Forwarded-Proto`, automatically. The
application must trust those headers only when the direct connection comes from
the trusted local reverse proxy.

After HTTPS has been verified and there is no need to serve the hostname over
plain HTTP, HTTP Strict Transport Security can be enabled:

```caddyfile
lokalac.example.com {
	header Strict-Transport-Security "max-age=31536000; includeSubDomains"
	reverse_proxy 127.0.0.1:8000
}
```

Only add `includeSubDomains` when every subdomain is permanently available over
HTTPS. Removing the header does not immediately undo a policy already cached by
browsers.
