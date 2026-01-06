#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Build a resume variant by merging base with overlay
 */
function buildVariant(variantName) {
  console.log(`🔨 Building variant: ${variantName}\n`);

  const basePath = path.join(__dirname, '..', 'resume', 'data.yaml');
  const variantPath = path.join(__dirname, '..', 'resume', 'variants', `${variantName}.yaml`);
  const distDir = path.join(__dirname, '..', 'dist');

  // Check if files exist
  if (!fs.existsSync(basePath)) {
    console.error('❌ Error: resume/data.yaml not found');
    process.exit(1);
  }

  if (!fs.existsSync(variantPath)) {
    console.error(`❌ Error: resume/variants/${variantName}.yaml not found`);
    console.log('\nAvailable variants:');
    const variantsDir = path.join(__dirname, '..', 'resume', 'variants');
    if (fs.existsSync(variantsDir)) {
      fs.readdirSync(variantsDir)
        .filter(f => f.endsWith('.yaml'))
        .forEach(f => console.log(`  - ${f.replace('.yaml', '')}`));
    }
    process.exit(1);
  }

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Use yq to merge YAML files
  const mergedYamlPath = path.join(distDir, `resume-${variantName}.yaml`);
  const mergedJsonPath = path.join(distDir, `resume-${variantName}.json`);
  
  try {
    console.log('📝 Merging base with variant using yq...');
    
    // Merge the two YAML files
    const mergeCmd = `yq eval-all 'select(fileIndex==0) * select(fileIndex==1)' "${basePath}" "${variantPath}"`;
    const mergedYaml = execSync(mergeCmd, { encoding: 'utf8' });
    
    // Save merged YAML
    fs.writeFileSync(mergedYamlPath, mergedYaml);
    console.log(`✅ Created ${path.basename(mergedYamlPath)}`);
    
    // Convert to JSON (filtering private fields)
    const resumeData = yaml.load(mergedYaml);
    
    // Filter private fields
    function filterPrivate(obj) {
      if (Array.isArray(obj)) {
        return obj.map(filterPrivate);
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
    
    const publicResume = filterPrivate(resumeData);
    fs.writeFileSync(mergedJsonPath, JSON.stringify(publicResume, null, 2));
    console.log(`✅ Created ${path.basename(mergedJsonPath)}`);
    
    // Generate markdown
    console.log('\n📄 Generating markdown...');
    const mdPath = path.join(distDir, `resume-${variantName}.md`);
    execSync(`node "${path.join(__dirname, 'generate-markdown.js')}" "${mergedJsonPath}" "${mdPath}"`, { stdio: 'inherit' });
    
    // Generate DOCX if Pandoc is available
    try {
      console.log('\n📝 Generating DOCX...');
      const docxPath = path.join(distDir, `resume-${variantName}.docx`);
      const templatePath = path.join(__dirname, '..', 'templates', 'reference.docx');
      
      if (fs.existsSync(templatePath)) {
        execSync(`pandoc "${mdPath}" -o "${docxPath}" --reference-doc="${templatePath}"`, { stdio: 'inherit' });
      } else {
        execSync(`pandoc "${mdPath}" -o "${docxPath}"`, { stdio: 'inherit' });
      }
      console.log(`✅ Created ${path.basename(docxPath)}`);
    } catch (err) {
      console.log('⚠️  Pandoc not available, skipping DOCX generation');
    }
    
    // Generate PDF if Pandoc + LaTeX available
    try {
      console.log('\n📕 Generating PDF...');
      const pdfPath = path.join(distDir, `resume-${variantName}.pdf`);
      execSync(`pandoc "${mdPath}" -o "${pdfPath}" --pdf-engine=xelatex`, { stdio: 'inherit' });
      console.log(`✅ Created ${path.basename(pdfPath)}`);
    } catch (err) {
      console.log('⚠️  LaTeX not available, skipping PDF generation');
    }
    
    console.log(`\n✨ Variant '${variantName}' built successfully!\n`);
    console.log('Generated files:');
    console.log(`  - dist/resume-${variantName}.json`);
    console.log(`  - dist/resume-${variantName}.md`);
    console.log(`  - dist/resume-${variantName}.docx (if Pandoc available)`);
    console.log(`  - dist/resume-${variantName}.pdf (if LaTeX available)`);
    
  } catch (error) {
    console.error('❌ Error building variant:', error.message);
    process.exit(1);
  }
}

// Get variant name from command line
const variantName = process.argv[2];

if (!variantName) {
  console.error('Usage: npm run build:variant <variant-name>');
  console.log('\nExample: npm run build:variant apple-ios');
  process.exit(1);
}

buildVariant(variantName);
