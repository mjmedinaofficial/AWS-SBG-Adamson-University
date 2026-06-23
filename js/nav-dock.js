/* Shared navigation dock slider + dropdown menus */
(function () {
    function updateDockSlider(activeItem) {
        const navDock = document.querySelector('.liquid-dock');
        const slider = navDock && navDock.querySelector('.dock-slider');
        if (!navDock || !slider) return;

        const item = activeItem !== undefined
            ? activeItem
            : navDock.querySelector('.dock-item.active');
        if (!item) {
            slider.style.opacity = '0';
            return;
        }

        slider.style.opacity = '1';
        const itemRect = item.getBoundingClientRect();
        const dockRect = navDock.getBoundingClientRect();
        slider.style.width = `${itemRect.width}px`;
        slider.style.left = `${itemRect.left - dockRect.left}px`;
    }

    function wireNavDropdowns() {
        const wraps = document.querySelectorAll('.dock-item-wrap');
        const canHoverOpen = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        wraps.forEach((wrap) => {
            const trigger = wrap.querySelector('[data-dropdown-trigger]');
            if (!trigger) return;

            let hoverTimer = null;
            let ignoreNextClick = false;

            const closeMenu = () => {
                wrap.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            };

            const openMenu = () => {
                clearTimeout(hoverTimer);
                wraps.forEach((other) => {
                    if (other === wrap) return;
                    other.classList.remove('open');
                    const otherTrigger = other.querySelector('[data-dropdown-trigger]');
                    if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                });
                wrap.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            };

            if (canHoverOpen) {
                wrap.addEventListener('mouseenter', () => {
                    openMenu();
                    ignoreNextClick = true;
                    window.setTimeout(() => {
                        ignoreNextClick = false;
                    }, 400);
                });
                wrap.addEventListener('mouseleave', () => {
                    hoverTimer = window.setTimeout(closeMenu, 130);
                });
            }

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (ignoreNextClick) {
                    ignoreNextClick = false;
                    if (!wrap.classList.contains('open')) openMenu();
                    return;
                }
                wrap.classList.contains('open') ? closeMenu() : openMenu();
            });

            wrap.querySelectorAll('[data-scroll-section]').forEach((scrollLink) => {
                scrollLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeMenu();
                    if (typeof window.sbgNavScrollToSection === 'function') {
                        window.sbgNavScrollToSection(Number(scrollLink.dataset.scrollSection));
                    }
                });
            });
        });

        if (!document.documentElement.dataset.sbgNavDropdownBound) {
            document.documentElement.dataset.sbgNavDropdownBound = 'true';
            document.addEventListener('click', (e) => {
                if (e.target.closest('.dock-item-wrap')) return;
                wraps.forEach((wrap) => {
                    wrap.classList.remove('open');
                    const trigger = wrap.querySelector('[data-dropdown-trigger]');
                    if (trigger) trigger.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    function init() {
        const navDock = document.querySelector('.liquid-dock');
        if (!navDock || !navDock.querySelector('.dock-slider')) return;

        updateDockSlider();
        wireNavDropdowns();
        window.addEventListener('resize', () => updateDockSlider());
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => updateDockSlider());
        }
    }

    window.sbgUpdateDockSlider = updateDockSlider;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
