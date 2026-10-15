import {delivered} from './asset-delivery.js';
import {test,expect} from '@playwright/test';
import {galleryPhotos} from '../src/data/gallery.js';
import {selectedHomepagePhotoIds} from '../src/data/selectedPhotos.js';

test('real collection year counts, thumbnails and lightbox images',async({page,request})=>{
 test.setTimeout(120000);
 const years=[...new Set(galleryPhotos.map(p=>p.year))].sort((a,b)=>b-a);
 expect(galleryPhotos.length).toBe(234);expect(selectedHomepagePhotoIds.length).toBe(175);
 await page.goto('/gallery');await expect(page.locator('.year-card')).toHaveCount(years.length);
 for(const year of years){
  const photos=galleryPhotos.filter(p=>p.year===year);const card=page.locator(`a[href="/gallery/${year}"]`);
  await expect(card).toContainText(`${photos.length} photographs`);
  await page.goto(`/gallery/${year}`);await expect(page.locator('.photo-card')).toHaveCount(photos.length);
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src',delivered(photos[0].thumbnailSrc));
  await page.locator('.photo-card').first().click();await expect(page.locator('dialog img')).toHaveAttribute('src',delivered(photos[0].src));
  await expect.poll(()=>page.locator('dialog img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
  await page.keyboard.press('Escape');await page.goto('/gallery');
 }
 for(const p of galleryPhotos){const response=await request.get(delivered(p.thumbnailSrc));expect(response.status(),p.id).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');}
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'verification/gallery-with-photos.png',fullPage:true});
});

test('curated collage crossfades automatically and opens originals on desktop and mobile',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/');await page.getByRole('button',{name:'Pause slideshow'}).click();
 const tiles=page.locator('.memory-collage-grid.current .memory-tile');
 await expect(tiles).toHaveCount(6);
 const first=galleryPhotos.find(p=>p.id===selectedHomepagePhotoIds[0]);
 await expect(tiles.first().locator('img')).toHaveAttribute('src',delivered(first.thumbnailSrc));
 await tiles.first().click();await expect(page.locator('dialog img')).toHaveAttribute('src',delivered(first.src));await page.keyboard.press('Escape');
 await page.setViewportSize({width:1440,height:1000});await page.locator('.memory-collage').scrollIntoViewIfNeeded();
 await page.locator('.memory-collage').screenshot({path:'verification/homepage-collage-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('.memory-collage').scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.locator('.memory-collage').screenshot({path:'verification/homepage-collage-mobile.png'});
 await page.getByRole('button',{name:'Play slideshow'}).click();
 await expect(page.locator('.memory-collage-grid.incoming')).toHaveCount(1,{timeout:12000});
 expect(await page.locator('.memory-collage-grid.incoming').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('1.2s');
 await expect(tiles.first().locator('img')).toHaveAttribute('src',delivered(galleryPhotos.find(p=>p.id===selectedHomepagePhotoIds[6]).thumbnailSrc),{timeout:5000});
 await expect(page.locator('.memory-collage-grid.incoming')).toHaveCount(0);
});

test('offscreen and hidden collages do not circulate or prefetch',async({page})=>{
 await page.clock.install();
 const requests=[];page.on('request',r=>{if(r.url().includes('/images/gallery/'))requests.push(r.url())});
 await page.goto('/');await page.waitForLoadState('networkidle');
 await expect(page.locator('.brand img')).toHaveAttribute('src',delivered('/images/bhagavati-logo.svg'));
 const image=page.locator('.memory-collage-grid.current img').first();
 const src=await image.getAttribute('src'),baseline=requests.length;
 await page.clock.runFor(20000);
 await expect(image).toHaveAttribute('src',src);expect(requests.length).toBe(baseline);
 expect(requests.every(url=>/-thumb(?:\.|\.webp)/.test(url))).toBeTruthy();
 await page.locator('.memory-collage').scrollIntoViewIfNeeded();await page.waitForLoadState('networkidle');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
 const afterScroll=requests.length;await page.clock.runFor(20000);
 await expect(image).toHaveAttribute('src',src);expect(requests.length).toBe(afterScroll);
});
