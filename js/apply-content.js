import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', loadApplyContent);

async function loadApplyContent() {
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('section', 'apply')
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore row not found
            console.error('Error fetching apply content:', error);
            return;
        }

        if (data && data.content) {
            const content = data.content;

            const titleEl = document.getElementById('applyPageTitle');
            const designerTextEl = document.getElementById('applyDesignerText');
            const designerLinkEl = document.getElementById('applyDesignerLink');
            const bloggerTextEl = document.getElementById('applyBloggerText');
            const bloggerLinkEl = document.getElementById('applyBloggerLink');

            if (titleEl && content.page_title) titleEl.textContent = content.page_title;

            if (designerTextEl && content.designer_text) designerTextEl.textContent = content.designer_text;
            if (designerLinkEl && content.designer_link) designerLinkEl.href = content.designer_link;

            if (bloggerTextEl && content.blogger_text) bloggerTextEl.textContent = content.blogger_text;
            if (bloggerLinkEl && content.blogger_link) bloggerLinkEl.href = content.blogger_link;
        }
    } catch (error) {
        console.error('Unexpected error loading apply content:', error);
    }
}
