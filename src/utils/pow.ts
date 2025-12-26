import { hash, randomBytes } from 'crypto';
import { createSHA256 } from 'hash-wasm';
import jwt from 'jsonwebtoken';
import { LRUCache } from 'lru-cache';

import { tryCatch } from '@/utils/promises';

export interface StablePowOpts {
  d: number;
  c: number;
}

export interface StablePoWResult {
  challenge: string;
  data: any;
  nonces: number[];
  debug?: {
    hashes: number;
  };
}

export interface Challenge extends StablePowOpts {
  n: string;
}

const SECRET = 'very-secret-string';
const challengeNonceLength = 8;
const challengeExpirationInSeconds = 60;

const spentChallengesCache = new LRUCache<string, boolean>({
  max: 1000,
});

export function createChallenge() {
  const challenge = {
    d: 12,
    c: 50,
    n: randomBytes(challengeNonceLength).toString('hex'),
  } satisfies Challenge;
  return jwt.sign(challenge, SECRET, {
    expiresIn: challengeExpirationInSeconds,
    noTimestamp: true,
  });
}

export function verifyChallenge(challengeInput: string): Challenge {
  const [errorChallenge, challengeData] = tryCatch(() => jwt.verify(challengeInput, SECRET));
  if (errorChallenge) {
    throw new Error(errorChallenge.message);
  }

  const challenge = challengeData as Challenge;
  if (spentChallengesCache.has(challenge.n)) {
    throw new Error(`already spent`);
  }

  spentChallengesCache.set(challenge.n, true);

  return challenge;
}

export function parseChallenge(challenge: string): Challenge | null {
  return jwt.decode(challenge) as Challenge;
}

export async function solveStablePow(
  challenge: string,
  jsonData: any,
  opts: StablePowOpts,
): Promise<StablePoWResult> {
  const hasher = await createSHA256();
  const encoder = new TextEncoder();

  // 1. Pre-encode the static part of your data
  const jsonString = `${JSON.stringify(jsonData)}.${challenge}`;
  const nonces: StablePoWResult['nonces'] = [];
  let hashes = 0;

  for (let i = 0; i < opts.c; i++) {
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
      const hash = hasher.digest('binary');
      hashes++;

      if (checkLeadingZeros(hash, opts.d)) {
        nonces.push(nonce);
        break;
      }
      nonce++;

      // Safety: periodically yield every 50k iterations
      if (nonce % 50_000 === 0) await new Promise((r) => setTimeout(r, 0));
    }
  }
  return { challenge, data: jsonData, debug: { hashes }, nonces };
}

export function verifyStablePow(result: StablePoWResult, opts: StablePowOpts): boolean {
  const jsonString = `${JSON.stringify(result.data)}.${result.challenge}`;

  if (result.nonces.length !== opts.c) {
    return false;
  }

  for (let i = 0; i < opts.c; i++) {
    const digest = hash('sha256', `${jsonString}${i}${result.nonces[i]}`, 'buffer');
    if (!checkLeadingZeros(digest, opts.d)) {
      return false;
    }
  }

  return true;
}

function checkLeadingZeros(hash: Uint8Array, requiredBits: number): boolean {
  const bytesToCheck = Math.floor(requiredBits / 8);
  const remainingBits = requiredBits % 8;

  for (let i = 0; i < bytesToCheck; i++) {
    if (hash[i] !== 0) {
      return false;
    }
  }

  if (remainingBits > 0) {
    const nextByte = hash[bytesToCheck]!;
    if (nextByte >> (8 - remainingBits) !== 0) {
      return false;
    }
  }

  return true;
}
