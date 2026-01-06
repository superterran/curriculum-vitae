#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Release tool for creating variant-specific tags
 */
async function release() {
  console.log('🚀 Resume Release Tool\n');
  
  // Get current version from git tags
  let currentVersion;
  try {
    const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' }).trim().split('\n');
    currentVersion = tags[0] || 'v2026.1.0';
  } catch (err) {
    currentVersion = 'v2026.1.0';
  }
  
  console.log(`Current version: ${currentVersion}\n`);
  
  // Ask what kind of release
  console.log('What would you like to release?');
  console.log('1. Main resume (e.g., v2026.1.1)');
  console.log('2. Variant resume (e.g., v2026.1.1-apple)');
  console.log('3. List available variants');
  console.log('4. Cancel');
  
  const choice = await question('\nEnter choice (1-4): ');
  
  if (choice === '4') {
    console.log('❌ Cancelled');
    rl.close();
    process.exit(0);
  }
  
  if (choice === '3') {
    // List variants
    const variantsDir = path.join(__dirname, '..', 'resume', 'variants');
    console.log('\n📋 Available variants:');
    if (fs.existsSync(variantsDir)) {
      const variants = fs.readdirSync(variantsDir).filter(f => f.endsWith('.yaml'));
      variants.forEach(v => console.log(`  - ${v.replace('.yaml', '')}`));
    } else {
      console.log('  (none found)');
    }
    rl.close();
    return;
  }
  
  // Get new version
  const newVersion = await question('\nEnter new version (e.g., v2026.1.1): ');
  
  if (!newVersion.startsWith('v')) {
    console.error('❌ Version must start with "v"');
    rl.close();
    process.exit(1);
  }
  
  let tagName = newVersion;
  let variantName = null;
  
  if (choice === '2') {
    // Variant release
    variantName = await question('Enter variant name (e.g., apple-ios): ');
    tagName = `${newVersion}-${variantName}`;
    
    // Check if variant exists
    const variantPath = path.join(__dirname, '..', 'resume', 'variants', `${variantName}.yaml`);
    if (!fs.existsSync(variantPath)) {
      console.error(`❌ Variant '${variantName}' not found`);
      rl.close();
      process.exit(1);
    }
  }
  
  // Confirm
  console.log(`\n📦 Creating release: ${tagName}`);
  if (variantName) {
    console.log(`📋 Variant: ${variantName}`);
  }
  
  const confirm = await question('\nProceed? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    process.exit(0);
  }
  
  // Build
  console.log('\n🔨 Building...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    
    if (variantName) {
      execSync(`npm run build:variant ${variantName}`, { stdio: 'inherit' });
      
      // Check if there's a cover letter
      const coverPath = path.join(__dirname, '..', 'resume', 'cover-letters', `${variantName}.yaml`);
      if (fs.existsSync(coverPath)) {
        console.log('\n💌 Building cover letter...');
        execSync(`npm run build:cover ${variantName}`, { stdio: 'inherit' });
      }
    } else {
      execSync('npm run build:formats', { stdio: 'inherit' });
    }
    
  } catch (err) {
    console.error('❌ Build failed');
    rl.close();
    process.exit(1);
  }
  
  // Create git tag
  console.log(`\n🏷️  Creating git tag: ${tagName}`);
  const tagMessage = await question('Tag message (optional): ');
  
  try {
    if (tagMessage) {
      execSync(`git tag -a ${tagName} -m "${tagMessage}"`, { stdio: 'inherit' });
    } else {
      execSync(`git tag ${tagName}`, { stdio: 'inherit' });
    }
    
    console.log('\n✨ Release tag created!');
    console.log('\nNext steps:');
    console.log(`  git push origin ${tagName}  - Push tag to trigger GitHub release`);
    console.log('  git push --tags            - Push all tags');
    
  } catch (err) {
    console.error('❌ Failed to create tag');
    rl.close();
    process.exit(1);
  }
  
  rl.close();
}

release().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
