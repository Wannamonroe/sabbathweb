import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('*')
            .eq('section', 'apply_blogger')
            .single();

        if (data && data.content) {
            const content = data.content;
            if (content.title) document.getElementById('bloggerPageTitle').textContent = content.title;
            if (content.subtitle) document.getElementById('bloggerPageSubtitle').textContent = content.subtitle;
            if (content.button_link) document.getElementById('bloggerPageButton').href = content.button_link;

            const list = document.getElementById('bloggerRequirementsList');
            if (content.requirements && Array.isArray(content.requirements)) {
                list.innerHTML = '';
                content.requirements.forEach((req, index) => {
                    const li = document.createElement('li');

                    // Simple logic to add numbering bold if user just inputs plain text, 
                    // OR we can assume user inputs the full text including number.
                    // Based on initial prompt, user inputs text. I will auto-number it to match aesthetic.

                    const number = index + 1;
                    // Custom formatting to match the example "𝟏)" or "7)"
                    // For simplicity, let's use bold tag for number.
                    li.innerHTML = `<span style="font-weight: bold; margin-right: 5px;">${number})</span> ${req}`;

                    list.appendChild(li);
                });
            }
        }
    } catch (error) {
        console.error('Error loading blogger content:', error);
    }
});
