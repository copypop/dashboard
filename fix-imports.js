const fs = require('fs');
const path = require('path');

const files = [
  'src/components/charts/EmailChart.tsx',
  'src/components/charts/SocialMediaChart.tsx',
  'src/components/charts/TrafficSourcesChart.tsx',
  'src/components/charts/WebsiteChart.tsx',
  'src/components/InsightsPanel.tsx',
  'src/services/insightService.ts',
  'src/store/dashboardStore.ts',
  'src/utils/dataProcessor.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix type imports
  content = content.replace(
    /import \{ ([^}]+) \} from '([^']+\/types\/dashboard)'/g,
    (match, imports, module) => {
      const typeImports = imports.split(',').map(i => i.trim()).join(', ');
      return `import type { ${typeImports} } from '${module}'`;
    }
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed imports in ${file}`);
});

console.log('All imports fixed!');