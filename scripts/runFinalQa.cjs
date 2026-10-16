/**
 * Comprehensive Final QA Pipeline Script for Wedding Film Story V3.2.2
 * Runs: TypeScript check -> Production Build -> Full Vitest Suite (90 tests) -> Summary Reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const artifactsDir = path.join(projectRoot, 'artifacts', 'final-qa');

if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

console.log('===============================================================');
console.log(' WEDDING FILM STORY V3.2.2 — COMPLETE FINAL QA RUN (PIPELINE) ');
console.log('===============================================================');

const results = {
  timestamp: new Date().toISOString(),
  steps: [],
  overallStatus: 'PASS',
};

function runStep(name, command) {
  console.log(`\n[PIPELINE] Running: ${name}...`);
  const startTime = Date.now();
  try {
    const stdout = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[PASS] ${name} (${duration}s)`);
    results.steps.push({ name, status: 'PASS', duration: `${duration}s`, output: stdout.slice(-1000) });
    return true;
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[FAIL] ${name} (${duration}s):`);
    const errorOutput = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + err.message;
    console.error(errorOutput);
    results.steps.push({ name, status: 'FAIL', duration: `${duration}s`, error: errorOutput.slice(-2000) });
    results.overallStatus = 'FAIL';
    return false;
  }
}

// 1. TypeScript Validation
const tsPass = runStep('1. TypeScript Validation', 'npx tsc -b');

// 2. Production Build
const buildPass = tsPass ? runStep('2. Production Build (Vite)', 'npx vite build') : false;

// 3. Complete Vitest Suite (90 Tests across 12 files)
const testPass = runStep('3. Complete Vitest Suite (90 Tests)', 'npx vitest run');

// Output summary log
console.log('\n===============================================================');
console.log(` FINAL QA PIPELINE RESULT: ${results.overallStatus}`);
console.log('===============================================================');

const summaryPath = path.join(artifactsDir, 'QA_PIPELINE_SUMMARY.json');
fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`Detailed pipeline summary written to: ${summaryPath}`);

if (results.overallStatus !== 'PASS') {
  process.exit(1);
}
