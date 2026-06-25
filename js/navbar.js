/* ============================================================
   AWS SBG AdU — Navbar controller
   Handles: scroll-based styling, dropdown menus, hamburger
   toggle, and scroll-to-section on the homepage.
   ============================================================ */
(function () {
    'use strict';

    const navbar = document.querySelector('.site-navbar');
    const hamburger = document.querySelector('.navbar-hamburger');
    const mobileMenu = document.querySelector('.navbar-mobile-menu');
    if (!navbar) return;

    /* --- Scroll effect: add shadow on scroll --- */
    function onScroll() {
        if (window.scrollY > 10) {
            navbar.classList.add('is-scrolled');
        } else {
            navbar.classList.remove('is-scrolled');
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* --- Desktop dropdown menus (hover-based) --- */
    const linkWraps = document.querySelectorAll('.navbar-link-wrap');
    linkWraps.forEach(function (wrap) {
        let timer = null;

        wrap.addEventListener('mouseenter', function () {
            clearTimeout(timer);
            wrap.classList.add('open');
        });

        wrap.addEventListener('mouseleave', function () {
            timer = setTimeout(function () {
                wrap.classList.remove('open');
            }, 120);
        });

        // Scroll-to-section links (homepage)
        wrap.querySelectorAll('[data-scroll-section]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                wrap.classList.remove('open');
                if (typeof window.sbgNavScrollToSection === 'function') {
                    window.sbgNavScrollToSection(Number(link.dataset.scrollSection));
                }
            });
        });
    });

    /* --- Hamburger toggle --- */
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            var isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu.classList.toggle('is-open');
            mobileMenu.setAttribute('aria-hidden', String(isExpanded));
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('is-open');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });

        // Handle scroll-to-section links inside mobile menu
        mobileMenu.querySelectorAll('[data-scroll-section]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('is-open');
                mobileMenu.setAttribute('aria-hidden', 'true');
                if (typeof window.sbgNavScrollToSection === 'function') {
                    window.sbgNavScrollToSection(Number(link.dataset.scrollSection));
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('is-open');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /* --- Close dropdowns when clicking outside --- */
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.navbar-link-wrap')) {
            linkWraps.forEach(function (wrap) {
                wrap.classList.remove('open');
            });
        }
    });
})();
