(function () {
  'use strict';


  const TRUSTED_DOMAINS = [
    'github.io',
  ];

  function isTrustedCaller() {

    const cs = document.currentScript;
    if (cs && cs.src) {
      return isDomainTrusted(cs.src);
    }


    try {
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/https?:\/\/[^\s):]+/);
        if (match) {
          const url = match[0];
          if (isDomainTrusted(url)) return true;
        }
      }
    } catch (_) {}


    if (cs && !cs.src) return true;

    return false;
  }

  function isDomainTrusted(url) {
    try {
      const hostname = new URL(url).hostname;
      return TRUSTED_DOMAINS.some(function (domain) {
        return hostname === domain || hostname.endsWith('.' + domain);
      });
    } catch (_) {
      return false;
    }
  }

  const _origDocAdd = document.addEventListener.bind(document);
  const _origWinAdd = window.addEventListener.bind(window);
  const _origNavAdd = window.navigation
    ? window.navigation.addEventListener.bind(window.navigation)
    : null;


  try {
    const _safeOpen = window.open.bind(window);
    Object.defineProperty(window, 'open', {
      value: function (url, name, features) {
        if (!isTrustedCaller()) {
          return null;
        }
        return _safeOpen(url, name, features);
      },
      writable: false,
      configurable: false,
    });
  } catch (e) {

  }


  try {
    if (window.navigation) {
      Object.defineProperty(window, 'navigation', {
        value: window.navigation,
        writable: false,
        configurable: false,
      });
    }
  } catch (e) {

  }


  try {
    if (window.navigation && _origNavAdd) {
      Object.defineProperty(window.navigation, 'addEventListener', {
        value: function (type, handler, options) {
          if (type === 'navigate' && !isTrustedCaller()) {
            return;
          }
          return _origNavAdd(type, handler, options);
        },
        writable: false,
        configurable: false,
      });
    }
  } catch (e) {
  }


  console.log('BLK');
})();
