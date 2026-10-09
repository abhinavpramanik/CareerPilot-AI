const fs = require('fs');
const path = require('path');
const dirs = ['skill-gap', 'settings', 'roadmap', 'resume', 'projects', 'profile', 'interview', 'career-analysis', 'ats-review'];
for (const dir of dirs) {
  const file = path.join('d:/CareerPilot AI/app', dir, 'layout.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import { Sidebar } from "@\/components\/layout\/Sidebar";/g, 'import { Sidebar, MobileNav } from "@/components/layout/Sidebar";');
    
    // Inject MobileNav right after <main ...>
    content = content.replace(/(<main[^>]*>)/g, '$1\n        <MobileNav user={session?.user} />');
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
