(() => {
  const data = window.DESIGNER_HUB_DATA;
  const panel = document.getElementById('contentPanel');
  const backdrop = document.getElementById('panelBackdrop');
  const panelTitle = document.getElementById('panelTitle');
  const panelContent = document.getElementById('panelContent');
  const sectionNames = { ai: 'AI 专项', ux: 'UX 内容', learn: '设计思维' };

  if (!data) {
    document.querySelector('main').innerHTML = '<div class="empty-state">内容数据暂未加载，请稍后刷新。</div>';
    return;
  }

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function itemFromRef(ref) {
    const source = ref.type === 'article' ? data.articles : ref.type === 'audio' ? data.audio : data.practice;
    const item = source && source[ref.id];
    return item ? { ...item, type: ref.type, displayTitle: ref.title || item.title } : null;
  }

  function tagClass(item) {
    if (item.tag === 'AI 专项' || item.type === 'practice') return 'ai';
    if (item.tag === '设计思维') return 'learn';
    return 'ux';
  }

  function typeLabel(item) {
    if (item.type === 'audio') return '音频';
    return '文档';
  }

  function metric(item) {
    return item.type === 'audio' ? `${item.views} 收听` : `${item.views} 阅读`;
  }

  function secondaryMeta(item) {
    if (item.type === 'audio') return item.transcript?.durationText || item.duration;
    if (item.type === 'practice') return item.meta;
    return item.date;
  }

  function cardMarkup(ref) {
    const item = itemFromRef(ref);
    if (!item) return '';
    return `
      <button class="content-card" type="button" data-open-type="${item.type}" data-open-id="${item.id}">
        <span class="content-image-wrap">
          <img class="content-image" src="${escapeHtml(item.cover)}" alt="" loading="lazy">
          <span class="tag-label ${tagClass(item)} image-label">${typeLabel(item)}</span>
        </span>
        <span class="content-body">
          <span class="content-title">${escapeHtml(item.displayTitle)}</span>
          <span class="content-desc">${escapeHtml(item.desc)}</span>
          <span class="content-meta"><span>${escapeHtml(secondaryMeta(item))}</span><span class="metric">${escapeHtml(metric(item))}</span></span>
        </span>
      </button>`;
  }

  function featuredMarkup(ref) {
    const item = itemFromRef(ref);
    if (!item) return '';
    const title = item.coverTitle ? item.coverTitle.replace(/\n/g, '、') : item.displayTitle;
    return `
      <button class="featured-card" type="button" data-open-type="${item.type}" data-open-id="${item.id}">
        <img class="featured-image" src="${escapeHtml(item.cover)}" alt="" loading="eager">
        <span class="featured-scrim"></span>
        <span class="featured-content">
          <span class="labels"><span class="type-label">${typeLabel(item)}</span><span class="pick-label">精选推荐</span></span>
          <span class="featured-title">${escapeHtml(title)}</span>
          <span class="featured-desc">${escapeHtml(item.desc)}</span>
          <span class="featured-meta"><span>${escapeHtml(secondaryMeta(item))}</span><span>${escapeHtml(metric(item))}</span></span>
        </span>
      </button>`;
  }

  function renderHome() {
    document.getElementById('heroKicker').textContent = data.product.label;
    document.getElementById('hero-title').textContent = data.product.name;
    document.getElementById('heroSubtitle').textContent = data.product.subtitle;
    document.getElementById('heroImage').src = data.product.heroImage;
    document.getElementById('featuredGrid').innerHTML = data.featured.map(featuredMarkup).join('');
    document.getElementById('aiGrid').innerHTML = data.sections.ai.map(cardMarkup).join('');
    document.getElementById('uxGrid').innerHTML = data.sections.ux.map(cardMarkup).join('');
    document.getElementById('learnGrid').innerHTML = data.sections.learn.map(cardMarkup).join('');
  }

  function openPanel(title, html) {
    panelTitle.textContent = title;
    panelContent.innerHTML = html;
    panelContent.scrollTop = 0;
    panel.classList.add('open');
    backdrop.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
    document.getElementById('closePanel').focus({ preventScroll: true });
  }

  function closePanel() {
    const audio = panelContent.querySelector('audio');
    if (audio) audio.pause();
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('panel-open');
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }

  function openArticle(id, updateHash = true) {
    const item = data.articles[id];
    if (!item) return;
    if (updateHash) history.replaceState(null, '', `#article/${id}`);
    openPanel(item.title, `
      <article>
        <img class="detail-cover" src="${escapeHtml(item.cover)}" alt="">
        <div class="detail-wrap">
          <div class="detail-tags"><span class="tag-label ${tagClass({ ...item, type: 'article' })}">${escapeHtml(item.tag)}</span><span class="tag-label ux">免费</span></div>
          <h1 class="detail-title">${escapeHtml(item.title)}</h1>
          <p class="detail-desc">${escapeHtml(item.desc)}</p>
          <div class="detail-meta">${escapeHtml(item.date)} · ${escapeHtml(item.views)} 阅读</div>
          <div class="body-divider">正文</div>
          <div class="article-body">${item.body}</div>
        </div>
      </article>`);
  }

  function openAudio(id, updateHash = true) {
    const item = data.audio[id];
    if (!item) return;
    if (updateHash) history.replaceState(null, '', `#audio/${id}`);
    const transcript = item.transcript || {};
    const summaries = (transcript.summary || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('');
    const chapters = (transcript.chapters || []).map((chapter) => `
      <button class="chapter-button" type="button" data-seconds="${Number(chapter.seconds) || 0}">
        <span class="chapter-time">${escapeHtml(chapter.time)}</span>
        <span class="chapter-title">${escapeHtml(chapter.title)}</span>
        <span class="chapter-play">播放</span>
      </button>`).join('');
    const paragraphs = (transcript.paragraphs || []).map((paragraph) => `
      <div class="transcript-row"><span class="transcript-time">${escapeHtml(paragraph.start)}</span><p class="transcript-copy">${escapeHtml(paragraph.text)}</p></div>`).join('');

    openPanel(item.title, `
      <article>
        <div class="audio-hero">
          <img src="${escapeHtml(item.cover)}" alt="">
          <div class="audio-hero-copy">
            <span class="pick-label">音频内容</span>
            <h1>${escapeHtml(item.coverTitle || item.title).replace(/\n/g, '<br>')}</h1>
            <p>${escapeHtml(item.desc)}</p>
          </div>
        </div>
        <div class="detail-wrap">
          <div class="detail-meta">${escapeHtml(item.tag)} · ${escapeHtml(item.duration)} · ${escapeHtml(item.views)} 收听</div>
          <audio class="audio-player" controls preload="metadata" src="${escapeHtml(item.src)}"></audio>
          <section class="audio-block"><h2>内容摘要</h2><ul class="summary-list">${summaries}</ul></section>
          <section class="audio-block"><h2>章节目录</h2><div class="chapter-list">${chapters}</div></section>
          <details class="audio-block transcript"><summary>完整文字稿</summary><div class="transcript-body">${paragraphs}</div></details>
        </div>
      </article>`);

    panelContent.querySelectorAll('[data-seconds]').forEach((button) => {
      button.addEventListener('click', () => {
        const audio = panelContent.querySelector('audio');
        if (!audio) return;
        audio.currentTime = Number(button.dataset.seconds) || 0;
        audio.play().catch(() => {});
      });
    });
  }

  function openPractice(id) {
    const item = data.practice[id];
    if (item) location.href = item.href;
  }

  function openList(section, updateHash = true) {
    const refs = data.allSections[section] || [];
    const rows = refs.map((ref) => {
      const item = itemFromRef(ref);
      if (!item) return '';
      return `
        <button class="list-item" type="button" data-open-type="${item.type}" data-open-id="${item.id}">
          <img class="list-image" src="${escapeHtml(item.cover)}" alt="" loading="lazy">
          <span class="list-content">
            <span class="list-title">${escapeHtml(item.displayTitle)}</span>
            <span class="list-desc">${escapeHtml(item.desc)}</span>
            <span class="list-meta"><span>${typeLabel(item)} · ${escapeHtml(secondaryMeta(item))}</span><span>${escapeHtml(metric(item))}</span></span>
          </span>
        </button>`;
    }).join('');
    if (updateHash) history.replaceState(null, '', `#list/${section}`);
    openPanel(`${sectionNames[section]} · 全部内容`, `<div class="list-wrap"><p class="list-summary">${refs.length} 项内容</p>${rows}</div>`);
  }

  function openContent(type, id) {
    if (type === 'article') openArticle(id);
    if (type === 'audio') openAudio(id);
    if (type === 'practice') openPractice(id);
  }

  function scrollToSection(id, trigger) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('[data-scroll]').forEach((button) => button.classList.remove('active'));
    document.querySelectorAll(`[data-scroll="${id}"]`).forEach((button) => button.classList.add('active'));
    if (trigger) trigger.blur();
  }

  document.addEventListener('click', (event) => {
    const openTarget = event.target.closest('[data-open-type]');
    if (openTarget) {
      openContent(openTarget.dataset.openType, openTarget.dataset.openId);
      return;
    }
    const listTarget = event.target.closest('[data-list]');
    if (listTarget) {
      openList(listTarget.dataset.list);
      return;
    }
    const scrollTarget = event.target.closest('[data-scroll]');
    if (scrollTarget) scrollToSection(scrollTarget.dataset.scroll, scrollTarget);
  });

  document.getElementById('closePanel').addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  function openFromHash() {
    const match = location.hash.match(/^#(article|audio|list)\/(.+)$/);
    if (!match) return;
    if (match[1] === 'article') openArticle(match[2], false);
    if (match[1] === 'audio') openAudio(match[2], false);
    if (match[1] === 'list') openList(match[2], false);
  }

  window.addEventListener('hashchange', openFromHash);
  renderHome();
  openFromHash();
})();
