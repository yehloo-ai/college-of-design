# UX Design Growth Assistant

**Live site:** [yehloo-ai.github.io/college-of-design](https://yehloo-ai.github.io/college-of-design/)

This is the web-synchronized edition of the **UX Design Growth Assistant** WeChat Mini Program. It presents the actual content on desktop and mobile while preserving consistency across articles, audio, and hands-on learning modules.

## Current Content

- 17 design articles covering AI specialization, UX content, and design thinking.
- Two audio episodes, each with a summary, chapter list, and full transcript.
- One hands-on module, **"The Core Path to Launching a Mini Program with Vibe Coding,"** with 17 learning milestones.
- A responsive homepage, category lists, article reading, and audio playback.

## Content Synchronization

Website data is generated from the Mini Program content source:

```bash
node scripts/sync-miniprogram-content.mjs "/absolute/path/to/designer-hub-miniprogram"
```

The script reads the Mini Program's `utils/data.js`, the base and article subpackage bodies, and `utils/transcripts.js`; it then generates `content/site-data.js` and synchronizes cover images and in-article images.

## Related Pages

- [Vibe Coding Hands-on Module](https://yehloo-ai.github.io/college-of-design/slide/)
- [Knowledge OS](https://yehloo-ai.github.io/college-of-design/knowledge-os/)

## Technology

`Vanilla HTML / CSS / JS` · `GitHub Pages`
