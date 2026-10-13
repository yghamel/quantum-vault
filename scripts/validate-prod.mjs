import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const errors = [];

function fail(msg) {
  errors.push(msg);
}

if (!existsSync(DIST)) {
  fail('dist/ directory missing - run pnpm build:prod first');
  report();
  process.exit(1);
}

if (!existsSync(join(DIST, 'index.html'))) {
  fail('dist/index.html missing - Capacitor webDir entry not emitted');
}

if (
  existsSync(join(DIST, 'index.html')) &&
  !/<meta http-equiv="Content-Security-Policy" content="[^"]*script-src (?:'|&#39;)self(?:'|&#39;)[;"]/.test(
    readFileSync(join(DIST, 'index.html'), 'utf8')
  )
) {
  fail('dist/index.html is missing its Content-Security-Policy meta tag');
}

if (existsSync(join(DIST, 'manifest.json'))) {
  fail(
    'dist/manifest.json present - extension manifest must not ship in Capacitor builds'
  );
}

const assetsDir = join(DIST, 'assets');
const jsBundles = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter(
      f => f.endsWith('.js') && statSync(join(assetsDir, f)).size > 0
    )
  : [];

if (jsBundles.length === 0) {
  fail('no non-empty JS bundles found in dist/assets/');
}

const sourceMaps = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter(f => f.endsWith('.map'))
  : [];
if (sourceMaps.length > 0) {
  fail(`source maps must not ship in the app bundle: ${sourceMaps.join(', ')}`);
}

const bundled = jsBundles
  .map(file => readFileSync(join(assetsDir, file), 'utf8'))
  .join('\n');

const bitcoinTestnetRef = '000000000933ea01ad0ee984209779ba';
const sepoliaRef = '11155111';
if (!bundled.includes(bitcoinTestnetRef)) {
  fail('Bitcoin testnet CAIP reference missing from production bundles');
}
if (!bundled.includes(sepoliaRef)) {
  fail('Ethereum Sepolia chain id missing from production bundles');
}

// Matches `legalPlaceholders` in src/lib/legal-content.ts.
const legalPlaceholderMarker = 'TO BE CONFIRMED';
if (bundled.includes(legalPlaceholderMarker)) {
  fail(
    `legal documents still contain "${legalPlaceholderMarker}" placeholders - fill legalPlaceholders in src/lib/legal-content.ts`
  );
}

function report() {
  if (errors.length === 0) {
    console.log(
      `validate:prod passed (Capacitor index.html with CSP, no extension manifest, no source maps, testnet refs present, no legal placeholders, ${jsBundles.length} JS bundle(s))`
    );
  } else {
    for (const e of errors) console.error(`ERROR: ${e}`);
  }
}

report();
if (errors.length > 0) process.exit(1);
