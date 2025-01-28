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

    // Función unificada para crear partículas
    const createParticle = (x, y, isBackground = false) => {
        if (isBackground) {
            // Partículas de fondo
            const particle = document.createElement('div');
            particle.className = 'background-particle';
            
            const size = Math.random() * 3 + 1;
            const posX = x || Math.random() * window.innerWidth;
            const posY = y || Math.random() * window.innerHeight;
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: rgba(50, 205, 50, ${Math.random() * 0.3});
                left: ${posX}px;
                top: ${posY}px;
                pointer-events: none;
                border-radius: 50%;
                z-index: 0;
            `;
            
            document.body.appendChild(particle);
            
            const animation = particle.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            animation.onfinish = () => particle.remove();
        } else {
            // Partículas de interacción
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            document.querySelector('.hero').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    };

    // Resto del código de la flecha de scroll
    const scrollArrow = document.querySelector('.scroll-arrow');
    console.log('Scroll Arrow Element:', scrollArrow);

    if (scrollArrow) {
        // Añadir evento al elemento y al ícono
        const arrowIcon = scrollArrow.querySelector('i');
        
        const scrollToAbout = (e) => {
            e.preventDefault();
            console.log('Flecha clickeada');
            
            const aboutSection = document.querySelector('.about-us');
            if (aboutSection) {
                console.log('Sección about-us encontrada');
                aboutSection.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                console.log('Fallback: scrolling one viewport height');
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            }
        };

        // Añadir el evento tanto al contenedor como al ícono
        scrollArrow.addEventListener('click', scrollToAbout);
        if (arrowIcon) {
            arrowIcon.addEventListener('click', scrollToAbout);
        }

        // Efectos visuales
        scrollArrow.style.cursor = 'pointer';
        scrollArrow.addEventListener('mouseenter', () => {
            scrollArrow.style.transform = 'translateY(5px)';
            scrollArrow.style.color = '#4dff4d';
        });

        scrollArrow.addEventListener('mouseleave', () => {
            scrollArrow.style.transform = 'translateY(0)';
            scrollArrow.style.color = 'var(--lime)';
        });
    } else {
        console.log('No se encontró el elemento scroll-arrow');
    }


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
    const hero = document.querySelector('.hero');
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

    // Funcionalidad de expansión de imagen y partículas combinada
    console.log('DOM Loaded');

    // Funcionalidad de expansión de imagen
    const overlay = document.querySelector('.overlay');
    const galleryItems = document.querySelectorAll('.gallery-item img');
    
    console.log('Found images:', galleryItems.length);

    galleryItems.forEach(img => {
        img.addEventListener('click', (e) => {
            console.log('Image clicked');
            e.preventDefault();
            
            const expandedView = document.createElement('div');
            expandedView.className = 'expanded-view';
            
            const expandedImg = document.createElement('img');
            expandedImg.src = img.src;
            expandedView.appendChild(expandedImg);
            
            overlay.classList.add('active');
            document.body.appendChild(expandedView);
            document.body.style.overflow = 'hidden';

            const closeExpanded = () => {
                overlay.classList.remove('active');
                expandedView.remove();
                document.body.style.overflow = 'auto';
            };

            overlay.addEventListener('click', closeExpanded);
            expandedView.addEventListener('click', closeExpanded);
        });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const expandedView = document.querySelector('.expanded-view');
            if (expandedView) {
                overlay.classList.remove('active');
                expandedView.remove();
                document.body.style.overflow = 'auto';
            }
        }
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

    // Interactividad para la galería de sim
    document.querySelectorAll('.sim-image').forEach(image => {
        // Efecto de parallax al mover el mouse
        image.addEventListener('mousemove', (e) => {
            const bounds = image.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;
            
            const moveX = (mouseX - centerX) / 20;
            const moveY = (mouseY - centerY) / 20;

            const img = image.querySelector('img');
            img.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
        });

        // Reset de la posición al salir
        image.addEventListener('mouseleave', () => {
            const img = image.querySelector('img');
            img.style.transform = 'scale(1) translate(0, 0)';
        });

        // Añadir efecto de brillo al hover
        image.addEventListener('mouseenter', () => {
            image.style.borderColor = 'var(--lime)';
            const overlay = image.querySelector('.sim-overlay');
            overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        });
    });

    // Interactividad para la galería
    document.addEventListener('DOMContentLoaded', () => {
        // Configuración de Fancybox
        Fancybox.bind("[data-fancybox]", {
            animated: true,
            showClass: "fancybox-fadeIn",
            hideClass: "fancybox-fadeOut",
            dragToClose: false,
            Image: {
                zoom: true,
            },
            Toolbar: {
                display: {
                    left: [],
                    middle: [],
                    right: ["close"],
                },
            }
        });

        // Efecto de parallax en el header
        const roundHeader = document.querySelector('.round-header');
        if (roundHeader) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                roundHeader.style.backgroundPositionY = scrolled * 0.5 + 'px';
            });
        }

        // Animación suave para los botones de teleport
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const button = item.querySelector('.teleport-button');
                if (button) {
                    button.style.transform = 'translateX(-50%) translateY(0)';
                }
            });
        });

        // Animación del fondo
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            setInterval(() => {
                const x = Math.random() * 100 - 50;
                const y = Math.random() * 100 - 50;
                shape.style.transform = `translate(${x}px, ${y}px)`;
            }, 20000);
        });
    });

    // Efecto de seguimiento del ratón en las imágenes
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            item.style.setProperty('--mouse-x', `${x}%`);
            item.style.setProperty('--mouse-y', `${y}%`);
            
            // Efecto de inclinación 3D suave
            const rotateX = (y - 50) * 0.1;
            const rotateY = (x - 50) * 0.1;
            
            item.style.transform = `
                perspective(1000px)
                rotateX(${-rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.02, 1.02, 1.02)
            `;
        });

        // Reset de la transformación
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // Crear partículas de fondo periódicamente
    setInterval(() => createParticle(null, null, true), 300);

    // Función específica para la navbar en round1
    const isRound1Page = document.querySelector('.round-header') !== null;
    
    if (isRound1Page) {
        // Configuración específica para round1
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.left = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '99999';
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        
        // Ajustar el header para compensar la navbar fija
        const roundHeader = document.querySelector('.round-header');
        if (roundHeader) {
            roundHeader.style.marginTop = '73px';
            roundHeader.style.zIndex = '1';
        }
        
        // Asegurar que la navbar permanezca fija y por encima durante el scroll
        window.addEventListener('scroll', () => {
            navbar.style.position = 'fixed';
            navbar.style.top = '0';
            navbar.style.zIndex = '99999';
        });
    }

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

    // Efecto parallax suave en el banner
    document.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('.round-header');
        const title = header.querySelector('h1');
        
        // Efecto parallax al mover el mouse
        header.addEventListener('mousemove', (e) => {
            const { offsetWidth: width, offsetHeight: height } = header;
            const { clientX: x, clientY: y } = e;
            
            const moveX = (x - width/2) * 0.01;
            const moveY = (y - height/2) * 0.01;
            
            title.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        // Reset al salir del área
        header.addEventListener('mouseleave', () => {
            title.style.transform = 'translate(0, 0)';
        });
        
        // Efecto de resplandor al hacer hover
        title.addEventListener('mouseenter', () => {
            title.style.transition = 'all 0.3s ease';
            title.style.textShadow = '0 0 30px rgba(50, 205, 50, 0.7)';
        });
        
        title.addEventListener('mouseleave', () => {
            title.style.textShadow = '0 0 15px rgba(50, 205, 50, 0.3)';
        });
    });
});

