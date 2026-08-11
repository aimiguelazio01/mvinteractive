const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.vercel') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getFiles(fullPath, files);
    } else {
      files.push({
        path: fullPath.replace(/\\/g, '/'),
        size: stat.size,
        mb: (stat.size / 1048576).toFixed(2)
      });
    }
  }
  return files;
}

const all = getFiles('.');
all.sort((a, b) => b.size - a.size);

const csv = 'FilePath,SizeBytes,SizeMB\n' + all.map(f => `"${f.path}",${f.size},${f.mb}`).join('\n');
fs.writeFileSync('files_sizes.csv', csv);
console.log('done');
