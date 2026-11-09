/*
 * Marquee de clientes que se puede arrastrar (mouse, dedo o scroll horizontal del trackpad).
 * Sin JS, o con "reducir movimiento", queda la versión de CSS: animación sola o lista quieta.
 * Uso: const stop = CrowMarquee.mount(section); … stop();
 */
(function () {
  "use strict";

  const LOOP_SECONDS = 70; // Lo que tarda en pasar una vuelta completa sin tocarlo.
  const FRICTION = 0.94; // Cuánto frena la inercia al soltar, por cuadro.
  const DRAG_THRESHOLD = 4; // Píxeles antes de considerar que el gesto es un arrastre.

  function mount(section) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const belt = section && section.querySelector(".clients__belt");
    const track = belt && belt.querySelector(".clients__track");
    if (!belt || !track || reduceMotion) return () => {};

    section.classList.add("clients--draggable");
    belt.querySelectorAll("img").forEach((img) => {
      img.draggable = false;
    });

    let loopWidth = track.offsetWidth; // Ancho de una copia de la lista: la vuelta completa.
    let offset = 0;
    let velocity = 0; // Inercia después de soltar, en px por cuadro.
    let dragging = false;
    let hovering = false;
    let visible = true;
    let pointerId = null;
    let startX = 0;
    let startOffset = 0;
    let lastX = 0;
    let lastTime = 0;
    let frame = 0;
    let previous = performance.now();

    const wrap = (x) => {
      if (!loopWidth) return 0;
      const r = x % loopWidth;
      return r > 0 ? r - loopWidth : r;
    };

    function tick(now) {
      const dt = Math.min(now - previous, 64);
      previous = now;

      if (!dragging) {
        if (Math.abs(velocity) > 0.05) {
          offset += velocity;
          velocity *= FRICTION;
        } else {
          velocity = 0;
          if (!hovering && !section.contains(document.activeElement)) {
            offset -= (loopWidth / (LOOP_SECONDS * 1000)) * dt;
          }
        }
      }

      offset = wrap(offset);
      belt.style.transform = `translate3d(${offset}px, 0, 0)`;
      frame = visible ? requestAnimationFrame(tick) : 0;
    }

    function start() {
      if (frame) return;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function onPointerDown(event) {
      if (event.button !== 0) return;
      pointerId = event.pointerId;
      startX = lastX = event.clientX;
      startOffset = offset;
      lastTime = event.timeStamp;
      velocity = 0;
    }

    function onPointerMove(event) {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        section.classList.add("is-dragging");
        // Captura el puntero para seguir arrastrando aunque salga del marquee.
        try {
          section.setPointerCapture(pointerId);
        } catch (error) {
          /* Puntero que ya no existe: se arrastra igual sin captura. */
        }
      }
      const elapsed = Math.max(event.timeStamp - lastTime, 1);
      // Velocidad en px por cuadro (~16 ms), para seguir el impulso al soltar.
      velocity = ((event.clientX - lastX) / elapsed) * 16;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      offset = startOffset + dx;
    }

    function onPointerUp(event) {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      section.classList.remove("is-dragging");
      if (section.hasPointerCapture(event.pointerId)) section.releasePointerCapture(event.pointerId);
      // Si el dedo se quedó quieto antes de soltar, no hay impulso.
      if (event.timeStamp - lastTime > 100) velocity = 0;
    }

    // Scroll horizontal del trackpad sobre el marquee: lo mueve; el vertical sigue scrolleando la página.
    function onWheel(event) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      velocity = 0;
      offset -= event.deltaX;
    }

    const onEnter = (event) => {
      if (event.pointerType === "mouse") hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };

    section.addEventListener("pointerdown", onPointerDown);
    section.addEventListener("pointermove", onPointerMove);
    section.addEventListener("pointerup", onPointerUp);
    section.addEventListener("pointercancel", onPointerUp);
    section.addEventListener("wheel", onWheel, { passive: false });
    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointerleave", onLeave);

    // Los logos cargan después: cuando cambia el ancho de la lista, se recalcula la vuelta.
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => (loopWidth = track.offsetWidth)) : null;
    if (resizeObserver) resizeObserver.observe(track);

    // Fuera de pantalla no se anima: ahorra batería y CPU.
    const visibilityObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
          })
        : null;
    if (visibilityObserver) visibilityObserver.observe(section);

    start();

    return function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      visible = false;
      if (resizeObserver) resizeObserver.disconnect();
      if (visibilityObserver) visibilityObserver.disconnect();
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerup", onPointerUp);
      section.removeEventListener("pointercancel", onPointerUp);
      section.removeEventListener("wheel", onWheel);
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointerleave", onLeave);
    };
  }

  window.CrowMarquee = { mount };
})();
