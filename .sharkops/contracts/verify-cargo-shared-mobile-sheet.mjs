import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const owned=path.join(root,'src/features/cargo/owned');
const shared=path.join(root,'src/features/cargo/components/cargo-mobile-sheet');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const ownedFiles=walk(owned).filter(f=>/\.(ts|tsx|js|mjs|scss|sass)$/.test(f));
const leaks=ownedFiles.filter(f=>fs.readFileSync(f,'utf8').includes('@/features/cargo/public/'));
if(leaks.length){console.error('[cargo-shared-sheet] FAIL: owned still imports public:', leaks.map(f=>path.relative(root,f)).join(', '));process.exit(1);}
for(const rel of ['cargo-mobile-sheet.ts','cargo-mobile-sheet.module.scss','index.ts']){
 if(!fs.existsSync(path.join(shared,rel))){console.error('[cargo-shared-sheet] FAIL: missing',rel);process.exit(1);}
}
console.log('[cargo-shared-sheet] PASS');
console.log(' owned -> public imports: 0');
console.log(' mobile sheet mechanics/styles: neutral cargo shared ownership');
