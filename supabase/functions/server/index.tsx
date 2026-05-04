import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const adminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

app.get("/make-server-904542fc/health", (c) => c.json({ status: "ok" }));

app.post("/make-server-904542fc/signup", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    if (!email || !password || !fullName) {
      return c.json({ error: "Email, password, and full name are required." }, 400);
    }
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(password)
    ) {
      return c.json({ error: "Password must be 8+ characters with an uppercase letter and a special character." }, 400);
    }

    const supabase = adminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      // Email server is not configured for signup confirmation, so auto-confirm.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: { id: data.user?.id, email: data.user?.email, fullName } });
  } catch (err) {
    console.log(`Unexpected signup error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: "Sign up failed. Please try again." }, 500);
  }
});

app.post("/make-server-904542fc/check-email", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || typeof email !== "string") {
      return c.json({ error: "Email is required." }, 400);
    }
    const supabase = adminClient();
    const target = email.trim().toLowerCase();
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.log(`check-email listUsers error: ${error.message}`);
        return c.json({ error: error.message }, 500);
      }
      const found = data.users.some((u) => (u.email || "").toLowerCase() === target);
      if (found) return c.json({ exists: true });
      if (data.users.length < perPage) break;
      page += 1;
    }
    return c.json({ exists: false });
  } catch (err) {
    console.log(`Unexpected check-email error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: "Could not verify email." }, 500);
  }
});

Deno.serve(app.fetch);
