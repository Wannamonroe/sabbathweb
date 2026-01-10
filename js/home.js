import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Initialize Supabase only if the library is available
const initializeSupabase = () => {
    if (window.supabase) {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    console.error('Supabase library not found');
    return null;
};

const supabase = initializeSupabase();

async function loadCarousel() {
    if (!supabase) return;

    try {
        const { data: images, error } = await supabase
            .from('carousel_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (images && images.length > 0) {
            const track = document.querySelector('.simple-carousel-track');
            const indicators = document.querySelector('.simple-carousel-indicators');

            if (!track || !indicators) return;

            // Clear existing content
            track.innerHTML = '';
            indicators.innerHTML = '';

            images.forEach((img, index) => {
                // Create Slide
                const slide = document.createElement('div');
                slide.className = 'simple-carousel-slide';
                slide.innerHTML = `<img src="${img.image_url}" alt="Carousel Image ${index + 1}">`;
                track.appendChild(slide);

                // Create Indicator
                const indicator = document.createElement('button');
                indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                indicators.appendChild(indicator);
            });

            // Initialize Carousel Logic
            if (window.initCarousel) {
                window.initCarousel();
            }
        }
    } catch (error) {
        console.error('Error loading carousel:', error);
    }
}

// Load carousel when DOM is ready
// Load Content on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    loadCarousel();
    loadSiteContent();
});

async function loadSiteContent() {
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('*');

        if (error) throw error;

        if (data) {
            const homeData = data.find(item => item.section === 'home')?.content;
            const aboutData = data.find(item => item.section === 'about_us')?.content;

            // Update Home
            if (homeData && homeData.event_link) {
                const linkEl = document.getElementById('homeEventLink');
                if (linkEl) linkEl.href = homeData.event_link;
            }

            // Update About
            if (aboutData) {
                const typeEl = document.getElementById('aboutUsType');
                const openingEl = document.getElementById('aboutUsOpening');
                const closingEl = document.getElementById('aboutUsClosing');
                const textEl = document.getElementById('aboutUsText');

                if (typeEl && aboutData.bottom_text) typeEl.textContent = aboutData.bottom_text;
                if (openingEl && aboutData.opening_date) openingEl.textContent = aboutData.opening_date;
                if (closingEl && aboutData.closing_date) closingEl.textContent = aboutData.closing_date;
                if (textEl && aboutData.text) textEl.textContent = aboutData.text;
            }
        }
    } catch (error) {
        console.error('Error loading site content:', error);
    }
}
