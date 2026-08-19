import { migrate } from "@/migrate.ts";
import migrations from "@/migrations.ts";
import { kv } from "@/services/kv.ts";

try {
  await migrate(migrations, kv);
} finally {
  kv.close();
}
