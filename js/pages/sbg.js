(function () {
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
