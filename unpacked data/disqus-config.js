(function () {
  'use strict';

  let disqusLoaded = false;

  function hideLoadingMsg() {
    const msg = document.getElementById('loading-msg');
    if (msg) msg.style.display = 'none';
  }

  function loadDisqusEmbed(config) {
    if (disqusLoaded && window.DISQUS) {
      window.disqus_config = function () {
        this.page.url = config.pageUrl;
        this.page.identifier = config.pageIdentifier;
        this.page.title = config.pageTitle;
        this.page.colorScheme = 'dark';
      };
      window.DISQUS.reset({ reload: true, config: window.disqus_config });
      hideLoadingMsg();
      return;
    }

    window.disqus_shortname = config.shortname;
    window.disqus_config = function () {
      this.page.url = config.pageUrl;
      this.page.identifier = config.pageIdentifier;
      this.page.title = config.pageTitle;
      this.page.colorScheme = 'dark';
    };

    const script = document.createElement('script');
    script.src = browser.runtime.getURL('disqus-embed.js');
    script.onload = () => {
      disqusLoaded = true;
      hideLoadingMsg();
    };
    script.onerror = () => {
      const msg = document.getElementById('loading-msg');
      if (msg) msg.textContent = 'Failed to load comments. Try reloading the extension.';
    };
    (document.head || document.body).appendChild(script);
  }

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'disqusConfig') {
      loadDisqusEmbed(event.data.data);
    }
  });
})();
