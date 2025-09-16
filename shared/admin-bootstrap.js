/*
  Bootstrap determinístico do Supabase para páginas admin
  - Garante window.supabase e createClient disponíveis de forma estável
  - Expõe window.__supabaseReady (Promise) e dispara evento 'supabase-ready'
*/
(function () {
  try {
    var RESOLVE_READY = null;
    var readyPromise = new Promise(function (res) { RESOLVE_READY = res; });
    // Expor promise global
    window.__supabaseReady = readyPromise;
    window.__supabaseReadyResolved = false;

    // Garantir objeto global
    window.supabase = window.supabase || {};

    function markReady(createClientFn) {
      try {
        if (typeof createClientFn === 'function') {
          window.supabase.createClient = createClientFn;
        }
        window.__supabaseReadyResolved = true;
        if (typeof RESOLVE_READY === 'function') RESOLVE_READY(true);
        try {
          var evt = new Event('supabase-ready');
          window.dispatchEvent(evt);
        } catch (_) {}
      } catch (_) {
        if (typeof RESOLVE_READY === 'function') RESOLVE_READY(true);
      }
    }

    // Caso já esteja disponível
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return markReady(window.supabase.createClient);
    }

    // 1) Tentar detectar carregamento do UMD (se já estiver na página)
    var POLL_MS = 50;
    var MAX_POLLS = 100; // ~5s
    var attempts = 0;
    var resolved = false;
    var poll = setInterval(function () {
      attempts++;
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        if (!resolved) {
          resolved = true;
          clearInterval(poll);
          markReady(window.supabase.createClient);
        }
      } else if (attempts >= MAX_POLLS) {
        clearInterval(poll);
      }
    }, POLL_MS);

    // 2) ESM fallback em paralelo (não depende do UMD)
    try {
      // dynamic import é suportado nos browsers modernos
      import('https://esm.sh/@supabase/supabase-js@2?bundle')
        .then(function (mod) {
          if (!resolved) {
            resolved = true;
            markReady(mod.createClient);
          }
        })
        .catch(function () { /* ignora, o UMD pode resolver */ });
    } catch (_) { /* ignora */ }

    // 3) Se UMD não estiver presente, injeta com cache-buster (não bloqueante)
    try {
      var hasUMD = Array.prototype.some.call(document.scripts, function (s) {
        return (s && typeof s.src === 'string' && s.src.indexOf('/@supabase/supabase-js@2/dist/umd/supabase.js') !== -1);
      });
      if (!hasUMD) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js?v=' + Date.now();
        s.async = true;
        // Quando carregar, se ainda não resolveu, marca pronto
        s.onload = function () {
          if (!resolved && window.supabase && typeof window.supabase.createClient === 'function') {
            resolved = true;
            markReady(window.supabase.createClient);
          }
        };
        document.head.appendChild(s);
      }
    } catch (_) { /* ignora */ }
  } catch (e) {
    // Em último caso, marca como pronto para não travar a página
    try { if (typeof window.__supabaseReady?.then !== 'function') window.__supabaseReady = Promise.resolve(true); } catch (_) {}
  }
})();

