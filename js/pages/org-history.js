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

    // ---- Mac Freeform Board Interactivity ----
    const ffContainer = document.getElementById('ff-canvas-container');
    const ffBoard = document.getElementById('ff-canvas-board');
    const ffConnections = document.getElementById('ff-connections');
    const ffCenterCard = document.getElementById('ff-board-title');
    const ffZoomIn = document.getElementById('ff-zoom-in');
    const ffZoomOut = document.getElementById('ff-zoom-out');
    const ffZoomLevel = document.getElementById('ff-zoom-level');
    const ffResetView = document.getElementById('ff-reset-view');
    const ffToolBtns = document.querySelectorAll('.oh-tool-btn');

    if (ffContainer && ffBoard && ffConnections && ffCenterCard) {
        let scale = 1.0;
        let panX = 0;
        let panY = 0;

        function applyBoardTransform() {
            ffBoard.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
        }

        function updateZoomText() {
            if (ffZoomLevel) {
                ffZoomLevel.textContent = `${Math.round(scale * 100)}%`;
            }
        }

        const rxMap = {
            "chelsea": -0.72,
            "kyzren": 0.0,
            "tanya": 0.72,
            "raefshaun": -0.82,
            "christine": 0.82,
            "john": -0.68,
            "rafael": 0.0,
            "jan": 0.68
        };
        const ryMap = {
            "chelsea": -0.66,
            "kyzren": -0.80,
            "tanya": -0.66,
            "raefshaun": 0.0,
            "christine": 0.0,
            "john": 0.66,
            "rafael": 0.80,
            "jan": 0.66
        };

        // Auto-fit coordinates to screen viewport size
        function fitToScreen() {
            const Cw = ffContainer.clientWidth || window.innerWidth;
            const Ch = ffContainer.clientHeight;
            const isMobile = window.innerWidth <= 1024;

            // On desktop, bail if container has no dimensions yet
            if (!isMobile && (Cw === 0 || Ch === 0)) return;
            // On mobile, bail only if width is 0
            if (isMobile && Cw === 0) return;

            // Reset zoom & pan to default
            scale = 1.0;
            panX = 0;
            panY = 0;
            applyBoardTransform();
            updateZoomText();

            if (isMobile) {
                // Mobile/Compact layout: Title at top center, notes in 2 perfectly centered columns below
                const centerWidth = Math.min(380, Cw - 32);
                ffCenterCard.style.position = 'absolute';
                ffCenterCard.style.width = `${centerWidth}px`;
                ffCenterCard.style.height = 'auto';
                ffCenterCard.style.left = `${(Cw - centerWidth) / 2}px`;
                ffCenterCard.style.top = '14px';

                // Title height calculation for topStart gap
                const titleHeight = Math.max(80, ffCenterCard.offsetHeight || 85);
                const topStart = 14 + titleHeight + 20;

                // Card dimensions and responsive grid centering
                const colGap = 16;
                const rowGap = 16;
                const noteHeight = 115;
                const maxNoteWidth = 185;
                const noteWidth = Math.min(maxNoteWidth, Math.floor((Cw - 40 - colGap) / 2));
                
                // Calculate total grid width & symmetric left margin for 100% horizontal centering
                const totalGridWidth = 2 * noteWidth + colGap;
                const gridLeftMargin = Math.max(12, Math.round((Cw - totalGridWidth) / 2));

                // Mobile 2x4 distribution positioning
                const mobileCoords = {
                    "chelsea":   { col: 0, row: 0 },
                    "kyzren":    { col: 1, row: 0 },
                    "tanya":     { col: 0, row: 1 },
                    "raefshaun": { col: 1, row: 1 },
                    "christine": { col: 0, row: 2 },
                    "john":      { col: 1, row: 2 },
                    "rafael":    { col: 0, row: 3 },
                    "jan":       { col: 1, row: 3 }
                };

                const activeNotes = ffBoard.querySelectorAll('.oh-freeform-note');
                activeNotes.forEach(note => {
                    const id = note.dataset.id;
                    const coord = mobileCoords[id] || { col: 0, row: 0 };
                    
                    note.style.position = 'absolute';
                    note.style.width = `${noteWidth}px`;
                    note.style.height = `${noteHeight}px`;

                    const leftPos = gridLeftMargin + coord.col * (noteWidth + colGap);
                    const topPos = topStart + coord.row * (noteHeight + rowGap);

                    note.style.left = `${leftPos}px`;
                    note.style.top = `${topPos}px`;
                });

                // Calculate total height needed for the board canvas
                const lastRowTop = topStart + 3 * (noteHeight + rowGap);
                const neededHeight = lastRowTop + noteHeight + 30;
                ffBoard.style.height = `${neededHeight}px`;
                ffContainer.style.height = `${neededHeight}px`;

                updateConnections();
                return;
            } else {
                // Desktop circular mind-map layout
                const centerWidth = 340;
                const centerHeight = 120;
                const noteWidth = 155;
                const noteHeight = 120;

                ffCenterCard.style.width = `${centerWidth}px`;
                ffCenterCard.style.height = `${centerHeight}px`;
                ffCenterCard.style.left = `${(Cw - centerWidth) / 2}px`;
                ffCenterCard.style.top = `${(Ch - centerHeight) / 2}px`;

                // Desktop circular mind-map layout (spacious, non-crowded placement)
                const spanX = Math.round(Math.min(460, (Cw - noteWidth) * 0.42));
                const spanY = Math.round(Math.min(250, (Ch - noteHeight) * 0.43));

                const cx = Cw / 2;
                const cy = Ch / 2;

                const activeNotes = ffBoard.querySelectorAll('.oh-freeform-note');
                activeNotes.forEach(note => {
                    const id = note.dataset.id;
                    const rx = rxMap[id] || 0;
                    const ry = ryMap[id] || 0;

                    note.style.width = `${noteWidth}px`;
                    note.style.height = `${noteHeight}px`;

                    const targetLeft = cx + rx * spanX - noteWidth / 2;
                    const targetTop = cy + ry * spanY - noteHeight / 2;

                    note.style.left = `${targetLeft}px`;
                    note.style.top = `${targetTop}px`;
                });
            }

            updateConnections();
        }

        // Initial paint & wait-for-render paint
        fitToScreen();
        window.setTimeout(fitToScreen, 100);

        // Resize handler to automatically keep elements in view
        window.addEventListener('resize', fitToScreen);

        // ---- Canvas Panning ----
        let isPanning = false;
        let startPanX = 0, startPanY = 0;

        ffContainer.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 1024) return;
            if (e.target.closest('.oh-freeform-note') || 
                e.target.closest('#ff-board-title') || 
                e.target.closest('.oh-tool-btn') || 
                e.target.closest('.oh-freeform-zoom-panel') || 
                e.target.closest('.oh-freeform-footer')) {
                return;
            }
            isPanning = true;
            startPanX = e.clientX - panX;
            startPanY = e.clientY - panY;
            ffContainer.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            panX = e.clientX - startPanX;
            panY = e.clientY - startPanY;
            applyBoardTransform();
        });

        document.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                ffContainer.style.cursor = 'grab';
            }
        });

        // Touch panning
        ffContainer.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) return;
            if (e.target.closest('.oh-freeform-note') || 
                e.target.closest('#ff-board-title') || 
                e.target.closest('.oh-tool-btn') || 
                e.target.closest('.oh-freeform-zoom-panel') || 
                e.target.closest('.oh-freeform-footer')) {
                return;
            }
            if (e.touches.length === 1) {
                isPanning = true;
                startPanX = e.touches[0].clientX - panX;
                startPanY = e.touches[0].clientY - panY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPanning) return;
            if (e.touches.length === 1) {
                panX = e.touches[0].clientX - startPanX;
                panY = e.touches[0].clientY - startPanY;
                applyBoardTransform();
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            isPanning = false;
        });

        // ---- Zoom Panel Actions ----
        if (ffZoomIn) {
            ffZoomIn.addEventListener('click', () => {
                scale = Math.min(1.5, scale + 0.1);
                updateZoomText();
                applyBoardTransform();
            });
        }
        if (ffZoomOut) {
            ffZoomOut.addEventListener('click', () => {
                scale = Math.max(0.5, scale - 0.1);
                updateZoomText();
                applyBoardTransform();
            });
        }
        if (ffResetView) {
            ffResetView.addEventListener('click', fitToScreen);
        }

        let activeDragEl = null;
        let dragOffsetX = 0, dragOffsetY = 0;
        let maxZIndex = 10;

        function startDrag(element, clientX, clientY) {
            activeDragEl = element;
            
            // Increment and set max z-index to bring this element to the front
            maxZIndex++;
            element.style.zIndex = maxZIndex;
            
            const boardRect = ffBoard.getBoundingClientRect();
            
            // Mouse pointer in board's coordinate system
            const boardMouseX = (clientX - boardRect.left) / scale;
            const boardMouseY = (clientY - boardRect.top) / scale;
            
            const currentLeft = element.offsetLeft;
            const currentTop = element.offsetTop;
            
            dragOffsetX = boardMouseX - currentLeft;
            dragOffsetY = boardMouseY - currentTop;
        }

        function initDraggable(el) {
            el.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                startDrag(el, e.clientX, e.clientY);
            });

            el.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                if (e.touches.length === 1) {
                    startDrag(el, e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: false });
        }

        const draggables = ffBoard.querySelectorAll('.oh-freeform-note, #ff-board-title');
        draggables.forEach(initDraggable);

        document.addEventListener('mousemove', (e) => {
            if (!activeDragEl) return;
            e.preventDefault();
            const boardRect = ffBoard.getBoundingClientRect();
            const boardMouseX = (e.clientX - boardRect.left) / scale;
            const boardMouseY = (e.clientY - boardRect.top) / scale;
            
            let newLeft = boardMouseX - dragOffsetX;
            let newTop = boardMouseY - dragOffsetY;
            
            const maxLeft = ffBoard.clientWidth - activeDragEl.offsetWidth;
            const maxTop = ffBoard.clientHeight - activeDragEl.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            activeDragEl.style.left = `${newLeft}px`;
            activeDragEl.style.top = `${newTop}px`;
            
            updateConnections();
        });

        document.addEventListener('touchmove', (e) => {
            if (!activeDragEl) return;
            e.preventDefault();
            const boardRect = ffBoard.getBoundingClientRect();
            const boardMouseX = (e.touches[0].clientX - boardRect.left) / scale;
            const boardMouseY = (e.touches[0].clientY - boardRect.top) / scale;
            
            let newLeft = boardMouseX - dragOffsetX;
            let newTop = boardMouseY - dragOffsetY;
            
            const maxLeft = ffBoard.clientWidth - activeDragEl.offsetWidth;
            const maxTop = ffBoard.clientHeight - activeDragEl.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            activeDragEl.style.left = `${newLeft}px`;
            activeDragEl.style.top = `${newTop}px`;
            
            updateConnections();
        }, { passive: false });

        const endDragHandler = () => {
            if (activeDragEl) {
                // Do NOT reset zIndex so it stays on top of other elements!
                activeDragEl = null;
            }
        };

        document.addEventListener('mouseup', endDragHandler);
        document.addEventListener('touchend', endDragHandler);

        // ---- Dynamic Connections ----
        function updateConnections() {
            if (!ffConnections || !ffCenterCard) return;
            ffConnections.innerHTML = '';

            const cx = ffCenterCard.offsetLeft + ffCenterCard.offsetWidth / 2;
            const cy = ffCenterCard.offsetTop + ffCenterCard.offsetHeight / 2;

            const activeNotes = ffBoard.querySelectorAll('.oh-freeform-note');
            activeNotes.forEach(note => {
                const nx = note.offsetLeft + note.offsetWidth / 2;
                const ny = note.offsetTop + note.offsetHeight / 2;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const cXOffset = (cx - nx) * 0.45;
                const cYOffset = (cy - ny) * 0.15;
                path.setAttribute('d', `M ${nx} ${ny} Q ${nx + cXOffset} ${ny + cYOffset} ${cx} ${cy}`);
                
                path.setAttribute('stroke', 'rgba(187, 175, 253, 0.32)');
                path.setAttribute('stroke-width', '2.5');
                path.setAttribute('stroke-dasharray', '5 5');
                path.setAttribute('fill', 'none');

                const circleStart = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circleStart.setAttribute('cx', nx);
                circleStart.setAttribute('cy', ny);
                circleStart.setAttribute('r', '4');
                circleStart.setAttribute('fill', '#f29b3c');

                const circleEnd = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circleEnd.setAttribute('cx', cx);
                circleEnd.setAttribute('cy', cy);
                circleEnd.setAttribute('r', '4.5');
                circleEnd.setAttribute('fill', '#bbaffd');

                ffConnections.appendChild(path);
                ffConnections.appendChild(circleStart);
                ffConnections.appendChild(circleEnd);
            });
        }

        // ---- Toolbar Tool Actions ----
        ffToolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ffToolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Initialize connection rendering
        updateConnections();
    }
})();
