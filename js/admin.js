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
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check User Role
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (roleError && roleError.code !== 'PGRST116') { // Ignore "Row not found" for now, treat as no access or default
                throw roleError;
            }

            const userRole = roleData ? roleData.role : 'no_access'; // Default to no_access if not found

            if (userRole === 'no_access') {
                await supabase.auth.signOut();
                alert('Access denied. Your account does not have permission to access the admin panel.');
                window.location.href = '../index.html';
                return;
            }

            window.location.href = 'dashboard.html';
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            
            let message = 'Ha ocurrido un error desconocido.';
            
            // Map specific errors
            if (error.message.includes('Invalid login credentials')) {
                message = 'Correo o contraseña incorrectos.';
            } else if (error.message.includes('Email not confirmed')) {
                message = 'Por favor, confirma tu correo electrónico antes de iniciar sesión.';
            } else if (error.message.includes('Failed to fetch')) {
                message = 'Error de conexión. Verifica tu internet.';
            } else {
                // Fallback for other errors (optional translation)
                message = error.message;
            }

            errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${message}</span>`;
            errorMessage.style.display = 'flex';
            
            // If role check fails, ensure logout
            await supabase.auth.signOut();
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
    const storageUsedSpan = document.getElementById('storageUsed');

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

    // Protect Route & Role Check
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        // Fetch Role
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        const userRole = roleData ? roleData.role : 'no_access';

        if (userRole === 'no_access') {
            await supabase.auth.signOut();
            alert('Access revoked.');
            window.location.href = '../index.html';
            return;
        }

        // Expose role for UI logic
        window.currentUserRole = userRole;

        // Show Superadmin features
        if (userRole === 'superadmin') {
            const accountManagementBtn = document.getElementById('accountManagementBtn');
            if (accountManagementBtn) {
                accountManagementBtn.style.display = 'block';
            }
            const userManagementSection = document.getElementById('userManagementSection');
            if (userManagementSection) {
                userManagementSection.style.display = 'block';
                loadUsers();
            }
        }

        userEmailSpan.textContent = session.user.email;
        loadRounds();
        loadStorageUsage();
    };
    checkAuth();

    // Storage Usage
    async function loadStorageUsage() {
        if (!storageUsedSpan) return;

        const progressBar = document.getElementById('storageProgressBar');

        try {
            const { data, error } = await supabase.rpc('get_storage_usage');

            if (error) {
                console.error('Error fetching storage usage:', error);
                storageUsedSpan.textContent = 'Error';
                return;
            }

            const bytes = data || 0;
            const megabytes = (bytes / (1024 * 1024)).toFixed(2);
            const percentage = Math.min((megabytes / 500) * 100, 100);

            // Format display: show GB if > 1000MB, otherwise MB
            let displayValue;
            if (megabytes > 1000) {
                displayValue = (megabytes / 1024).toFixed(2) + ' GB';
            } else {
                displayValue = megabytes + ' MB';
            }

            storageUsedSpan.textContent = displayValue;

            if (progressBar) {
                progressBar.style.width = `${percentage}%`;

                // Color change based on usage
                if (percentage > 90) {
                    progressBar.style.backgroundColor = '#d93025'; // Red
                } else if (percentage > 75) {
                    progressBar.style.backgroundColor = '#f4b400'; // Yellow
                } else {
                    progressBar.style.backgroundColor = '#4285f4'; // Blue
                }
            }

        } catch (error) {
            console.error('Error loading storage usage:', error);
        }
    }

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // Optimize Image Function
    const optimizeImage = (file, maxWidth = 1200, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        const optimizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(optimizedFile);
                    }, 'image/jpeg', quality);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

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
                const optimizedFile = await optimizeImage(selectedFile);
                const fileExt = 'jpg'; // Always converting to jpg
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('round-images')
                    .upload(filePath, optimizedFile);

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
                if (confirm('Are you sure you want to delete this round? ALL associated images will be permanently deleted.')) {
                    try {
                        // 1. Get Round Data (for Main Image)
                        const { data: roundData, error: roundError } = await supabase
                            .from('rounds')
                            .select('image_url')
                            .eq('id', id)
                            .single();

                        if (roundError) throw roundError;

                        // 2. Delete Main Image from Storage
                        if (roundData && roundData.image_url) {
                            const urlParts = roundData.image_url.split('/round-images/');
                            if (urlParts.length > 1) {
                                await supabase.storage.from('round-images').remove([urlParts[1]]);
                            }
                        }

                        // 3. Get All Gallery Images for this Round
                        const { data: galleryImages, error: galleryError } = await supabase
                            .from('round_images')
                            .select('image_url')
                            .eq('round_id', id);

                        if (galleryError) throw galleryError;

                        // 4. Delete Gallery Images from Storage
                        if (galleryImages && galleryImages.length > 0) {
                            const pathsToDelete = galleryImages
                                .map(img => {
                                    const parts = img.image_url.split('/round-images/');
                                    return parts.length > 1 ? parts[1] : null;
                                })
                                .filter(path => path !== null);

                            if (pathsToDelete.length > 0) {
                                await supabase.storage.from('round-images').remove(pathsToDelete);
                            }
                        }

                        // 5. Delete Round from DB (Cascade should handle round_images records)
                        const { error } = await supabase
                            .from('rounds')
                            .delete()
                            .eq('id', id);

                        if (error) throw error;

                        loadRounds(); // Refresh list
                        loadStorageUsage(); // Update storage display
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
    // Load Images with Drag & Drop Support
    async function loadRoundImages(roundId) {
        try {
            const { data: images, error } = await supabase
                .from('round_images')
                .select('*')
                .eq('round_id', roundId)
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            roundImagesList.innerHTML = images.map(img => `
                <div class="round-item" 
                     draggable="true" 
                     data-id="${img.id}"
                     style="padding: 0.5rem; position: relative;">
                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 5px; z-index: 10;">
                        <button class="btn-action btn-edit" onclick="editImageName('${img.id}', '${img.name || ''}')" title="Edit Name" style="background: rgba(0,0,0,0.5); padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-pencil-alt" style="font-size: 0.9rem;"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteImage('${img.id}')" title="Delete Image" style="background: rgba(0,0,0,0.5); padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-trash" style="font-size: 0.9rem;"></i>
                        </button>
                    </div>
                    <img src="${img.image_url}" alt="${img.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 5px; margin-bottom: 0.5rem; pointer-events: none;">
                    <p style="color: #fff; margin: 0; font-size: 0.9rem;">${img.name || 'Untitled'}</p>
                </div>
            `).join('');

            initializeDragAndDrop();

            // Show Save Order Button if items > 1
            const saveOrderBtn = document.getElementById('saveOrderBtn');
            if (saveOrderBtn) {
                saveOrderBtn.style.display = images.length > 1 ? 'block' : 'none';
                saveOrderBtn.onclick = saveImageOrder;
            }

        } catch (error) {
            console.error('Error loading images:', error);
            alert('Error loading images: ' + error.message);
        }
    }

    // Drag & Drop Logic
    function initializeDragAndDrop() {
        const items = roundImagesList.querySelectorAll('.round-item');

        items.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    }

    let dragSrcEl = null;

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if (dragSrcEl !== this) {
            // Swap logic: Insert dragged element before or after target
            // Simple approach: Swap HTML (might break listeners, better to move DOM nodes)

            // Re-attaching nodes
            const container = roundImagesList;
            const items = Array.from(container.children);
            const srcIndex = items.indexOf(dragSrcEl);
            const targetIndex = items.indexOf(this);

            if (srcIndex < targetIndex) {
                this.after(dragSrcEl);
            } else {
                this.before(dragSrcEl);
            }
        }
        return false;
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        const items = roundImagesList.querySelectorAll('.round-item');
        items.forEach(item => item.classList.remove('drag-over'));
    }

    // Save Order Function
    async function saveImageOrder() {
        const saveBtn = document.getElementById('saveOrderBtn');
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            const items = roundImagesList.querySelectorAll('.round-item');
            const updates = [];

            items.forEach((item, index) => {
                const id = item.dataset.id;
                updates.push({
                    id: id,
                    display_order: index
                });
            });

            // Upsert updates
            // Since Supabase JS client doesn't support bulk update with different values easily in v2 without rpc or loop,
            // we will loop for now or use upsert if we select all columns.
            // Efficient bulk update is tricky. Let's do parallel requests for now as N is small (max ~20 images).

            const promises = updates.map(update =>
                supabase
                    .from('round_images')
                    .update({ display_order: update.display_order })
                    .eq('id', update.id)
            );

            await Promise.all(promises);

            alert('Order saved successfully!');
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error saving order: ' + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    }

    // Edit Image Name
    // Rename Image Modal Logic
    const renameModal = document.getElementById('renameModal');
    const renameInput = document.getElementById('renameInput');
    const cancelRenameBtn = document.getElementById('cancelRenameBtn');
    const confirmRenameBtn = document.getElementById('confirmRenameBtn');

    let currentRenameImageId = null;

    // Edit Image Name
    window.editImageName = (imageId, currentName) => {
        currentRenameImageId = imageId;
        renameInput.value = currentName || '';
        renameModal.style.display = 'flex';
        renameInput.focus();
    };

    const closeRenameModal = () => {
        renameModal.style.display = 'none';
        currentRenameImageId = null;
        renameInput.value = '';
    };

    if (cancelRenameBtn) {
        cancelRenameBtn.addEventListener('click', closeRenameModal);
    }

    if (confirmRenameBtn) {
        confirmRenameBtn.addEventListener('click', async () => {
            const newName = renameInput.value.trim();
            if (!newName) {
                alert('Please enter a name');
                return;
            }

            try {
                confirmRenameBtn.disabled = true;
                confirmRenameBtn.textContent = 'Saving...';

                const { error } = await supabase
                    .from('round_images')
                    .update({ name: newName })
                    .eq('id', currentRenameImageId);

                if (error) throw error;

                closeRenameModal();
                loadRoundImages(currentRoundId);
            } catch (error) {
                alert('Error updating image name: ' + error.message);
            } finally {
                confirmRenameBtn.disabled = false;
                confirmRenameBtn.textContent = 'Save';
            }
        });
    }

    // Close on click outside removed as per user request
    /* 
    if (renameModal) {
        renameModal.addEventListener('click', (e) => {
            if (e.target === renameModal) closeRenameModal();
        });
    }
    */

    if (renameInput) {
        renameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmRenameBtn.click();
            }
        });
    }

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
                    saveImageBtn.textContent = `Optimizing & Uploading ${uploadedCount}/${totalFiles}...`;

                    try {
                        const optimizedFile = await optimizeImage(file);
                        const fileExt = 'jpg';
                        const fileName = `gallery/${currentRoundId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                        const { data, error: uploadError } = await supabase.storage
                            .from('round-images')
                            .upload(fileName, optimizedFile);

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
                    } catch (optError) {
                        console.error(`Error optimizing ${file.name}:`, optError);
                    }
                }

                alert('Images upload process completed!');
                resetModalForm();
                loadRoundImages(currentRoundId);
                loadStorageUsage();

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
                // 1. Get Image URL first
                const { data: imgData, error: fetchError } = await supabase
                    .from('round_images')
                    .select('image_url')
                    .eq('id', imageId)
                    .single();

                if (fetchError) throw fetchError;

                if (imgData && imgData.image_url) {
                    // 2. Extract path from URL
                    // URL format: .../storage/v1/object/public/round-images/path/to/file.jpg
                    const urlParts = imgData.image_url.split('/round-images/');
                    if (urlParts.length > 1) {
                        const filePath = urlParts[1];

                        // 3. Delete from Storage
                        const { error: storageError } = await supabase.storage
                            .from('round-images')
                            .remove([filePath]);

                        if (storageError) {
                            console.error('Error deleting file from storage:', storageError);
                            // We continue to delete from DB even if storage fails, 
                            // or maybe we should warn? For now, just log.
                        }
                    }
                }

                // 4. Delete from DB
                const { error } = await supabase
                    .from('round_images')
                    .delete()
                    .eq('id', imageId);

                if (error) throw error;

                loadRoundImages(currentRoundId);
                loadStorageUsage();
            } catch (error) {
                alert('Error deleting image: ' + error.message);
            }
        }
    };

    // Carousel Management Logic
    const carouselDropZone = document.getElementById('carouselDropZone');
    const carouselImageInput = document.getElementById('carouselImageFile');
    const uploadCarouselBtn = document.getElementById('uploadCarouselBtn');
    const carouselImagesList = document.getElementById('carouselImagesList');
    let selectedCarouselFiles = [];
    let carouselImagesData = []; // Store DB images

    if (carouselDropZone) {
        carouselDropZone.addEventListener('click', () => carouselImageInput.click());

        carouselDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            carouselDropZone.classList.add('dragover');
        });

        carouselDropZone.addEventListener('dragleave', () => {
            carouselDropZone.classList.remove('dragover');
        });

        carouselDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            carouselDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleCarouselFileSelect(e.dataTransfer.files);
            }
        });
    }

    if (carouselImageInput) {
        carouselImageInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleCarouselFileSelect(e.target.files);
            }
        });
    }

    function handleCarouselFileSelect(files) {
        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        // Append new files instead of replacing
        selectedCarouselFiles = [...selectedCarouselFiles, ...newFiles];

        if (newFiles.length > 0) {
            renderCarouselList();
        }
    }

    // Remove pending file
    window.removePendingFile = (index) => {
        selectedCarouselFiles.splice(index, 1);
        renderCarouselList();
    };

    // Combined Render Function
    function renderCarouselList() {
        if (!carouselImagesList) return;

        let html = '';

        // 1. Render Pending Files (Previews)
        selectedCarouselFiles.forEach((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            html += `
                <div class="round-item" style="padding: 0.5rem; position: relative; border: 2px dashed #4CAF50;">
                    <button class="btn-action btn-delete" onclick="removePendingFile(${index})" title="Remove Pending" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; z-index: 10;">
                        <i class="fas fa-times" style="font-size: 0.9rem;"></i>
                    </button>
                    <div style="position: absolute; bottom: 0.5rem; left: 0.5rem; background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px; font-size: 0.7rem;">Pending</div>
                    <img src="${objectUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 5px; opacity: 0.8;">
                </div>
            `;
        });

        // 2. Render Uploaded Images (DB)
        carouselImagesData.forEach(img => {
            html += `
                <div class="round-item" style="padding: 0.5rem; position: relative;">
                    <button class="btn-action btn-delete" onclick="deleteCarouselImage('${img.id}')" title="Delete Image" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-trash" style="font-size: 0.9rem;"></i>
                    </button>
                    <img src="${img.image_url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 5px;">
                </div>
            `;
        });

        carouselImagesList.innerHTML = html;
    }

    async function loadCarouselImages() {
        if (!carouselImagesList) return;

        try {
            const { data: images, error } = await supabase
                .from('carousel_images')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            carouselImagesData = images; // Store data
            renderCarouselList(); // Render combined list

        } catch (error) {
            console.error('Error loading carousel images:', error);
        }
    }

    if (uploadCarouselBtn) {
        uploadCarouselBtn.addEventListener('click', async () => {
            if (selectedCarouselFiles.length === 0) {
                alert('Please select images first.');
                return;
            }

            try {
                uploadCarouselBtn.disabled = true;
                uploadCarouselBtn.textContent = 'Uploading...';

                for (const file of selectedCarouselFiles) {
                    // Compress Image: Max 1920px width, 0.85 quality
                    // This ensures files are well below 20MB while keeping high quality
                    let fileToUpload = file;
                    try {
                        const optimizedBlob = await optimizeImage(file, 1920, 0.85);
                        fileToUpload = new File([optimizedBlob], file.name, { type: file.type });

                        // Safety check for 20MB limit (20 * 1024 * 1024 bytes)
                        if (fileToUpload.size > 20 * 1024 * 1024) {
                            alert(`File ${file.name} is still too large (>20MB) after compression. Skipped.`);
                            continue;
                        }
                    } catch (optError) {
                        console.warn('Compression failed, trying original file:', optError);
                    }

                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('carousel-images')
                        .upload(fileName, fileToUpload);

                    if (uploadError) {
                        console.error(`Error uploading ${file.name}:`, uploadError);
                        continue;
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('carousel-images')
                        .getPublicUrl(fileName);

                    const { error: insertError } = await supabase
                        .from('carousel_images')
                        .insert([{ image_url: publicUrl }]);

                    if (insertError) console.error('Error inserting DB record:', insertError);
                }

                alert('Carousel images uploaded!');
                selectedCarouselFiles = []; // Clear pending
                loadCarouselImages(); // Refresh DB list
                loadStorageUsage();
            } catch (error) {
                alert('Error uploading: ' + error.message);
            } finally {
                uploadCarouselBtn.disabled = false;
                uploadCarouselBtn.textContent = 'Upload to Carousel';
            }
        });
    }

    window.deleteCarouselImage = async (id) => {
        if (confirm('Delete this carousel image?')) {
            try {
                // 1. Get Image URL first
                const { data: imgData, error: fetchError } = await supabase
                    .from('carousel_images')
                    .select('image_url')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                if (imgData && imgData.image_url) {
                    // Extract path
                    const urlParts = imgData.image_url.split('/carousel-images/');
                    if (urlParts.length > 1) {
                        const filePath = urlParts[1];

                        // Delete from Storage
                        const { error: storageError } = await supabase.storage
                            .from('carousel-images')
                            .remove([filePath]);

                        if (storageError) console.error('Error deleting file:', storageError);
                    }
                }

                const { error } = await supabase
                    .from('carousel_images')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                loadCarouselImages();
                loadStorageUsage();
            } catch (error) {
                alert('Error deleting: ' + error.message);
            }
        }
    };

    // Initial Load
    loadCarouselImages();

    // User Management Logic (Superadmin Only)
    async function loadUsers() {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;

        try {
            const { data: users, error } = await supabase
                .rpc('get_users_with_roles');

            if (error) throw error;

            usersTableBody.innerHTML = users.map(user => {
                const isSuperadmin = user.role === 'superadmin';
                const isSelf = user.user_id === (supabase.auth.getUser()?.data?.user?.id); // Note: getUser is async usually, but we have session

                let actionButtons = '';
                if (!isSuperadmin) {
                    actionButtons = `
                        <select onchange="updateUserRole('${user.user_id}', this.value)" style="background: #222; color: #fff; border: 1px solid #444; padding: 5px; border-radius: 4px; margin-right: 10px;">
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="no_access" ${user.role === 'no_access' ? 'selected' : ''}>No Access</option>
                        </select>
                        <button class="btn-action btn-delete" onclick="deleteUser('${user.user_id}')" title="Delete User" style="color: #ff4444;">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                } else {
                    actionButtons = '<span style="color: #8dde00; font-size: 0.9rem;">Superadmin (Protected)</span>';
                }

                return `
                    <tr style="border-bottom: 1px solid #222;">
                        <td style="padding: 1rem;">${user.email}</td>
                        <td style="padding: 1rem;">
                            <span style="
                                padding: 2px 8px; 
                                border-radius: 4px; 
                                background: ${user.role === 'superadmin' ? '#8dde00' : (user.role === 'admin' ? '#4444ff' : '#333')}; 
                                color: ${user.role === 'superadmin' ? '#000' : '#fff'};
                                font-size: 0.8rem;
                            ">
                                ${user.role.toUpperCase()}
                            </span>
                        </td>
                        <td style="padding: 1rem;">${new Date(user.created_at).toLocaleDateString()}</td>
                        <td style="padding: 1rem;">
                            ${actionButtons}
                        </td>
                    </tr>
                `;
            }).join('');

            // Expose functions
            window.updateUserRole = async (userId, newRole) => {
                if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
                    loadUsers(); // Reset select
                    return;
                }

                try {
                    const { error } = await supabase
                        .rpc('update_user_role_by_superadmin', {
                            target_user_id: userId,
                            new_role: newRole
                        });

                    if (error) throw error;
                    alert('User role updated successfully.');
                    loadUsers();
                } catch (error) {
                    alert('Error updating role: ' + error.message);
                    loadUsers(); // Reset select
                }
            };

            window.deleteUser = async (userId) => {
                if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone.')) {
                    return;
                }

                try {
                    const { error } = await supabase
                        .rpc('delete_user_by_superadmin', {
                            target_user_id: userId
                        });

                    if (error) throw error;
                    alert('User deleted successfully.');
                    loadUsers();
                } catch (error) {
                    alert('Error deleting user: ' + error.message);
                }
            };

        } catch (error) {
            console.error('Error loading users:', error);
            usersTableBody.innerHTML = `<tr><td colspan="4" style="padding: 1rem; color: #ff4444;">Error loading users: ${error.message}</td></tr>`;
        }
    }

    // Create Account Logic
    const createUserBtn = document.getElementById('createUserBtn');
    const createUserModal = document.getElementById('createUserModal');
    const closeCreateUserModal = document.getElementById('closeCreateUserModal');
    const createUserForm = document.getElementById('createUserForm');

    if (createUserBtn) {
        createUserBtn.addEventListener('click', () => {
            createUserModal.style.display = 'flex';
        });
    }

    if (closeCreateUserModal) {
        closeCreateUserModal.addEventListener('click', () => {
            createUserModal.style.display = 'none';
        });
    }

    if (createUserModal) {
        createUserModal.addEventListener('click', (e) => {
            if (e.target === createUserModal) {
                createUserModal.style.display = 'none';
            }
        });
    }

    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;
            const submitBtn = createUserForm.querySelector('button[type="submit"]');

            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating...';

                const { error } = await supabase.rpc('create_user_by_superadmin', {
                    new_email: email,
                    new_password: password,
                    new_role: role
                });

                if (error) throw error;

                alert('User created successfully!');
                createUserModal.style.display = 'none';
                createUserForm.reset();
                loadUsers(); // Refresh list

            } catch (error) {
                alert('Error creating user: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }
}
