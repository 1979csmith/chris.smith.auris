(function(){
  if (window.__AURIS_ANALYTICS_READY__) return;
  window.__AURIS_ANALYTICS_READY__ = true;

  var GA_ID = window.AURIS_ANALYTICS_ID || "";
  var source = {
    landing_page: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || "direct",
    title: document.title || ""
  };

  function loadGA(id) {
    if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;
    if (!window.dataLayer) window.dataLayer = [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js?id="]')) {
      var ga = document.createElement('script');
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(ga);
    }
    window.gtag('js', new Date());
    window.gtag('config', id, {
      page_title: source.title,
      page_location: source.landing_page,
      page_path: source.path
    });
  }

  window.aurisTrack = function(name, detail) {
    var payload = Object.assign({}, source, detail || {});
    console.info('Auris analytics event', name, payload);
    if (window.gtag) window.gtag('event', name, payload);
  };

  function classifyLink(el) {
    var href = el.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) return 'lead_phone_click';
    if (href.indexOf('mailto:') === 0) return 'lead_email_click';
    if (href.indexOf('#') === 0) return 'internal_anchor_click';
    if (href.indexOf('/') === 0) return 'internal_page_click';
    return 'link_click';
  }

  function bindEvents() {
    window.aurisTrack('page_view_custom', {
      page_type: document.body && document.body.dataset ? document.body.dataset.pageType || 'site' : 'site'
    });

    document.querySelectorAll('a').forEach(function(el){
      if (el.__aurisTracked) return;
      el.__aurisTracked = true;
      el.addEventListener('click', function(){
        var href = el.getAttribute('href') || '';
        var eventName = el.dataset.track || classifyLink(el);
        window.aurisTrack(eventName, {
          link_text: (el.textContent || '').trim().slice(0, 120),
          href: href,
          is_lead_event: href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0
        });
      });
    });
  }

  loadGA(GA_ID);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindEvents);
  else bindEvents();
})();
