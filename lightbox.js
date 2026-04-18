let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let lastTranslateX = 0;
let lastTranslateY = 0;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function openLightbox(imgEl) {
    const img = document.getElementById('lightbox-img');
    img.src = imgEl.src;
    resetZoom();
    document.getElementById('lightbox').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('show');
    document.body.style.overflow = 'auto';
    resetZoom();
}

function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    applyTransform();
    const img = document.getElementById('lightbox-img');
    if (img) img.classList.remove('zoomed', 'dragging');
}

function applyTransform() {
    const img = document.getElementById('lightbox-img');
    if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function clampTranslate() {
    const img = document.getElementById('lightbox-img');
    const rect = img.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = Math.max(0, (rect.width - vw) / 2);
    const maxY = Math.max(0, (rect.height - vh) / 2);
    translateX = Math.min(maxX, Math.max(-maxX, translateX));
    translateY = Math.min(maxY, Math.max(-maxY, translateY));
}

document.addEventListener('DOMContentLoaded', function () {
    const img = document.getElementById('lightbox-img');
    const lightbox = document.getElementById('lightbox');
    if (!img || !lightbox) return;

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    img.addEventListener('click', function (e) {
        if (isDragging) return;
        if (scale === 1) {
            scale = 2.5;
            const rect = img.getBoundingClientRect();
            const clickX = e.clientX - (rect.left + rect.width / 2);
            const clickY = e.clientY - (rect.top + rect.height / 2);
            translateX = -clickX * (scale - 1) / scale;
            translateY = -clickY * (scale - 1) / scale;
            clampTranslate();
            img.classList.add('zoomed');
        } else {
            resetZoom();
        }
        applyTransform();
    });

    img.addEventListener('wheel', function (e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.3 : 0.3;
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
        if (scale === MIN_SCALE) {
            resetZoom();
        } else {
            img.classList.add('zoomed');
            clampTranslate();
            applyTransform();
        }
    }, { passive: false });

    img.addEventListener('mousedown', function (e) {
        if (scale === 1) return;
        e.preventDefault();
        isDragging = false;
        dragStartX = e.clientX - lastTranslateX;
        dragStartY = e.clientY - lastTranslateY;
        img.classList.add('dragging');

        function onMouseMove(e) {
            isDragging = true;
            translateX = e.clientX - dragStartX;
            translateY = e.clientY - dragStartY;
            clampTranslate();
            applyTransform();
        }

        function onMouseUp() {
            lastTranslateX = translateX;
            lastTranslateY = translateY;
            img.classList.remove('dragging');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setTimeout(() => { isDragging = false; }, 10);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    let lastTouchDist = null;
    let touchStartX = 0;
    let touchStartY = 0;

    img.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
            lastTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        } else if (e.touches.length === 1 && scale > 1) {
            touchStartX = e.touches[0].clientX - lastTranslateX;
            touchStartY = e.touches[0].clientY - lastTranslateY;
        }
    }, { passive: true });

    img.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = (dist - lastTouchDist) * 0.01;
            scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
            lastTouchDist = dist;
            if (scale > 1) img.classList.add('zoomed');
            clampTranslate();
            applyTransform();
        } else if (e.touches.length === 1 && scale > 1) {
            translateX = e.touches[0].clientX - touchStartX;
            translateY = e.touches[0].clientY - touchStartY;
            lastTranslateX = translateX;
            lastTranslateY = translateY;
            clampTranslate();
            applyTransform();
        }
    }, { passive: false });

    img.addEventListener('touchend', function () {
        lastTouchDist = null;
        if (scale <= 1) resetZoom();
    });
});
