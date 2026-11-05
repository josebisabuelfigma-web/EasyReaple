// Crea (o reemplaza la clave de) un usuario del panel. Se corre en tu computador:
//   node --env-file=.env.local scripts/create-admin.mjs
// La contraseña se escribe por consola (no se ve ni queda en ningún archivo)
// y a la base de datos solo llega su hash (scrypt, igual que lib/auth.ts).
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Usa: node --env-file=.env.local scripts/create-admin.mjs");
  process.exit(1);
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function hashPassword(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, 64, (err, derived) =>
      err ? reject(err) : resolve(`scrypt$${salt.toString("base64")}$${derived.toString("base64")}`)
    )
  );
}

const username = (await ask("Usuario (sin espacios, mínimo 3 caracteres): ")).replace(/\s+/g, "");
if (username.length < 3 || username.length > 60) {
  console.error("El usuario debe tener entre 3 y 60 caracteres.");
  process.exit(1);
}
const email = (await ask("Correo de recuperación: ")).trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Correo no válido.");
  process.exit(1);
}
const password = await ask("Contraseña (mínimo 8 caracteres): ", { hidden: true });
const again = await ask("Repite la contraseña: ", { hidden: true });
if (password.length < 8 || password.length > 200) {
  console.error("La contraseña debe tener entre 8 y 200 caracteres.");
  process.exit(1);
}
if (password !== again) {
  console.error("Las contraseñas no coinciden.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const password_hash = await hashPassword(password);

const { data: existing, error: findError } = await supabase
  .from("app_users")
  .select("id")
  .eq("username_key", username.toLowerCase())
  .maybeSingle();
if (findError) {
  console.error("Error consultando la base de datos:", findError.message);
  process.exit(1);
}

const { error } = existing
  ? await supabase
      .from("app_users")
      .update({ email, password_hash, active: true, failed_attempts: 0, locked_until: null })
      .eq("id", existing.id)
  : await supabase.from("app_users").insert({ username, email, password_hash });

if (error) {
  console.error("No se pudo guardar:", error.message);
  process.exit(1);
}
console.log(existing ? `Listo: se actualizó la clave de «${username}».` : `Listo: usuario «${username}» creado.`);
