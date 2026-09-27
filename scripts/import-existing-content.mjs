import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const sourceDirectory = resolve(process.argv[2] || '../kmc-renewal-202609/content');
const outputDirectory = resolve('src/content/pages');
await mkdir(outputDirectory, { recursive: true });

const metadata = {
  about: ['医院紹介', '京橋内科医院の院長挨拶、診療姿勢、略歴、院内風景、提携医院をご案内します。'],
  medical: ['診療内容', '京橋内科医院の一般内科、生活習慣病、体調不良の相談、予防接種をご案内します。'],
  first: ['来院案内', '初診・再診時の持ち物、予約と診察順、個人情報保護についてご案内します。'],
  access: ['アクセス', '京橋内科医院の所在地と京橋駅、東京駅、宝町駅からの道順をご案内します。'],
  policy: ['プライバシーポリシー', '京橋内科医院の個人情報保護方針です。'],
};

const levelTwo = new Set([
  '院長ご挨拶', '診察とは皆さまと私との往復運動', '医院紹介', '提携医院紹介',
  '診療案内', '一般内科', '生活習慣病', '「なんとなく体調が悪い」とお悩みの方へ', '予防接種',
  '受診時のお持ち物', '予約について', '個人情報保護について', 'アクセス', '病院までの道のり',
]);
const levelThree = new Set([
  '略歴', '資格', '主な診療内容', '食習慣に関連する疾患', '運動習慣に関連する疾患',
  '喫煙に関連する疾患', '飲酒に関連する疾患', '当院での対応',
  '東京メトロ', 'JR（東京駅）', '都営地下鉄',
  '千代田区', '港区', '中央区', '文京区', '渋谷区', '新宿区', '江東区', '品川区', '大田区', '豊島区', '他',
]);

const clinicPhotos = [
  { path: 'legacy/20190407086.jpg', alt: '京橋内科医院が入る建物の外観', caption: '外観：昭和ビル別館4階に位置しております' },
  { path: 'legacy/20190407093.jpg', alt: '京橋内科医院の玄関', caption: '玄関：ビル1階にある看板が目印です' },
  { path: 'legacy/20190407031.jpg', alt: '京橋内科医院の受付', caption: '受付：来院時はまずこちらにお越し下さい' },
  { path: 'waiting-room.jpg', alt: '京橋内科医院の待合室', caption: '待合風景１：木目が特徴の落ち着いた空間です' },
  { path: 'legacy/20190407034.jpg', alt: '京橋内科医院の待合室', caption: '待合風景２：診察までゆっくりお待ちいただけます' },
  { path: 'consultation.jpg', alt: '京橋内科医院の診察室', caption: '診察室：清潔で開放感のある空間です' },
];
const clinicCaptions = new Set(clinicPhotos.map((photo) => photo.caption));
const clinicGallery = `<div class="clinic-gallery">\n\n${clinicPhotos.map((photo) => `<figure>\n\n![${photo.alt}](../../assets/site/${photo.path})\n\n<figcaption>${photo.caption}</figcaption>\n\n</figure>`).join('\n\n')}\n\n</div>`;
const imageSections = {
  aboutIntro: [
    '![京橋内科医院の院長挨拶に掲載された写真](../../assets/site/legacy/20190407093.jpg)',
    '![京橋内科医院の院長挨拶に掲載された写真](../../assets/site/legacy/20190407043.jpg)',
  ].join('\n'),
  access: `<div class="access-photos">\n\n${[
    '![京橋内科医院が入る建物](../../assets/site/legacy/20190407086-1.jpg)',
    '![京橋内科医院周辺の案内図](../../assets/site/legacy/20260110_145538000_ios.png)',
  ].join('\n\n')}\n\n</div>`,
};

const medicalFactors = {
  '食習慣に関連する疾患': [['03_obesity.png', '肥満'], ['04_overeating-1.png', '過食'], ['08_ckd.png', '慢性腎臓病'], ['12_genetics.png', '遺伝']],
  '運動習慣に関連する疾患': [['05_inactivity.png', '運動不足'], ['03_obesity.png', '肥満'], ['10_stress_a.png', 'ストレス']],
  '喫煙に関連する疾患': [['02_smoking.png', '喫煙'], ['09_copd-1.png', '慢性閉塞性肺疾患'], ['07_sleep_apnea.png', '睡眠時無呼吸'], ['14_cancer_risk.png', 'がんのリスク']],
  '飲酒に関連する疾患': [['01_alcohol.png', '飲酒'], ['13_disease-1.png', '疾患'], ['14_cancer_risk.png', 'がんのリスク']],
};
const lifestyleDiagram = 'e581a5e5bab7e4babae7949f100e5b9b4fainal_e3839ae383bce382b8_1_e794bbe5838f_0001.jpg';

function factorRow(title) {
  const icons = medicalFactors[title].map(([file, alt]) => `![${alt}](../../assets/site/legacy/${file})`).join('\n');
  return `<div class="medical-factor">\n\n### ${title}\n\n<div class="factor-icons">\n\n${icons}\n\n</div>\n\n</div>`;
}

const mapServiceLinks = `<nav class="map-service-links" aria-label="地図サービス">
  <a href="https://maps.app.goo.gl/NF3RKk3aTCTMRBB19">Google Maps はこちら ＞</a>
  <a href="https://maps.apple.com/?q=東京都中央区京橋2-8-21">Apple Maps はこちら ＞</a>
  <a href="https://map.yahoo.co.jp/search?lat=35.6774856&lon=139.7709429&q=東京都中央区京橋2-8-21">Yahoo!マップ はこちら ＞</a>
</nav>`;

const yaml = (value) => JSON.stringify(value);

function policyMarkdown(text) {
  const parts = text.replace(/\s+/g, ' ').trim().split(/(?=第\d+条（)/);
  return parts.map((part, index) => {
    if (index === 0) return part;
    const match = part.match(/^(第\d+条（[^）]+）)(.*)$/s);
    return match ? `## ${match[1]}\n\n${match[2].trim()}` : part;
  }).join('\n\n');
}

const requestedPages = process.argv.slice(3);
if (requestedPages.some((name) => !metadata[name])) throw new Error('Unknown page requested for import');

for (const [name, [title, description]] of Object.entries(metadata).filter(([pageName]) => !requestedPages.length || requestedPages.includes(pageName))) {
  const source = JSON.parse(await readFile(resolve(sourceDirectory, `${name}.json`), 'utf8'));
  const frontmatter = `---\ntitle: ${yaml(title)}\ndescription: ${yaml(description)}\nnavLabel: ${yaml(title)}\norder: ${Object.keys(metadata).indexOf(name) + 1}\nsource: ${yaml(source.Source)}\n---\n\n`;
  let body;

  if (name === 'policy') {
    body = policyMarkdown(source.TextBlocks[1]);
  } else {
    const chunks = [];
    for (const block of source.TextBlocks) {
      if (name === 'about' && clinicCaptions.has(block)) continue;
      if (name === 'about' && block === '診察とは皆さまと私との往復運動') {
        chunks.push('</div>', '<div class="doctor-images">', imageSections.aboutIntro, '</div>', '</div>');
      }
      if (levelTwo.has(block)) {
        chunks.push(`## ${block}`);
        if (name === 'about' && block === '院長ご挨拶') chunks.push('<div class="doctor-intro">', '<div class="doctor-copy">');
        if (name === 'about' && block === '医院紹介') chunks.push(clinicGallery);
      } else if (levelThree.has(block) || block.startsWith('▶')) {
        if (name === 'medical' && medicalFactors[block]) {
          chunks.push(factorRow(block));
        } else {
          if (name === 'medical' && block === '当院での対応') {
            chunks.push(`<figure class="lifestyle-diagram">\n\n![生活習慣病と健康人生の説明図](../../assets/site/legacy/${lifestyleDiagram})\n\n</figure>`);
          }
          chunks.push(`### ${block}`);
        }
      } else {
        if (name === 'medical' && block.startsWith('斜線部分の時期：')) {
          chunks.push(`<figure class="timeline-diagram">\n\n![治療時期と進行の説明図](../../assets/site/legacy/image.png)\n\n<figcaption>${block}</figcaption>\n\n</figure>`);
          continue;
        }
        chunks.push(block);
        if (name === 'access' && block.startsWith('〒104-0031')) {
          chunks.push(imageSections.access, mapServiceLinks);
        }
      }
    }
    body = chunks.join('\n\n');
  }

  await writeFile(resolve(outputDirectory, `${basename(name)}.md`), `${frontmatter}${body.trim()}\n`, 'utf8');
}

console.log(`Imported ${requestedPages.length || Object.keys(metadata).length} Markdown pages from ${sourceDirectory}`);