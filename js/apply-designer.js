import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('section', 'apply_designer')
            .single();

        if (data && data.content) {
            const content = data.content;
            if (content.title) document.getElementById('designerPageTitle').textContent = content.title;
            if (content.text) document.getElementById('designerPageText').innerHTML = content.text; // InnerHTML to support br tags
            if (content.button_link) document.getElementById('designerPageButton').href = content.button_link;
        }
    } catch (error) {
        console.error('Error loading designer content:', error);
    }
});
