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
document.addEventListener('DOMContentLoaded', loadCarousel);
