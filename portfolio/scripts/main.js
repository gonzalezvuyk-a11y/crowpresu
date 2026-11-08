/*
 * Router por hash + render de vistas. Sin dependencias.
 * Rutas: #/ (work) · #/work/<slug> · #/estudio · #/contacto
 */
(function () {
  "use strict";

  const { site, projects, services } = window.CROW;
  const main = document.getElementById("main");
  const navLinks = document.querySelectorAll("[data-nav]");
  const WORK_COLS = [2, 3, 4];
  const PROJECT_COLS = [1, 2, 4];
  const PLAYERS = {
    adobe: (id) => `https://www-ccv.adobe.io/v1/player/ccv/${encodeURIComponent(id)}/embed?bgcolor=%23151515&lazyLoading=true&api_key=BehancePro2View`,
    vimeo: (id) => `https://player.vimeo.com/video/${encodeURIComponent(id)}?dnt=1`,
    youtube: (id) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
  };

  const motion = window.CrowMotion;
  let isFirstRender = true;

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function projectHref(project) {
    return `#/work/${encodeURIComponent(project.slug)}`;
  }

  function projectLabel(project) {
    return project.detail ? `${project.title}, ${project.detail}` : project.title;
  }

  /* ---------- Piezas de vista ---------- */

  // Íconos de n barras: la columna activa se entiende de un vistazo.
  function colsIcon(n) {
    const gap = 2;
    const width = (16 - gap * (n - 1)) / n;
    const bars = Array.from({ length: n }, (_, i) => `<rect x="${i * (width + gap)}" y="0" width="${width}" height="12" fill="currentColor"/>`).join("");
    return `<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" focusable="false">${bars}</svg>`;
  }

  function viewToggle(options, active) {
    if (options.length < 2) return "";
    return `
      <div class="view-toggle" role="group" aria-label="Columnas de la grilla">
        ${options
          .map(
            (n) =>
              `<button class="view-toggle__btn" type="button" data-cols-set="${n}" aria-pressed="${n === active}" aria-label="${n} ${n === 1 ? "columna" : "columnas"}">${colsIcon(n)}</button>`
          )
          .join("")}
      </div>`;
  }

  function tile(project, index) {
    const cover = project.cover;
    const ratio = cover && ["portrait", "square", "wide"].includes(cover.ratio) ? cover.ratio : "landscape";
    const media = cover
      ? `<img class="tile__media" src="${esc(cover.src)}" alt="" width="${cover.width}" height="${cover.height}"${cover.position ? ` style="object-position: ${esc(cover.position)}"` : ""} loading="${index < 4 ? "eager" : "lazy"}" decoding="async">`
      : "";

    return `
      <li>
        <a class="tile" href="${projectHref(project)}">
          <span class="tile__frame tile__frame--${ratio}">${media}</span>
          <span class="tile__caption">
            <span class="tile__title">${esc(projectLabel(project))}</span>
            <span class="tile__meta">${project.year}</span>
          </span>
        </a>
      </li>`;
  }

  function mediaItem(item, project, index, total) {
    const title = item.title || `${projectLabel(project)}, pieza ${index + 1}`;
    const ratio = ["portrait", "square", "natural"].includes(item.ratio) ? item.ratio : "landscape";
    let content = "";

    if (item.type === "image") {
      const size = item.width && item.height ? ` width="${item.width}" height="${item.height}"` : "";
      content = `<img src="${esc(item.src)}" alt="${esc(item.alt || "")}"${size} loading="lazy" decoding="async">`;
    } else if (item.type === "video") {
      content = `<video src="${esc(item.src)}" ${item.poster ? `poster="${esc(item.poster)}"` : ""} controls preload="metadata" playsinline aria-label="${esc(title)}"></video>`;
    } else if (PLAYERS[item.type]) {
      content = `<iframe src="${PLAYERS[item.type](item.id)}" title="${esc(title)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      return "";
    }

    const label = String(index + 1).padStart(2, "0");
    return `
      <li class="media-item media-item--${ratio}">
        <div class="media-item__frame">${content}</div>
        <p class="media-item__caption">${label} / ${String(total).padStart(2, "0")}</p>
      </li>`;
  }

  function stateMessage({ title, text, link }) {
    return `
      <div class="state-message" role="status">
        <p class="state-message__title">${esc(title)}</p>
        <p>${esc(text)}</p>
        ${link ? `<a class="state-message__link" href="${link.href}">${esc(link.label)}</a>` : ""}
      </div>`;
  }

  // Una pieza sola va a una columna; videos verticales múltiples, a cuatro.
  function defaultProjectCols(project) {
    if (project.media.length === 1) return 1;
    if (project.media.every((m) => m.ratio === "natural")) return 4;
    const portrait = project.media.filter((m) => m.ratio === "portrait").length;
    return portrait >= project.media.length / 2 ? 4 : 2;
  }

  /* ---------- Vistas ---------- */

  function workView() {
    const years = projects.map((p) => p.year);
    const range = `${Math.min(...years)}–${Math.max(...years)}`;

    return {
      title: `${site.name} ${site.descriptor}`,
      html: `
        <section class="hero">
          <h1 class="hero__text" tabindex="-1">${esc(site.intro)}</h1>
        </section>
        <div class="index-bar">
          <h2 class="index-bar__title"><strong>Work</strong> <span class="index-bar__meta">${projects.length} proyectos, ${range}</span></h2>
          ${viewToggle(WORK_COLS, 4)}
        </div>
        <ul class="media-grid" data-cols="4">${projects.map(tile).join("")}</ul>`
    };
  }

  function projectView(slug) {
    const index = projects.findIndex((p) => p.slug === slug);
    if (index === -1) return notFoundView();

    const project = projects[index];
    const next = projects[(index + 1) % projects.length];
    const cols = defaultProjectCols(project);
    const meta = [project.detail, project.category, project.year].filter(Boolean).join(", ");

    const body = project.media.length
      ? `<ul class="media-grid media-grid--project" data-cols="${cols}">${project.media
          .map((item, i) => mediaItem(item, project, i, project.media.length))
          .join("")}</ul>`
      : `<div class="project__empty">${stateMessage({
          title: "Material en carga",
          text: "Estamos subiendo las piezas de este proyecto."
        })}</div>`;

    return {
      title: projectLabel(project),
      html: `
        <article>
          <div class="index-bar">
            <div class="index-bar__lead">
              <a class="index-bar__crumb" href="#/">Work</a>
              <span class="index-bar__crumb" aria-hidden="true">/</span>
              <h1 class="index-bar__title" tabindex="-1"><strong>${esc(project.title)}</strong> <span class="index-bar__meta">${esc(meta)}</span></h1>
            </div>
            ${project.media.length > 1 ? viewToggle(PROJECT_COLS, cols) : ""}
          </div>
          ${body}
          <nav class="project__nav" aria-label="Proyecto siguiente">
            <a class="project__next" href="${projectHref(next)}">
              <span class="project__next-label">Siguiente</span>
              <span class="project__next-title">${esc(projectLabel(next))} <span aria-hidden="true">→</span></span>
            </a>
          </nav>
        </article>`
    };
  }

  function studioView() {
    return {
      title: "Estudio",
      html: `
        <div class="page">
          <h1 class="text-page__title" tabindex="-1">Estudio de contenido visual.</h1>
          <p class="text-page__lead">
            theCrow. nace como evolución del trabajo de Roxanna Ramírez: fotógrafa, videógrafa y editora.
            No se limita a registrar. Observa, interpreta y transforma momentos, ideas y experiencias en contenido relevante.
          </p>

          <section class="text-page__section" aria-labelledby="services-title">
            <h2 class="text-page__label" id="services-title">Servicios</h2>
            <dl class="service-list">
              ${services.map((s) => `<div><dt>${esc(s.name)}</dt><dd>${esc(s.text)}</dd></div>`).join("")}
            </dl>
          </section>

          <section class="text-page__section" aria-labelledby="principle-title">
            <h2 class="text-page__label" id="principle-title">Principio</h2>
            <p class="principle">Presence over noise.</p>
            <p class="principle__body">
              Estar presentes no significa producir más contenido. Significa reconocer qué merece ser contado y encontrar la mejor manera de hacerlo.
            </p>
          </section>
        </div>`
    };
  }

  function contactView() {
    const links = [];
    if (site.email) links.push({ label: site.email, href: `mailto:${site.email}` });
    if (site.whatsapp) {
      const text = site.whatsappMessage ? `?text=${encodeURIComponent(site.whatsappMessage)}` : "";
      links.push({
        label: `WhatsApp ${site.whatsapp}`,
        href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}${text}`,
        external: true
      });
    }
    links.push({ label: `Instagram @${site.instagram.handle}`, href: site.instagram.url, external: true });

    return {
      title: "Contacto",
      html: `
        <div class="page">
          <h1 class="text-page__title" tabindex="-1">Contemos lo que está pasando.</h1>
          <p class="text-page__lead">
            Eventos, marcas, campañas o contenido recurrente. Contanos qué tenés en mente y vemos cómo estar presentes.
          </p>
          <ul class="contact-list">
            ${links
              .map(
                (l) =>
                  `<li><a class="contact-list__link" href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}${l.external ? '<span class="visually-hidden"> (se abre en una pestaña nueva)</span>' : ""}</a></li>`
              )
              .join("")}
          </ul>
        </div>`
    };
  }

  function notFoundView() {
    return {
      title: "Página no encontrada",
      html: `
        <div class="page">
          <h1 class="text-page__title" tabindex="-1">No encontramos esa página.</h1>
          <div class="project__empty" style="margin-top: var(--space-5)">
            ${stateMessage({ title: "Error 404", text: "El proyecto que buscás no existe o cambió de lugar.", link: { href: "#/", label: "Volver a Work" } })}
          </div>
        </div>`
    };
  }

  /* ---------- Router ---------- */

  function resolve(hash) {
    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts.length === 0) return { nav: "work", view: workView() };
    if (parts[0] === "work" && parts[1]) return { nav: "work", view: projectView(decodeURIComponent(parts[1])) };
    if (parts[0] === "estudio") return { nav: "estudio", view: studioView() };
    if (parts[0] === "contacto") return { nav: "contacto", view: contactView() };
    return { nav: null, view: notFoundView() };
  }

  function render() {
    const { nav, view } = resolve(window.location.hash);

    motion.leave();
    main.innerHTML = view.html;
    motion.enter(main, { first: isFirstRender });
    document.title = view.title.startsWith(site.name) ? view.title : `${view.title} — ${site.name}`;

    navLinks.forEach((link) => {
      if (link.dataset.nav === nav) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    motion.scrollToTop(true);

    // Navegar por hash no mueve el foco: lo llevamos al título de la vista nueva (no en la carga inicial).
    if (!isFirstRender) {
      const heading = main.querySelector("h1");
      if (heading) heading.focus({ preventScroll: true });
    }
    isFirstRender = false;
  }

  /* ---------- Interacciones ---------- */

  // Selector de columnas: delegado, sin volver a renderizar la vista.
  main.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cols-set]");
    if (!button) return;
    const grid = main.querySelector(".media-grid");
    if (!grid) return;

    motion.changeCols(grid, () => {
      grid.dataset.cols = button.dataset.colsSet;
    });
    main.querySelectorAll("[data-cols-set]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
  });

  document.querySelector("[data-action='top']").addEventListener("click", () => {
    motion.scrollToTop(false);
    document.getElementById("top").focus({ preventScroll: true });
  });

  // Reloj de Asunción. Con "reducir movimiento" no marca segundos.
  const clock = document.getElementById("clock");
  if (clock) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const formatter = new Intl.DateTimeFormat("es-PY", {
      hour: "2-digit",
      minute: "2-digit",
      ...(reduceMotion ? {} : { second: "2-digit" }),
      hour12: false,
      timeZone: site.timeZone
    });
    const tick = () => {
      clock.textContent = `${formatter.format(new Date())} ASU PY`;
    };
    tick();
    setInterval(tick, reduceMotion ? 30000 : 1000);
  }

  window.addEventListener("hashchange", render);
  render();
})();
