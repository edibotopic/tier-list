// Toggle between light and dark themes
const toggleTheme = () => {
    const currentTheme = document.documentElement.className;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.className = newTheme;
    localStorage.setItem('tierListTheme', newTheme);
    updateThemeButton();
};

// Update theme icon 
const updateThemeButton = () => {
    const btn = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.className;
    btn.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    btn.title = currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
};

// Load saved theme preference from localStorage
const savedTheme = localStorage.getItem('tierListTheme') || 'dark';
document.documentElement.className = savedTheme;

// Toggle zen mode (for screenshots and summaries)
const toggleZenMode = () => {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    localStorage.setItem('zenMode', isZen);
    updateZenButton();
};

// Update zen icon
const updateZenButton = () => {
    const btn = document.getElementById('zenToggle');
    const isZen = document.body.classList.contains('zen-mode');
    btn.textContent = isZen ? '👁️' : '🧘';
    btn.title = isZen ? 'Exit Zen Mode' : 'Enter Zen Mode';
};

// Load saved zen mode preference from localStorage
const savedZenMode = localStorage.getItem('zenMode') === 'true';
if (savedZenMode) {
    document.body.classList.add('zen-mode');
}

// Track currently dragged elements
let draggedElement = null;      // Currently dragged image
let draggedTierRow = null;      // Currently dragged tier row
let selectedImages = new Set();  // Set of selected images for multi-select

// Convert RGB color to hex format for color picker
function rgbToHex(rgb) {
    if (!rgb || rgb.indexOf('rgb') === -1) return rgb;
    const values = rgb.match(/\d+/g);
    if (!values || values.length < 3) return rgb;
    const r = parseInt(values[0]).toString(16).padStart(2, '0');
    const g = parseInt(values[1]).toString(16).padStart(2, '0');
    const b = parseInt(values[2]).toString(16).padStart(2, '0');
    return '#' + r + g + b;
}

// Update control button colors based on color picker
function updateControlButtonColors() {
    const color = document.getElementById('tierColor').value;
    const addBtn = document.querySelector('.controls button:not(.upload-button)');
    const uploadBtn = document.querySelector('.upload-button');
    if (addBtn) addBtn.style.backgroundColor = color;
    if (uploadBtn) uploadBtn.style.backgroundColor = color;
}

// Create a new tier row and add it to the tier list
function addTier() {
    const tierName = document.getElementById('tierName').value.trim();
    const tierColor = document.getElementById('tierColor').value;

    if (!tierName) {
        alert('Please enter a tier name');
        return;
    }

    const tierList = document.getElementById('tierList');
    const tierRow = document.createElement('div');
    tierRow.className = 'tier-row';
    tierRow.draggable = true;
    tierRow.ondragstart = dragTierStart;
    tierRow.ondragend = dragTierEnd;
    tierRow.ondragover = allowTierDrop;
    tierRow.ondrop = dropTier;

    // Tier label (colored name on the left, click to change color)
    const tierLabel = document.createElement('div');
    tierLabel.className = 'tier-label';
    tierLabel.style.backgroundColor = tierColor;
    tierLabel.textContent = tierName;
    tierLabel.onclick = function(e) {
        e.stopPropagation();
        // Create temporary color input to pick new color
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = rgbToHex(tierLabel.style.backgroundColor) || tierColor;
        colorPicker.style.position = 'absolute';
        colorPicker.style.opacity = '0';
        document.body.appendChild(colorPicker);

        colorPicker.onchange = function() {
            tierLabel.style.backgroundColor = colorPicker.value;
            document.body.removeChild(colorPicker);
        };

        colorPicker.onblur = function() {
            document.body.removeChild(colorPicker);
        };

        colorPicker.click();
    };

    // Tier items container (holds images)
    const tierItems = document.createElement('div');
    tierItems.className = 'tier-items';
    tierItems.ondrop = drop;
    tierItems.ondragover = allowDrop;
    tierItems.ondragleave = dragLeave;

    // Tier controls (Clear and Delete buttons)
    const tierControls = document.createElement('div');
    tierControls.className = 'tier-controls';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-tier';
    clearBtn.textContent = 'Clear';
    clearBtn.onclick = function(e) {
        e.stopPropagation();
        const images = tierItems.querySelectorAll('.image-item');
        const imageBank = document.getElementById('imageBank');
        images.forEach(img => imageBank.appendChild(img));
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-tier';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        // Move images back to bank before deleting tier
        const images = tierItems.querySelectorAll('.image-item');
        const imageBank = document.getElementById('imageBank');
        images.forEach(img => imageBank.appendChild(img));
        tierRow.remove();
    };

    tierControls.appendChild(clearBtn);
    tierControls.appendChild(deleteBtn);

    tierRow.appendChild(tierLabel);
    tierRow.appendChild(tierItems);
    tierRow.appendChild(tierControls);

    tierList.appendChild(tierRow);

    // NOT IMPLEMENTED: Auto-suggest next tier name (S -> A -> B -> C -> D -> F)
    document.getElementById('tierName').value = getNextTierName(tierName);
}

// NOT IMPLEMENTED: Suggest next tier name in standard sequence
function getNextTierName(current) {
    const sequence = ['S', 'A', 'B', 'C', 'D', 'F'];
    const index = sequence.indexOf(current);
    if (index !== -1 && index < sequence.length - 1) {
        return sequence[index + 1];
    }
    return current;
}

// Handle image upload from file picker
function handleImageUpload(event) {
    const files = event.target.files;
    addImagesToBank(files);
    event.target.value = '';
}

// Add uploaded or dropped images to the image bank
function addImagesToBank(files) {
    const imageBank = document.getElementById('imageBank');

    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                createImageElement(e.target.result, imageBank);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Clear all selected images
function clearSelection() {
    selectedImages.forEach(img => img.classList.remove('selected'));
    selectedImages.clear();
}

// Toggle image selection
function toggleImageSelection(img, shiftKey) {
    if (shiftKey) {
        // Multi-select with shift
        if (selectedImages.has(img)) {
            img.classList.remove('selected');
            selectedImages.delete(img);
        } else {
            img.classList.add('selected');
            selectedImages.add(img);
        }
    } else {
        // Single select without shift
        clearSelection();
        img.classList.add('selected');
        selectedImages.add(img);
    }
}

// Show slideshow modal for selected images
function showImageSlideshow(startImg) {
    const images = selectedImages.size > 0 ? Array.from(selectedImages) : [startImg];
    let currentIndex = 0;

    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const prevBtn = document.getElementById('modalPrev');
    const nextBtn = document.getElementById('modalNext');

    // Add slideshow class if multiple images
    if (images.length > 1) {
        modal.classList.add('slideshow');
    }

    modal.style.display = 'block';

    function showImage(index) {
        modalImg.src = images[index].src;
        currentIndex = index;
    }

    showImage(images.indexOf(startImg) >= 0 ? images.indexOf(startImg) : 0);

    // Navigation button handlers
    function goNext(e) {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function goPrev(e) {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    prevBtn.onclick = goPrev;
    nextBtn.onclick = goNext;

    // Add keyboard navigation for slideshow
    function handleKeydown(e) {
        if (e.key === 'ArrowRight') {
            goNext();
        } else if (e.key === 'ArrowLeft') {
            goPrev();
        } else if (e.key === 'Escape') {
            closeSlideshow();
        }
    }

    function closeSlideshow() {
        modal.style.display = 'none';
        modal.classList.remove('slideshow');
        document.removeEventListener('keydown', handleKeydown);
    }

    document.removeEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleKeydown);

    modal.onclick = function() {
        closeSlideshow();
    };
}

// Create an image element with drag-drop and click handlers
function createImageElement(src, container) {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'image-item';
    img.draggable = true;
    img.ondragstart = drag;
    img.ondragend = dragEnd;
    // Click to select/view
    img.onclick = function(e) {
        e.stopPropagation();
        if (e.shiftKey) {
            // Shift+click for multi-select
            toggleImageSelection(this, true);
        } else if (selectedImages.size > 0 && selectedImages.has(this)) {
            // If already selected, show slideshow
            showImageSlideshow(this);
        } else if (selectedImages.size === 0) {
            // No selection, just view full-size
            showImageModal(this.src);
        } else {
            // New single selection
            toggleImageSelection(this, false);
        }
    };
    // Double-click to remove image
    img.ondblclick = function(e) {
        e.stopPropagation();
        if (selectedImages.size > 0) {
            // Remove all selected
            selectedImages.forEach(img => img.remove());
            clearSelection();
        } else {
            this.remove();
        }
    };
    container.appendChild(img);
}

// Show full-size image in modal overlay
function showImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = src;
}

// Close the image modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    modal.classList.remove('slideshow');
}

// Start dragging a tier row to reorder tiers
function dragTierStart(event) {
    if (event.target.classList.contains('tier-row')) {
        draggedTierRow = event.target;
        event.target.classList.add('dragging-tier');
        event.dataTransfer.effectAllowed = 'move';
    }
}

// End tier row drag
function dragTierEnd(event) {
    event.target.classList.remove('dragging-tier');
    document.querySelectorAll('.tier-row').forEach(row => {
        row.classList.remove('drag-over-tier');
    });
    draggedTierRow = null;
}

// Allow dropping on tier rows
function allowTierDrop(event) {
    if (draggedTierRow && event.target.classList.contains('tier-row')) {
        event.preventDefault();
        event.target.classList.add('drag-over-tier');
    }
}

// Drop tier row to reorder it
function dropTier(event) {
    event.preventDefault();
    event.stopPropagation();

    if (draggedTierRow && event.currentTarget.classList.contains('tier-row')) {
        const dropTarget = event.currentTarget;
        dropTarget.classList.remove('drag-over-tier');

        if (draggedTierRow !== dropTarget) {
            const tierList = document.getElementById('tierList');
            const allTiers = [...tierList.children];
            const draggedIndex = allTiers.indexOf(draggedTierRow);
            const dropIndex = allTiers.indexOf(dropTarget);

            // Insert before or after based on drag direction
            if (draggedIndex < dropIndex) {
                tierList.insertBefore(draggedTierRow, dropTarget.nextSibling);
            } else {
                tierList.insertBefore(draggedTierRow, dropTarget);
            }
        }
    }
}

// Start dragging an image
function drag(event) {
    draggedElement = event.target;

    // If dragging a selected image, drag all selected images
    if (selectedImages.has(event.target)) {
        event.target.classList.add('dragging');
        selectedImages.forEach(img => {
            if (img !== event.target) {
                img.classList.add('dragging');
            }
        });
    } else {
        event.target.classList.add('dragging');
    }

    event.stopPropagation();
}

// End image drag
function dragEnd(event) {
    document.querySelectorAll('.image-item.dragging').forEach(img => {
        img.classList.remove('dragging');
    });
}

// Allow dropping images on tier items or image bank
function allowDrop(event) {
    event.preventDefault();
    if (event.target.classList.contains('tier-items') ||
        event.target.classList.contains('image-bank-items')) {
        event.target.classList.add('drag-over');
    }
}

// Remove drag-over styling when leaving drop zone
function dragLeave(event) {
    if (event.target.classList.contains('tier-items') ||
        event.target.classList.contains('image-bank-items')) {
        event.target.classList.remove('drag-over');
    }
}

// Add images to a specific container (tier or bank)
function addImagesToContainer(files, container) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                createImageElement(e.target.result, container);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Handle dropping images or files
function drop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('drag-over');

    let dropTarget = event.target;

    // Handle file drops from file system (drag images from explorer)
    if (event.dataTransfer.files.length > 0) {
        if (dropTarget.classList.contains('tier-items')) {
            // Drop directly into tier
            addImagesToContainer(event.dataTransfer.files, dropTarget);
        } else if (dropTarget.classList.contains('image-bank-items')) {
            // Drop into image bank
            addImagesToBank(event.dataTransfer.files);
        }
        return;
    }

    // Handle dropping on tier container or image bank
    if (dropTarget.classList.contains('tier-items') ||
        dropTarget.classList.contains('image-bank-items')) {
        if (draggedElement) {
            // If dragging selected images, move all of them
            if (selectedImages.has(draggedElement)) {
                selectedImages.forEach(img => {
                    dropTarget.appendChild(img);
                });
                clearSelection();
            } else {
                dropTarget.appendChild(draggedElement);
            }
        }
    }
    // Handle dropping on another image to reorder
    else if (dropTarget.classList.contains('image-item') && draggedElement) {
        const parent = dropTarget.parentElement;
        if (parent && (parent.classList.contains('tier-items') ||
                      parent.classList.contains('image-bank-items'))) {
            const allImages = [...parent.children];
            const draggedIndex = allImages.indexOf(draggedElement);
            const dropIndex = allImages.indexOf(dropTarget);

            // Insert before or after based on drag direction
            if (draggedIndex < dropIndex) {
                parent.insertBefore(draggedElement, dropTarget.nextSibling);
            } else {
                parent.insertBefore(draggedElement, dropTarget);
            }
        }
    }
}

// Prevent browser default drag/drop behavior (opening files)
window.addEventListener('dragover', function(e) {
    e.preventDefault();
});

window.addEventListener('drop', function(e) {
    e.preventDefault();
});

// Set up default tiers on page load
window.onload = function() {
    updateThemeButton();
    updateZenButton();

    // Create default tiers with typical colors
    const defaultTiers = [
        { name: 'S', color: '#ff7f7f' },
        { name: 'A', color: '#ffbf7f' },
        { name: 'B', color: '#ffff7f' },
        { name: 'C', color: '#7fff7f' },
        { name: 'D', color: '#7fbfff' }
    ];

    defaultTiers.forEach(tier => {
        document.getElementById('tierName').value = tier.name;
        document.getElementById('tierColor').value = tier.color;
        addTier();
    });

    // Clear tier name input after initialization
    document.getElementById('tierName').value = '';
    // Set color picker to the last tier's color
    const lastTierColor = defaultTiers[defaultTiers.length - 1].color;
    document.getElementById('tierColor').value = lastTierColor;

    // Initialize button colors
    updateControlButtonColors();

    // Add event listener to color picker to update button colors
    document.getElementById('tierColor').addEventListener('input', updateControlButtonColors);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Show shift indicator when shift is held (but not when modal is open)
        if (e.key === 'Shift') {
            const modal = document.getElementById('imageModal');
            if (modal.style.display !== 'block') {
                document.getElementById('shiftIndicator').classList.add('visible');
            }
        }

        // Delete selected images with Delete or Backspace key
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImages.size > 0) {
            e.preventDefault();
            selectedImages.forEach(img => img.remove());
            clearSelection();
        }

        // Open slideshow with Enter key when images are selected
        if (e.key === 'Enter' && selectedImages.size > 0) {
            e.preventDefault();
            const firstImage = Array.from(selectedImages)[0];
            showImageSlideshow(firstImage);
        }

        // Clear selection with Escape key (only if modal is not open)
        if (e.key === 'Escape') {
            const modal = document.getElementById('imageModal');
            if (modal.style.display === 'block') {
                // Close modal if open
                closeModal();
            } else if (selectedImages.size > 0) {
                // Clear selection if no modal open
                clearSelection();
            }
        }
    });

    // Hide shift indicator when shift is released
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Shift') {
            document.getElementById('shiftIndicator').classList.remove('visible');
        }
    });

    // Clear selection when clicking on background
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('image-item') && !e.shiftKey) {
            clearSelection();
        }
    });
};
