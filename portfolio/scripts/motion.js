/*
 * Movimiento: Lenis (scroll suave) + GSAP (ScrollTrigger y Flip).
 *
 * Reglas:
 *  - Todo es opcional. Si las librerías no cargan, o el sistema pide "reducir movimiento",
 *    este módulo no hace nada y el sitio se ve completo, sin estados ocultos.
 *  - Los estados iniciales (opacidad 0, desplazamiento) se aplican solo desde GSAP,
 *    nunca desde el CSS.
 *  - Solo se anima transform y opacity.
 */
(function () {
  "use strict";

  const { gsap, ScrollTrigger, Flip, Lenis } = window;
  const supported = Boolean(gsap && ScrollTrigger);
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let lenis = null;
  let ctx = null; // contexto de GSAP de la vista actual: se revierte al cambiar de vista

  const isActive = () => supported && !reduceQuery.matches;

  function init() {
    if (!isActive()) return;

    gsap.registerPlugin(ScrollTrigger);
    if (Flip) gsap.registerPlugin(Flip);

    if (Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      // Un solo reloj para los dos: Lenis avanza con el ticker de GSAP.
      gsap.ticker.add((time) => {
        if (lenis) lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Las tipografías y las imágenes pueden mover las posiciones medidas.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());

    // Si el usuario activa "reducir movimiento" con el sitio abierto, se apaga el scroll suave.
    reduceQuery.addEventListener("change", (event) => {
      if (event.matches && lenis) {
        lenis.destroy();
        lenis = null;
      }
    });
  }

  /* ---------- Utilidades ---------- */

  // Envuelve cada palabra en una máscara para poder revelarla desde abajo.
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return words.map((word, i) => {
      const mask = document.createElement("span");
      mask.className = "split__mask";
      const inner = document.createElement("span");
      inner.className = "split__word";
      inner.textContent = word;
      mask.append(inner);
      el.append(mask);
      if (i < words.length - 1) el.append(" ");
      return inner;
    });
  }

  /* ---------- API ---------- */

  function scrollToTop(immediate) {
    if (lenis) lenis.scrollTo(0, { immediate, duration: 1.2 });
    else window.scrollTo(0, 0);
  }

  // Antes de reemplazar el DOM: mata triggers y tweens de la vista anterior.
  function leave() {
    if (ctx) {
      ctx.revert();
      ctx = null;
    }
  }

  // Después de pintar la vista nueva. `first` es true solo en la carga inicial.
  function enter(root, { first }) {
    if (!isActive()) return;

    ctx = gsap.context(() => {
      if (first) {
        gsap.from(document.querySelectorAll(".site-header > *"), {
          opacity: 0,
          y: -10,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08
        });
      }

      // Frase de inicio: palabra por palabra, desde abajo.
      const hero = root.querySelector(".hero__text");
      if (hero) {
        gsap.from(splitWords(hero), {
          yPercent: 110,
          duration: 1,
          ease: "power4.out",
          stagger: 0.045,
          delay: first ? 0.25 : 0
        });
      } else {
        // En las vistas de texto el título ya entra con el resto de los bloques: animarlo dos veces
        // hacía que la segunda animación tomara opacidad 0 como valor final y lo dejaba invisible.
        const heading = root.querySelector("h1");
        if (heading && !heading.closest(".page")) gsap.from(heading, { opacity: 0, y: 12, duration: 0.6, ease: "power3.out" });
      }

      const bar = root.querySelector(".index-bar");
      if (bar) gsap.from(bar, { opacity: 0, y: 8, duration: 0.6, ease: "power3.out", delay: hero ? 0.5 : 0.1 });

      // Portadas y piezas: entran al llegar a la pantalla, en tandas.
      const items = gsap.utils.toArray(root.querySelectorAll(".media-grid > li"));
      if (items.length) {
        const images = items.map((li) => li.querySelector(".tile__media")).filter(Boolean);
        gsap.set(items, { opacity: 0, y: 36 });
        gsap.set(images, { scale: 1.12 });

        ScrollTrigger.batch(items, {
          start: "top 94%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true });
            gsap.to(
              batch.map((li) => li.querySelector(".tile__media")).filter(Boolean),
              { scale: 1, duration: 1.4, ease: "power3.out", stagger: 0.08 }
            );
          }
        });
      }

      // Vistas de texto: los bloques entran en cascada.
      const blocks = root.querySelectorAll(".page > *");
      if (blocks.length) {
        gsap.from(blocks, { opacity: 0, y: 24, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.1 });
      }

      const next = root.querySelector(".project__nav");
      if (next) {
        gsap.from(next, {
          opacity: 0,
          y: 16,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: next, start: "top 96%", once: true }
        });
      }
    }, root);
  }

  // Cambio de columnas: las tarjetas se desplazan a su lugar nuevo en vez de saltar.
  function changeCols(grid, apply) {
    if (!isActive() || !Flip) {
      apply();
      return;
    }
    const state = Flip.getState(grid.children);
    apply();
    Flip.from(state, {
      duration: 0.7,
      ease: "power3.inOut",
      absolute: false,
      scale: false,
      onComplete: () => ScrollTrigger.refresh()
    });
  }

  init();

  window.CrowMotion = { scrollToTop, leave, enter, changeCols };
})();
