document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.simple-carousel-track');
    const slides = document.querySelectorAll('.simple-carousel-slide');
    const nextButton = document.querySelector('.simple-carousel-btn.next');
    const prevButton = document.querySelector('.simple-carousel-btn.prev');
    const indicators = document.querySelectorAll('.indicator');
    const eventButton = document.querySelector('.event-button');
    const banner = document.querySelector('.banner-section');
    const logo = document.querySelector('.banner-logo');

    let currentIndex = 0;
    let autoplayInterval;
    const totalStops = 5; // Aumentado de 4 a 5

    function updateActiveSlides(currentIndex) {
        slides.forEach((slide, index) => {
            const distance = Math.abs(index - currentIndex);
            slide.style.opacity = '1';
            slide.style.transform = distance === 0 ? 'scale(1.02)' : 'scale(1)';
            slide.classList.toggle('active', index === currentIndex);
        });
    }

    function smoothTransition(offset) {
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = `translateX(${offset}%)`;
    }

    slides.forEach(slide => {
        slide.addEventListener('mouseenter', () => {
            if (!slide.classList.contains('active')) {
                slide.style.opacity = '1';
                slide.style.transform = 'scale(1.01)';
            }
        });

        slide.addEventListener('mouseleave', () => {
            if (!slide.classList.contains('active')) {
                slide.style.opacity = '1';
                slide.style.transform = 'scale(1)';
            }
        });
    });

    function goToSlide(index) {
        currentIndex = index;
        if (currentIndex < 0) currentIndex = totalStops - 1;
        if (currentIndex >= totalStops) currentIndex = 0;
        
        const offset = (currentIndex * -80);
        smoothTransition(offset);
        updateActiveSlides(currentIndex);
        
        // Actualizar indicadores
        indicators.forEach((indicator, idx) => {
            indicator.classList.toggle('active', idx === currentIndex);
        });
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 2000);
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
    updateActiveSlides(currentIndex);
    startAutoplay();

    eventButton.addEventListener('mousemove', (e) => {
        const rect = eventButton.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const glow = eventButton.querySelector('.button-glow');
        glow.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
    });

    eventButton.addEventListener('click', (e) => {
        e.preventDefault();
        eventButton.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            eventButton.style.transform = 'scale(1)';
            window.location.href = eventButton.href;
        }, 200);
    });

    // Añadir efecto de clic a los botones
    const buttons = document.querySelectorAll('.simple-carousel-btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(-50%) scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-50%) scale(1.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(-50%) scale(1)';
        });
    });
});

