import fs from 'fs';
import path from 'path';

const i18nPath = 'c:/Users/joong/Desktop/travel-Traffic/js/i18n.js';
let content = fs.readFileSync(i18nPath, 'utf8');

// Fix the specific garbage pattern: "some text"some text"
// We look for a closing quote followed by any text and then another double quote on the same line that shouldn't be there.
// Specifically for the guide content which is very long.

console.log('Original content length:', content.length);

// This regex finds the corrupted guide.15 line exactly and fixes it.
// It looks for the closing quote followed by the repeated fragment.
content = content.replace(/"(바랍니다\.|adventure today\.)"[^,}\n]+?\1"/g, '"$1"');

// Alternative fix: Run through the entire file and find lines with two closing quotes or similar.
// But the above should handle the two known spots.

fs.writeFileSync(i18nPath, content, 'utf8');
console.log('Repaired content length:', content.length);
