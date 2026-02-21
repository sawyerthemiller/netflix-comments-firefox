(function () {
  'use strict';

  document.documentElement.style.setProperty('--comments-ok', 'yes');

  const DISQUS_SHORTNAME = 'www-netflix-com-1';

  function getNetflixId() {
    return (window.location.href.split('/')[4] || '').slice(0, 8);
  }

  function getPageTitle() {
    return (
      document.querySelector('[data-uia="video-title"]')?.textContent ||
      document.querySelector('.video-title')?.textContent ||
      document.querySelector('h4.previewModal--player-titleTreatmentContent')?.textContent ||
      document.querySelector('.title-logo')?.textContent ||
      document.title ||
      'Netflix'
    ).trim();
  }

  function buildDisqusConfig() {
    const id = getNetflixId();
    const title = getPageTitle();
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return {
      shortname: DISQUS_SHORTNAME,
      pageUrl: window.location.href,
      pageIdentifier: `${sanitizedTitle}-${id}`,
      pageTitle: title,
    };
  }

  function sendConfigToIframe(iframe) {
    const config = buildDisqusConfig();
    const send = () => {
      try {
        iframe.contentWindow.postMessage({ type: 'disqusConfig', data: config }, '*');
      } catch (_) { }
    };
    iframe.addEventListener('load', send);
    setTimeout(send, 800);
  }

  function createPanel() {
    const wrapper = document.createElement('div');
    wrapper.id = 'ncs-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 25vw;
      height: 100vh;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      background: #111;
      border-left: 1px solid #333;
      box-shadow: -4px 0 24px rgba(0,0,0,0.6);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #111;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
    `;

    const title = document.createElement('span');
    title.textContent = 'Comments';
    title.style.cssText = 'color:#e5e5e5; font-size:18px; font-weight:600; letter-spacing:0.2px;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.title = 'Close comments';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #aaa;
      font-size: 20px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 0;
      line-height: 1;
      transition: color 0.15s, background 0.15s;
    `;
    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.color = '#fff';
      closeBtn.style.background = '#333';
    });
    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.color = '#aaa';
      closeBtn.style.background = 'none';
    });
    closeBtn.addEventListener('click', () => closePanel(wrapper));

    header.appendChild(title);
    header.appendChild(closeBtn);
    wrapper.appendChild(header);

    const iframe = document.createElement('iframe');
    iframe.id = 'ncs-panel-iframe';
    iframe.src = browser.runtime.getURL('disqus.html');
    iframe.style.cssText = `
      flex: 1;
      width: 100%;
      border: none;
      background: #1a1a1a;
    `;

    wrapper.appendChild(iframe);
    return { wrapper, iframe };
  }

  function openPanel() {
    if (document.getElementById('ncs-wrapper')) return;
    const { wrapper, iframe } = createPanel();
    document.body.appendChild(wrapper);
    document.body.style.width = '75vw';
    document.body.style.overflowX = 'hidden';
    sendConfigToIframe(iframe);
  }

  function closePanel(wrapper) {
    const el = wrapper || document.getElementById('ncs-wrapper');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.style.width = '';
    document.body.style.overflowX = '';
  }

  function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'ncs-toggle-btn';
    btn.textContent = 'Comments';
    btn.style.cssText = `
      position: fixed;
      top: 45vh;
      right: 0;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      background: rgba(255,255,255,0.15);
      color: #fff;
      border: none;
      border-radius: 0;
      padding: 14px 8px;
      font-size: 13px;
      font-family: 'Segoe UI Supro', sans-serif;
      letter-spacing: 0.05em;
      cursor: pointer;
      z-index: 2147483646;
      transition: background 0.2s, color 0.2s;
      backdrop-filter: blur(4px);
    `;
    btn.addEventListener('mouseover', () => {
      btn.style.background = 'rgba(255,255,255,1)';
      btn.style.color = '#111';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = 'rgba(255,255,255,0.15)';
      btn.style.color = '#fff';
    });
    btn.addEventListener('click', () => {
      if (document.getElementById('ncs-wrapper')) {
        closePanel();
      } else {
        openPanel();
      }
    });
    return btn;
  }

  function loadExtensionElements() {
    if (document.getElementById('ncs-toggle-btn')) return;
    document.body.appendChild(createToggleButton());
  }

  function removeExtensionElements() {
    const btn = document.getElementById('ncs-toggle-btn');
    if (btn) btn.parentNode.removeChild(btn);
    closePanel();
  }

  let lastHref = location.href;

  const urlObserver = new MutationObserver(() => {
    if (location.href === lastHref) return;
    lastHref = location.href;

    const isWatch = new URL(location.href).pathname.split('/')[1] === 'watch';
    if (isWatch) {
      loadExtensionElements();
      const iframe = document.getElementById('ncs-panel-iframe');
      if (iframe) setTimeout(() => sendConfigToIframe(iframe), 1200);
    } else {
      removeExtensionElements();
    }
  });

  urlObserver.observe(document, { subtree: true, childList: true });

  function injectEventListeners() {
    if (document.getElementById('ncs-event-listeners')) return;
    const s = document.createElement('script');
    s.id = 'ncs-event-listeners';
    s.src = browser.runtime.getURL('eventListeners.js');
    (document.head || document.documentElement).appendChild(s);
  }

  if (location.pathname.split('/')[1] === 'watch') {
    loadExtensionElements();
    injectEventListeners();
  }
})();
