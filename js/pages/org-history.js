(function () {

    // ---- Timeline reveal ----
    const nodes = document.querySelectorAll('.oh-finder-node');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    nodes.forEach((node, i) => {
        node.style.transitionDelay = `${i * 0.12}s`;
        revealObserver.observe(node);
    });

    // ---- Gallery (all event photos) ----
    const escapeAttr = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    function shuffleArray(items) {
        const arr = items.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function buildGalleryImages() {
        const events = window.SBG_EVENTS || [];
        const images = [];

        events.forEach((ev) => {
            (ev.images || []).forEach((src, i) => {
                images.push({
                    src,
                    alt: `${ev.title} — photo ${i + 1}`
                });
            });
        });

        if (images.length) return shuffleArray(images);

        return shuffleArray([
            { src: 'img/home1.jpg', alt: 'Community event' },
            { src: 'img/home2.jpg', alt: 'Workshop session' },
            { src: 'img/home3.jpg', alt: 'Group photo' }
        ]);
    }

    const galleryImages = buildGalleryImages();
    const galleryMain = document.getElementById('oh-gallery-main');
    const galleryThumbsEl = document.getElementById('oh-gallery-thumbs');
    const galleryPrev = document.querySelector('.oh-gallery-prev');
    const galleryNext = document.querySelector('.oh-gallery-next');
    let galleryIndex = 0;

    function renderGalleryThumbs() {
        if (!galleryThumbsEl) return;

        galleryThumbsEl.innerHTML = galleryImages.map((img, i) => `
            <button type="button" class="oh-gallery-thumb${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="${escapeAttr(img.alt)}"${i === 0 ? ' aria-current="true"' : ''}>
                <img src="${escapeAttr(img.src)}" alt="" loading="lazy" />
            </button>
        `).join('');

        galleryThumbsEl.querySelectorAll('.oh-gallery-thumb').forEach((thumb) => {
            thumb.addEventListener('click', () => {
                setGalleryIndex(Number(thumb.dataset.index));
            });
        });
    }

    function scrollActiveGalleryThumbIntoView() {
        if (!galleryThumbsEl) return;
        const activeThumb = galleryThumbsEl.querySelector('.oh-gallery-thumb.active');
        if (!activeThumb) return;
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const containerWidth = galleryThumbsEl.clientWidth;
        galleryThumbsEl.scrollTo({
            left: Math.max(0, thumbLeft - (containerWidth / 2) + (thumbWidth / 2)),
            behavior: 'smooth'
        });
    }

    function setGalleryIndex(index, options = {}) {
        galleryIndex = (index + galleryImages.length) % galleryImages.length;
        const current = galleryImages[galleryIndex];

        if (galleryMain) {
            galleryMain.classList.add('is-fading');
            window.setTimeout(() => {
                galleryMain.src = current.src;
                galleryMain.alt = current.alt;
                galleryMain.classList.remove('is-fading');
            }, 120);
        }

        document.querySelectorAll('.oh-gallery-thumb').forEach((thumb, i) => {
            const isActive = i === galleryIndex;
            thumb.classList.toggle('active', isActive);
            thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        if (!options.skipThumbScroll) {
            scrollActiveGalleryThumbIntoView();
        }
    }

    renderGalleryThumbs();
    setGalleryIndex(0, { skipThumbScroll: true });

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => setGalleryIndex(galleryIndex - 1));
    }
    if (galleryNext) {
        galleryNext.addEventListener('click', () => setGalleryIndex(galleryIndex + 1));
    }

    // ---- Narrative reveal ----
    const narrative = document.getElementById('oh-finder-narrative');
    const narrativeItems = narrative && narrative.querySelectorAll('.oh-narrative-reveal');
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
