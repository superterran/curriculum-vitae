#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Reorder sections in the generated HTML to move volunteer-work after work-experience
 */
function reorderSections() {
  const htmlPath = path.join(__dirname, '..', 'dist', 'resume.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Error: dist/resume.html not found');
    process.exit(1);
  }

  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract the volunteer-work section
  const volunteerRegex = /(<div class="detail" id="volunteer-work">[\s\S]*?<\/div><\/div><\/div>)/;
  const volunteerMatch = html.match(volunteerRegex);
  
  if (!volunteerMatch) {
    console.log('⚠️  No volunteer section found to reorder');
    return;
  }
  
  const volunteerSection = volunteerMatch[1];
  
  // Remove volunteer section from its current location
  html = html.replace(volunteerRegex, '');
  
  // Find work-experience section and insert volunteer after it
  const workExperienceRegex = /(<div class="detail" id="work-experience">[\s\S]*?<\/div><\/div><\/div>)/;
  html = html.replace(workExperienceRegex, (match) => {
    return match + volunteerSection;
  });
  
  // Update navigation order - move volunteer-work link after work-experience
  const navVolunteerRegex = /(<li><a href="#volunteer-work">[\s\S]*?<\/a><\/li>)/;
  const navVolunteerMatch = html.match(navVolunteerRegex);
  
  if (navVolunteerMatch) {
    const navVolunteerLink = navVolunteerMatch[1];
    html = html.replace(navVolunteerRegex, '');
    
    const navWorkRegex = /(<li><a href="#work-experience">[\s\S]*?<\/a><\/li>)/;
    html = html.replace(navWorkRegex, (match) => {
      return match + navVolunteerLink;
    });
  }
  
  fs.writeFileSync(htmlPath, html);
  console.log('✅ Reordered sections: volunteer-work moved after work-experience');
}

reorderSections();
