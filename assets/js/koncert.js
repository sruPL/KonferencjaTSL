// Karuzela zdjęć na stronie „Koncert” – bez zewnętrznych bibliotek, bez autoodtwarzania
(function () {
    const carousel = document.getElementById('koncertCarousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const last = slides.length - 1;
    let current = 0;

    function loadImage(index) {
        const slide = slides[index];
        if (slide) slide.querySelector('img').loading = 'eager';
    }

    function goTo(index) {
        current = Math.max(0, Math.min(last, index));
        track.style.transform = 'translateX(' + (-100 * current) + '%)';
        dots.forEach((dot, i) => {
            if (i === current) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
        slides.forEach((slide, i) => slide.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
        prev.disabled = current === 0;
        next.disabled = current === last;
        // Bieżące i następne zdjęcie ładujemy od razu, aby przejście było płynne
        loadImage(current);
        loadImage(current + 1);
    }

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
        else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
        else if (e.key === 'End') { e.preventDefault(); goTo(last); }
    });

    // Przesuwanie palcem (i myszą): przewijanie pionowe strony zostaje natywne (touch-action: pan-y)
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let dragging = false;
    let pointerId = null;
    let maxMove = 0; // największe przesunięcie wskaźnika – odróżnia kliknięcie od przeciągnięcia

    track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        maxMove = 0;
        loadImage(current - 1);
        loadImage(current + 1);
    });

    track.addEventListener('pointermove', (e) => {
        if (!dragging || e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        maxMove = Math.max(maxMove, Math.abs(dx), Math.abs(dy));
        if (!track.classList.contains('is-dragging')) {
            if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
            track.classList.add('is-dragging');
            track.setPointerCapture(pointerId);
        }
        // Na krańcach galerii stawiamy opór
        const edge = (current === 0 && dx > 0) || (current === last && dx < 0);
        const offset = edge ? dx / 3 : dx;
        track.style.transform = 'translateX(calc(' + (-100 * current) + '% + ' + offset + 'px))';
    });

    function endDrag(e) {
        if (!dragging || e.pointerId !== pointerId) return;
        dragging = false;
        maxMove = Math.max(maxMove, Math.abs(e.clientX - startX), Math.abs(e.clientY - startY));
        if (e.type === 'pointercancel') maxMove = Infinity;
        if (!track.classList.contains('is-dragging')) return;
        track.classList.remove('is-dragging');
        if (e.type === 'pointercancel') { goTo(current); return; }
        const dx = e.clientX - startX;
        const fast = Math.abs(dx) > 30 && Date.now() - startTime < 300;
        if (dx < 0 && (fast || -dx > track.clientWidth * 0.2)) goTo(current + 1);
        else if (dx > 0 && (fast || dx > track.clientWidth * 0.2)) goTo(current - 1);
        else goTo(current);
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    // Powiększenie zdjęcia (lightbox) – pełne, nieprzycięte zdjęcie na ciemnym tle
    const images = slides.map((slide) => slide.querySelector('img'));
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Powiększone zdjęcie');
    lightbox.hidden = true;
    lightbox.innerHTML =
        '<figure class="lightbox-figure"><img class="lightbox-img" alt="" decoding="async"></figure>' +
        '<p class="lightbox-counter" aria-live="polite"></p>' +
        '<button type="button" class="lightbox-btn lightbox-close" aria-label="Zamknij"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
        '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Poprzednie zdjęcie"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>' +
        '<button type="button" class="lightbox-btn lightbox-next" aria-label="Następne zdjęcie"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>';
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('.lightbox-img');
    const lbCounter = lightbox.querySelector('.lightbox-counter');
    const lbClose = lightbox.querySelector('.lightbox-close');
    const lbPrev = lightbox.querySelector('.lightbox-prev');
    const lbNext = lightbox.querySelector('.lightbox-next');
    const lbButtons = [lbClose, lbPrev, lbNext];
    let lbIndex = 0;
    let lastFocus = null;

    function showInLightbox(index) {
        lbIndex = Math.max(0, Math.min(last, index));
        const source = images[lbIndex];
        lbImg.src = source.currentSrc || source.src;
        lbImg.alt = source.alt;
        lbCounter.textContent = (lbIndex + 1) + ' / ' + slides.length;
        lbPrev.disabled = lbIndex === 0;
        lbNext.disabled = lbIndex === last;
        if (!lightbox.hidden && document.activeElement && document.activeElement.disabled) lbClose.focus();
        if (images[lbIndex + 1]) images[lbIndex + 1].loading = 'eager';
    }

    function openLightbox(index) {
        lastFocus = document.activeElement;
        showInLightbox(index);
        lightbox.hidden = false;
        document.documentElement.classList.add('lightbox-open');
        lbClose.focus();
    }

    function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        document.documentElement.classList.remove('lightbox-open');
        goTo(lbIndex);
        const target = lastFocus && document.contains(lastFocus) && lastFocus !== document.body ? lastFocus : track;
        target.focus();
    }

    // Otwieramy tylko po prawdziwym kliknięciu/stuknięciu, nie po przeciągnięciu
    track.addEventListener('click', (e) => {
        if (maxMove > 8) return;
        const slide = e.target.closest('.carousel-slide');
        if (slide) openLightbox(slides.indexOf(slide));
    });

    track.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(current); }
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => showInLightbox(lbIndex - 1));
    lbNext.addEventListener('click', () => showInLightbox(lbIndex + 1));

    // Klawiatura na poziomie dokumentu – działa także, gdy fokus zgubi się na wyłączonym przycisku
    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); showInLightbox(lbIndex - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); showInLightbox(lbIndex + 1); }
        else if (e.key === 'Tab') {
            // Fokus zostaje w oknie
            const focusable = lbButtons.filter((b) => !b.disabled);
            const i = focusable.indexOf(document.activeElement);
            e.preventDefault();
            const nextIndex = e.shiftKey ? (i <= 0 ? focusable.length - 1 : i - 1) : (i + 1) % focusable.length;
            focusable[nextIndex].focus();
        }
    });

    // Przesuwanie palcem w powiększeniu oraz zamykanie kliknięciem w tło
    let lbStartX = 0;
    let lbStartY = 0;
    let lbPointer = null;
    let lbMoved = false;

    lightbox.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.lightbox-btn')) return;
        lbPointer = e.pointerId;
        lbStartX = e.clientX;
        lbStartY = e.clientY;
        lbMoved = false;
    });

    lightbox.addEventListener('pointerup', (e) => {
        if (e.pointerId !== lbPointer) return;
        lbPointer = null;
        const dx = e.clientX - lbStartX;
        const dy = e.clientY - lbStartY;
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) lbMoved = true;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) showInLightbox(lbIndex + (dx < 0 ? 1 : -1));
    });

    lightbox.addEventListener('pointercancel', () => { lbPointer = null; lbMoved = true; });

    lightbox.addEventListener('click', (e) => {
        if (lbMoved) { lbMoved = false; return; }
        if (!e.target.closest('.lightbox-img, .lightbox-btn')) closeLightbox();
    });

    lbImg.addEventListener('dragstart', (e) => e.preventDefault());

    goTo(0);
})();
