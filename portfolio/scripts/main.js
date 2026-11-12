/*
 * Router por direcciones reales (History API) + render de vistas. Sin dependencias.
 * Rutas: / (work) · /work/<slug> · /estudio · /contacto
 * Cada ruta existe también como archivo estático (lo genera scripts/prerender.mjs) con su título,
 * descripción y canónico, para que Google y las redes puedan leer cada una por separado.
 * Las direcciones viejas con # (#/work/<slug>) se convierten al cargar.
 */
(function () {
  "use strict";

  const { site, projects, services, clients } = window.CROW;
  const main = document.getElementById("main");
  const navLinks = document.querySelectorAll("[data-nav]");
  const WORK_COLS = [2, 3, 4];
  const PROJECT_COLS = [1, 2, 3, 4];
  const PLAYERS = {
    adobe: (id) => `https://www-ccv.adobe.io/v1/player/ccv/${encodeURIComponent(id)}/embed?bgcolor=%23151515&lazyLoading=true&api_key=BehancePro2View`,
    vimeo: (id) => `https://player.vimeo.com/video/${encodeURIComponent(id)}?dnt=1`,
    youtube: (id) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
  };

  // Direcciones que cambiaron de nombre: siguen funcionando.
  const SITE_DESCRIPTION = "theCrow. es un estudio de contenido visual: fotografía, video, edición y producción para marcas, eventos y experiencias. Always present.";
  const RENAMED = { veredas: "veredas-extremas", "veredas-extremas-fotos": "veredas-extremas" };
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
    return `/work/${encodeURIComponent(project.slug)}`;
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

  // Sello del Tatakuá sobre la portada (decorativo: el nombre del premio está en el texto).
  const AWARD_SEAL = '<span class="tile__seal" aria-hidden="true"><img src="/assets/awards/tatakua.svg" alt="" width="28" height="16"></span>';

  function tile(project, index) {
    const cover = project.cover;
    const ratio = cover && ["portrait", "square", "wide"].includes(cover.ratio) ? cover.ratio : "landscape";
    const position = cover && cover.position ? ` style="object-position: ${esc(cover.position)}"` : "";
    let media = "";
    if (cover && /\.mp4$/.test(cover.src)) {
      // Loop corto sin sonido: no descarga nada hasta que se ve (ver watchLoops).
      media = `<video class="tile__media" data-loop src="${esc(cover.src)}" poster="${esc(cover.poster)}" width="${cover.width}" height="${cover.height}" muted loop playsinline preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1"${position}></video>`;
    } else if (cover) {
      media = `<img class="tile__media" src="${esc(cover.src)}" alt="" width="${cover.width}" height="${cover.height}"${position} loading="${index < 4 ? "eager" : "lazy"}" decoding="async">`;
    }

    return `
      <li>
        <a class="tile" href="${projectHref(project)}">
          <span class="tile__frame tile__frame--${ratio}">${media}${project.award ? AWARD_SEAL : ""}</span>
          <span class="tile__caption">
            <span class="tile__title">${esc(projectLabel(project))}</span>
            <span class="tile__meta">${project.year}</span>
            ${project.award ? `<span class="tile__award">${esc(project.award.name)}</span>` : ""}
          </span>
        </a>
      </li>`;
  }

  // Ancho aproximado de cada foto según las columnas, para que el navegador elija el archivo justo.
  function gridSizes(cols) {
    return cols === 1 ? "(min-width: 48em) 64rem, 100vw" : `(min-width: 48em) ${Math.round(100 / cols)}vw, 100vw`;
  }

  function mediaItem(item, project, index, total, cols) {
    const title = item.title || `${projectLabel(project)}, pieza ${index + 1}`;
    const ratio = ["portrait", "square", "natural"].includes(item.ratio) ? item.ratio : "landscape";
    let content = "";

    if (item.type === "image") {
      const size = item.width && item.height ? ` width="${item.width}" height="${item.height}"` : "";
      const srcset = item.small ? ` srcset="${esc(item.small)} 800w, ${esc(item.src)} ${item.width}w" sizes="${gridSizes(cols)}"` : "";
      content = `<img src="${esc(item.src)}"${srcset} alt="${esc(item.alt || "")}"${size} loading="lazy" decoding="async">`;
    } else if (item.type === "video") {
      content = `<video src="${esc(item.src)}" ${item.poster ? `poster="${esc(item.poster)}"` : ""} controls preload="none" playsinline aria-label="${esc(title)}"></video>`;
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
    // Piezas verticales y fotos van a cuatro columnas; las horizontales, a dos.
    const tall = project.media.filter((m) => m.ratio === "portrait" || m.ratio === "natural").length;
    return tall >= project.media.length / 2 ? 4 : 2;
  }

  /* ---------- Pie: redes y CTA de WhatsApp (salen de site.js) ---------- */

  const ICON_PATHS = {
    facebook: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
    instagram: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
    whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
  };
  const icon = (name) =>
    `<svg class="site-footer__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="${ICON_PATHS[name]}"/></svg>`;

  function renderFooterContact() {
    const target = document.querySelector("[data-footer-contact]");
    if (!target) return;
    const socials = [];
    if (site.instagram) socials.push({ name: "instagram", label: `Instagram @${site.instagram.handle}`, href: site.instagram.url });
    if (site.facebook) socials.push({ name: "facebook", label: `Facebook ${site.facebook.name}`, href: site.facebook.url });
    const text = site.whatsappMessage ? `?text=${encodeURIComponent(site.whatsappMessage)}` : "";
    const cta = site.whatsapp
      ? `<a class="site-footer__cta" href="https://wa.me/${site.whatsapp.replace(/\D/g, "")}${text}" target="_blank" rel="noopener noreferrer">${icon("whatsapp")}<span>Escribinos por WhatsApp</span><span class="visually-hidden"> (se abre en otra pestaña)</span></a>`
      : "";
    target.innerHTML = `
      ${cta}
      <ul class="site-footer__social" aria-label="Redes">
        ${socials
          .map(
            (n) => `<li><a class="site-footer__social-link" href="${n.href}" target="_blank" rel="noopener noreferrer" aria-label="${esc(n.label)} (se abre en otra pestaña)">${icon(n.name)}</a></li>`
          )
          .join("")}
      </ul>`;
  }

  // Botón flotante "Hablemos": abre el WhatsApp del número de site.js, en cualquier pantalla.
  function renderFloatingWhatsapp() {
    if (!site.whatsapp) return;
    const text = site.whatsappMessage ? `?text=${encodeURIComponent(site.whatsappMessage)}` : "";
    const link = document.createElement("a");
    link.className = "wa-float";
    link.href = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}${text}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = `${icon("whatsapp")}<span class="wa-float__label">Hablemos</span><span class="visually-hidden"> por WhatsApp (se abre en otra pestaña)</span>`;
    document.body.append(link);
  }

  /* ---------- Vistas ---------- */

  // Marquee de clientes. La segunda copia de la lista solo existe para que el bucle no tenga corte y se oculta a lectores de pantalla.
  function clientsMarquee() {
    if (!clients || !clients.length) return "";
    const item = (c, hidden) => {
      const inner = c.logo
        ? `<img class="clients__logo" src="/assets/clients/${c.logo}" alt="${hidden ? "" : esc(c.name)}" width="${c.w}" height="${c.h}" style="--logo-h:${c.size}rem" decoding="async">`
        : `<span class="clients__name">${esc(c.name)}</span>`;
      return `<li class="clients__item">${inner}</li>`;
    };
    const track = (hidden) =>
      `<ul class="clients__track"${hidden ? ' aria-hidden="true"' : ""}>${clients.map((c) => item(c, hidden)).join("")}</ul>`;
    return `
        <section class="clients" aria-label="Clientes">
          <div class="clients__belt">${track(false)}${track(true)}</div>
        </section>`;
  }

  function workView() {
    const years = projects.map((p) => p.year);
    const range = `${Math.min(...years)}–${Math.max(...years)}`;

    return {
      title: `${site.name} ${site.descriptor}`,
      path: "/",
      description: SITE_DESCRIPTION,
      html: `
        <section class="hero">
          <h1 class="hero__text" tabindex="-1">${esc(site.intro)}</h1>
        </section>
        ${clientsMarquee()}
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
    const cols = project.cols || defaultProjectCols(project);
    const meta = [project.detail, project.category, project.year].filter(Boolean).join(", ");
    const award = project.award
      ? `<aside class="award-banner" aria-label="Premio">
            <img class="award-banner__icon" src="/assets/awards/tatakua.svg" alt="" width="96" height="54">
            <div class="award-banner__text">
              <p class="award-banner__label">Premio</p>
              <p class="award-banner__name">${esc(project.award.name)}</p>
              <p class="award-banner__detail">${esc(project.award.detail)}</p>
            </div>
          </aside>`
      : "";

    const body = project.media.length
      ? `<ul class="media-grid media-grid--project" data-cols="${cols}">${project.media
          .map((item, i) => mediaItem(item, project, i, project.media.length, cols))
          .join("")}</ul>`
      : `<div class="project__empty">${stateMessage({
          title: "Material en carga",
          text: "Estamos subiendo las piezas de este proyecto."
        })}</div>`;

    return {
      title: projectLabel(project),
      path: `/work/${encodeURIComponent(project.slug)}`,
      description: `${projectLabel(project)}: ${project.category.toLowerCase()} de ${site.name} (${project.year}). ${site.descriptor} en Asunción, Paraguay.`,
      html: `
        <article>
          <div class="index-bar">
            <div class="index-bar__lead">
              <a class="index-bar__crumb" href="/">Work</a>
              <span class="index-bar__crumb" aria-hidden="true">/</span>
              <h1 class="index-bar__title" tabindex="-1"><strong>${esc(project.title)}</strong> <span class="index-bar__meta">${esc(meta)}</span></h1>
            </div>
            ${project.media.length > 1 ? viewToggle(PROJECT_COLS, cols) : ""}
          </div>
          ${award}
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

  function awardsSection() {
    const awarded = projects.filter((p) => p.award);
    if (!awarded.length) return "";
    return `
          <section class="text-page__section" aria-labelledby="awards-title">
            <h2 class="text-page__label" id="awards-title">Reconocimientos</h2>
            <ul class="award-list">
              ${awarded
                .map(
                  (p) => `<li>
                <a class="award-list__link" href="${projectHref(p)}">
                  <span class="award-list__seal" aria-hidden="true"><img src="/assets/awards/tatakua.svg" alt="" width="36" height="20"></span>
                  <span><strong class="award-list__name">${esc(p.award.name)}</strong>
                  <span class="award-list__detail">${esc(projectLabel(p))}. ${esc(p.award.detail)}</span></span>
                </a>
              </li>`
                )
                .join("")}
            </ul>
          </section>`;
  }

  function studioView() {
    return {
      title: "Estudio",
      path: "/estudio",
      description: "theCrow. nace como evolución del trabajo de Roxanna Ramírez: fotógrafa, videógrafa y editora. Cobertura realtime, contenido para marcas y spots y campañas en Asunción, Paraguay.",
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
            ${site.servicesNote ? `<p class="service-note">${esc(site.servicesNote)}</p>` : ""}
          </section>

          ${awardsSection()}

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
      path: "/contacto",
      description: "Escribinos por WhatsApp, mail o el formulario: eventos, marcas, campañas o contenido recurrente en Asunción, Paraguay.",
      html: `
        <div class="page">
          <h1 class="text-page__title" tabindex="-1">Contemos lo que está pasando.</h1>
          <p class="text-page__lead">
            Eventos, marcas, campañas o contenido recurrente. Contanos qué tenés en mente y vemos cómo estar presentes.
          </p>
          <form class="contact-form" data-contact-form novalidate>
            <div class="contact-form__field">
              <label for="cf-name">Nombre <span class="contact-form__req">(obligatorio)</span></label>
              <input id="cf-name" name="name" type="text" autocomplete="name" required aria-describedby="cf-name-error">
              <p class="contact-form__error" id="cf-name-error" hidden></p>
            </div>
            <div class="contact-form__field">
              <label for="cf-company">Empresa o marca</label>
              <input id="cf-company" name="company" type="text" autocomplete="organization">
            </div>
            <div class="contact-form__field">
              <label for="cf-contact">Mail o WhatsApp <span class="contact-form__req">(obligatorio)</span></label>
              <input id="cf-contact" name="contact" type="text" autocomplete="email" required aria-describedby="cf-contact-error">
              <p class="contact-form__error" id="cf-contact-error" hidden></p>
            </div>
            <div class="contact-form__field">
              <label for="cf-message">¿Qué tenés en mente? <span class="contact-form__req">(obligatorio)</span></label>
              <textarea id="cf-message" name="message" rows="5" required aria-describedby="cf-message-error"></textarea>
              <p class="contact-form__error" id="cf-message-error" hidden></p>
            </div>
            <div class="visually-hidden" aria-hidden="true">
              <label for="cf-web">No completar este campo</label>
              <input id="cf-web" name="botcheck" type="text" tabindex="-1" autocomplete="off">
            </div>
            <button class="contact-form__submit" type="submit">Enviar consulta</button>
            <p class="contact-form__status" role="status" aria-live="polite" data-contact-status></p>
          </form>
          <h2 class="text-page__label contact-form__alt">O escribinos directo</h2>
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
      path: "/404",
      noindex: true,
      description: "La dirección que buscás no existe o cambió de lugar.",
      html: `
        <div class="page">
          <h1 class="text-page__title" tabindex="-1">No encontramos esa página.</h1>
          <div class="project__empty" style="margin-top: var(--space-5)">
            ${stateMessage({ title: "Error 404", text: "El proyecto que buscás no existe o cambió de lugar.", link: { href: "/", label: "Volver a Work" } })}
          </div>
        </div>`
    };
  }

  /* ---------- Router ---------- */

  function resolve(pathname) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return { nav: "work", view: workView() };
    if (parts[0] === "work" && parts[1]) {
      const slug = decodeURIComponent(parts[1]);
      return { nav: "work", view: projectView(RENAMED[slug] || slug) };
    }
    if (parts[0] === "estudio") return { nav: "estudio", view: studioView() };
    if (parts[0] === "contacto") return { nav: "contacto", view: contactView() };
    return { nav: null, view: notFoundView() };
  }

  // Las portadas en video se reproducen solo mientras se ven; con "reducir movimiento" quedan en su poster.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let loopObserver = null;

  function watchLoops() {
    if (loopObserver) loopObserver.disconnect();
    const videos = main.querySelectorAll("video[data-loop]");
    if (!videos.length || reduceMotion.matches || !("IntersectionObserver" in window)) return;

    loopObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.muted = true; // el atributo no siempre alcanza para el autoplay
            target.play().catch(() => {});
          } else {
            target.pause();
          }
        });
      },
      { rootMargin: "100px" }
    );
    videos.forEach((video) => loopObserver.observe(video));
  }

  let stopMarquee = () => {};

  const SITE_URL = "https://thecrowfilm.com";

  // Título, descripción, canónico y etiquetas para compartir de la ruta actual (también están escritos en el
  // archivo estático de cada ruta; esto los mantiene al navegar sin recargar).
  function setPageMeta(view) {
    const url = SITE_URL + view.path;
    const set = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    set('link[rel="canonical"]', "href", url);
    set('meta[name="description"]', "content", view.description);
    set('meta[property="og:url"]', "content", url);
    set('meta[property="og:title"]', "content", document.title);
    set('meta[property="og:description"]', "content", view.description);
    set('meta[name="twitter:title"]', "content", document.title);
    set('meta[name="twitter:description"]', "content", view.description);
    let robots = document.querySelector('meta[name="robots"]');
    if (view.noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.append(robots);
      }
      robots.content = "noindex";
    } else if (robots) {
      robots.remove();
    }
  }

  function render() {
    const { nav, view } = resolve(window.location.pathname);

    motion.leave();
    stopMarquee();
    main.innerHTML = view.html;
    stopMarquee = window.CrowMarquee ? window.CrowMarquee.mount(main.querySelector(".clients")) : () => {};
    motion.enter(main, { first: isFirstRender });
    watchLoops();
    document.title = view.title.startsWith(site.name) ? view.title : `${view.title} — ${site.name}`;
    setPageMeta(view);

    navLinks.forEach((link) => {
      if (link.dataset.nav === nav) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    motion.scrollToTop(true);

    // Navegar sin recargar no mueve el foco: lo llevamos al título de la vista nueva (no en la carga inicial).
    if (!isFirstRender) {
      const heading = main.querySelector("h1");
      if (heading) heading.focus({ preventScroll: true });
      window.dispatchEvent(new Event("crow:route")); // el píxel cuenta una vista nueva
    }
    isFirstRender = false;
  }

  /* ---------- Interacciones ---------- */

  // Formulario de contacto: con clave de Web3Forms llega por mail; sin clave arma el mensaje y abre WhatsApp.
  const CONTACT_FIELDS = [
    { name: "name", error: "Escribí tu nombre." },
    { name: "contact", error: "Dejanos un mail o un WhatsApp para responderte." },
    { name: "message", error: "Contanos brevemente qué tenés en mente." }
  ];

  function validateContact(form) {
    let firstInvalid = null;
    CONTACT_FIELDS.forEach(({ name, error }) => {
      const input = form.elements[name];
      const message = form.querySelector(`#${input.id}-error`);
      const invalid = !input.value.trim();
      input.setAttribute("aria-invalid", String(invalid));
      message.hidden = !invalid;
      message.textContent = invalid ? error : "";
      if (invalid && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  async function submitContact(form) {
    const status = form.querySelector("[data-contact-status]");
    const button = form.querySelector("button[type='submit']");
    if (form.elements.botcheck.value) return; // los bots completan el campo oculto
    if (!validateContact(form)) {
      status.textContent = "Revisá los campos marcados.";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const whatsappUrl = () => {
      const lines = [`Hola theCrow., soy ${data.name}${data.company ? ` (${data.company})` : ""}.`, data.message, `Mi contacto: ${data.contact}`];
      return `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
    };

    // Sin mail cargado en site.js, el formulario arma el mensaje y abre WhatsApp.
    if (!site.email) {
      if (!site.whatsapp) return;
      window.crowTrack && window.crowTrack("Lead", { method: "whatsapp" });
      status.textContent = "Abrimos WhatsApp con tu mensaje listo. Tocá enviar para que nos llegue.";
      window.open(whatsappUrl(), "_blank", "noopener");
      return;
    }

    button.disabled = true;
    status.textContent = "Enviando…";
    try {
      // FormSubmit manda el mail directo a site.email. Si la persona dejó un mail, "Responder" le contesta a ella.
      const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.trim());
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(site.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Consulta de ${data.name}${data.company ? ` (${data.company})` : ""} desde thecrowfilm.com`,
          _template: "table",
          _captcha: "false",
          Nombre: data.name,
          Empresa: data.company || "—",
          Contacto: data.contact,
          Mensaje: data.message,
          ...(looksLikeEmail ? { email: data.contact.trim() } : {})
        })
      });
      const result = await response.json();
      if (String(result.success) !== "true") throw new Error("error");
      window.crowTrack && window.crowTrack("Lead", { method: "form" });
      form.reset();
      status.textContent = "¡Gracias! Recibimos tu consulta y te respondemos pronto.";
    } catch (error) {
      status.innerHTML = "";
      const retry = document.createElement("span");
      retry.textContent = "No se pudo enviar. ";
      const link = document.createElement("a");
      link.href = site.whatsapp ? whatsappUrl() : `mailto:${site.email}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = site.whatsapp ? "Escribinos por WhatsApp" : "Escribinos por mail";
      status.append(retry, link);
    } finally {
      button.disabled = false;
    }
  }

  main.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-contact-form]");
    if (!form) return;
    event.preventDefault();
    submitContact(form);
  });

  // Selector de columnas: delegado, sin volver a renderizar la vista.
  main.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cols-set]");
    if (!button) return;
    const grid = main.querySelector(".media-grid");
    if (!grid) return;

    const cols = Number(button.dataset.colsSet);
    motion.changeCols(grid, () => {
      grid.dataset.cols = String(cols);
    });
    // Las fotos cambian de ancho: el navegador vuelve a elegir el archivo que corresponde.
    grid.querySelectorAll("img[sizes]").forEach((img) => {
      img.sizes = gridSizes(cols);
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

  renderFooterContact();
  renderFloatingWhatsapp();
  // Navegación: los links internos cambian la dirección sin recargar la página.
  const INTERNAL = /^\/(?:$|work\/|estudio$|contacto$)/;
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
    const href = link.getAttribute("href");
    if (!INTERNAL.test(href)) return;
    event.preventDefault();
    if (href !== window.location.pathname) window.history.pushState({}, "", href);
    render();
  });
  window.addEventListener("popstate", render);

  // Las direcciones viejas con # (por ejemplo /#/work/sistema-b) pasan a la dirección real.
  if (window.location.hash.startsWith("#/")) {
    window.history.replaceState({}, "", window.location.hash.slice(1) || "/");
  }
  render();
})();
