document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript conectado correctamente');

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }
    });

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Scroll arrow functionality
    const scrollArrow = document.querySelector('.scroll-arrow');
    scrollArrow.addEventListener('click', () => {
        const aboutSection = document.querySelector('.about-us');
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Efecto de typing mejorado
    function typeWriter(element, text, speed = 50) {
        const originalWidth = element.offsetWidth;
        element.classList.add('typing');
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing');
            }
        }
        
        type();
    }

    // Preparar el contenedor antes del typing
    const heroText = document.querySelector('.hero-content p');
    const originalText = heroText.textContent;
    // Establecemos el texto completo primero para obtener el ancho correcto
    heroText.textContent = originalText;
    heroText.style.width = heroText.offsetWidth + 'px';
    // Luego iniciamos el efecto
    heroText.textContent = '';
    setTimeout(() => {
        typeWriter(heroText, originalText);
    }, 1000);

    // Efecto de parallax mejorado
    document.addEventListener('mousemove', (e) => {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;

        heroContent.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        hero.style.backgroundPosition = `${-mouseX}px ${-mouseY}px`;
    });

    // Efecto de resplandor al scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');
        const opacity = Math.max(0, Math.min(1, 1 - (scrolled / 500)));
        
        hero.style.backgroundPosition = `${mouseX * 50}px ${mouseY * 50}px`;
    });

    // Animación de entrada para elementos del about
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    document.querySelectorAll('.about-text > *').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "all 0.5s ease";
        observer.observe(el);
    });

    // Efecto de hover en las fechas
    const dates = document.querySelectorAll('.event-dates p');
    dates.forEach(date => {
        date.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.transition = 'transform 0.3s ease';
        });
        
        date.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'scale(1)';
        });
    });

    // Efecto de partículas en el hero (opcional)
    const createParticle = (x, y) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        hero.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    };

    hero.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.9) {
            createParticle(e.clientX, e.clientY);
        }
    });
});
