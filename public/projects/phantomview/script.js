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
document.addEventListener('DOMContentLoaded', () => {
    // GALLERY IMAGE DATA
    const galleryData = [
        // Configurator: 01-15
        ...Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            category: 'configurator',
            title: `PHANTOM CONFIGURATION ${i + 1}`,
            meta: 'BESPOKE DESIGN',
            description: 'A masterpiece of individual expression, tailored to reaching the heights of luxury.',
            src: `assets/imgs/rr_img_${(i + 1).toString().padStart(2, '0')}.jpg`
        })),
        // Street: 16-24
        ...Array.from({ length: 9 }, (_, i) => ({
            id: i + 16,
            category: 'street',
            title: `URBAN ELEGANCE ${i + 1}`,
            meta: 'STREET PRESENCE',
            description: 'The Phantom commands the road with an effortless grace that is unmistakable.',
            src: `assets/imgs/rr_img_${(i + 16).toString().padStart(2, '0')}.jpg`
        })),
        // Winter: 25-28
        ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 25,
            category: 'winter',
            title: `ARCTIC JOURNEY ${i + 1}`,
            meta: 'ALL-SEASON LUXURY',
            description: 'Uncompromising performance encountered in the most challenging conditions.',
            src: `assets/imgs/rr_img_${(i + 25).toString().padStart(2, '0')}.jpg`
        }))
    ];

    const railTrack = document.getElementById('focus-rail-track');
    const railCounter = document.getElementById('rail-counter');
    const railTitle = document.getElementById('rail-title');
    const railDescription = document.getElementById('rail-description');
    const railMeta = document.getElementById('rail-meta');
    const bgAmbience = document.getElementById('gallery-bg-ambience');
    
    let activeIndex = 0;
    let filteredData = [...galleryData];

    const updateRail = () => {
        const items = railTrack.querySelectorAll('.gallery-item');
        const count = filteredData.length;
        
        items.forEach((item, index) => {
            const offset = index - activeIndex;
            const absOffset = Math.abs(offset);
            const isCenter = offset === 0;

            // 3D Transforms
            const xOffset = offset * 280;
            const zOffset = -absOffset * 150;
            const rotateY = offset * -15;
            const scale = isCenter ? 1 : 0.8;
            const opacity = isCenter ? 1 : Math.max(0, 1 - absOffset * 0.4);
            const blur = isCenter ? 0 : absOffset * 2;
            const brightness = isCenter ? 1 : 0.4;

            item.style.transform = `translateX(${xOffset}px) translateZ(${zOffset}px) rotateY(${rotateY}deg) scale(${scale})`;
            item.style.opacity = opacity;
            item.style.filter = `blur(${blur}px) brightness(${brightness})`;
            item.style.zIndex = 100 - absOffset;
            
            if (isCenter) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Info
        const activeItem = filteredData[activeIndex];
        if (activeItem) {
            railTitle.textContent = activeItem.title;
            railDescription.textContent = activeItem.description;
            railMeta.textContent = activeItem.meta;
            railCounter.textContent = `${activeIndex + 1} / ${count}`;
            bgAmbience.style.backgroundImage = `url(${activeItem.src})`;
        }
    };

    const loadGallery = (filter = 'all') => {
        railTrack.innerHTML = '';
        filteredData = filter === 'all'
            ? galleryData
            : galleryData.filter(item => item.category === filter);

        activeIndex = 0;

        filteredData.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `<img src="${item.src}" alt="${item.title}">`;
            
            galleryItem.addEventListener('click', () => {
                activeIndex = index;
                updateRail();
            });

            railTrack.appendChild(galleryItem);
        });

        updateRail();
    };

    // Navigation
    document.getElementById('nav-prev').addEventListener('click', () => {
        if (activeIndex > 0) {
            activeIndex--;
            updateRail();
        } else {
            activeIndex = filteredData.length - 1;
            updateRail();
        }
    });

    document.getElementById('nav-next').addEventListener('click', () => {
        if (activeIndex < filteredData.length - 1) {
            activeIndex++;
            updateRail();
        } else {
            activeIndex = 0;
            updateRail();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') document.getElementById('nav-prev').click();
        if (e.key === 'ArrowRight') document.getElementById('nav-next').click();
    });

    // Filter Button Listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
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
