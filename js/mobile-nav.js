/* ============================================================
   AWS SBG AdU — Mobile navigation
   Replaces the nav-links with a liquid-glass three-dot button
   that opens an iOS-style context menu. Active at ≤1024px.
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

    function buildMenu() {
        if (built) return;
        const navLinks = document.querySelector('.nav-links');
        const header = document.querySelector('.site-header');
        if (!navLinks || !header) return;
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

        /* Build menu items from the nav-links anchors */
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach((link) => {
            const group = document.createElement('div');
            group.className = 'mnav-group';

            const titleEl = document.createElement('a');
            titleEl.className = 'mnav-title';
            titleEl.href = link.getAttribute('href') || '#';
            const text = link.textContent.replace(/\s+/g, ' ').trim();
            titleEl.innerHTML =
                '<span class="mnav-title-text">' + text + '</span>' +
                '<span class="mnav-chevron" aria-hidden="true">' +
                '<svg viewBox="0 0 8 14" width="8" height="14"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '</span>';
            if (link.classList.contains('active')) titleEl.classList.add('is-current');
            titleEl.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                window.setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 80);
            });
            group.appendChild(titleEl);

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

/* ---------- Universal Finder Sidebar Folder Switcher (No Redirection) ---------- */
document.addEventListener('click', function (e) {
    const sidebarItem = e.target.closest('.dc-finder-sidebar-item, .ev-finder-sidebar-item, .of-finder-sidebar-item, .sbg-finder-sidebar-item, .oh-finder-sidebar-item, .jf-finder-sidebar-item');
    if (sidebarItem) {
        e.preventDefault();
        const sidebar = sidebarItem.closest('aside, .dc-finder-sidebar, .ev-finder-sidebar, .of-finder-sidebar, .sbg-finder-sidebar, .oh-finder-sidebar, .jf-finder-sidebar');
        if (sidebar) {
            sidebar.querySelectorAll('.dc-finder-sidebar-item, .ev-finder-sidebar-item, .of-finder-sidebar-item, .sbg-finder-sidebar-item, .oh-finder-sidebar-item, .jf-finder-sidebar-item').forEach(function (item) {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            });
            sidebarItem.classList.add('active');
            sidebarItem.setAttribute('aria-current', 'true');
        }
    }
});
