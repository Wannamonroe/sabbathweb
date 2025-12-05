document.addEventListener('DOMContentLoaded', () => {
    // Other initializations if any...

    // Make initCarousel available globally
    window.initCarousel = () => {
        const track = document.querySelector('.simple-carousel-track');
        if (!track) return; // Guard clause

        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.simple-carousel-btn.next');
        const prevButton = document.querySelector('.simple-carousel-btn.prev');
        const dotsNav = document.querySelector('.simple-carousel-indicators');
        const dots = Array.from(dotsNav.children);

        // Remove existing event listeners (cloning nodes is a quick way to clear listeners)
        // But since we are re-creating the DOM in index.html, we just need to re-attach logic to new elements.
        // The variables above select the NEW elements.

        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSlides(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            // Reset all slides
            slides.forEach(slide => {
                slide.classList.remove('active', 'next-slide');
                slide.style.zIndex = '0';
            });

            // Set active slide
            slides[index].classList.add('active');
            slides[index].style.zIndex = '10';

            // Set next slide (to be visible under the cut)
            const nextIndex = (index + 1) % totalSlides;
            slides[nextIndex].classList.add('next-slide');
            slides[nextIndex].style.zIndex = '5';

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            currentIndex = index;
        }

        // Clear any existing interval if this function is called multiple times
        if (window.carouselInterval) clearInterval(window.carouselInterval);

        // Autoplay
        window.carouselInterval = setInterval(() => {
            updateSlides((currentIndex + 1) % totalSlides);
        }, 4000); // Slower interval for better viewing

        // Event Listeners
        if (nextButton) {
            nextButton.onclick = () => {
                clearInterval(window.carouselInterval);
                updateSlides(currentIndex + 1);
                window.carouselInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 4000);
            };
        }

        if (prevButton) {
            prevButton.onclick = () => {
                clearInterval(window.carouselInterval);
                updateSlides(currentIndex - 1);
                window.carouselInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 4000);
            };
        }

        dots.forEach((dot, index) => {
            dot.onclick = () => {
                clearInterval(window.carouselInterval);
                updateSlides(index);
                window.carouselInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 4000);
            };
        });

        track.onmouseenter = () => clearInterval(window.carouselInterval);
        track.onmouseleave = () => {
            window.carouselInterval = setInterval(() => updateSlides((currentIndex + 1) % totalSlides), 4000);
        };

        updateSlides(0);

        // Añadir efecto de clic a los botones
        const buttons = document.querySelectorAll('.simple-carousel-btn');
        buttons.forEach(button => {
            button.onmousedown = () => {
                button.style.transform = 'translateY(-50%) scale(0.95)';
            };

            button.onmouseup = () => {
                button.style.transform = 'translateY(-50%) scale(1.1)';
            };

            button.onmouseleave = () => {
                button.style.transform = 'translateY(-50%) scale(1)';
            };
        });
    };

    // Initialize immediately if content exists (fallback)
    if (document.querySelector('.simple-carousel-slide')) {
        window.initCarousel();
    }

    // Event Button Logic (kept outside carousel init as it's static)
    const eventButton = document.querySelector('.event-button');
    if (eventButton) {
        eventButton.addEventListener('mousemove', (e) => {
            const rect = eventButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const glow = eventButton.querySelector('.button-glow');
            if (glow) glow.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
        });

        eventButton.addEventListener('click', (e) => {
            e.preventDefault();
            eventButton.style.transform = 'scale(0.98)';

            setTimeout(() => {
                eventButton.style.transform = 'scale(1)';
                window.location.href = eventButton.href;
            }, 200);
        });
    }
});

