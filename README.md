# UX设计成长助手

**在线访问：** [yehloo-ai.github.io/college-of-design](https://yehloo-ai.github.io/college-of-design/)

这是“UX设计成长助手”微信小程序的网页同步版本，面向桌面端与移动端展示真实内容，并保持文章、音频与实践章节的一致性。

## 当前内容

- 10 篇设计文章，覆盖 AI 专项、UX 内容与设计思维
- 2 期音频，包含摘要、章节目录与完整文字稿
- 1 个“小程序 Vibe Coding 上线核心路径”实践章节，共 17 个学习节点
- 响应式首页、分类列表、文章阅读与音频播放

## 内容同步

网页数据由小程序内容源生成：

```bash
node scripts/sync-miniprogram-content.mjs "/absolute/path/to/designer-hub-miniprogram"
```

脚本会读取小程序的 `utils/data.js`、`utils/bodies.js` 与 `utils/transcripts.js`，生成 `content/site-data.js`，并同步公开展示所需素材。

## 相关页面

- [Vibe Coding 实践章节](https://yehloo-ai.github.io/college-of-design/slide/)
- [Knowledge OS](https://yehloo-ai.github.io/college-of-design/knowledge-os/)

## 技术

`Vanilla HTML / CSS / JS` · `GitHub Pages`
