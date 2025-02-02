document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.simple-carousel-track');
    const slides = document.querySelectorAll('.simple-carousel-slide');
    const nextButton = document.querySelector('.simple-carousel-btn.next');
    const prevButton = document.querySelector('.simple-carousel-btn.prev');
    const indicators = document.querySelectorAll('.indicator');

    let currentIndex = 0;
    let autoplayInterval;
    const totalStops = 4; // Cambiado a 4 paradas

    function updateCarousel() {
        const offset = (currentIndex * -80);
        track.style.transform = `translateX(${offset}%)`;
        
        // Actualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        if (currentIndex < 0) currentIndex = totalStops - 1;
        if (currentIndex >= totalStops) currentIndex = 0;
        updateCarousel();
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 3000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Event Listeners
    nextButton.addEventListener('click', () => {
        stopAutoplay();
        goToSlide(currentIndex + 1);
        startAutoplay();
    });

    prevButton.addEventListener('click', () => {
        stopAutoplay();
        goToSlide(currentIndex - 1);
        startAutoplay();
    });

    // Event listeners para los indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoplay();
            goToSlide(index);
            startAutoplay();
        });
    });

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Inicializar
    updateCarousel();
    startAutoplay();
});

