/**
 * ============================================================
 *  NavigationTracker v4.0
 *  - Proteção TOTAL contra sobrescrita por terceiros
 *  - Monitora TODAS as saídas de navegação do site
 *  - Enriquece URL final via includeParamNavigate()
 *  - Registra saídas via sendBeacon (fallback: fetch)
 *  - Deve ser o PRIMEIRO script no <head>
 * ============================================================
 */
const NavigationTracker = (function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // CONFIGURAÇÃO
  // ─────────────────────────────────────────────────────────
  const CONFIG = {
    trustedDomains: ['github.io'],

    // Endpoint que receberá o POST com os dados de saída
    // null = desativado (só dispara onExit)
    trackEndpoint: null,
    // Exemplo: trackEndpoint: 'https://meusite.com/api/track'

    // Parâmetros extras adicionados em TODA saída externa
    extraParams: {
      // affid : 'meu-id',
      // subid : 'presell-v1',
      // gclid : null,
    },

    onExit: function (data) {
      console.log('[NavigationTracker] EXIT', data);
    },

    debug: true,
  };

  // ─────────────────────────────────────────────────────────
  // ESTADO INTERNO
  // ─────────────────────────────────────────────────────────
  let _exitSent    = false;
  let _navLock     = false;
  let _lastVirtual = null;

  // ─────────────────────────────────────────────────────────
  // CAPTURA NATIVOS ANTES DE QUALQUER TERCEIRO
  // ─────────────────────────────────────────────────────────
  const _nativeDefineProp   = Object.defineProperty.bind(Object);
  const _nativeOpen         = window.open.bind(window);
  const _nativeHrefDesc     = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
  const _nativeHrefSet      = _nativeHrefDesc.set;
  const _nativeHrefGet      = _nativeHrefDesc.get;
  const _nativeAssignDesc   = Object.getOwnPropertyDescriptor(Location.prototype, 'assign');
  const _nativeAssign       = _nativeAssignDesc && _nativeAssignDesc.value;
  const _nativeReplaceDesc  = Object.getOwnPropertyDescriptor(Location.prototype, 'replace');
  const _nativeReplace      = _nativeReplaceDesc && _nativeReplaceDesc.value;
  const _nativePushState    = history.pushState.bind(history);
  const _nativeReplaceState = history.replaceState.bind(history);

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────
  function log() {
    if (CONFIG.debug) {
      console.log.apply(console, ['[NavigationTracker]'].concat(Array.prototype.slice.call(arguments)));
    }
  }

  function isDomainTrusted(url) {
    try {
      const hostname = new URL(url).hostname;
      return CONFIG.trustedDomains.some(function (d) {
        return hostname === d || hostname.endsWith('.' + d);
      });
    } catch (_) { return false; }
  }

  function isTrustedCaller() {
    const cs = document.currentScript;
    if (cs && cs.src) return isDomainTrusted(cs.src);
    try {
      const lines = ((new Error().stack) || '').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/https?:\/\/[^\s):]+/);
        if (m && isDomainTrusted(m[0])) return true;
      }
    } catch (_) {}
    if (cs && !cs.src) return true;
    return false;
  }

  function parseUrl(url) {
    try { return new URL(url, location.href); } catch (_) { return null; }
  }

  function isExternal(url) {
    const u = typeof url === 'string' ? parseUrl(url) : url;
    return !!(u && u.hostname && u.hostname !== location.hostname);
  }

  function resetExitSent() {
    _exitSent = false;
    _navLock  = false;
  }

  // ─────────────────────────────────────────────────────────
  // ★ FUNÇÃO CENTRAL DE ENRIQUECIMENTO DE URL
  //   Toda saída passa por aqui antes de navegar
  //   Customize os parâmetros em CONFIG.extraParams
  //   ou sobrescreva a função via NavigationTracker.setParamBuilder()
  // ─────────────────────────────────────────────────────────
  let _paramBuilder = function (url) {
    try {
      const u = new URL(url);

      // Adiciona cada parâmetro de CONFIG.extraParams
      Object.keys(CONFIG.extraParams).forEach(function (key) {
        const val = CONFIG.extraParams[key];
        if (val !== null && val !== undefined && val !== '') {
          u.searchParams.set(key, val);
        }
      });

      return u.toString();
    } catch (_) {
      return url; // se falhar, retorna URL original sem modificação
    }
  };

  function includeParamNavigate(url) {
    if (!url) return url;
    try {
      const enriched = _paramBuilder(String(url));
      log('includeParamNavigate:', url, '→', enriched);
      return enriched;
    } catch (_) {
      return url;
    }
  }

  // ─────────────────────────────────────────────────────────
  // ENVIO PARA ENDPOINT
  //   1. Tenta sendBeacon (não bloqueia navegação, ideal para unload)
  //   2. Fallback para fetch com keepalive (sobrevive ao unload)
  //   3. Fallback final para fetch simples
  // ─────────────────────────────────────────────────────────
  function trackExit(data) {
    if (!CONFIG.trackEndpoint) return;

    const payload = JSON.stringify(data);
    const endpoint = CONFIG.trackEndpoint;

    // Tenta sendBeacon primeiro — mais confiável durante unload
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        const sent = navigator.sendBeacon(endpoint, blob);
        if (sent) {
          log('trackExit via sendBeacon ✅');
          return;
        }
        log('sendBeacon retornou false — tentando fetch');
      } catch (e) {
        log('sendBeacon falhou — tentando fetch:', e);
      }
    }

    // Fallback: fetch com keepalive (sobrevive ao unload da página)
    try {
      fetch(endpoint, {
        method    : 'POST',
        headers   : { 'Content-Type': 'application/json' },
        body      : payload,
        keepalive : true,       // mantém request mesmo após navegação
      })
      .then(function () { log('trackExit via fetch keepalive ✅'); })
      .catch(function (e) {
        // Fallback final: fetch simples sem keepalive
        log('fetch keepalive falhou — tentando fetch simples:', e);
        fetch(endpoint, {
          method  : 'POST',
          headers : { 'Content-Type': 'application/json' },
          body    : payload,
        }).catch(function (e2) {
          log('trackExit falhou completamente:', e2);
        });
      });
    } catch (e) {
      log('trackExit fetch error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────
  // DISPARO DO EVENTO DE SAÍDA
  //   1. Enriquece a URL via includeParamNavigate()
  //   2. Envia para endpoint via trackExit()
  //   3. Dispara o callback onExit com os dados
  //   4. Retorna a URL final enriquecida
  // ─────────────────────────────────────────────────────────
  function fireExit(url, trigger) {
    const finalUrl = includeParamNavigate(url);

    if (!_exitSent) {
      const u = parseUrl(finalUrl);
      if (isExternal(u)) {
        _exitSent = true;

        const data = {
          trigger     : trigger,
          destination : finalUrl,
          original    : url,
          from        : location.href,
          timestamp   : Date.now(),
        };

        // 1. Envia para endpoint (sendBeacon → fetch keepalive → fetch)
        trackExit(data);

        // 2. Dispara callback customizado
        try { CONFIG.onExit(data); } catch (e) { log('onExit error:', e); }
      }
    }

    return finalUrl; // URL enriquecida para uso imediato na navegação
  }

  // ─────────────────────────────────────────────────────────
  // PROTEÇÃO GENÉRICA com getter/setter trap
  // ─────────────────────────────────────────────────────────
  function protectMethod(obj, prop, wrappedFn, label) {
    let _current = wrappedFn;
    try {
      _nativeDefineProp(obj, prop, {
        get: function () { return _current; },
        set: function (fn) {
          if (isTrustedCaller()) {
            log(label + ' sobrescrito por domínio confiável');
            _current = fn;
          } else {
            log(label + ' sobrescrita BLOQUEADA por terceiro');
          }
        },
        configurable: true,
      });
      log(label + ' protegido ✅');
    } catch (e) {
      log('Falha ao proteger ' + label + ':', e);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 1. window.open
  // ─────────────────────────────────────────────────────────
  protectMethod(window, 'open', function (url, name, features) {
    const finalUrl = fireExit(url, 'window_open');
    return _nativeOpen(finalUrl, name, features);
  }, 'window.open');

  // ─────────────────────────────────────────────────────────
  // 2. location.href
  // ─────────────────────────────────────────────────────────
  let _currentHrefSet = function (url) {
    const finalUrl = fireExit(url, 'location_href');
    _nativeHrefSet.call(location, isExternal(url) ? finalUrl : url);
  };
  let _currentHrefGet = _nativeHrefGet;

  try {
    _nativeDefineProp(Location.prototype, 'href', {
      get: function () { return _currentHrefGet.call(this); },
      set: function (url) { _currentHrefSet.call(this, url); },
      configurable: true,
    });
    log('location.href protegido ✅');
  } catch (e) { log('Falha ao proteger location.href:', e); }

  // ─────────────────────────────────────────────────────────
  // 3. location.assign
  // ─────────────────────────────────────────────────────────
  protectMethod(Location.prototype, 'assign', function (url) {
    const finalUrl = fireExit(url, 'location_assign');
    return _nativeAssign.call(location, isExternal(url) ? finalUrl : url);
  }, 'location.assign');

  // ─────────────────────────────────────────────────────────
  // 4. location.replace
  // ─────────────────────────────────────────────────────────
  protectMethod(Location.prototype, 'replace', function (url) {
    const finalUrl = fireExit(url, 'location_replace');
    return _nativeReplace.call(location, isExternal(url) ? finalUrl : url);
  }, 'location.replace');

  // ─────────────────────────────────────────────────────────
  // 5. history.pushState
  // ─────────────────────────────────────────────────────────
  protectMethod(history, 'pushState', function (state, title, url) {
    if (url && isExternal(String(url))) {
      const finalUrl = fireExit(String(url), 'pushstate');
      return _nativePushState(state, title, finalUrl);
    }
    _lastVirtual = url || location.href;
    resetExitSent();
    log('SPA pushState → reset, virtual:', _lastVirtual);
    return _nativePushState(state, title, url);
  }, 'history.pushState');

  // ─────────────────────────────────────────────────────────
  // 6. history.replaceState
  // ─────────────────────────────────────────────────────────
  protectMethod(history, 'replaceState', function (state, title, url) {
    if (url && isExternal(String(url))) {
      const finalUrl = fireExit(String(url), 'replacestate');
      return _nativeReplaceState(state, title, finalUrl);
    }
    _lastVirtual = url || location.href;
    resetExitSent();
    log('SPA replaceState → reset, virtual:', _lastVirtual);
    return _nativeReplaceState(state, title, url);
  }, 'history.replaceState');

  // ─────────────────────────────────────────────────────────
  // 7. Object.defineProperty — bloqueia redefinição de
  //    location.href por terceiros
  // ─────────────────────────────────────────────────────────
  try {
    _nativeDefineProp(Object, 'defineProperty', {
      value: function (obj, prop, descriptor) {
        if (obj === Location.prototype && prop === 'href') {
          if (isTrustedCaller()) {
            log('location.href redefinido por domínio confiável');
            if (descriptor.set) _currentHrefSet = descriptor.set;
            if (descriptor.get) _currentHrefGet = descriptor.get;
            return obj;
          }
          log('location.href redefinição BLOQUEADA por terceiro');
          return obj;
        }
        return _nativeDefineProp(obj, prop, descriptor);
      },
      writable: true,
      configurable: true,
    });
    log('Object.defineProperty protegido ✅');
  } catch (e) { log('Falha ao proteger Object.defineProperty:', e); }

  // ─────────────────────────────────────────────────────────
  // 8. Navigation API — fallback garantido
  // ─────────────────────────────────────────────────────────
  if (window.navigation && typeof window.navigation.addEventListener === 'function') {
    window.navigation.addEventListener('navigate', function (e) {
      try {
        if (_navLock) return;
        if (!e.cancelable) return;
        if (e.navigationType === 'traverse') return;
        if (e.hashChange || e.downloadRequest !== null) return;
        if (e.formData) return;
        const dest = e.destination && e.destination.url;
        if (!dest || !isExternal(dest)) return;
        fireExit(dest, 'navigation_api');
      } catch (err) { log('Navigation API error:', err); }
    });
    log('Navigation API ✅');
  } else {
    log('Navigation API indisponível — usando fallbacks');
  }

  // ─────────────────────────────────────────────────────────
  // 9. Cliques em <a href> — normal e _blank
  // ─────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    try {
      const el = e.target && e.target.closest('a');
      if (!el) return;
      const href = el.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
      if (!isExternal(href)) return;

      const trigger  = el.target === '_blank' ? 'click_blank' : 'click_link';
      const finalUrl = fireExit(href, trigger);

      // Redireciona para URL enriquecida
      if (finalUrl && finalUrl !== href) {
        e.preventDefault();
        if (el.target === '_blank') {
          _nativeOpen(finalUrl, '_blank');
        } else {
          _nativeHrefSet.call(location, finalUrl);
        }
      }
    } catch (err) { log('click handler error:', err); }
  }, true);

  // ─────────────────────────────────────────────────────────
  // 10. Submit de <form>
  // ─────────────────────────────────────────────────────────
  document.addEventListener('submit', function (e) {
    try {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      const action = form.getAttribute('action') || location.href;
      if (!isExternal(action)) return;
      const finalUrl = fireExit(action, 'form_submit');
      if (finalUrl && finalUrl !== action) {
        form.setAttribute('action', finalUrl);
      }
    } catch (_) {}
  }, true);

  // ─────────────────────────────────────────────────────────
  // 11. <meta refresh> dinâmico via MutationObserver
  // ─────────────────────────────────────────────────────────
  try {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (
            node.nodeType === 1 &&
            node.tagName === 'META' &&
            (node.httpEquiv || '').toLowerCase() === 'refresh'
          ) {
            const match = (node.content || '').match(/url=(.+)/i);
            if (match) {
              const url = match[1].trim().replace(/['"]/g, '');
              if (isExternal(url)) {
                const finalUrl = fireExit(url, 'meta_refresh');
                if (finalUrl && finalUrl !== url) {
                  node.content = '0;url=' + finalUrl;
                }
              }
            }
          }
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
    log('MutationObserver meta refresh ✅');
  } catch (e) { log('Falha MutationObserver:', e); }

  // ─────────────────────────────────────────────────────────
  // 12. popstate — reset em SPA
  // ─────────────────────────────────────────────────────────
  window.addEventListener('popstate', function () {
    resetExitSent();
    log('popstate → reset');
  });

  log('NavigationTracker v3.0 iniciado ✅');

  // ─────────────────────────────────────────────────────────
  // API PÚBLICA
  // ─────────────────────────────────────────────────────────
  return {
    // Troca o callback de saída
    onExit: function (fn) { CONFIG.onExit = fn; },

    // Define o endpoint de rastreamento em runtime
    // Ex: NavigationTracker.setEndpoint('https://meusite.com/api/track')
    setEndpoint: function (url) {
      CONFIG.trackEndpoint = url;
      log('trackEndpoint definido:', url);
    },

    // Define parâmetros extras adicionados em toda saída
    // Ex: NavigationTracker.setParams({ affid: '123', subid: 'v1' })
    setParams: function (params) {
      Object.keys(params).forEach(function (k) {
        CONFIG.extraParams[k] = params[k];
      });
      log('Params atualizados:', CONFIG.extraParams);
    },

    // Substitui a função de enriquecimento completa
    // Ex: NavigationTracker.setParamBuilder(function(url) { return url + '?custom=1'; })
    setParamBuilder: function (fn) {
      _paramBuilder = fn;
      log('paramBuilder substituído');
    },

    // Chama manualmente o enriquecimento (uso externo)
    includeParamNavigate: includeParamNavigate,

    // Adiciona domínio confiável em runtime
    addTrustedDomain: function (domain) {
      if (CONFIG.trustedDomains.indexOf(domain) === -1) {
        CONFIG.trustedDomains.push(domain);
        log('Domínio confiável adicionado:', domain);
      }
    },

    // Reset manual (útil em SPA)
    reset: function () { resetExitSent(); log('reset manual'); },

    // Estado atual (debug)
    status: function () {
      return {
        exitSent    : _exitSent,
        navLock     : _navLock,
        lastVirtual : _lastVirtual,
        trusted     : CONFIG.trustedDomains,
        params      : CONFIG.extraParams,
      };
    },
  };

})();
