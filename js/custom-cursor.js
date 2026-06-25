/**
 * Shared custom cursor for subpages (pointer-fine devices only).
 * Index page uses its own rAF-integrated cursor in pages/index.js.
 */
(function () {
    const cursor = document.getElementById('custom-cursor');
    const glow = document.getElementById('custom-cursor-glow');
    if (!cursor || !glow) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.body.classList.add('custom-cursor-active');

    document.addEventListener('mousemove', (e) => {
        const x = `${e.clientX}px`;
        const y = `${e.clientY}px`;
        cursor.style.left = x;
        cursor.style.top = y;
        glow.style.left = x;
        glow.style.top = y;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        glow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        glow.style.opacity = '0.8';
    });
})();
