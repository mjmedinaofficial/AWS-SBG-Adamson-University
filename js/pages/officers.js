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

    // ---- Officer cards reveal one by one on scroll ----
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const siblings = Array.from(card.parentElement.children);
                const i = siblings.indexOf(card);
                card.style.transitionDelay = `${i * 0.1}s`;
                card.classList.add('in-view');
                cardObserver.unobserve(card);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.of-card').forEach((c) => cardObserver.observe(c));
})();
