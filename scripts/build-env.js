const fs = require('fs');
const path = require('path');

// Only process production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('Skipping environment injection for development (using hardcoded values)');
  return;
}

const envFile = path.join(__dirname, '../src/environments/environment.prod.ts');

// Check if file already has real values (avoid double processing)
if (fs.existsSync(envFile)) {
  const existingContent = fs.readFileSync(envFile, 'utf8');
  if (!existingContent.includes('${JWT_TOKEN}') && !existingContent.includes('${NEST_URL}')) {
    console.log('Production environment file already processed, skipping injection.');
    return;
  }
}

let content = fs.readFileSync(envFile, 'utf8');

content = content.replace(/\$\{JWT_TOKEN\}/g, process.env.JWT_TOKEN || '');
content = content.replace(/\$\{NEST_URL\}/g, process.env.NEST_URL || '');

fs.writeFileSync(envFile, content);
console.log('Environment variables injected into production:', {
  JWT_TOKEN: process.env.JWT_TOKEN ? 'SET' : 'NOT SET',
  NEST_URL: process.env.NEST_URL || 'NOT SET'
});