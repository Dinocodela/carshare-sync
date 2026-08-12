// AES-GCM encryption helpers for Instagram tokens at rest.
// Plaintext tokens are NEVER stored. Key comes from the SOCIAL_TOKEN_ENC_KEY secret.

export const KEY_VERSION = 1;

function b64encode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64decode(str: string): Uint8Array {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(): Promise<CryptoKey> {
  const raw = Deno.env.get("SOCIAL_TOKEN_ENC_KEY");
  if (!raw) throw new Error("SOCIAL_TOKEN_ENC_KEY is not configured");
  const keyBytes = b64decode(raw);
  if (keyBytes.length !== 32) {
    throw new Error("SOCIAL_TOKEN_ENC_KEY must be a base64-encoded 32-byte key");
  }
  return await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export interface EncryptedToken {
  token_ciphertext: string;
  token_iv: string;
  token_tag: string;
  key_version: number;
}

/**
 * Encrypt a token. WebCrypto appends the 16-byte auth tag to the ciphertext;
 * we split it out so ciphertext / iv / tag live in separate columns.
 */
export async function encryptToken(plaintext: string): Promise<EncryptedToken> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded),
  );

  const tag = sealed.slice(sealed.length - 16);
  const ciphertext = sealed.slice(0, sealed.length - 16);

  return {
    token_ciphertext: b64encode(ciphertext),
    token_iv: b64encode(iv),
    token_tag: b64encode(tag),
    key_version: KEY_VERSION,
  };
}

export async function decryptToken(row: {
  token_ciphertext: string;
  token_iv: string;
  token_tag: string | null;
}): Promise<string> {
  const key = await getKey();
  const ciphertext = b64decode(row.token_ciphertext);
  const tag = row.token_tag ? b64decode(row.token_tag) : new Uint8Array(0);

  const sealed = new Uint8Array(ciphertext.length + tag.length);
  sealed.set(ciphertext, 0);
  sealed.set(tag, ciphertext.length);

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64decode(row.token_iv) },
    key,
    sealed,
  );
  return new TextDecoder().decode(plain);
}
