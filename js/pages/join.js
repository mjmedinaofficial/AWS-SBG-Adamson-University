(function () {
    const customCursor = document.getElementById('custom-cursor');
    const customCursorGlow = document.getElementById('custom-cursor-glow');
    if (customCursor && customCursorGlow && window.matchMedia('(pointer: fine) and (hover: hover)').matches) {
        document.body.classList.add('custom-cursor-active');
        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
            customCursorGlow.style.left = `${e.clientX}px`;
            customCursorGlow.style.top = `${e.clientY}px`;
        });
        document.addEventListener('mouseleave', () => { customCursor.style.opacity = '0'; customCursorGlow.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { customCursor.style.opacity = '1'; customCursorGlow.style.opacity = '0.8'; });
    }

    const form = document.getElementById('join-form');
    if (form && !document.querySelector('.jf-finder-wrap--closed')) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            alert('Application submitted! We\'ll contact you at your Adamson email soon.');
            form.reset();
        });
    }
})();
