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

    const observerRounds = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Añade un delay progresivo para cada carta
                entry.target.style.animationDelay = `${entries.indexOf(entry) * 0.2}s`;
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "50px"
    });

    document.querySelectorAll('.round-card').forEach(card => {
        observerRounds.observe(card);
    });

    // Efecto de parallax en las imágenes de las rounds
    document.querySelectorAll('.round-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const image = card.querySelector('.round-image img');
            const content = card.querySelector('.round-content');
            
            // Calcula la posición relativa del mouse dentro de la carta
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calcula el porcentaje de movimiento
            const moveX = (x - rect.width/2) / rect.width * 10;
            const moveY = (y - rect.height/2) / rect.height * 10;
            
            // Aplica la transformación
            image.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
            content.style.transform = `translate(${moveX/2}px, ${moveY/2}px)`;
        });

        // Resetea la posición cuando el mouse sale
        card.addEventListener('mouseleave', () => {
            const image = card.querySelector('.round-image img');
            const content = card.querySelector('.round-content');
            
            image.style.transform = 'scale(1) translate(0, 0)';
            content.style.transform = 'translate(0, 0)';
        });
    });

    // Efecto de brillo que sigue al cursor
    document.querySelectorAll('.round-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // Animación suave al hacer scroll a las rounds
    document.querySelectorAll('.round-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.currentTarget.tagName === 'A') {
                e.preventDefault();
                const href = e.currentTarget.getAttribute('href');
                
                // Añade clase para animación de salida
                e.currentTarget.classList.add('card-exit');
                
                // Navega después de la animación
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

    // Efecto de partículas en hover (opcional)
    function createParticle(x, y, card) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        card.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    document.querySelectorAll('.round-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.9) {
                const rect = card.getBoundingClientRect();
                createParticle(e.clientX - rect.left, e.clientY - rect.top, card);
            }
        });
    });

    // Efecto de resplandor al scroll
    window.addEventListener('scroll', () => {
        const rounds = document.querySelector('.rounds');
        const scrolled = window.scrollY;
        const roundsTop = rounds.offsetTop;
        const roundsHeight = rounds.offsetHeight;
        
        if (scrolled > roundsTop - window.innerHeight && scrolled < roundsTop + roundsHeight) {
            const progress = (scrolled - (roundsTop - window.innerHeight)) / (roundsHeight + window.innerHeight);
            rounds.style.setProperty('--scroll-progress', progress);
        }
    });
});

// Añade estos estilos CSS para los nuevos efectos
const styles = `
    .particle {
        position: absolute;
        pointer-events: none;
        background: rgba(50, 205, 50, 0.5);
        border-radius: 50%;
        width: 4px;
        height: 4px;
        animation: particle-fade 1s ease-out forwards;
    }

    @keyframes particle-fade {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0) translateY(-20px);
        }
    }

    .card-exit {
        animation: card-exit 0.5s ease forwards;
    }

    @keyframes card-exit {
        to {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
        }
    }
`;

// Añade los estilos al documento
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
