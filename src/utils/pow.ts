import { createSHA256 } from 'hash-wasm';

export interface StablePowOpts {
  difficulty: number;
  count: number;
}

export interface StablePoWResult {
  data: any;
  nonces: number[];
  hashes: number;
}

export async function solveStablePow(jsonData: any, opts: StablePowOpts): Promise<StablePoWResult> {
  const hasher = await createSHA256();
  const encoder = new TextEncoder();

  // 1. Pre-encode the static part of your data
  const jsonString = JSON.stringify(jsonData);
  const target = '0'.repeat(opts.difficulty);
  const nonces: StablePoWResult['nonces'] = [];
  let hashes = 0;

  for (let i = 0; i < opts.count; i++) {
    const prefix = encoder.encode(`${jsonString}${i}`);

    // 2. Create a buffer: [prefix bytes] + [space for nonce string]
    // We reserve 12 bytes for the nonce (enough for a large integer)
    const buffer = new Uint8Array(prefix.length + 12);
    buffer.set(prefix);

    let nonce = 0;
    while (true) {
      // 3. Manually write the nonce into the buffer as bytes
      // This is MUCH faster than `${prefix}${nonce}`
      const nonceStr = nonce.toString();
      const nonceLength = nonceStr.length;

      for (let j = 0; j < nonceLength; j++) {
        buffer[prefix.length + j] = nonceStr.charCodeAt(j);
      }

      // 4. Hash ONLY the used portion of the buffer
      hasher.init();
      hasher.update(buffer.subarray(0, prefix.length + nonceLength));
      const hash = hasher.digest();
      hashes++;

      if (hash.startsWith(target)) {
        nonces.push(nonce);
        break;
      }
      nonce++;

      // Safety: periodically yield every 50k iterations
      if (nonce % 50000 === 0) await new Promise((r) => setTimeout(r, 0));
    }
  }
  return { data: jsonData, hashes, nonces };
}

export async function verifyStablePow(
  result: StablePoWResult,
  opts: StablePowOpts,
): Promise<boolean> {
  const hasher = await createSHA256();
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(result.data);
  const target = '0'.repeat(opts.difficulty);

  if (result.nonces.length !== opts.count) {
    return false;
  }

  for (let i = 0; i < opts.count; i++) {
    const prefix = encoder.encode(`${jsonString}${i}${result.nonces[i]}`);
    hasher.init();
    hasher.update(prefix);
    const hash = hasher.digest();
    if (!hash.startsWith(target)) {
      return false;
    }
  }

  return true;
}
