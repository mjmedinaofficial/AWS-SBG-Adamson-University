/* Footer social links — copy email to clipboard with toast */
(function () {
    const TOAST_MS = 3000;
    let toastEl = null;
    let toastTimer = null;

    function ensureToast() {
        if (toastEl) return toastEl;
        toastEl = document.createElement('div');
        toastEl.className = 'footer-copy-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
        return toastEl;
    }

    function showToast(message) {
        const toast = ensureToast();
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            toast.classList.remove('is-visible');
        }, TOAST_MS);
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function initEmailCopy() {
        document.querySelectorAll('[data-copy-email]').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = btn.getAttribute('data-copy-email');
                if (!email) return;

                try {
                    await copyText(email);
                    showToast('Email copied to clipboard');
                } catch {
                    showToast('Could not copy email — please try again');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmailCopy);
    } else {
        initEmailCopy();
    }
})();
