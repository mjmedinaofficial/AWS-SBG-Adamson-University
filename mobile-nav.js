(function () {
    const MOBILE_MQ = window.matchMedia('(max-width: 768px)');
    let ignoreOutsideCloseUntil = 0;

    function isMobileNav() {
        return MOBILE_MQ.matches;
    }

    function getViewportPad() {
        return 12;
    }

    function resetDropdownPosition(menu) {
        if (!menu) return;
        menu.classList.remove('mobile-positioned');
        menu.style.left = '';
        menu.style.transform = '';
        menu.style.maxWidth = '';
        menu.style.width = '';
    }

    function positionDropdown(wrap) {
        const menu = wrap.querySelector('.nav-dropdown');
        if (!menu || !isMobileNav()) return;

        const pad = getViewportPad();
        menu.classList.add('mobile-positioned');
        menu.style.left = '50%';
        menu.style.transform = 'translateX(-50%)';
        menu.style.maxWidth = `${Math.max(140, window.innerWidth - pad * 2)}px`;
        menu.style.width = 'max-content';

        requestAnimationFrame(() => {
            const menuRect = menu.getBoundingClientRect();
            let shift = 0;

            if (menuRect.left < pad) {
                shift = pad - menuRect.left;
            } else if (menuRect.right > window.innerWidth - pad) {
                shift = (window.innerWidth - pad) - menuRect.right;
            }

            menu.style.transform = shift
                ? `translateX(calc(-50% + ${Math.round(shift)}px))`
                : 'translateX(-50%)';
        });
    }

    function closeAllDropdowns(except) {
        document.querySelectorAll('.dock-item-wrap.open').forEach((wrap) => {
            if (wrap === except) return;
            wrap.classList.remove('open');
            const trigger = wrap.querySelector('[data-dropdown-trigger]');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            resetDropdownPosition(wrap.querySelector('.nav-dropdown'));
        });
    }

    function toggleDropdown(wrap) {
        const trigger = wrap.querySelector('[data-dropdown-trigger]');
        const menu = wrap.querySelector('.nav-dropdown');
        const willOpen = !wrap.classList.contains('open');

        closeAllDropdowns(willOpen ? wrap : null);
        wrap.classList.toggle('open', willOpen);

        if (trigger) trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

        if (willOpen) {
            positionDropdown(wrap);
        } else {
            resetDropdownPosition(menu);
        }
    }

    function repositionOpenDropdowns() {
        if (!isMobileNav()) return;
        document.querySelectorAll('.dock-item-wrap.open').forEach((wrap) => positionDropdown(wrap));
    }

    function blockHoverHandlers(wrap) {
        ['mouseenter', 'mouseleave'].forEach((type) => {
            wrap.addEventListener(type, (e) => {
                if (!isMobileNav()) return;
                e.stopImmediatePropagation();
            }, true);
        });
    }

    function bindMobileDropdowns() {
        document.querySelectorAll('.dock-item-wrap').forEach((wrap) => {
            const trigger = wrap.querySelector('[data-dropdown-trigger]');
            if (!trigger) return;

            if (wrap.dataset.mobileNavBound !== '1') {
                wrap.dataset.mobileNavBound = '1';
                blockHoverHandlers(wrap);

                trigger.addEventListener('click', (e) => {
                    if (!isMobileNav()) return;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    ignoreOutsideCloseUntil = Date.now() + 350;
                    toggleDropdown(wrap);
                }, true);

                wrap.querySelectorAll('.nav-dropdown a[href], .nav-dropdown button').forEach((el) => {
                    el.addEventListener('click', () => {
                        if (!isMobileNav()) return;
                        closeAllDropdowns();
                    });
                });
            }
        });
    }

    function handleOutsideClose(e) {
        if (!isMobileNav()) return;
        if (Date.now() < ignoreOutsideCloseUntil) return;
        if (e.target.closest('.dock-item-wrap')) return;
        closeAllDropdowns();
    }

    if (!document.documentElement.dataset.mobileNavOutsideBound) {
        document.documentElement.dataset.mobileNavOutsideBound = '1';
        document.addEventListener('click', handleOutsideClose, true);
        document.addEventListener('touchstart', handleOutsideClose, { capture: true, passive: true });
        window.addEventListener('resize', repositionOpenDropdowns, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindMobileDropdowns);
    } else {
        bindMobileDropdowns();
    }

    MOBILE_MQ.addEventListener('change', () => {
        if (!isMobileNav()) closeAllDropdowns();
        bindMobileDropdowns();
    });
})();
