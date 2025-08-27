#!/usr/bin/env node

import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

console.log('🔐 Dashboard Password Hash Generator\n');
console.log('This tool will generate a SHA-256 hash of your password.');
console.log('The hash should be used in your .env file or Vercel environment variables.\n');

// Function to mask password input
function askPassword(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.on('data', function onData(char) {
      char = char.toString('utf8');
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          stdout.write('\n');
          process.exit();
          break;
        case '\u007f': // Backspace
        case '\b':
          password = password.slice(0, -1);
          stdout.clearLine();
          stdout.cursorTo(0);
          stdout.write(query + '*'.repeat(password.length));
          break;
        default:
          password += char;
          stdout.write('*');
          break;
      }
    });

    let password = '';
    stdout.write(query);
    stdin.setRawMode(true);
    stdin.resume();
  });
}

async function main() {
  // Get password
  const password = await askPassword('Enter your password: ');
  
  if (!password) {
    console.log('\n❌ Password cannot be empty!');
    process.exit(1);
  }
  
  // Confirm password
  const confirmPassword = await askPassword('Confirm your password: ');
  
  if (password !== confirmPassword) {
    console.log('\n❌ Passwords do not match!');
    process.exit(1);
  }
  
  // Generate hash
  const hash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
  
  console.log('\n✅ Password hash generated successfully!\n');
  console.log('Add this to your .env.local file:');
  console.log('─'.repeat(60));
  console.log(`VITE_DASHBOARD_PASSWORD_HASH=${hash}`);
  console.log('─'.repeat(60));
  
  console.log('\nOr add it to Vercel environment variables:');
  console.log('1. Go to your Vercel project settings');
  console.log('2. Navigate to Environment Variables');
  console.log('3. Add VITE_DASHBOARD_PASSWORD_HASH with the hash above');
  
  console.log('\n⚠️  Security Tips:');
  console.log('• Never share or commit this hash');
  console.log('• Use a strong password (16+ characters)');
  console.log('• Store the original password securely');
  console.log('• Rotate passwords every 90 days');
  
  rl.close();
  process.exit(0);
}

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});