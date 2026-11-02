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

    track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        loadImage(current - 1);
        loadImage(current + 1);
    });

    track.addEventListener('pointermove', (e) => {
        if (!dragging || e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
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

    goTo(0);
})();
