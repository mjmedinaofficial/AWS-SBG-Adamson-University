(function() {
    const DESKTOP_MQ = window.matchMedia('(min-width: 769px)');
    const MOBILE_LAYOUT_MQ = window.matchMedia('(max-width: 768px)');
    const POINTER_FINE_MQ = window.matchMedia('(hover: hover) and (pointer: fine)');

    const customCursor = document.getElementById('custom-cursor');
    const customCursorGlow = document.getElementById('custom-cursor-glow');
    const useCustomCursor = customCursor && customCursorGlow && POINTER_FINE_MQ.matches;

    if (useCustomCursor) {
        document.body.classList.add('custom-cursor-active');

        document.addEventListener('mousemove', (e) => {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
            customCursorGlow.style.left = `${e.clientX}px`;
            customCursorGlow.style.top = `${e.clientY}px`;
        });

        document.addEventListener('mouseleave', () => {
            customCursor.style.opacity = '0';
            customCursorGlow.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            customCursor.style.opacity = '1';
            customCursorGlow.style.opacity = '0.85';
        });
    }

    // Section 1: hero glass card tilt
    const section1TiltCard = document.getElementById('section1-tilt-card');

    // Global: nav dock, page indicator, scroll container
    const topBar = document.querySelector('.top-bar');
    const navDock = document.querySelector('.liquid-dock');
    const navDockSlider = navDock.querySelector('.dock-slider');
    const sectionItems = Array.from(navDock.querySelectorAll('[data-section-index]'));
    const pageIndicatorDots = Array.from(document.querySelectorAll('.page-indicator-dot'));
    const pageSections = document.querySelectorAll('.page-section');
    const pageScrollContainer = document.querySelector('.horizontal-container');
    const siteFooter = document.querySelector('.site-footer');

    // Desktop zoom: stack hero only above ~110% browser zoom.
    // Baseline viewport height is captured on first load (assumed 100%
    // zoom) so browser chrome on short laptops doesn't false-trigger.
    const ZOOM_STACK_THRESHOLD = 1.105;
    const BASELINE_KEY = 'sbgViewportBaselineH';
    let baselineInnerHeight = parseFloat(sessionStorage.getItem(BASELINE_KEY)) || 0;

    function estimateBrowserZoom() {
        const innerH = window.innerHeight;
        if (!innerH) return 1;
        if (!baselineInnerHeight || innerH > baselineInnerHeight) {
            baselineInnerHeight = innerH;
            sessionStorage.setItem(BASELINE_KEY, String(baselineInnerHeight));
        }
        return baselineInnerHeight / innerH;
    }

    function syncDesktopZoomStack() {
        if (!DESKTOP_MQ.matches || MOBILE_LAYOUT_MQ.matches) {
            document.body.classList.remove('desktop-zoom-stack');
            return;
        }
        // Laptops/desktops (≥1024px): keep side-by-side hero + moving carousel.
        if (window.innerWidth >= 1024) {
            document.body.classList.remove('desktop-zoom-stack');
            return;
        }
        document.body.classList.toggle(
            'desktop-zoom-stack',
            estimateBrowserZoom() > ZOOM_STACK_THRESHOLD
        );
    }

    syncDesktopZoomStack();
    window.addEventListener('resize', syncDesktopZoomStack);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncDesktopZoomStack);
    }

    document.addEventListener('mousemove', (e) => {
        if (!section1TiltCard || MOBILE_LAYOUT_MQ.matches || !POINTER_FINE_MQ.matches || document.body.classList.contains('desktop-zoom-stack')) return;
        const rect = section1TiltCard.getBoundingClientRect();
        if (rect.left > window.innerWidth || rect.right < 0) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateY = (centerX - e.clientX) / 30;
        const rotateX = (centerY - e.clientY) / 30;
        section1TiltCard.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });

    document.addEventListener('mouseleave', () => {
        if (!section1TiltCard || document.body.classList.contains('desktop-zoom-stack')) return;
        section1TiltCard.style.transition = 'transform 0.5s ease';
        section1TiltCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        setTimeout(() => { section1TiltCard.style.transition = 'transform 0.1s ease-out'; }, 500);
    });

    function updateNavDockSlider(activeItem) {
        sectionItems.forEach(i => i.classList.remove('active'));
        if (!activeItem) {
            if (window.sbgUpdateDockSlider) window.sbgUpdateDockSlider(null);
            else if (navDockSlider) navDockSlider.style.opacity = '0';
            return;
        }
        activeItem.classList.add('active');
        if (window.sbgUpdateDockSlider) {
            window.sbgUpdateDockSlider(activeItem);
            return;
        }
        if (!navDockSlider) return;
        navDockSlider.style.opacity = '1';
        const itemRect = activeItem.getBoundingClientRect();
        const dockRect = navDock.getBoundingClientRect();
        navDockSlider.style.width = `${itemRect.width}px`;
        navDockSlider.style.left = `${itemRect.left - dockRect.left}px`;
    }

    function scrollToSection(index) {
        if (!pageSections[index] || !pageScrollContainer) return;
        pageScrollContainer.scrollTo({
            top: pageSections[index].offsetTop,
            behavior: 'smooth'
        });
    }

    window.sbgNavScrollToSection = scrollToSection;

    function scrollToFooter() {
        if (!siteFooter || !pageScrollContainer) return;
        pageScrollContainer.scrollTo({
            top: pageScrollContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // index: 0..2 = sections, 3 = footer
    function setActiveState(index) {
        const onFooter = index === 3;

        const sectionItem = sectionItems.find(el => Number(el.dataset.sectionIndex) === index);
        updateNavDockSlider(onFooter ? null : sectionItem);

        pageIndicatorDots.forEach((dot) => {
            const di = Number(dot.dataset.indicatorIndex);
            const isActive = di === index;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    function getActiveStateIndex() {
        const scrollPos = pageScrollContainer.scrollTop;
        if (siteFooter) {
            const cRect = pageScrollContainer.getBoundingClientRect();
            const fRect = siteFooter.getBoundingClientRect();
            if (fRect.top <= cRect.bottom - siteFooter.offsetHeight * 0.35) {
                return 3;
            }
        }
        const scrollMid = scrollPos + pageScrollContainer.clientHeight * 0.4;
        let activeIndex = 0;
        pageSections.forEach((section, i) => {
            if (scrollMid >= section.offsetTop) activeIndex = i;
        });
        return activeIndex;
    }

    sectionItems.forEach((item) => {
        if (item.hasAttribute('data-dropdown-trigger')) return;
        item.addEventListener('click', () => scrollToSection(Number(item.dataset.sectionIndex)));
    });

    pageIndicatorDots.forEach((dot) => {
        const di = Number(dot.dataset.indicatorIndex);
        dot.addEventListener('click', () => di === 3 ? scrollToFooter() : scrollToSection(di));
    });

    pageScrollContainer.addEventListener('scroll', () => {
        setActiveState(getActiveStateIndex());
    }, { passive: true });

    // ---- Handle incoming hash links from other pages ----
    function applyHashTarget() {
        const hash = window.location.hash;
        if (hash === '#workshops') {
            scrollToSection(1);
        } else if (hash === '#join') {
            scrollToSection(2);
        } else if (hash === '#footer') {
            scrollToFooter();
        } else {
            pageScrollContainer.scrollTop = 0;
            setActiveState(0);
        }
    }
    applyHashTarget();
    window.addEventListener('hashchange', applyHashTarget);

    function renderCommunityStats() {
        const totalEvents = (window.SBG_EVENTS || []).length;

        const statEvents = document.getElementById('section3-stat-events');
        const statsSnippet = document.getElementById('section3-stats-snippet');
        const footerEvents = document.getElementById('section3-footer-events');

        if (statEvents) statEvents.textContent = String(totalEvents);
        if (statsSnippet) {
            statsSnippet.textContent = `Founded 2024 · 50+ members · ${totalEvents} events`;
        }
        if (footerEvents) footerEvents.textContent = `${totalEvents} events`;
        document.querySelectorAll('[data-finder-footer-events]').forEach((el) => {
            el.textContent = `${totalEvents} events`;
        });
    }

    renderCommunityStats();

    const section3El = pageSections[2];
    const section3Window = section3El && section3El.querySelector('.section3-window');
    let section3FinderRevealed = false;

    if (section3Window) {
        const section3RevealTargets = section3Window.querySelectorAll(
            '.section3-titlebar, .section3-notes-app, .section3-notes-toolbar, .section3-footer'
        );
        section3RevealTargets.forEach((el) => el.classList.add('section3-reveal'));

        const section3RevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !section3FinderRevealed) {
                    section3FinderRevealed = true;
                    section3Window.classList.add('is-revealed');
                    section3RevealTargets.forEach((el, i) => {
                        el.style.animationDelay = `${i * 0.03}s`;
                    });
                }
            });
        }, { root: pageScrollContainer, threshold: 0.25 });

        section3RevealObserver.observe(section3Window);

        const notesListItems = section3Window.querySelectorAll('.section3-notes-list-item[data-note-id]');
        const notesPanes = section3Window.querySelectorAll('.section3-notes-pane[data-note-panel]');
        const notesApp = section3Window.querySelector('.section3-notes-app');
        const notesHint = section3Window.querySelector('#section3-notes-hint');
        const notesMobileBack = section3Window.querySelector('#section3-notes-mobile-back');
        const notesDetail = section3Window.querySelector('.section3-notes-detail');
        const mobileNotesMq = window.matchMedia('(max-width: 768px)');
        const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const NOTES_NAV_MS = 320;
        let notesNavAnimating = false;
        let notesNavTimer = null;

        function isMobileNotesLayout() {
            return mobileNotesMq.matches;
        }

        function finishNotesNav() {
            notesNavAnimating = false;
            if (notesNavTimer) {
                window.clearTimeout(notesNavTimer);
                notesNavTimer = null;
            }
        }

        function setMobileNotesView(view, { animate = true } = {}) {
            if (!notesApp) return;
            if (!isMobileNotesLayout()) {
                notesApp.classList.remove('is-mobile-list', 'is-mobile-detail');
                finishNotesNav();
                return;
            }
            if (animate && notesNavAnimating) return;

            const useAnimate = animate && !reducedMotionMq.matches;
            notesApp.classList.toggle('is-mobile-list', view === 'list');
            notesApp.classList.toggle('is-mobile-detail', view === 'detail');

            if (!useAnimate) {
                finishNotesNav();
                return;
            }

            notesNavAnimating = true;
            notesNavTimer = window.setTimeout(finishNotesNav, NOTES_NAV_MS);
        }

        function initMobileNotesLayout() {
            if (isMobileNotesLayout()) {
                setMobileNotesView('list', { animate: false });
            } else {
                setMobileNotesView('', { animate: false });
            }
        }

        initMobileNotesLayout();
        mobileNotesMq.addEventListener('change', initMobileNotesLayout);

        notesMobileBack?.addEventListener('click', () => {
            setMobileNotesView('list', { animate: true });
        });

        notesListItems.forEach((item) => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.noteId;
                if (!noteId) return;
                const isSameActiveNote = item.classList.contains('active');
                if (isSameActiveNote && !isMobileNotesLayout()) return;
                if (isSameActiveNote && isMobileNotesLayout() && notesApp?.classList.contains('is-mobile-detail')) return;
                if (isMobileNotesLayout() && notesNavAnimating) return;

                if (notesHint) notesHint.classList.add('is-dismissed');
                if (notesApp) notesApp.classList.add('is-note-explored');

                notesListItems.forEach((el) => {
                    const isActive = el === item;
                    el.classList.toggle('active', isActive);
                    el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });
                notesPanes.forEach((pane) => {
                    const isActive = pane.dataset.notePanel === noteId;
                    pane.classList.toggle('active', isActive);
                    pane.hidden = !isActive;
                });

                if (isMobileNotesLayout()) {
                    notesDetail?.scrollTo(0, 0);
                    setMobileNotesView('detail', { animate: true });
                }
            });
        });
    }

    // Section 2: staggered reveal on scroll into workshops overview
    const section2El = pageSections[1];
    let section2Revealed = false;
    const section2RevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !section2Revealed) {
                section2Revealed = true;
                section2El.classList.add('is-revealed');
            }
        });
    }, { root: pageScrollContainer, threshold: 0.25 });

    if (section2El) section2RevealObserver.observe(section2El);

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    function renderFeaturedEvents() {
        const grid = document.getElementById('section2-events-grid');
        if (!grid || !window.SBG_EVENTS?.length) return;

        const featuredCount = window.SBG_FEATURED_EVENT_COUNT ?? 3;
        const featured = window.SBG_EVENTS.slice(0, featuredCount);

        grid.innerHTML = featured.map((ev) => `
            <div class="section2-event-card section2-reveal" data-event-number="${ev.number}">
                <div class="section2-event-card-image" style="background-image: url('${escapeHtml(ev.image)}');">
                    <span class="section2-event-card-badge">${escapeHtml(ev.badge)}</span>
                </div>
                <div class="section2-event-card-content">
                    <div class="section2-event-card-meta">
                        <div class="section2-event-date-box">
                            <div class="section2-event-date-month">${escapeHtml(ev.month)}</div>
                            <div class="section2-event-date-day">${escapeHtml(ev.day)}</div>
                        </div>
                        <div class="section2-event-card-title">${escapeHtml(ev.title)}</div>
                    </div>
                    <p class="section2-event-card-desc">${escapeHtml(ev.desc)}</p>
                    <div class="section2-event-card-footer">
                        <span class="section2-event-card-speaker">Speaker <strong>${escapeHtml(ev.speaker)}</strong></span>
                        <button type="button" class="section2-event-card-link" data-event-number="${ev.number}">View Event</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function wireEventViewButtons() {
        document.querySelectorAll('.section2-event-card-link[data-event-number]').forEach((btn) => {
            btn.addEventListener('click', () => openEventModal(Number(btn.dataset.eventNumber)));
        });
    }

    renderFeaturedEvents();

    // Section 2: event detail modal with image gallery
    const eventModal = document.getElementById('section2-event-modal');
    const eventModalImage = document.getElementById('section2-event-modal-image');
    const eventModalThumbs = document.getElementById('section2-event-modal-thumbs');
    const eventModalTitle = document.getElementById('section2-event-modal-title');
    const eventModalHeading = document.getElementById('section2-event-modal-heading');
    const eventModalDesc = document.getElementById('section2-event-modal-desc');
    const eventModalSpeaker = document.getElementById('section2-event-modal-speaker');
    const eventModalMonth = document.getElementById('section2-event-modal-month');
    const eventModalDay = document.getElementById('section2-event-modal-day');
    const eventModalBadge = document.getElementById('section2-event-modal-badge');
    const eventModalTags = document.getElementById('section2-event-modal-tags');
    const eventModalCounter = document.getElementById('section2-event-modal-counter');
    const galleryPrev = document.querySelector('.section2-gallery-prev');
    const galleryNext = document.querySelector('.section2-gallery-next');
    const eventsByNumber = window.SBG_EVENTS
        ? Object.fromEntries(window.SBG_EVENTS.map((ev) => [ev.number, ev]))
        : {};
    let modalGalleryIndex = 0;
    let modalGalleryImages = [];
    let lastFocusedElement = null;

    function updateModalGalleryCounter() {
        if (!eventModalCounter || !modalGalleryImages.length) return;
        eventModalCounter.textContent = `${modalGalleryIndex + 1} / ${modalGalleryImages.length}`;
    }

    function setModalGalleryIndex(index) {
        if (!modalGalleryImages.length || !eventModalImage) return;
        modalGalleryIndex = (index + modalGalleryImages.length) % modalGalleryImages.length;
        const src = modalGalleryImages[modalGalleryIndex];
        eventModalImage.classList.remove('is-entering');
        eventModalImage.classList.add('is-fading');
        setTimeout(() => {
            eventModalImage.src = src;
            eventModalImage.alt = eventModalHeading ? eventModalHeading.textContent : 'Event photo';
            eventModalImage.classList.remove('is-fading');
            eventModalImage.classList.add('is-entering');
            setTimeout(() => eventModalImage.classList.remove('is-entering'), 550);
        }, 180);

        updateModalGalleryCounter();

        if (eventModalThumbs) {
            eventModalThumbs.querySelectorAll('.section2-gallery-thumb').forEach((thumb, i) => {
                const isActive = i === modalGalleryIndex;
                thumb.classList.toggle('active', isActive);
                thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
            const activeThumb = eventModalThumbs.querySelector('.section2-gallery-thumb.active');
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }

    function openEventModal(eventNumber) {
        const ev = eventsByNumber[eventNumber];
        if (!ev || !eventModal) return;

        lastFocusedElement = document.activeElement;
        modalGalleryImages = ev.images || [ev.image];
        modalGalleryIndex = 0;

        if (eventModalTitle) eventModalTitle.textContent = 'Event Details';
        if (eventModalHeading) eventModalHeading.textContent = ev.title;
        if (eventModalDesc) eventModalDesc.textContent = ev.desc;
        if (eventModalSpeaker) eventModalSpeaker.textContent = ev.speaker;
        if (eventModalMonth) eventModalMonth.textContent = ev.month;
        if (eventModalDay) eventModalDay.textContent = ev.day;
        if (eventModalBadge) eventModalBadge.textContent = ev.badge;

        if (eventModalTags) {
            eventModalTags.innerHTML = (ev.tags || []).map((tag) =>
                `<span class="section2-event-modal-tag">${tag}</span>`
            ).join('');
        }

        if (eventModalThumbs) {
            eventModalThumbs.innerHTML = modalGalleryImages.map((src, i) => `
                <button type="button" class="section2-gallery-thumb${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Photo ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}>
                    <img src="${src}" alt="" />
                </button>
            `).join('');
            eventModalThumbs.querySelectorAll('.section2-gallery-thumb').forEach((thumb) => {
                thumb.addEventListener('click', () => setModalGalleryIndex(Number(thumb.dataset.index)));
            });
        }

        if (eventModalImage) {
            eventModalImage.src = modalGalleryImages[0];
            eventModalImage.alt = ev.title;
            eventModalImage.classList.remove('is-fading');
            eventModalImage.classList.add('is-entering');
            setTimeout(() => eventModalImage.classList.remove('is-entering'), 550);
        }

        updateModalGalleryCounter();

        eventModal.hidden = false;
        eventModal.setAttribute('aria-hidden', 'false');
        eventModal.classList.remove('is-open');
        void eventModal.offsetWidth;
        eventModal.classList.add('is-open');
        document.body.classList.add('section2-modal-open');

        const closeBtn = eventModal.querySelector('[data-modal-close]');
        if (closeBtn) closeBtn.focus();
    }

    function closeEventModal() {
        if (!eventModal) return;
        eventModal.classList.remove('is-open');
        eventModal.hidden = true;
        eventModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('section2-modal-open');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    wireEventViewButtons();

    if (eventModal) {
        eventModal.querySelectorAll('[data-modal-close]').forEach((el) => {
            el.addEventListener('click', closeEventModal);
        });
    }

    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => setModalGalleryIndex(modalGalleryIndex - 1));
    }
    if (galleryNext) {
        galleryNext.addEventListener('click', () => setModalGalleryIndex(modalGalleryIndex + 1));
    }

    document.addEventListener('keydown', (e) => {
        if (!eventModal || eventModal.hidden) return;
        if (e.key === 'Escape') closeEventModal();
        if (e.key === 'ArrowLeft') setModalGalleryIndex(modalGalleryIndex - 1);
        if (e.key === 'ArrowRight') setModalGalleryIndex(modalGalleryIndex + 1);
    });
})();
