/*
 * Píxel de Meta (ID 1957630941866467, cuenta publicitaria de theCrow.).
 * La web cambia de ruta sin recargar, así que además de la carga inicial se cuenta una vista
 * nueva en cada cambio de ruta, y se miden los contactos: clic en WhatsApp o mail y el formulario.
 * Los eventos del formulario salen de main.js con window.crowTrack.
 */
(function () {
  var PIXEL_ID = "1957630941866467";

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");

  // Evento a medida para main.js; si el píxel no cargó (bloqueador de anuncios), no pasa nada.
  window.crowTrack = function (eventName, params) {
    try {
      window.fbq("track", eventName, params || {});
    } catch (error) {
      /* sin medición */
    }
  };

  // Cada ruta nueva es una vista nueva (la primera ya se contó arriba). main.js avisa con este evento.
  window.addEventListener("crow:route", function () {
    window.crowTrack("PageView");
  });

  // Contactos por los links directos.
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (href.indexOf("wa.me/") !== -1) window.crowTrack("Contact", { method: "whatsapp" });
    else if (href.indexOf("mailto:") === 0) window.crowTrack("Contact", { method: "email" });
  });
})();
