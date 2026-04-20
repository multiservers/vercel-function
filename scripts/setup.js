const fs = require('fs');
const path = require('path');

const relayFile = path.join(__dirname, '..', 'api', 'relay.ts');
let code = fs.readFileSync(relayFile, 'utf8');

const isPro = process.env.PRO_PLAN === 'true';

if (isPro) {
  code = code.replace(
    '// RUNTIME_CONFIG_PLACEHOLDER',
    'export const config = { maxDuration: 300 };'
  );
  console.log('Build: Serverless mode (Pro, 300s timeout)');
} else {
  code = code.replace(
    '// RUNTIME_CONFIG_PLACEHOLDER',
    "export const config = { runtime: 'edge' };"
  );
  console.log('Build: Edge mode (Hobby, 30s timeout)');
}

fs.writeFileSync(relayFile, code);
