(function () {
    const form = document.getElementById('join-form');
    if (form && !document.querySelector('.jf-finder-wrap--closed')) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            alert('Application submitted! We\'ll contact you at your Adamson email soon.');
            form.reset();
        });
    }
})();
