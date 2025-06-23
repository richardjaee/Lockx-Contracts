#!/usr/bin/env node
/**
 * Simple gas report diff script.
 * Usage: node compare-gas.js <oldReport> <newReport>
 * Outputs markdown summarising differences.
 */
const fs = require('fs');

function parse(report) {
  const lines = report.split(/\r?\n/);
  const tableStart = lines.findIndex((l) => l.startsWith('·')); // hardhat-gas-reporter uses middot table lines
  if (tableStart === -1) return {};
  const entries = {};
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('·')) break;
    // example: ·  createLockboxWithETH     ·      241,546  ·              -  ·          -  ·          1  ·
    const parts = line.split('·').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const name = parts[0];
    const gas = parseInt(parts[1].replace(/[, ]/g, ''));
    entries[name] = gas;
  }
  return entries;
}

function diff(basePath, headPath) {
  const baseTxt = fs.readFileSync(basePath, 'utf8');
  const headTxt = fs.readFileSync(headPath, 'utf8');
  const baseGas = parse(baseTxt);
  const headGas = parse(headTxt);

  const names = new Set([...Object.keys(baseGas), ...Object.keys(headGas)]);
  let markdown = '| Function | Base | PR | Δ |%|\n|---|---|---|---|---|\n';
  names.forEach((fn) => {
    const oldGas = baseGas[fn] || 0;
    const newGas = headGas[fn] || 0;
    if (oldGas === 0 && newGas === 0) return;
    const delta = newGas - oldGas;
    const pct = oldGas === 0 ? 'n/a' : ((delta / oldGas) * 100).toFixed(2) + '%';
    const sign = delta > 0 ? '+' : '';
    markdown += `| ${fn} | ${oldGas || '-'} | ${newGas || '-'} | ${sign}${delta} | ${pct} |\n`;
  });
  return markdown;
}

if (process.argv.length < 4) {
  console.error('Usage: node compare-gas.js <base> <head>');
  process.exit(1);
}
console.log(diff(process.argv[2], process.argv[3]));
