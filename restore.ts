import fs from 'fs';
import path from 'path';

// Load backup
const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

// Restore files
Object.entries(backup.files).forEach(([filePath, content]) => {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(filePath, content as string);
});

console.log('Backup restored successfully!');
console.log(`Timestamp: ${backup.timestamp}`);
console.log('Restored files:');
Object.keys(backup.files).forEach(file => console.log(`- ${file}`));