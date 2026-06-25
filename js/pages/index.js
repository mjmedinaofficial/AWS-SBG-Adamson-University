(function() {
    const DESKTOP_MQ = window.matchMedia('(min-width: 1025px)');
    const MOBILE_LAYOUT_MQ = window.matchMedia('(max-width: 1024px)');
    const POINTER_FINE_MQ = window.matchMedia('(hover: hover) and (pointer: fine)');
    const REDUCED_MOTION_MQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    const customCursor = document.getElementById('custom-cursor');
    const customCursorGlow = document.getElementById('custom-cursor-glow');
    const useCustomCursor = customCursor && customCursorGlow && POINTER_FINE_MQ.matches;

    let pointerX = 0;
    let pointerY = 0;
    let visualFrameQueued = false;

    function scheduleVisualFrame() {
        if (visualFrameQueued) return;
        visualFrameQueued = true;
        requestAnimationFrame(runVisualFrame);
    }

    if (useCustomCursor) {
        document.body.classList.add('custom-cursor-active');

        document.addEventListener('mousemove', (e) => {
            pointerX = e.clientX;
            pointerY = e.clientY;
            scheduleVisualFrame();
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            customCursor.style.opacity = '0';
            customCursorGlow.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            customCursor.style.opacity = '1';
            customCursorGlow.style.opacity = '0.85';
        });
    }

    // Section 1: hero glass card follows cursor (3D tilt) — desktop mouse only
    const section1El = document.querySelector('.section1');
    const section1TiltCard = document.getElementById('section1-tilt-card');
    const SECTION1_TILT_MQ = window.matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
    const isTouchPrimaryDevice = navigator.maxTouchPoints > 0;
    const TILT_LERP = 0.2;
    const TILT_RESET_LERP = 0.1;
    const TILT_DIVISOR = 30;
    const TILT_MAX_DEG = 12;

    let tiltRect = null;
    let section1Rect = null;
    let tiltRectDirty = true;
    let tiltHovering = false;
    let tiltCurrentRX = 0;
    let tiltCurrentRY = 0;
    let tiltTargetRX = 0;
    let tiltTargetRY = 0;

    if (isTouchPrimaryDevice) {
        document.body.classList.add('touch-primary-device');
    }

    function refreshTiltRects() {
        if (section1TiltCard) tiltRect = section1TiltCard.getBoundingClientRect();
        if (section1El) section1Rect = section1El.getBoundingClientRect();
        tiltRectDirty = false;
    }

    function invalidateTiltRect() {
        tiltRectDirty = true;
    }

    function clampTilt(value) {
        return Math.max(-TILT_MAX_DEG, Math.min(TILT_MAX_DEG, value));
    }

    function setTiltTargets(clientX, clientY) {
        if (!tiltRect || tiltRectDirty) refreshTiltRects();
        if (!tiltRect) return;
        const centerX = tiltRect.left + tiltRect.width / 2;
        const centerY = tiltRect.top + tiltRect.height / 2;
        tiltTargetRY = clampTilt((centerX - clientX) / TILT_DIVISOR);
        tiltTargetRX = clampTilt((centerY - clientY) / TILT_DIVISOR);
    }

    function pointerInsideSection1(x, y) {
        if (!section1Rect || tiltRectDirty) refreshTiltRects();
        if (!section1Rect) return false;
        return x >= section1Rect.left && x <= section1Rect.right
            && y >= section1Rect.top && y <= section1Rect.bottom;
    }

    function beginTiltHover() {
        if (!section1TiltCard || tiltHovering) return;
        tiltHovering = true;
        invalidateTiltRect();
        section1TiltCard.classList.add('is-tilting');
    }

    function endTiltHover() {
        if (!section1TiltCard) return;
        tiltHovering = false;
        tiltTargetRX = 0;
        tiltTargetRY = 0;
        scheduleVisualFrame();
    }

    function finalizeTiltIdle() {
        if (!section1TiltCard) return;
        section1TiltCard.classList.remove('is-tilting');
    }

    function resetSection1TiltCard() {
        if (!section1TiltCard) return;
        tiltHovering = false;
        tiltCurrentRX = 0;
        tiltCurrentRY = 0;
        tiltTargetRX = 0;
        tiltTargetRY = 0;
        section1TiltCard.classList.remove('is-tilting');
        section1TiltCard.style.transition = '';
        section1TiltCard.style.transform = '';
    }

    function isSection1TiltEnabled() {
        if (!section1TiltCard) return false;
        if (MOBILE_LAYOUT_MQ.matches) return false;
        if (document.body.classList.contains('desktop-zoom-stack')) return false;
        if (!SECTION1_TILT_MQ.matches) return false;
        if (isTouchPrimaryDevice) return false;
        if (REDUCED_MOTION_MQ.matches) return false;
        return true;
    }

    function applyTiltTransform() {
        section1TiltCard.style.transform =
            `perspective(1000px) rotateX(${tiltCurrentRX.toFixed(2)}deg) rotateY(${tiltCurrentRY.toFixed(2)}deg)`;
    }

    function runVisualFrame() {
        visualFrameQueued = false;
        let needsAnotherFrame = false;

        if (useCustomCursor) {
            const cursorTransform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
            customCursor.style.transform = cursorTransform;
            customCursorGlow.style.transform = cursorTransform;
        }

        if (isSection1TiltEnabled() && section1TiltCard) {
            const deltaX = tiltTargetRX - tiltCurrentRX;
            const deltaY = tiltTargetRY - tiltCurrentRY;
            const isSettling = !tiltHovering;
            const lerp = isSettling ? TILT_RESET_LERP : TILT_LERP;

            if (Math.abs(deltaX) > 0.02 || Math.abs(deltaY) > 0.02) {
                tiltCurrentRX += deltaX * lerp;
                tiltCurrentRY += deltaY * lerp;
                applyTiltTransform();
                needsAnotherFrame = true;
            } else if (tiltHovering) {
                tiltCurrentRX = tiltTargetRX;
                tiltCurrentRY = tiltTargetRY;
                applyTiltTransform();
            } else {
                tiltCurrentRX = 0;
                tiltCurrentRY = 0;
                applyTiltTransform();
                finalizeTiltIdle();
            }
        }

        if (needsAnotherFrame) scheduleVisualFrame();
    }

    function syncSection1TiltState() {
        if (!isSection1TiltEnabled()) resetSection1TiltCard();
    }

    syncSection1TiltState();
    MOBILE_LAYOUT_MQ.addEventListener('change', syncSection1TiltState);
    SECTION1_TILT_MQ.addEventListener('change', syncSection1TiltState);
    REDUCED_MOTION_MQ.addEventListener('change', syncSection1TiltState);

    if (section1TiltCard && section1El) {
        window.addEventListener('resize', invalidateTiltRect, { passive: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', invalidateTiltRect, { passive: true });
        }

        document.addEventListener('mousemove', (e) => {
            pointerX = e.clientX;
            pointerY = e.clientY;
            if (!isSection1TiltEnabled()) return;

            if (pointerInsideSection1(pointerX, pointerY)) {
                beginTiltHover();
                setTiltTargets(pointerX, pointerY);
                scheduleVisualFrame();
                return;
            }

            if (tiltHovering) endTiltHover();
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            endTiltHover();
        });
    }

    // Global: nav dock, page indicator, scroll container
    const topBar = document.querySelector('.navbar-brand-pill');
    const navDock = document.querySelector('.navbar-nav-pill');
    const navDockSlider = navDock ? navDock.querySelector('.dock-slider') : null;
    const sectionItems = navDock ? Array.from(navDock.querySelectorAll('[data-section-index]')) : Array.from(document.querySelectorAll('.navbar-link[data-section-index]'));
    const pageIndicatorDots = Array.from(document.querySelectorAll('.page-indicator-dot'));
    const pageSections = document.querySelectorAll('.page-section');
    const pageScrollContainer = document.querySelector('.horizontal-container');
    const siteFooter = document.querySelector('.site-footer');

    if (section1TiltCard && pageScrollContainer) {
        pageScrollContainer.addEventListener('scroll', invalidateTiltRect, { passive: true });
    }

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
            syncSection1TiltState();
            return;
        }
        // Laptops/desktops (≥1024px): keep side-by-side hero + moving carousel.
        if (window.innerWidth >= 1025) {
            document.body.classList.remove('desktop-zoom-stack');
            syncSection1TiltState();
            return;
        }
        document.body.classList.toggle(
            'desktop-zoom-stack',
            estimateBrowserZoom() > ZOOM_STACK_THRESHOLD
        );
        syncSection1TiltState();
    }

    syncDesktopZoomStack();
    window.addEventListener('resize', syncDesktopZoomStack);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncDesktopZoomStack);
    }

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
        if (!navDockSlider || !navDock) return;
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

    function scrollToSnapIndex(index) {
        if (index === 3) scrollToFooter();
        else scrollToSection(index);
    }

    function isEditableTarget(el) {
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
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

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (isEditableTarget(document.activeElement)) return;

        const eventModal = document.getElementById('section2-event-modal');
        if (eventModal && !eventModal.hasAttribute('hidden')) return;

        e.preventDefault();
        const current = getActiveStateIndex();
        if (e.key === 'ArrowDown' && current < 3) scrollToSnapIndex(current + 1);
        if (e.key === 'ArrowUp' && current > 0) scrollToSnapIndex(current - 1);
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
            statsSnippet.textContent = `Founded 2024 · 120+ members · ${totalEvents} events`;
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
        const mobileNotesMq = window.matchMedia('(max-width: 1024px)');
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

        const gridSlots = window.SBG_FEATURED_EVENT_COUNT ?? 3;
        const eventCount = Math.max(gridSlots - 1, 1);
        const featured = window.SBG_EVENTS.slice(0, eventCount);

        const eventCards = featured.map((ev) => `
            <div class="section2-event-card section2-reveal" data-event-number="${ev.number}">
                <div class="section2-event-card-image${ev.image ? '' : ' section2-event-card-image--empty'}"${ev.image ? ` style="background-image: url('${escapeHtml(ev.image)}');"` : ''}>
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

        const viewAllCard = `
            <a href="events.html" class="section2-view-all-card section2-reveal" title="View all events and workshops">
                <p class="section2-view-all-card-desc">View all the engaging events and workshops hosted by AWS Student Builder Group — from hands-on cloud labs to certification prep and community meetups.</p>
                <span class="section2-view-all-card-btn section1-btn">View All Events</span>
            </a>
        `;

        grid.innerHTML = eventCards + viewAllCard;
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
