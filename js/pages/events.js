(function () {
    const events = window.SBG_EVENTS || [];

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const listEl = document.getElementById('ev-list');
    const previewEl = document.getElementById('ev-preview');
    const yearStripEl = document.getElementById('ev-year-strip');
    const monthStripEl = document.getElementById('ev-month-strip');

    const now = new Date();
    let activeYear = 'all';
    let activeMonth = now.getMonth() + 1;
    let selectedId = null;

    const eventYears = [...new Set(events.map((e) => e.year))].sort();

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    function sortEventsChronologically(list) {
        return list.slice().sort((a, b) => {
            const dateA = new Date(parseInt(a.year, 10), a.monthNum - 1, parseInt(a.day, 10));
            const dateB = new Date(parseInt(b.year, 10), b.monthNum - 1, parseInt(b.day, 10));
            return dateB - dateA;
        });
    }

    function isAllYearsView() {
        return activeYear === 'all';
    }

    function getFilteredEvents() {
        if (isAllYearsView()) return sortEventsChronologically(events);
        return events.filter((ev) => {
            if (String(ev.year) !== String(activeYear)) return false;
            if (ev.monthNum !== activeMonth) return false;
            return true;
        });
    }

    function eventsInYear(year) {
        return events.filter((ev) => String(ev.year) === String(year));
    }

    function firstMonthWithEvents(year) {
        const months = eventsInYear(year).map((ev) => ev.monthNum);
        return months.length ? Math.min(...months) : 1;
    }

    function badgeClass(ev) {
        return ev.badgeClass || 'upcoming';
    }

    function renderPreview(ev) {
        if (!ev) {
            previewEl.innerHTML = '<p class="ev-list-empty">Select an event to preview details.</p>';
            return;
        }
        const imageCount = ev.images?.length ?? 0;
        const hasPhotos = imageCount > 0;
        const heroInner = `
                    <span class="ev-preview-hero-badge ${badgeClass(ev)}">${escapeHtml(ev.badge)}</span>
                    <div class="ev-preview-hero-date">
                        <span class="day">${escapeHtml(ev.day)}</span>
                        <span class="month-year">${escapeHtml(ev.month)} ${escapeHtml(ev.year)}</span>
                    </div>
                    ${hasPhotos ? `
                    <span class="ev-preview-hero-gallery-hint">
                        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><rect x="2" y="4" width="16" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="9" r="1.6" fill="currentColor" stroke="none"/><path d="M2 14l4.2-3.5 3.3 2.8L13 10l5 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        View ${imageCount} photo${imageCount === 1 ? '' : 's'}
                    </span>` : ''}`;
        previewEl.innerHTML = `
            ${hasPhotos ? `
            <button type="button" class="ev-preview-hero-btn" aria-label="View ${imageCount} event photo${imageCount === 1 ? '' : 's'}">
                <div class="ev-preview-hero" style="background-image:url('${escapeHtml(ev.image)}')">
                    ${heroInner}
                </div>
            </button>` : `
            <div class="ev-preview-hero ev-preview-hero--no-image">
                ${heroInner}
            </div>`}
            <h2 class="ev-preview-title">${escapeHtml(ev.title)}</h2>
            <p class="ev-preview-desc">${escapeHtml(ev.desc)}</p>
            <p class="ev-preview-speaker">Speaker: <strong>${escapeHtml(ev.speaker)}</strong></p>
            <div class="ev-preview-footer">
                <div class="ev-preview-tags">
                    ${ev.tags.map((t) => `<span class="ev-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            </div>
        `;

        const heroBtn = previewEl.querySelector('.ev-preview-hero-btn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => openGallery(ev));
        }

        if (window.matchMedia('(max-width: 1024px)').matches) {
            previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderList() {
        const filtered = getFilteredEvents();
        if (!filtered.length) {
            const monthName = MONTHS[activeMonth - 1];
            const emptyMsg = isAllYearsView()
                ? 'No events found.'
                : `No events in ${monthName} ${activeYear}.`;
            listEl.innerHTML = `<p class="ev-list-empty">${emptyMsg}</p>`;
            renderPreview(null);
            return;
        }
        if (!filtered.find((e) => e.id === selectedId)) {
            selectedId = filtered[0].id;
        }
        listEl.innerHTML = filtered.map((ev) => `
            <button type="button" class="ev-list-row${ev.id === selectedId ? ' selected' : ''}" data-id="${escapeHtml(ev.id)}">
                <span class="ev-list-date">
                    <span class="ev-list-date-month">${escapeHtml(ev.month)}</span>
                    <span class="ev-list-date-day">${escapeHtml(ev.day)}</span>
                </span>
                <span class="ev-list-info">
                    <h3>${escapeHtml(ev.title)}</h3>
                    <span>${escapeHtml(ev.speaker)}</span>
                </span>
                <span class="ev-list-badge ${badgeClass(ev)}">${escapeHtml(ev.badge)}</span>
            </button>
        `).join('');

        listEl.querySelectorAll('.ev-list-row').forEach((row) => {
            row.addEventListener('click', () => {
                selectedId = row.dataset.id;
                renderList();
                renderPreview(events.find((e) => e.id === selectedId));
            });
        });

        renderPreview(events.find((e) => e.id === selectedId));
    }

    function renderYearStrip() {
        if (!yearStripEl) return;
        const allActive = isAllYearsView();
        const allTab = `<button type="button" class="ev-year-tab${allActive ? ' active' : ''}" data-year="all" role="tab" aria-selected="${allActive}">All<span class="ev-year-tab-count">${events.length}</span></button>`;
        const yearTabs = eventYears.map((year) => {
            const active = !allActive && String(year) === String(activeYear);
            const count = eventsInYear(year).length;
            return `<button type="button" class="ev-year-tab${active ? ' active' : ''}" data-year="${escapeHtml(year)}" role="tab" aria-selected="${active}">${escapeHtml(year)}<span class="ev-year-tab-count">${count}</span></button>`;
        }).join('');

        yearStripEl.innerHTML = allTab + yearTabs;

        yearStripEl.querySelectorAll('.ev-year-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                activeYear = tab.dataset.year;
                if (!isAllYearsView()) {
                    activeMonth = firstMonthWithEvents(activeYear);
                }
                renderYearStrip();
                renderMonthStrip();
                renderList();
            });
        });
    }

    function renderMonthStrip() {
        if (!monthStripEl) return;
        if (isAllYearsView()) {
            monthStripEl.innerHTML = '';
            monthStripEl.hidden = true;
            return;
        }

        monthStripEl.hidden = false;
        const yearEvents = eventsInYear(activeYear);
        const eventMonths = new Set(yearEvents.map((e) => e.monthNum));
        monthStripEl.innerHTML = MONTHS.map((name, i) => {
            const num = i + 1;
            const has = eventMonths.has(num);
            const active = activeMonth === num;
            return `<button type="button" class="ev-month-tab${has ? ' has-events' : ''}${active ? ' active' : ''}" data-month="${num}" role="tab" aria-selected="${active}">${name}</button>`;
        }).join('');

        monthStripEl.querySelectorAll('.ev-month-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                activeMonth = parseInt(tab.dataset.month, 10);
                renderMonthStrip();
                renderList();
            });
        });
    }

    document.querySelectorAll('[data-finder-footer-events]').forEach((el) => {
        if (events.length) el.textContent = `${events.length} events`;
    });

    const statNums = document.querySelectorAll('.ev-stat-num');
    if (statNums[0] && events.length) statNums[0].textContent = String(events.length);
    if (statNums[1] && events.length) {
        statNums[1].textContent = String(events.filter((ev) => ev.badgeClass === 'upcoming').length);
    }

    renderYearStrip();
    renderMonthStrip();
    renderList();

    // ---- Event photo gallery modal ----
    const galleryModal = document.getElementById('ev-gallery-modal');
    const galleryImage = document.getElementById('ev-gallery-image');
    const galleryThumbs = document.getElementById('ev-gallery-thumbs');
    const galleryCounter = document.getElementById('ev-gallery-counter');
    const galleryTitle = document.getElementById('ev-gallery-modal-title');
    const galleryPrev = document.querySelector('.ev-gallery-prev');
    const galleryNext = document.querySelector('.ev-gallery-next');
    let galleryImages = [];
    let galleryIndex = 0;
    let galleryLastFocus = null;

    function updateGalleryCounter() {
        if (!galleryCounter || !galleryImages.length) return;
        galleryCounter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
    }

    function scrollActiveThumbIntoView() {
        if (!galleryThumbs) return;
        const activeThumb = galleryThumbs.querySelector('.ev-gallery-thumb.active');
        if (!activeThumb) return;
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const containerWidth = galleryThumbs.clientWidth;
        const targetLeft = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
        galleryThumbs.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: 'smooth'
        });
    }

    function setGalleryIndex(index) {
        if (!galleryImages.length || !galleryImage) return;
        galleryIndex = (index + galleryImages.length) % galleryImages.length;
        const src = galleryImages[galleryIndex];
        galleryImage.classList.add('is-fading');
        setTimeout(() => {
            galleryImage.src = src;
            galleryImage.alt = galleryTitle ? galleryTitle.textContent : 'Event photo';
            galleryImage.classList.remove('is-fading');
        }, 180);
        updateGalleryCounter();
        if (galleryThumbs) {
            galleryThumbs.querySelectorAll('.ev-gallery-thumb').forEach((thumb, i) => {
                const isActive = i === galleryIndex;
                thumb.classList.toggle('active', isActive);
                thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
            scrollActiveThumbIntoView();
        }
    }

    function openGallery(ev) {
        if (!galleryModal || !ev || !ev.images?.length) return;
        galleryLastFocus = document.activeElement;
        galleryImages = ev.images || [ev.image];
        galleryIndex = 0;

        if (galleryTitle) {
            galleryTitle.innerHTML = `<span class="ev-finder-title-icon" aria-hidden="true"></span>${escapeHtml(ev.title)}`;
        }

        if (galleryThumbs) {
            galleryThumbs.innerHTML = galleryImages.map((src, i) => `
                <button type="button" class="ev-gallery-thumb${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Photo ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}>
                    <img src="${escapeHtml(src)}" alt="" />
                </button>
            `).join('');
            galleryThumbs.querySelectorAll('.ev-gallery-thumb').forEach((thumb) => {
                thumb.addEventListener('click', () => setGalleryIndex(parseInt(thumb.dataset.index, 10)));
            });
        }

        if (galleryImage) {
            galleryImage.src = galleryImages[0];
            galleryImage.alt = ev.title;
        }
        updateGalleryCounter();

        galleryModal.hidden = false;
        galleryModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('ev-gallery-open');
        galleryModal.querySelector('[data-ev-gallery-close]')?.focus();
    }

    function closeGallery() {
        if (!galleryModal) return;
        galleryModal.hidden = true;
        galleryModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('ev-gallery-open');
        if (galleryLastFocus && typeof galleryLastFocus.focus === 'function') {
            galleryLastFocus.focus();
        }
    }

    if (galleryModal) {
        galleryModal.querySelectorAll('[data-ev-gallery-close]').forEach((el) => {
            el.addEventListener('click', closeGallery);
        });
    }
    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => setGalleryIndex(galleryIndex - 1));
    }
    if (galleryNext) {
        galleryNext.addEventListener('click', () => setGalleryIndex(galleryIndex + 1));
    }
    document.addEventListener('keydown', (e) => {
        if (!galleryModal || galleryModal.hidden) return;
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowLeft') setGalleryIndex(galleryIndex - 1);
        if (e.key === 'ArrowRight') setGalleryIndex(galleryIndex + 1);
    });

    // ---- Custom cursor ----
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
        document.addEventListener('mouseleave', () => {
            customCursor.style.opacity = '0';
            customCursorGlow.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            customCursor.style.opacity = '1';
            customCursorGlow.style.opacity = '0.8';
        });
    }

})();
