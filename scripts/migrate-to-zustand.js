const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mappings
const importMappings = [
  {
    old: /import\s+{\s*useUser\s*}\s+from\s+['"]@\/context\/UserContext['"]/g,
    new: "import { useUser } from '@/stores/hooks'"
  },
  {
    old: /import\s+{\s*useEnhancedTheme\s*}\s+from\s+['"]@\/theme\/EnhancedThemeProvider['"]/g,
    new: "import { useEnhancedTheme } from '@/stores/hooks'"
  },
  {
    old: /import\s+{\s*useSettings\s*}\s+from\s+['"]@\/context\/SettingsContext['"]/g,
    new: "import { useSettings } from '@/stores/hooks'"
  },
  {
    old: /import\s+{\s*useDemo\s*}\s+from\s+['"]@\/context\/DemoContext['"]/g,
    new: "import { useDemo } from '@/stores/hooks'"
  },
  {
    old: /import\s+{\s*useAvatar\s*}\s+from\s+['"]@\/context\/UserContext['"]/g,
    new: "import { useAvatar } from '@/stores/hooks'"
  },
  {
    old: /import\s+{\s*useRoleGuard\s*}\s+from\s+['"]@\/context\/UserContext['"]/g,
    new: "import { useRoleGuard } from '@/stores/hooks'"
  },
  {
    old: /import\s+{\s*useHeadingColors\s*}\s+from\s+['"]@\/theme\/EnhancedThemeProvider['"]/g,
    new: "import { useHeadingColors } from '@/stores/hooks'"
  }
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/context/**',
  '**/stores/**',
  '**/scripts/**'
];

// Find all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: excludePatterns
});

console.log(`Found ${files.length} files to process`);

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  importMappings.forEach(mapping => {
    if (mapping.old.test(content)) {
      content = content.replace(mapping.old, mapping.new);
      hasChanges = true;
      totalReplacements++;
      console.log(`✓ Updated imports in ${file}`);
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log(`\n✅ Migration complete! Updated ${totalReplacements} imports`);
console.log('\nNext steps:');
console.log('1. Run "npm run build" to check for any TypeScript errors');
console.log('2. Test the application thoroughly');
console.log('3. Remove old context files when ready'); 