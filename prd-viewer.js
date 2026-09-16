(async function () {
  const content = document.getElementById('prd-content');
  const toc = document.getElementById('toc');

  function showError() {
    content.innerHTML = '<div class="error-state"><strong>文档暂时无法加载</strong><p>你仍然可以打开 <a href="PRD.md">PRD Markdown 原文</a>。</p></div>';
    toc.innerHTML = '<span class="muted">目录加载失败</span>';
  }

  try {
    const response = await fetch('PRD.md');
    if (!response.ok) throw new Error('PRD request failed');
    if (!window.marked) throw new Error('Markdown renderer unavailable');

    const markdown = await response.text();
    content.innerHTML = window.marked.parse(markdown, { gfm: true, breaks: false });

    const usedIds = new Map();
    const headings = [...content.querySelectorAll('h1, h2, h3')];
    headings.forEach((heading) => {
      const base = heading.textContent.trim().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase() || 'section';
      const count = usedIds.get(base) || 0;
      usedIds.set(base, count + 1);
      heading.id = count ? `${base}-${count + 1}` : base;
    });

    toc.innerHTML = '';
    headings.filter((heading) => heading.tagName !== 'H3').forEach((heading) => {
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.className = heading.tagName === 'H1' ? 'toc-h1' : 'toc-h2';
      toc.appendChild(link);
    });

    if (window.mermaid) {
      const diagrams = [...content.querySelectorAll('pre code.language-mermaid')];
      diagrams.forEach((code) => {
        const diagram = document.createElement('div');
        diagram.className = 'mermaid';
        diagram.textContent = code.textContent;
        code.parentElement.replaceWith(diagram);
      });
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
      if (diagrams.length) await window.mermaid.run({ querySelector: '.mermaid' });
    }
  } catch (error) {
    showError();
  }
})();

