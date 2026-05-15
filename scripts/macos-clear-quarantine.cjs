#!/usr/bin/env node
// Quita cuarentena de macOS en carpetas del proyecto (evita fallo al ejecutar Vite).
const { execSync } = require('child_process');
const fs = require('fs');

if (process.platform !== 'darwin') process.exit(0);

for (const dir of ['node_modules', 'src', 'public']) {
  if (!fs.existsSync(dir)) continue;
  try {
    execSync(`xattr -cr ${JSON.stringify(dir)}`, { stdio: 'inherit' });
  } catch {
    // Ignorar si algún subárbol no permite escribir atributos extendidos.
  }
}
