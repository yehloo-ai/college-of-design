import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '..');
const sourceRoot = path.resolve(process.argv[2] || process.env.DESIGNER_HUB_MINIPROGRAM || '');

if (!process.argv[2] && !process.env.DESIGNER_HUB_MINIPROGRAM) {
  console.error('Usage: node scripts/sync-miniprogram-content.mjs <designer-hub-miniprogram-path>');
  process.exit(1);
}

const sourceFiles = {
  data: path.join(sourceRoot, 'utils/data.js'),
  bodies: path.join(sourceRoot, 'utils/bodies.js'),
  transcripts: path.join(sourceRoot, 'utils/transcripts.js'),
  assets: path.join(sourceRoot, 'assets')
};

Object.values(sourceFiles).forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing mini-program source: ${filePath}`);
  }
});

const data = require(sourceFiles.data);
const bodies = require(sourceFiles.bodies).bodies;
const transcripts = require(sourceFiles.transcripts);

const relativeAsset = (value) => String(value || '').replace(/^\//, '');
const audioMeta = {
  au1: {
    views: '3,260',
    src: 'audio/AI时代下的角色重构.mp3'
  },
  au2: {
    views: '2,480',
    src: 'audio/C端工作流协同与业务增益体系构建.mp3'
  }
};

const articles = Object.fromEntries(
  Object.entries(data.articles).map(([id, article]) => [id, {
    ...article,
    cover: relativeAsset(article.cover),
    body: bodies[id] || ''
  }])
);

const audio = Object.fromEntries(
  Object.entries(data.audioList).map(([id, item]) => [id, {
    ...item,
    cover: relativeAsset(item.cover),
    src: audioMeta[id]?.src || item.src,
    views: audioMeta[id]?.views || '0',
    transcript: transcripts[item.transcriptId] || null
  }])
);

const practice = Object.fromEntries(
  Object.entries(data.practiceList).map(([id, item]) => [id, {
    ...item,
    cover: relativeAsset(item.cover),
    views: '5,680',
    href: 'slide/'
  }])
);

const payload = {
  product: {
    name: 'UX设计成长助手',
    label: '设计知识平台',
    subtitle: 'UX 内容 · AI 专项 · 设计思维',
    heroImage: 'assets/home-editorial-header-clean.jpg'
  },
  articles,
  audio,
  practice,
  sections: {
    ai: [
      { type: 'article', id: 'a9' },
      { type: 'practice', id: 'vibeCoding', title: '小程序 设计Coding 核心路径' },
      { type: 'audio', id: 'au1', title: 'AI 时代的组织与角色重构' },
      { type: 'audio', id: 'au2' }
    ],
    ux: data.homeSections.ux.ids.map((id) => ({ type: 'article', id })),
    learn: data.homeSections.learn.ids.map((id) => ({ type: 'article', id }))
  },
  allSections: {
    ai: [
      { type: 'article', id: 'a9' },
      { type: 'practice', id: 'vibeCoding' },
      { type: 'audio', id: 'au1' },
      { type: 'audio', id: 'au2' }
    ],
    ux: data.sections.ux.items.map((id) => ({ type: 'article', id })),
    learn: data.sections.learn.items.map((id) => ({ type: 'article', id }))
  },
  featured: [
    { type: 'audio', id: 'au1' },
    { type: 'audio', id: 'au2' },
    { type: 'article', id: 'a3' }
  ]
};

const contentDir = path.join(siteRoot, 'content');
const assetTarget = path.join(siteRoot, 'assets');
fs.mkdirSync(contentDir, { recursive: true });
fs.rmSync(assetTarget, { recursive: true, force: true });
fs.cpSync(sourceFiles.assets, assetTarget, { recursive: true });

const serialized = JSON.stringify(payload, null, 2)
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
fs.writeFileSync(
  path.join(contentDir, 'site-data.js'),
  `window.DESIGNER_HUB_DATA = ${serialized};\n`,
  'utf8'
);

console.log(JSON.stringify({
  articles: Object.keys(articles).length,
  audio: Object.keys(audio).length,
  practice: Object.keys(practice).length,
  assets: fs.readdirSync(assetTarget).length
}, null, 2));
