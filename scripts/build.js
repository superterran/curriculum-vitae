#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

/**
 * Recursively filter private fields (starting with _) from an object
 */
function filterPrivate(obj) {
  if (Array.isArray(obj)) {
    // First filter, then map - check for _name before removing private fields
    return obj
      .filter(item => {
        // If item has _name but no name, exclude it entirely
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          if (item._name && !item.name) {
            return false;
          }
        }
        return true;
      })
      .map(filterPrivate)
      .filter(item => {
        // After filtering private fields, ensure we have content
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return Object.keys(item).length > 0;
        }
        return true;
      });
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = filterPrivate(obj[key]);
      }
      return acc;
    }, {});
  }
  return obj;
}

/**
 * Main build function
 */
function build() {
  console.log('🔨 Building resume...\n');

  // Load YAML
  const yamlPath = path.join(__dirname, '..', 'resume', 'data.yaml');
  if (!fs.existsSync(yamlPath)) {
    console.error('❌ Error: resume/data.yaml not found');
    process.exit(1);
  }

  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const resumeData = yaml.load(yamlContent);

  // Extract private config
  const theme = resumeData._theme || 'jsonresume-theme-elegant';
  const domain = resumeData._domain;
  
  console.log(`📋 Theme: ${theme}`);
  if (domain) {
    console.log(`🌐 Domain: ${domain}`);
  }

  // Filter private fields
  const publicResume = filterPrivate(resumeData);

  // Ensure dist directory exists
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Write resume.json
  const jsonPath = path.join(__dirname, '..', 'resume.json');
  fs.writeFileSync(jsonPath, JSON.stringify(publicResume, null, 2));
  console.log('✅ Generated resume.json');

  // Copy to dist for archival
  fs.writeFileSync(path.join(distDir, 'resume.json'), JSON.stringify(publicResume, null, 2));
  console.log('✅ Copied to dist/resume.json');

  // Create CNAME if domain is specified
  if (domain) {
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'CNAME'), domain);
    console.log('✅ Created public/CNAME');
  }

  // Copy profile picture if it exists
  const publicDir = path.join(__dirname, '..', 'public');
  const profilePictures = ['me.png', 'me.jpg', 'me.jpeg'];
  for (const pic of profilePictures) {
    const picPath = path.join(publicDir, pic);
    if (fs.existsSync(picPath)) {
      fs.copyFileSync(picPath, path.join(distDir, pic));
      console.log(`✅ Copied ${pic} to dist/`);
    }
  }

  console.log('\n✨ Build complete!\n');
  console.log('Next steps:');
  console.log('  npm run build:formats  - Generate all output formats');
  console.log('  npm run validate       - Validate against JSONResume schema');
  console.log('  npm run serve          - Preview locally');
}

// Run build
build();
