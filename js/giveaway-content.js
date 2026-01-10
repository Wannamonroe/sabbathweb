import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', loadGiveawayContent);

async function loadGiveawayContent() {
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('content')
            .eq('section', 'giveaway')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching giveaway content:', error);
            return;
        }

        if (data && data.content) {
            const content = data.content;

            const titleEl = document.getElementById('giveawayTitle');
            const descriptionEl = document.getElementById('giveawayDescription');
            const subtitleEl = document.getElementById('giveawaySubtitle');
            const buttonEl = document.getElementById('giveawayButton');
            const stepsListEl = document.getElementById('giveawayStepsList');

            if (titleEl) titleEl.textContent = content.title || '𝐒𝐀𝐁𝐁𝐀𝐓𝐇 𝗟𝟯𝟬.𝟬𝟬𝟬 𝗚𝗜𝗩𝗘𝘼𝗪𝘼𝗬';
            if (descriptionEl) descriptionEl.innerHTML = content.description || 'We will be picking <span class="highlight">6 𝘄𝗶𝗻𝗻𝗲𝗿𝘀</span> and each will receive <span class="highlight">𝗟𝟱𝟬𝟬𝟬</span>';
            if (subtitleEl) subtitleEl.textContent = content.subtitle || 'To enter the giveaway follow the next steps:';
            if (buttonEl) buttonEl.href = content.button_link || '#';

            if (stepsListEl && content.steps && Array.isArray(content.steps)) {
                stepsListEl.innerHTML = '';
                content.steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    stepsListEl.appendChild(li);
                });
            }
        }
    } catch (error) {
        console.error('Error in loadGiveawayContent:', error);
    }
}
