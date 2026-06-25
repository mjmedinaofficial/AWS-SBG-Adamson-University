/* ============================================================
   AWS SBG AdU — Mobile navigation
   Replaces the dock with a liquid-glass three-dot button that
   opens an iOS-style context menu (clickable section titles +
   their dropdown choices). Active at viewport widths ≤1024px.
   ============================================================ */
(function () {
    const MOBILE_MQ = window.matchMedia('(max-width: 1024px)');
    let built = false;
    let isOpen = false;
    let toggleBtn = null;
    let sheet = null;
    let backdrop = null;

    function isMobile() {
        return MOBILE_MQ.matches;
    }

    function cleanTitle(btn) {
        if (!btn) return '';
        // Strip the caret text; use only the label
        const clone = btn.cloneNode(true);
        clone.querySelectorAll('.nav-caret, svg').forEach((n) => n.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim();
    }

    function triggerSource(source) {
        // Reuse all existing wiring (scroll-to-section on home, real
        // navigation on subpages) by replaying the click on the origin.
        if (!source) return;
        const href = source.getAttribute('href');
        const isScroll = source.hasAttribute('data-scroll-section');
        if (href && href !== '#' && !isScroll) {
            window.location.href = href;
        } else {
            source.click();
        }
    }

    function buildMenu() {
        if (built) return;
        const dock = document.querySelector('.liquid-dock');
        const header = document.querySelector('.site-header');
        if (!dock || !header) return;
        built = true;

        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'mnav-toggle';
        toggleBtn.setAttribute('aria-label', 'Open navigation menu');
        toggleBtn.setAttribute('aria-haspopup', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML =
            '<span class="mnav-dot"></span><span class="mnav-dot"></span><span class="mnav-dot"></span>';

        backdrop = document.createElement('div');
        backdrop.className = 'mnav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');

        sheet = document.createElement('div');
        sheet.className = 'mnav-sheet';
        sheet.setAttribute('role', 'menu');
        sheet.setAttribute('aria-label', 'Site navigation');

        dock.querySelectorAll('.dock-item-wrap').forEach((wrap) => {
            const btn = wrap.querySelector('.dock-item');
            const items = Array.from(wrap.querySelectorAll('.nav-dropdown-item'));
            if (!items.length) return;

            const overview = items[0];
            const rest = items.slice(1);

            const group = document.createElement('div');
            group.className = 'mnav-group';

            const titleEl = document.createElement('a');
            titleEl.className = 'mnav-title';
            titleEl.href = overview.getAttribute('href') || '#';
            titleEl.innerHTML =
                '<span class="mnav-title-text">' + cleanTitle(btn) + '</span>' +
                '<span class="mnav-chevron" aria-hidden="true">' +
                '<svg viewBox="0 0 8 14" width="8" height="14"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '</span>';
            if (btn && btn.classList.contains('active')) titleEl.classList.add('is-current');
            titleEl.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                window.setTimeout(() => triggerSource(overview), 80);
            });
            group.appendChild(titleEl);

            rest.forEach((item) => {
                const link = document.createElement('a');
                link.className = 'mnav-item';
                link.href = item.getAttribute('href') || '#';
                link.textContent = item.textContent.replace(/\s+/g, ' ').trim();
                if (item.classList.contains('primary')) link.classList.add('is-current');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeMenu();
                    window.setTimeout(() => triggerSource(item), 80);
                });
                group.appendChild(link);
            });

            sheet.appendChild(group);
        });

        header.appendChild(toggleBtn);
        document.body.appendChild(backdrop);
        document.body.appendChild(sheet);

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isOpen ? closeMenu() : openMenu();
        });
        backdrop.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) closeMenu();
        });
    }

    function openMenu() {
        if (!sheet) return;
        isOpen = true;
        document.body.classList.add('mnav-open');
        toggleBtn.classList.add('is-active');
        toggleBtn.setAttribute('aria-expanded', 'true');
        backdrop.classList.add('is-visible');
        sheet.classList.add('is-visible');
    }

    function closeMenu() {
        if (!sheet) return;
        isOpen = false;
        document.body.classList.remove('mnav-open');
        toggleBtn.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        backdrop.classList.remove('is-visible');
        sheet.classList.remove('is-visible');
    }

    function init() {
        if (isMobile()) buildMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    MOBILE_MQ.addEventListener('change', () => {
        if (isMobile()) {
            buildMenu();
        } else {
            closeMenu();
        }
    });
})();
