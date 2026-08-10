(function () {
    /* ── Custom cursor ────────────────────────────────────────── */
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

    /* ── Config ────────────────────────────────────────────────── */
    // ⚠️  PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfpYTFotGO4tdWX9y-50r7It1pMfrGTiYnjYhhoOPPk_ed9-Y0M5MXnLq3xOVAlpyCHg/exec';
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    /* ── DOM refs ──────────────────────────────────────────────── */
    const form          = document.getElementById('join-form');
    const formIntro     = document.getElementById('form-intro');
    const submitBtn     = document.getElementById('submit-btn');
    const btnLabel      = submitBtn?.querySelector('.jf-btn-label');
    const btnSpinner    = submitBtn?.querySelector('.jf-btn-spinner');
    const successPanel  = document.getElementById('form-success');
    const errorPanel    = document.getElementById('form-error');
    const loadingPanel  = document.getElementById('form-loading');
    const submitAnother = document.getElementById('submit-another');
    const errorRetry    = document.getElementById('error-retry');

    // Upload elements
    const uploadZone      = document.getElementById('upload-zone');
    const fileInput       = document.getElementById('receipt');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const uploadPreview   = document.getElementById('upload-preview');
    const uploadFilename  = document.getElementById('upload-filename');

    if (!form || document.querySelector('.jf-finder-wrap--closed')) return;

    /* ── File upload handling ──────────────────────────────────── */
    let selectedFile = null;

    // Click to upload
    uploadZone?.addEventListener('click', () => {
        fileInput?.click();
    });

    // Drag & drop
    uploadZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('jf-upload-zone--dragover');
    });
    uploadZone?.addEventListener('dragleave', () => {
        uploadZone.classList.remove('jf-upload-zone--dragover');
    });
    uploadZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('jf-upload-zone--dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // File input change
    fileInput?.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        // Validate type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, or WEBP).');
            return;
        }
        // Validate size
        if (file.size > MAX_FILE_SIZE) {
            alert('File is too large. Maximum size is 5 MB.');
            return;
        }

        selectedFile = file;

        // Show filename
        uploadFilename.textContent = file.name;
        uploadPlaceholder.hidden = true;
        uploadPreview.hidden = false;
    }

    function clearUpload() {
        selectedFile = null;
        fileInput.value = '';
        uploadFilename.textContent = '';
        uploadPlaceholder.hidden = false;
        uploadPreview.hidden = true;
    }

    // Clear upload on form reset
    form.addEventListener('reset', () => {
        setTimeout(() => clearUpload(), 0);
    });

    /* ── Form submission ──────────────────────────────────────── */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate built-in constraints
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Validate file is selected
        if (!selectedFile) {
            alert('Please upload your proof of payment.');
            return;
        }

        // Check if Web App URL has been configured
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
            alert('Please paste your Google Apps Script Web App URL into line 19 of js/pages/join.js before submitting.');
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            // Read file as base64
            const base64 = await readFileAsBase64(selectedFile);

            // Build payload
            const payload = {
                firstName:     form.firstName.value.trim(),
                middleName:    form.middleName.value.trim(),
                lastName:      form.lastName.value.trim(),
                studentNumber: form.studentNumber.value.trim(),
                course:        form.course.value.trim(),
                year:          form.year.value,
                fileName:      selectedFile.name,
                fileType:      selectedFile.type,
                fileData:      base64
            };

            // Send to Google Apps Script
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            // With no-cors mode, we can't read the response,
            // so we assume success if no error was thrown
            showSuccess();

        } catch (err) {
            console.error('Submission error:', err);
            showError();
        } finally {
            setLoading(false);
        }
    });

    /* ── UI state helpers ─────────────────────────────────────── */
    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (btnLabel) btnLabel.hidden = isLoading;
        if (btnSpinner) btnSpinner.hidden = !isLoading;
        if (isLoading) {
            form.hidden = true;
            if (formIntro) formIntro.hidden = true;
            if (successPanel) successPanel.hidden = true;
            if (errorPanel) errorPanel.hidden = true;
            if (loadingPanel) loadingPanel.hidden = false;
        }
    }

    function showSuccess() {
        form.hidden = true;
        if (formIntro) formIntro.hidden = true;
        if (loadingPanel) loadingPanel.hidden = true;
        if (errorPanel) errorPanel.hidden = true;
        if (successPanel) successPanel.hidden = false;
        form.reset();
        clearUpload();
    }

    function showError() {
        form.hidden = true;
        if (formIntro) formIntro.hidden = true;
        if (loadingPanel) loadingPanel.hidden = true;
        if (successPanel) successPanel.hidden = true;
        if (errorPanel) errorPanel.hidden = false;
    }

    function showForm() {
        if (loadingPanel) loadingPanel.hidden = true;
        if (successPanel) successPanel.hidden = true;
        if (errorPanel) errorPanel.hidden = true;
        if (formIntro) formIntro.hidden = false;
        form.hidden = false;
    }

    submitAnother?.addEventListener('click', showForm);
    errorRetry?.addEventListener('click', showForm);

    /* ── Utilities ─────────────────────────────────────────────── */
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Strip the data URL prefix (e.g. "data:image/png;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
})();
