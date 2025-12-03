import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if we are on the login page or dashboard
const isLoginPage = window.location.pathname.includes('login.html');
const isDashboard = window.location.pathname.includes('dashboard.html');

// Login Logic
if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check if already logged in
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = 'dashboard.html';
        }
    };
    checkSession();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
}

// Dashboard Logic
if (isDashboard) {
    const logoutBtn = document.getElementById('logoutBtn');
    const createRoundForm = document.getElementById('createRoundForm');
    const roundsList = document.getElementById('roundsList');
    const userEmailSpan = document.getElementById('userEmail');

    // Protect Route
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        userEmailSpan.textContent = session.user.email;
        loadRounds();
    };
    checkAuth();

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // Create Round
    createRoundForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('roundName').value;
        const participants = document.getElementById('participants').value;
        const dates = document.getElementById('dates').value;
        const imageUrl = document.getElementById('imageUrl').value;

        try {
            const { data, error } = await supabase
                .from('rounds')
                .insert([
                    { name, participants, dates, image_url: imageUrl }
                ])
                .select();

            if (error) throw error;

            alert('Round created successfully!');
            createRoundForm.reset();
            loadRounds(); // Refresh list
        } catch (error) {
            alert('Error creating round: ' + error.message);
        }
    });

    // Load Rounds
    async function loadRounds() {
        try {
            const { data: rounds, error } = await supabase
                .from('rounds')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            roundsList.innerHTML = rounds.map(round => `
                <div class="round-item">
                    <h3>${round.name}</h3>
                    <p><strong>Dates:</strong> ${round.dates}</p>
                    <p><strong>Participants:</strong> ${round.participants.substring(0, 50)}...</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading rounds:', error);
        }
    }
}
