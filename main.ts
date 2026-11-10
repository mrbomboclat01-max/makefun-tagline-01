import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Contest spec: UTF-8 text, 1–280 bytes, not only whitespace.
const MIN_BYTES = 1;
const MAX_BYTES = 280;

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const OUTPUT_FILE = 'entry.txt';

interface ValidationResult {
  ok: boolean;
  byteLength: number;
  error?: string;
}

/**
 * Counts the UTF-8 byte length of a string without allocating a Buffer.
 * @param text - The string to measure.
 */
function utf8ByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

/**
 * Checks that a tagline satisfies the contest's format rules.
 * Returns a result object rather than throwing so callers decide how to handle failures.
 * @param tagline - Candidate tagline string.
 */
function validateTagline(tagline: string): ValidationResult {
  const byteLength = utf8ByteLength(tagline);

  if (tagline.trim().length === 0) {
    return { ok: false, byteLength, error: 'tagline must not be only whitespace' };
  }
  if (byteLength < MIN_BYTES) {
    return { ok: false, byteLength, error: `tagline too short: ${byteLength} byte(s), minimum ${MIN_BYTES}` };
  }
  if (byteLength > MAX_BYTES) {
    return { ok: false, byteLength, error: `tagline too long: ${byteLength} bytes, maximum ${MAX_BYTES}` };
  }

  return { ok: true, byteLength };
}

/**
 * Writes the validated tagline to the contest output file.
 * Creates the output directory first so this works both inside and outside the grader container.
 * No trailing newline — the judge reads exactly the bytes written.
 * @param tagline - Already-validated tagline string.
 * @param outputDir - Directory that will receive entry.txt.
 */
function writeTagline(tagline: string, outputDir: string): void {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, OUTPUT_FILE), tagline, { encoding: 'utf8' });
}

/**
 * Entry point. Validates then writes the tagline, exiting with a non-zero code on any error
 * so the grader can distinguish a bad entry from a successful one.
 */
function main(): void {
  const tagline = 'Enter your agent. Climb the ranks. Claim the prize.';

  const result = validateTagline(tagline);
  if (!result.ok) {
    process.stderr.write(`Error: ${result.error}\n`);
    process.exit(1);
  }

  writeTagline(tagline, OUTPUT_DIR);
}

main();
