document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.simple-carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.simple-carousel-btn.next');
    const prevButton = document.querySelector('.simple-carousel-btn.prev');
    const dotsNav = document.querySelector('.simple-carousel-indicators');
    const dots = Array.from(dotsNav.children);
    const eventButton = document.querySelector('.event-button');
    const banner = document.querySelector('.banner-section');
    const logo = document.querySelector('.banner-logo');

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateSlides(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;
    }

    // Autoplay
    let autoplayInterval = setInterval(() => {
        updateSlides((currentIndex + 1) % totalSlides);
    }, 3000);

    // Event Listeners
    nextButton.addEventListener('click', () => {
        clearInterval(autoplayInterval);
        updateSlides(currentIndex + 1);
        autoplayInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 3000);
    });

    prevButton.addEventListener('click', () => {
        clearInterval(autoplayInterval);
        updateSlides(currentIndex - 1);
        autoplayInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 3000);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(autoplayInterval);
            updateSlides(index);
            autoplayInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 3000);
        });
    });

    track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    track.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 3000);
    });

    updateSlides(0);

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

    // Actualizar la función updateActiveSlides
    function updateActiveSlides(currentIndex) {
        slides.forEach((slide, index) => {
            const distance = Math.abs(index - currentIndex);
            slide.style.opacity = '1'; // Mantener opacidad completa
            slide.style.transform = distance === 0 ? 'scale(1.02)' : 'scale(1)';
            slide.classList.toggle('active', index === currentIndex);
        });
    }

    // Actualizar el efecto hover
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
});

