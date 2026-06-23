(function () {
    const customCursor = document.getElementById('custom-cursor');
    const customCursorGlow = document.getElementById('custom-cursor-glow');
    if (customCursor && customCursorGlow && window.matchMedia('(pointer: fine) and (hover: hover)').matches) {
        document.body.classList.add('custom-cursor-active');
        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = `${e.clientX}px`; customCursor.style.top = `${e.clientY}px`;
            customCursorGlow.style.left = `${e.clientX}px`; customCursorGlow.style.top = `${e.clientY}px`;
        });
        document.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; customCursorGlow.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { customCursor.style.opacity = '1'; customCursorGlow.style.opacity = '0.8'; });
    }

    // Narrative reveal
    const narrative = document.getElementById('sbg-finder-narrative');
    const narrativeItems = narrative && narrative.querySelectorAll('.sbg-narrative-reveal');
    if (narrative && narrativeItems.length) {
        const narrativeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    narrative.classList.add('is-revealed');
                    narrativeItems.forEach((el, i) => {
                        el.style.animationDelay = `${i * 0.08}s`;
                    });
                    narrativeObserver.unobserve(narrative);
                }
            });
        }, { threshold: 0.2 });
        narrativeObserver.observe(narrative);
    }
})();
