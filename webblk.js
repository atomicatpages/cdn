/**
 * ============================================================
 *  PROTEÇÃO CONTRA INTERCEPTAÇÃO DE NAVEGAÇÃO POR TERCEIROS
 *  Deve ser o PRIMEIRO script carregado no <head>, antes de
 *  qualquer tag de terceiro (GTM, pixels, afiliados, etc.)
 *
 *  DOMÍNIOS CONFIÁVEIS: apenas scripts hospedados nos domínios
 *  da lista TRUSTED_DOMAINS podem registrar eventos protegidos.
 * ============================================================
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // DOMÍNIOS CONFIÁVEIS
  // Adicione aqui todos os domínios dos seus scripts
  // ─────────────────────────────────────────────────────────
  const TRUSTED_DOMAINS = [
    'github.io',
    // 'meuoutrodominio.com',
    // 'cdn.meusite.com.br',
  ];

  // ─────────────────────────────────────────────────────────
  // HELPER — verifica se o script atual é confiável
  // Usa document.currentScript (disponível durante execução
  // síncrona) ou rastreia via Error.stack como fallback
  // ─────────────────────────────────────────────────────────
  function isTrustedCaller() {
    // Tenta via currentScript primeiro (mais confiável)
    const cs = document.currentScript;
    if (cs && cs.src) {
      return isDomainTrusted(cs.src);
    }

    // Fallback: analisa o call stack para encontrar a URL do script chamador
    try {
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/https?:\/\/[^\s):]+/);
        if (match) {
          const url = match[0];
          // ignora a própria URL deste script de proteção
          if (isDomainTrusted(url)) return true;
        }
      }
    } catch (_) {}

    // Inline scripts (sem src) rodando na mesma página são permitidos
    // pois você controla o HTML da página
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

  // Guarda as referências originais ANTES de qualquer proteção
  const _origDocAdd = document.addEventListener.bind(document);
  const _origWinAdd = window.addEventListener.bind(window);
  const _origNavAdd = window.navigation
    ? window.navigation.addEventListener.bind(window.navigation)
    : null;

  // ─────────────────────────────────────────────────────────
  // 1. PROTEGE window.open
  // ─────────────────────────────────────────────────────────
  try {
    const _safeOpen = window.open.bind(window);
    Object.defineProperty(window, 'open', {
      value: function (url, name, features) {
        if (!isTrustedCaller()) {
          console.warn('[PROTEÇÃO] window.open bloqueado — domínio não confiável.');
          return null;
        }
        return _safeOpen(url, name, features);
      },
      writable: false,
      configurable: false,
    });
  } catch (e) {
    console.warn('[PROTEÇÃO] Falha ao proteger window.open:', e);
  }

  // ─────────────────────────────────────────────────────────
  // 2. PROTEGE window.navigation (congela o objeto)
  // ─────────────────────────────────────────────────────────
  try {
    if (window.navigation) {
      Object.defineProperty(window, 'navigation', {
        value: window.navigation,
        writable: false,
        configurable: false,
      });
    }
  } catch (e) {
    console.warn('[PROTEÇÃO] Falha ao congelar window.navigation:', e);
  }

  // ─────────────────────────────────────────────────────────
  // 3. PROTEGE navigation.addEventListener
  //    Domínios confiáveis podem registrar 'navigate'
  //    Terceiros são bloqueados
  // ─────────────────────────────────────────────────────────
  try {
    if (window.navigation && _origNavAdd) {
      Object.defineProperty(window.navigation, 'addEventListener', {
        value: function (type, handler, options) {
          if (type === 'navigate' && !isTrustedCaller()) {
            console.warn('[PROTEÇÃO] navigation "navigate" bloqueado — domínio não confiável.');
            return;
          }
          return _origNavAdd(type, handler, options);
        },
        writable: false,
        configurable: false,
      });
    }
  } catch (e) {
    console.warn('[PROTEÇÃO] Falha ao proteger navigation.addEventListener:', e);
  }


  console.log('[PROTEÇÃO] Escudo ativo. Domínios confiáveis:', TRUSTED_DOMAINS);
})();
