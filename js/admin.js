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

    // Form elements for Edit Mode
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const roundIdInput = document.getElementById('roundId');
    const roundNameInput = document.getElementById('roundName');
    const participantsInput = document.getElementById('participants');
    const datesInput = document.getElementById('dates');
    const imageUrlInput = document.getElementById('imageUrl');

    // File Upload Elements
    const dropZone = document.getElementById('dropZone');
    const imageFileInput = document.getElementById('imageFile');
    const imagePreview = document.getElementById('imagePreview');
    let selectedFile = null;

    let isEditing = false;

    // Drag & Drop Events
    dropZone.addEventListener('click', () => imageFileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    imageFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        selectedFile = file;

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

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

    // Create / Update Round
    createRoundForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = roundNameInput.value;
        const participants = participantsInput.value;
        const dates = datesInput.value;
        let imageUrl = imageUrlInput.value;
        const id = roundIdInput.value;

        try {
            // Upload Image if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('round-images')
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('round-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            let error;
            if (isEditing && id) {
                // Update
                const { error: updateError } = await supabase
                    .from('rounds')
                    .update({ name, participants, dates, image_url: imageUrl })
                    .eq('id', id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('rounds')
                    .insert([{ name, participants, dates, image_url: imageUrl }]);
                error = insertError;
            }

            if (error) throw error;

            alert(isEditing ? 'Round updated successfully!' : 'Round created successfully!');
            resetForm();
            loadRounds();
        } catch (error) {
            alert('Error saving round: ' + error.message);
        }
    });

    // Cancel Edit
    cancelEditBtn.addEventListener('click', resetForm);

    function resetForm() {
        createRoundForm.reset();
        isEditing = false;
        roundIdInput.value = '';
        formTitle.textContent = 'Create New Round';
        submitBtn.textContent = 'Create Round';
        cancelEditBtn.style.display = 'none';

        // Reset File
        selectedFile = null;
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }

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
                    <div class="round-actions">
                        <button class="btn-action btn-edit" onclick="editRound('${round.id}')">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteRound('${round.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <h3>${round.name}</h3>
                    <p><strong>Dates:</strong> ${round.dates}</p>
                    <p><strong>Participants:</strong> ${round.participants.substring(0, 50)}...</p>
                </div>
            `).join('');

            // Expose functions to global scope for onclick handlers
            window.editRound = async (id) => {
                const round = rounds.find(r => r.id == id);
                if (round) {
                    isEditing = true;
                    roundIdInput.value = round.id;
                    roundNameInput.value = round.name;
                    participantsInput.value = round.participants;
                    datesInput.value = round.dates;
                    imageUrlInput.value = round.image_url || '';

                    // Show preview if image exists
                    if (round.image_url) {
                        imagePreview.src = round.image_url;
                        imagePreview.style.display = 'block';
                    } else {
                        imagePreview.style.display = 'none';
                    }

                    formTitle.textContent = 'Edit Round';
                    submitBtn.textContent = 'Update Round';
                    cancelEditBtn.style.display = 'block';

                    // Scroll to form
                    createRoundForm.scrollIntoView({ behavior: 'smooth' });
                }
            };

            window.deleteRound = async (id) => {
                if (confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
                    try {
                        const { error } = await supabase
                            .from('rounds')
                            .delete()
                            .eq('id', id);

                        if (error) throw error;

                        loadRounds(); // Refresh list
                    } catch (error) {
                        alert('Error deleting round: ' + error.message);
                    }
                }
            };

        } catch (error) {
            console.error('Error loading rounds:', error);
        }
    }
}
