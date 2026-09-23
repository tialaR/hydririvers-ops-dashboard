#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-61/components');
const referencePath = path.resolve(root, 'docs/governance/figma-freeze/page-61/m01-desktop-foundation-parity-review.png');
const baseUrl = process.env.PAGE61_STORYBOOK_URL || 'http://127.0.0.1:6106';
const policy = { perceptualThreshold: 0.20, perceptualNeighborRadius: 1, maxDiffRatio: 0.05, maxRmse: 0.09, geometryTolerancePx: 2 };
const components = [
  { name: 'Shipment Card / Selected Attention', storyId: 'page-61-shipment-card--selected-attention', selector: '[data-testid="page61-shipment-card"]', reference: { x:279, y:270, width:386, height:232 } },
  { name: 'Detail Tabs', storyId: 'page-61-detail-tabs--canonical', selector: '[data-testid="page61-detail-tabs"]', reference: { x:672, y:504, width:768, height:44 } },
  { name: 'Attention Panel', storyId: 'page-61-attention-panel--canonical-attention', selector: '[data-testid="page61-attention-panel"]', reference: { x:690, y:930, width:732, height:84 } }
];

await mkdir(evidenceDir, { recursive: true });
const frozen = await readFile(referencePath);
const browser = await chromium.launch({ headless: true });

try {
  const results = [];
  for (const item of components) {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    await page.goto(baseUrl + '/iframe.html?id=' + item.storyId + '&viewMode=story', { waitUntil: 'domcontentloaded' });
    const target = page.locator(item.selector).first();
    await target.waitFor({ state: 'visible', timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    const box = await target.boundingBox();
    if (!box) throw new Error(item.name + ': missing bounding box');

    const slug = item.storyId.replace(/[^a-z0-9-]+/gi, '-');
    const runtimePath = path.resolve(evidenceDir, slug + '-runtime.png');
    const referenceCropPath = path.resolve(evidenceDir, slug + '-reference.png');
    const diffPath = path.resolve(evidenceDir, slug + '-diff.png');
    await target.screenshot({ path: runtimePath, animations: 'disabled', caret: 'hide' });
    const runtime = await readFile(runtimePath);

    const cropPage = await browser.newPage({ viewport: { width: item.reference.width, height: item.reference.height } });
    const cropHtml = '<style>html,body{margin:0;overflow:hidden;background:#000}img{position:absolute;left:-' + item.reference.x + 'px;top:-' + item.reference.y + 'px;width:1440px;height:1024px;max-width:none}</style><img src="data:image/png;base64,' + frozen.toString('base64') + '">';
    await cropPage.setContent(cropHtml);
    await cropPage.screenshot({ path: referenceCropPath, animations: 'disabled', caret: 'hide' });
    const reference = await readFile(referenceCropPath);

    const diffPage = await browser.newPage({ viewport: { width: item.reference.width, height: item.reference.height } });
    await diffPage.setContent('<style>html,body{margin:0;background:#000}canvas{display:block}</style><canvas id="diff" width="' + item.reference.width + '" height="' + item.reference.height + '"></canvas>');

    const metrics = await diffPage.evaluate(async (args) => {
      const loadImage = (source) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('PNG decode failed'));
        image.src = 'data:image/png;base64,' + source;
      });
      const images = await Promise.all([loadImage(args.reference), loadImage(args.runtime)]);
      const refImage = images[0];
      const runImage = images[1];
      const canvas = document.createElement('canvas');
      canvas.width = args.width;
      canvas.height = args.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(refImage, 0, 0);
      const ref = context.getImageData(0,0,args.width,args.height).data;
      context.clearRect(0,0,args.width,args.height);
      context.drawImage(runImage,0,0);
      const run = context.getImageData(0,0,args.width,args.height).data;
      const diffCanvas = document.querySelector('#diff');
      const diffContext = diffCanvas.getContext('2d');
      const diffImage = diffContext.createImageData(args.width,args.height);
      let raw = 0;
      let perceptual = 0;
      let squared = 0;
      const yiq = (r1,g1,b1,r2,g2,b2) => {
        const dr=r1-r2, dg=g1-g2, db=b1-b2;
        const y=0.29889531*dr+0.58662247*dg+0.11448223*db;
        const i=0.59597799*dr-0.2741761*dg-0.32180189*db;
        const q=0.21147017*dr-0.52261711*dg+0.31114694*db;
        return Math.sqrt(0.5053*y*y+0.299*i*i+0.1957*q*q)/187.66;
      };
      for(let offset=0; offset<ref.length; offset+=4){
        const red=Math.abs(ref[offset]-run[offset]);
        const green=Math.abs(ref[offset+1]-run[offset+1]);
        const blue=Math.abs(ref[offset+2]-run[offset+2]);
        if(red!==0||green!==0||blue!==0) raw+=1;
        const pixelIndex = offset / 4;
        const x = pixelIndex % args.width;
        const y = Math.floor(pixelIndex / args.width);
        let distance=yiq(ref[offset],ref[offset+1],ref[offset+2],run[offset],run[offset+1],run[offset+2]);
        for(let dy=-args.radius; dy<=args.radius; dy+=1){
          for(let dx=-args.radius; dx<=args.radius; dx+=1){
            if(dx===0&&dy===0) continue;
            const cx=Math.max(0,Math.min(args.width-1,x+dx));
            const cy=Math.max(0,Math.min(args.height-1,y+dy));
            const co=(cy*args.width+cx)*4;
            distance=Math.min(distance,yiq(ref[offset],ref[offset+1],ref[offset+2],run[co],run[co+1],run[co+2]));
          }
        }
        squared+=distance*distance;
        const different=distance>args.threshold;
        if(different) perceptual+=1;
        diffImage.data[offset]=different?Math.min(255,red*3+60):Math.min(60,red);
        diffImage.data[offset+1]=different?Math.min(255,green*3):Math.min(60,green);
        diffImage.data[offset+2]=different?Math.min(255,blue*3):Math.min(60,blue);
        diffImage.data[offset+3]=255;
      }
      diffContext.putImageData(diffImage,0,0);
      const count=args.width*args.height;
      return { runtimeDimensions:{width:runImage.width,height:runImage.height}, rawDivergentPixels:raw, perceptualDivergentPixels:perceptual, perceptualDiffRatio:perceptual/count, perceptualRmse:Math.sqrt(squared/count) };
    }, { reference: reference.toString('base64'), runtime: runtime.toString('base64'), width:item.reference.width, height:item.reference.height, threshold:policy.perceptualThreshold, radius:policy.perceptualNeighborRadius });

    await diffPage.screenshot({ path: diffPath, animations:'disabled', caret:'hide' });
    const geometryPass=Math.abs(box.width-item.reference.width)<=policy.geometryTolerancePx && Math.abs(box.height-item.reference.height)<=policy.geometryTolerancePx;
    const visualPass=metrics.perceptualDiffRatio<=policy.maxDiffRatio && metrics.perceptualRmse<=policy.maxRmse;
    results.push({ name:item.name, storyId:item.storyId, selector:item.selector, reference:item.reference, runtimeBox:box, geometryPass, visualPass, pass:geometryPass&&visualPass, metrics, artifacts:{ reference:path.relative(root,referenceCropPath), runtime:path.relative(root,runtimePath), diff:path.relative(root,diffPath) } });
    await page.close(); await cropPage.close(); await diffPage.close();
  }

  const report={ gate:'PAGE61-STORYBOOK-VISUAL-v1', policy, status:results.every((result)=>result.pass)?'PASS':'FAIL', results };
  await writeFile(path.resolve(evidenceDir,'component-visual-result.json'), JSON.stringify(report,null,2)+'\n');
  for(const result of results){
    console.log((result.pass?'PASS ':'FAIL ') + result.name + ': geometry=' + (result.geometryPass?'PASS':'FAIL') + ' perceptual=' + (result.metrics.perceptualDiffRatio*100).toFixed(3) + '% rmse=' + result.metrics.perceptualRmse.toFixed(6));
  }
  process.exitCode=report.status==='PASS'?0:1;
} finally {
  await browser.close();
}
