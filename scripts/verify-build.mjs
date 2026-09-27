import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const expectedPages = [
  'index.html',
  'home/about/index.html',
  'home/medical/index.html',
  'home/first/index.html',
  'home/access/index.html',
  'home/policy/index.html',
];

for (const page of expectedPages) await access(resolve('dist', page));

const home = await readFile(resolve('dist', 'index.html'), 'utf8');
const requiredText = ['京橋内科医院', 'お知らせ', '健診後フォロー専用枠のご案内', 'インフルエンザワクチン', '03-3567-8311'];
for (const text of requiredText) {
  if (!home.includes(text)) throw new Error(`Built home page is missing: ${text}`);
}

const builtPages = await Promise.all(expectedPages.map((page) => readFile(resolve('dist', page), 'utf8')));
if (builtPages.some((html) => html.includes('/wp-content/'))) throw new Error('Built pages still reference WordPress assets');
if (builtPages.some((html) => /<form\b/i.test(html))) throw new Error('Unexpected form found in the static validation site');
if (builtPages.some((html) => !html.includes('Google マップ: 京橋内科医院'))) {
  throw new Error('Every built page must include the Google Maps embed');
}
if (builtPages.some((html) => {
  const iframe = html.match(/<iframe\b[^>]*title="Google マップ: 京橋内科医院"[^>]*>/)?.[0];
  return !iframe?.includes('src="https://www.google.com/maps/embed') || html.includes('data-src=') || !html.includes('class="map-open-link"') || html.includes('class="map-poster"');
})) {
  throw new Error('Every page must display Google Maps by default without a fallback or activation step');
}

for (const [path, imageCount, layouts] of [
  ['home/about/index.html', 8, ['doctor-intro', 'clinic-gallery']],
  ['home/medical/index.html', 16, ['medical-factor', 'lifestyle-diagram', 'timeline-diagram']],
  ['home/access/index.html', 2, ['access-photos']],
]) {
  const html = builtPages[expectedPages.indexOf(path)];
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  if (!article || (article.match(/<img\b/g) || []).length !== imageCount || layouts.some((layout) => !article.includes(`class="${layout}"`))) {
    throw new Error(`Built page lost its original image layout: ${path}`);
  }
}

for (const [index, page] of expectedPages.slice(1).entries()) {
  if (!builtPages[index + 1].includes('class="page-banner"')) {
    throw new Error(`Built detail page is missing its banner: ${page}`);
  }
}

const accessPage = builtPages[expectedPages.indexOf('home/access/index.html')];
if (!accessPage.includes('google.com/maps/embed') || !accessPage.includes('Google マップ: 京橋内科医院')) {
  throw new Error('Built access page is missing the labelled Google Maps embed');
}
for (const service of ['Google Maps', 'Apple Maps', 'Yahoo!マップ']) {
  if (!accessPage.includes(service)) throw new Error(`Built access page is missing map service: ${service}`);
}

console.log(`Verified ${expectedPages.length} static pages, detail banners, map, and required home content.`);