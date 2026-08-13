import { hash, Variant } from "@felix/argon2";

if (Deno.args.length !== 0) {
  console.error(
    "Error: Passwords must not be passed as command-line arguments.",
  );
  console.error("Usage: deno run -A scripts/hash-password.ts");
  Deno.exit(1);
}

if (!Deno.stdin.isTerminal()) {
  console.error("Error: Run this command in an interactive terminal.");
  Deno.exit(1);
}

const encoder = new TextEncoder();
const passwordBytes: number[] = [];
const input = new Uint8Array(1);

await Deno.stdout.write(encoder.encode("Password: "));
Deno.stdin.setRaw(true);

try {
  while (await Deno.stdin.read(input) !== null) {
    const byte = input[0];

    if (byte === 3) {
      throw new Deno.errors.Interrupted();
    }

    if (byte === 10 || byte === 13) {
      break;
    }

    if (byte === 8 || byte === 127) {
      passwordBytes.pop();
    } else {
      passwordBytes.push(byte);
    }
  }
} finally {
  Deno.stdin.setRaw(false);
  await Deno.stdout.write(encoder.encode("\n"));
}

if (passwordBytes.length === 0) {
  console.error("Error: Password must not be empty.");
  Deno.exit(1);
}

const password = new TextDecoder().decode(new Uint8Array(passwordBytes));
console.log(await hash(password, { variant: Variant.Argon2id }));
