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
        document.addEventListener('mouseleave', () => {
            customCursor.style.opacity = '0';
            customCursorGlow.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            customCursor.style.opacity = '1';
            customCursorGlow.style.opacity = '0.8';
        });
    }

    const officers = window.SBG_OFFICERS || [];
    const gridEl = document.getElementById('of-officers-grid');

    function initials(name) {
        return name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    }

    function encodeAssetPath(path) {
        if (!path) return '';
        return path.split('/').map((segment, i) => (i === 0 ? segment : encodeURIComponent(segment))).join('/');
    }

    function metaLine(officer) {
        const parts = [];
        if (officer.course) parts.push(officer.course);
        if (officer.yearLevel) parts.push(officer.yearLevel);
        return parts.join(' · ');
    }

    function avatarHtml(officer, className) {
        if (officer.image) {
            return `<img class="${className}" src="${encodeAssetPath(officer.image)}" alt="" loading="lazy" />`;
        }
        return `<span class="${className} of-contact-initials" aria-hidden="true">${initials(officer.name)}</span>`;
    }

    function actionButton(label, iconSvg, href, disabled) {
        if (disabled || !href) {
            return `<span class="of-contact-action is-disabled" aria-disabled="true">
                <span class="of-contact-action-icon">${iconSvg}</span>
                <span class="of-contact-action-label">${label}</span>
            </span>`;
        }
        return `<a class="of-contact-action" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}">
            <span class="of-contact-action-icon">${iconSvg}</span>
            <span class="of-contact-action-label">${label}</span>
        </a>`;
    }

    const ICON_LINKEDIN = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z"/></svg>';
    const ICON_INSTAGRAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none"/></svg>';

    function fieldRow(label, value) {
        if (!value) return '';
        return `<div class="of-contact-field">
            <span class="of-contact-field-label">${label}</span>
            <span class="of-contact-field-value">${value}</span>
        </div>`;
    }

    function renderOfficerCard(officer) {
        const meta = metaLine(officer);
        const nickname = officer.nickname ? `Goes by ${officer.nickname}` : 'AWS SBG Officer';

        return `<article class="of-card of-contact-card" data-officer-id="${officer.id}">
            <div class="of-contact-hero">
                <div class="of-contact-photo-ring">
                    ${avatarHtml(officer, 'of-contact-photo')}
                </div>
                <p class="of-contact-meta">${meta || 'AWS Student Builder Group'}</p>
                <h3 class="of-contact-name">${officer.name}</h3>
                <p class="of-contact-nickname">${nickname}</p>
            </div>

            <div class="of-contact-actions" role="group" aria-label="Contact actions for ${officer.name}">
                ${actionButton('linkedin', ICON_LINKEDIN, officer.linkedin, !officer.linkedin)}
                ${actionButton('instagram', ICON_INSTAGRAM, officer.instagram, !officer.instagram)}
            </div>

            <div class="of-contact-details">
                ${fieldRow('Nickname', officer.nickname)}
                ${fieldRow('Course', officer.course)}
                ${fieldRow('Year Level', officer.yearLevel)}
            </div>
        </article>`;
    }

    function initOfficerGrid() {
        if (!gridEl || !officers.length) return;

        gridEl.innerHTML = officers.map(renderOfficerCard).join('');

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const siblings = Array.from(card.parentElement.children);
                    const i = siblings.indexOf(card);
                    card.style.transitionDelay = `${i * 0.06}s`;
                    card.classList.add('in-view');
                    cardObserver.unobserve(card);
                }
            });
        }, { threshold: 0.12 });

        gridEl.querySelectorAll('.of-card').forEach((card) => cardObserver.observe(card));
    }

    initOfficerGrid();
})();
