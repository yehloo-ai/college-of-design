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
const packageBodies = require(path.join(sourceRoot, 'package-articles/utils/bodies.js')).bodies;
const articleLayout = require(path.join(sourceRoot, 'utils/article-layout.js'));
const webAssets = (value) => String(value || '').replace(/([\"'])\/(assets|package-articles|package-audio|package-zaojing)\//g, '$1$2/');
const transcripts = { ...require(sourceFiles.transcripts), aiDesignWorkflow: require(path.join(sourceRoot, 'package-audio/utils/ai-design-workflow-transcript.js')), zaojing: require(path.join(sourceRoot, 'package-zaojing/utils/zaojing-transcript.js')) };

const relativeAsset = (value) => String(value || '').replace(/^\//, '');
const audioMeta = {
  au3: { src: 'audio/ai-stages-clean-v3.mp3' },
  au4: { src: 'audio/zaojing-clean-v3.mp3' },
  au1: {
    views: '3,260',
    src: 'audio/ai-role-clean-v3.mp3'
  },
  au2: {
    views: '2,480',
    src: 'audio/c-workflow-clean-v3.mp3'
  }
};

const articles = Object.fromEntries(
  Object.entries(data.articles).map(([id, article]) => [id, {
    ...article,
    cover: relativeAsset(article.cover),
    body: webAssets(article.sourcePackage ? (packageBodies[id] || '') : articleLayout.formatArticleBody(id, bodies[id] || ''))
  }])
);

const audio = Object.fromEntries(
  Object.entries(data.audioList).map(([id, item]) => [id, {
    ...item,
    cover: relativeAsset(item.cover),
    diagram: item.diagram ? { ...item.diagram, src: relativeAsset(item.diagram.src), thumbnail: relativeAsset(item.diagram.thumbnail) } : null,
    src: audioMeta[id]?.src || item.src,
    views: item.views || audioMeta[id]?.views || '0',
    transcript: transcripts[item.transcriptId] ? { ...transcripts[item.transcriptId], sourceMemoHtml: webAssets(transcripts[item.transcriptId].sourceMemoHtml) } : null
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

const featuredRefs = [
  { type: 'audio', id: 'au4' },
  { type: 'audio', id: 'au3' },
  { type: 'article', id: 'a17' }
];
const aiRefs = [
  { type: 'audio', id: 'au1' },
  { type: 'audio', id: 'au2' },
  { type: 'article', id: 'a9' },
  { type: 'practice', id: 'vibeCoding', title: '小程序 设计Coding 核心路径' },
  ...featuredRefs
];

const payload = {
  product: {
    name: 'AX设计成长助手',
    label: '设计知识平台',
    subtitle: 'UX 内容 · AI 专项 · 设计思维',
    heroImage: 'assets/home-editorial-header-clean.jpg'
  },
  articles,
  audio,
  practice,
  sections: {
    ai: aiRefs,
    ux: data.homeSections.ux.ids.map((id) => ({ type: 'article', id })),
    learn: data.homeSections.learn.ids.map((id) => ({ type: 'article', id }))
  },
  allSections: {
    ai: aiRefs,
    ux: data.sections.ux.items.map((id) => ({ type: 'article', id })),
    learn: data.sections.learn.items.map((id) => ({ type: 'article', id }))
  },
  featured: featuredRefs
};

const contentDir = path.join(siteRoot, 'content');
const assetTarget = path.join(siteRoot, 'assets');
fs.mkdirSync(contentDir, { recursive: true });
const ignoredFiles = new Set((JSON.parse(fs.readFileSync(path.join(sourceRoot, 'project.config.json'), 'utf8')).packOptions?.ignore || []).filter(rule => rule.type === 'file').map(rule => rule.value));
fs.cpSync(sourceFiles.assets, assetTarget, { recursive: true, filter: (src) => !ignoredFiles.has(path.relative(sourceRoot, src).split(path.sep).join('/')) });
for (const pack of ['package-articles', 'package-audio', 'package-zaojing']) {
  const from = path.join(sourceRoot, pack, 'assets');
  if (fs.existsSync(from)) fs.cpSync(from, path.join(siteRoot, pack, 'assets'), { recursive: true });
}

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
