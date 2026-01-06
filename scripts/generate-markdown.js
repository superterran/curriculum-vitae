#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

/**
 * Generate markdown from resume JSON
 */
function generateMarkdown(inputPath, outputPath) {
  // Default paths if not provided
  const jsonPath = inputPath || path.join(__dirname, '..', 'resume.json');
  const mdPath = outputPath || path.join(__dirname, '..', 'dist', 'resume.md');
  const templatePath = path.join(__dirname, '..', 'templates', 'resume.md.hbs');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: ${jsonPath} not found`);
    console.log('Run "npm run build" first to generate resume.json');
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: templates/resume.md.hbs not found');
    process.exit(1);
  }

  try {
    // Load resume data
    const resumeData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Register Handlebars helpers
    Handlebars.registerHelper('formatDate', function(dateString) {
      if (!dateString) return 'Present';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    });
    
    Handlebars.registerHelper('join', function(array, separator) {
      return array ? array.join(separator || ', ') : '';
    });
    
    // Load and compile template
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
    
    // Generate markdown
    const markdown = template(resumeData);
    
    // Ensure output directory exists
    const outputDir = path.dirname(mdPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write markdown file
    fs.writeFileSync(mdPath, markdown);
    console.log(`✅ Generated ${path.basename(mdPath)}`);
    
  } catch (error) {
    console.error('❌ Error generating markdown:', error.message);
    process.exit(1);
  }
}

// Get paths from command line args
const inputPath = process.argv[2];
const outputPath = process.argv[3];

generateMarkdown(inputPath, outputPath);
