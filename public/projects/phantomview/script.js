window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.padding = '1rem 2rem';
        header.style.borderBottom = '1px solid #1a1a1a';
    } else {
        header.style.background = 'transparent';
        header.style.padding = '1.5rem 2rem';
        header.style.borderBottom = 'none';
    }
});

// Dynamically populate gallery if needed, or just handle interactions
document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');

    // IMAGE MODAL INTERACTION
    const modal = document.getElementById('image-modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalImg = document.getElementById('modal-img');
    let modalTimeout;
    let hoverTimeout;

    const showModal = (src) => {
        clearTimeout(modalTimeout);
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            modalImg.src = src;
            modal.classList.add('active');
        }, 1000);
    };

    const hideModal = () => {
        clearTimeout(hoverTimeout);
        modalTimeout = setTimeout(() => {
            modal.classList.remove('active');
        }, 100);
    };

    // Keep open if mouse enters the visible popup content
    modalContent.addEventListener('mouseenter', () => {
        clearTimeout(modalTimeout);
        clearTimeout(hoverTimeout);
    });

    // Close if mouse leaves the visible popup content
    modalContent.addEventListener('mouseleave', hideModal);

    // Close if clicking the background overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // GALLERY IMAGE DATA
    const galleryData = [
        // Configurator: 01-15
        ...Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            category: 'configurator',
            src: `assets/imgs/rr_img_${(i + 1).toString().padStart(2, '0')}.jpg`
        })),
        // Street: 16-24
        ...Array.from({ length: 9 }, (_, i) => ({
            id: i + 16,
            category: 'street',
            src: `assets/imgs/rr_img_${(i + 16).toString().padStart(2, '0')}.jpg`
        })),
        // Winter: 25-28
        ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 25,
            category: 'winter',
            src: `assets/imgs/rr_img_${(i + 25).toString().padStart(2, '0')}.jpg`
        }))
    ];

    const loadGallery = (filter = 'all') => {
        galleryGrid.innerHTML = '';
        const filteredData = filter === 'all'
            ? galleryData
            : galleryData.filter(item => item.category === filter);

        filteredData.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item fade-in';
            galleryItem.style.animationDelay = `${index * 0.05}s`;

            galleryItem.innerHTML = `
                <img src="${item.src}" alt="Rolls-Royce Phantom ${item.id}">
            `;

            galleryItem.addEventListener('mouseenter', () => showModal(item.src));
            galleryItem.addEventListener('mouseleave', hideModal);

            galleryGrid.appendChild(galleryItem);
        });
    };

    // Filter Button Listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Load filtered gallery
            loadGallery(btn.dataset.category);
        });
    });

    // Initial Load
    loadGallery('all');

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
