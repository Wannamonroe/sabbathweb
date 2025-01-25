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

    // Efecto de parallax en el hero
    const hero = document.querySelector('.hero');
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
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
