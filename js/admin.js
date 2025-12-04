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
                        <button class="btn-action btn-edit" onclick="editRound('${round.id}')" title="Edit Round">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn-action btn-images" onclick="manageImages('${round.id}', '${round.name}')" title="Manage Images">
                            <i class="fas fa-images"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteRound('${round.id}')" title="Delete Round">
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

    // Image Management Modal Logic
    const imageModal = document.getElementById('imageModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const imageNameInput = document.getElementById('imageName');
    const modalDropZone = document.getElementById('modalDropZone');
    const modalImageFileInput = document.getElementById('modalImageFile');
    const modalPreviewContainer = document.getElementById('modalPreviewContainer');
    const modalImagePreview = document.getElementById('modalImagePreview');
    const fileCount = document.getElementById('fileCount');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const roundImagesList = document.getElementById('roundImagesList');

    let currentRoundId = null;
    let selectedModalFiles = [];

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            imageModal.style.display = 'none';
            resetModalForm();
        });
    }

    window.onclick = (event) => {
        if (event.target == imageModal) {
            imageModal.style.display = 'none';
            resetModalForm();
        }
    };

    // Drag & Drop for Modal
    if (modalDropZone) {
        modalDropZone.addEventListener('click', () => modalImageFileInput.click());

        modalDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            modalDropZone.classList.add('dragover');
        });

        modalDropZone.addEventListener('dragleave', () => {
            modalDropZone.classList.remove('dragover');
        });

        modalDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            modalDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleModalFileSelect(e.dataTransfer.files);
            }
        });
    }

    if (modalImageFileInput) {
        modalImageFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleModalFileSelect(e.target.files);
            }
        });
    }

    function handleModalFileSelect(files) {
        selectedModalFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        if (selectedModalFiles.length === 0) {
            alert('Please select valid image files.');
            return;
        }

        modalPreviewContainer.style.display = 'block';
        fileCount.textContent = `${selectedModalFiles.length} file(s) selected`;
        modalImagePreview.innerHTML = '';

        // Show previews for up to 5 images
        selectedModalFiles.slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '60px';
                img.style.height = '60px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                modalImagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });

        if (selectedModalFiles.length > 5) {
            const more = document.createElement('div');
            more.textContent = `+${selectedModalFiles.length - 5}`;
            more.style.color = '#aaa';
            more.style.display = 'flex';
            more.style.alignItems = 'center';
            modalImagePreview.appendChild(more);
        }
    }

    function resetModalForm() {
        if (imageNameInput) imageNameInput.value = '';
        selectedModalFiles = [];
        modalPreviewContainer.style.display = 'none';
        modalImagePreview.innerHTML = '';
        fileCount.textContent = '';
        modalImageFileInput.value = '';
    }

    // Open Modal
    window.manageImages = async (roundId, roundName) => {
        currentRoundId = roundId;
        modalTitle.textContent = `Manage Images for ${roundName}`;
        imageModal.style.display = 'block';
        loadRoundImages(roundId);
    };

    // Load Images
    async function loadRoundImages(roundId) {
        try {
            const { data: images, error } = await supabase
                .from('round_images')
                .select('*')
                .eq('round_id', roundId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            roundImagesList.innerHTML = images.map(img => `
                <div class="round-item" style="padding: 0.5rem; position: relative;">
                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 5px;">
                        <button class="btn-action btn-edit" onclick="editImageName('${img.id}', '${img.name || ''}')" title="Edit Name" style="background: rgba(0,0,0,0.5); padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-pencil-alt" style="font-size: 0.9rem;"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteImage('${img.id}')" title="Delete Image" style="background: rgba(0,0,0,0.5); padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-trash" style="font-size: 0.9rem;"></i>
                        </button>
                    </div>
                    <img src="${img.image_url}" alt="${img.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 5px; margin-bottom: 0.5rem;">
                    <p style="color: #fff; margin: 0; font-size: 0.9rem;">${img.name || 'Untitled'}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading images:', error);
            alert('Error loading images: ' + error.message);
        }
    }

    // Edit Image Name
    window.editImageName = async (imageId, currentName) => {
        const newName = prompt('Enter new name for the image:', currentName);
        if (newName !== null && newName !== currentName) {
            try {
                const { error } = await supabase
                    .from('round_images')
                    .update({ name: newName })
                    .eq('id', imageId);

                if (error) throw error;

                loadRoundImages(currentRoundId);
            } catch (error) {
                alert('Error updating image name: ' + error.message);
            }
        }
    };

    // Save Images (Bulk Upload)
    if (saveImageBtn) {
        saveImageBtn.addEventListener('click', async () => {
            if (selectedModalFiles.length === 0) {
                alert('Please select images first.');
                return;
            }

            try {
                saveImageBtn.disabled = true;
                const totalFiles = selectedModalFiles.length;
                let uploadedCount = 0;

                for (const file of selectedModalFiles) {
                    uploadedCount++;
                    saveImageBtn.textContent = `Uploading ${uploadedCount}/${totalFiles}...`;

                    const fileExt = file.name.split('.').pop();
                    const fileName = `gallery/${currentRoundId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { data, error: uploadError } = await supabase.storage
                        .from('round-images')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error(`Error uploading ${file.name}:`, uploadError);
                        continue; // Skip this file and try next
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('round-images')
                        .getPublicUrl(fileName);

                    const { error: insertError } = await supabase
                        .from('round_images')
                        .insert([{
                            round_id: currentRoundId,
                            image_url: publicUrl,
                            name: 'SIN NOMBRE'
                        }]);

                    if (insertError) {
                        console.error(`Error inserting record for ${file.name}:`, insertError);
                    }
                }

                alert('Images upload process completed!');
                resetModalForm();
                loadRoundImages(currentRoundId);

            } catch (error) {
                console.error('Error saving images:', error);
                alert('Error saving images: ' + error.message);
            } finally {
                saveImageBtn.disabled = false;
                saveImageBtn.textContent = 'Save Images';
            }
        });
    }

    // Delete Image
    window.deleteImage = async (imageId) => {
        if (confirm('Are you sure you want to delete this image?')) {
            try {
                const { error } = await supabase
                    .from('round_images')
                    .delete()
                    .eq('id', imageId);

                if (error) throw error;

                loadRoundImages(currentRoundId);
            } catch (error) {
                alert('Error deleting image: ' + error.message);
            }
        }
    };
}
