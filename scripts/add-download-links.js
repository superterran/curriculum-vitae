#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

/**
 * Add download links to the generated HTML resume
 */
function addDownloadLinks() {
  const htmlPath = path.join(__dirname, '..', 'dist', 'resume.html');
  const yamlPath = path.join(__dirname, '..', 'resume', 'data.yaml');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Error: dist/resume.html not found');
    process.exit(1);
  }

  // Load config from YAML
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const resumeData = yaml.load(yamlContent);
  
  const enablePdf = resumeData._downloads?.pdf !== false;
  const enableDocx = resumeData._downloads?.docx !== false;
  const enableJson = resumeData._downloads?.json !== false;
  const enableMd = resumeData._downloads?.md !== false;
  
  if (!enablePdf && !enableDocx && !enableJson && !enableMd) {
    console.log('ℹ️  Download links disabled in config');
    return;
  }

  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Remove any existing download sections from previous runs
  html = html.replace(/<div class="download-links"[\s\S]*?<\/style>\s*\n/g, '');
  html = html.replace(/<hr>\s*<div class="download-section">[\s\S]*?<\/style>\s*\n/g, '');
  
  // Build primary PDF button
  let primaryButton = '';
  if (enablePdf) {
    primaryButton = '<a href="/resume.pdf" download class="download-btn-primary"><i class="icon icon-download"></i> Download PDF</a>';
  }
  
  // Build secondary format links
  const secondaryLinks = [];
  if (enableDocx) {
    secondaryLinks.push('<a href="/resume.docx" download class="download-link-secondary" title="Download DOCX">DOCX</a>');
  }
  if (enableJson) {
    secondaryLinks.push('<a href="/resume.json" download class="download-link-secondary" title="Download JSON">JSON</a>');
  }
  if (enableMd) {
    secondaryLinks.push('<a href="/resume.md" download class="download-link-secondary" title="Download Markdown">MD</a>');
  }
  
  const downloadSection = `
    <hr>
    <div class="download-section">
      <h4 class="text-center" style="margin-bottom: 10px; color: #666; font-size: 14px;">Download Resume</h4>
      <div class="download-links text-center">
        ${primaryButton}
        ${secondaryLinks.length > 0 ? `<div class="download-secondary">${secondaryLinks.join(' · ')}</div>` : ''}
      </div>
    </div>
    <style>
      .download-section {
        padding: 0 10px 10px;
      }
      .download-btn-primary {
        display: block;
        padding: 12px 16px;
        margin: 8px 0;
        background: #0366d6;
        color: white !important;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        font-size: 14px;
        transition: background 0.2s;
        text-align: center;
      }
      .download-btn-primary:hover {
        background: #0256c4;
        color: white !important;
      }
      .download-btn-primary i {
        margin-right: 6px;
      }
      .download-secondary {
        margin-top: 8px;
        font-size: 11px;
        color: #666;
      }
      .download-link-secondary {
        color: #0366d6;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
      }
      .download-link-secondary:hover {
        color: #0256c4;
        text-decoration: underline;
      }
      @media print {
        .download-section {
          display: none;
        }
      }
    </style>
  `;
  
  // Try to insert into the profile card sidebar after social-links section
  if (html.includes('class="social-links')) {
    // Insert after the social-links div closes (find the closing </div></div> pattern)
    html = html.replace(/(<div class="social-links[^>]*>[\s\S]*?<\/div>\s*<\/div>)/, '$1' + downloadSection);
  } else if (html.includes('class="profile-card"')) {
    // Fallback: insert before the closing tag of profile-card
    html = html.replace(/(<div class="[^"]*profile-card[^"]*"[\s\S]*?)(<\/div>\s*<\/section>)/, '$1' + downloadSection + '$2');
  } else {
    console.log('⚠️  Could not find profile card, trying alternate insertion');
    // Last resort: insert after first card
    html = html.replace(/(<div class="card profile-card"[\s\S]*?)(<\/div>\s*<\/section>)/, '$1' + downloadSection + '$2');
  }
  
  fs.writeFileSync(htmlPath, html);
  const formats = [];
  if (enablePdf) formats.push('PDF');
  if (enableDocx) formats.push('DOCX');
  if (enableJson) formats.push('JSON');
  if (enableMd) formats.push('MD');
  console.log(`✅ Added download links (${formats.join(', ')})`);
}

addDownloadLinks();
