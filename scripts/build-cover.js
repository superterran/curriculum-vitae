#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Handlebars = require('handlebars');

/**
 * Build a cover letter from template and data
 */
function buildCoverLetter(letterName) {
  console.log(`💌 Building cover letter: ${letterName}\n`);

  const letterDataPath = path.join(__dirname, '..', 'resume', 'cover-letters', `${letterName}.yaml`);
  const templatePath = path.join(__dirname, '..', 'templates', 'cover.md.hbs');
  const baseDataPath = path.join(__dirname, '..', 'resume', 'data.yaml');
  const distDir = path.join(__dirname, '..', 'dist');

  // Check if files exist
  if (!fs.existsSync(letterDataPath)) {
    console.error(`❌ Error: resume/cover-letters/${letterName}.yaml not found`);
    console.log('\nAvailable cover letters:');
    const lettersDir = path.join(__dirname, '..', 'resume', 'cover-letters');
    if (fs.existsSync(lettersDir)) {
      fs.readdirSync(lettersDir)
        .filter(f => f.endsWith('.yaml'))
        .forEach(f => console.log(`  - ${f.replace('.yaml', '')}`));
    }
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: templates/cover.md.hbs not found');
    process.exit(1);
  }

  // Ensure dist directory
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  try {
    // Load base resume data for name, contact info, etc.
    const baseData = yaml.load(fs.readFileSync(baseDataPath, 'utf8'));
    
    // Load letter-specific data
    const letterData = yaml.load(fs.readFileSync(letterDataPath, 'utf8'));
    
    // Merge data (letter data takes precedence)
    const data = {
      ...baseData.basics,
      ...letterData,
      name: baseData.basics.name,
      email: baseData.basics.email,
      phone: baseData.basics.phone,
      location: baseData.basics.location
    };
    
    // Load and compile template
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
    
    // Generate markdown
    const markdown = template(data);
    const mdPath = path.join(distDir, `cover-${letterName}.md`);
    fs.writeFileSync(mdPath, markdown);
    console.log(`✅ Created ${path.basename(mdPath)}`);
    
    // Generate DOCX if Pandoc is available
    const { execSync } = require('child_process');
    try {
      console.log('\n📝 Generating DOCX...');
      const docxPath = path.join(distDir, `cover-${letterName}.docx`);
      execSync(`pandoc "${mdPath}" -o "${docxPath}"`, { stdio: 'inherit' });
      console.log(`✅ Created ${path.basename(docxPath)}`);
    } catch (err) {
      console.log('⚠️  Pandoc not available, skipping DOCX generation');
    }
    
    // Generate PDF if Pandoc + LaTeX available
    try {
      console.log('\n📕 Generating PDF...');
      const pdfPath = path.join(distDir, `cover-${letterName}.pdf`);
      execSync(`pandoc "${mdPath}" -o "${pdfPath}" --pdf-engine=xelatex`, { stdio: 'inherit' });
      console.log(`✅ Created ${path.basename(pdfPath)}`);
    } catch (err) {
      console.log('⚠️  LaTeX not available, skipping PDF generation');
    }
    
    console.log(`\n✨ Cover letter '${letterName}' built successfully!\n`);
    console.log('Generated files:');
    console.log(`  - dist/cover-${letterName}.md`);
    console.log(`  - dist/cover-${letterName}.docx (if Pandoc available)`);
    console.log(`  - dist/cover-${letterName}.pdf (if LaTeX available)`);
    
  } catch (error) {
    console.error('❌ Error building cover letter:', error.message);
    process.exit(1);
  }
}

// Get letter name from command line
const letterName = process.argv[2];

if (!letterName) {
  console.error('Usage: npm run build:cover <letter-name>');
  console.log('\nExample: npm run build:cover apple');
  process.exit(1);
}

buildCoverLetter(letterName);
