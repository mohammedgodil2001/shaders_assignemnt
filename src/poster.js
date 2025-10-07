const POSTER_SIZES = {
    a4: { width: 2480, height: 3508, name: 'A4' },
    a3: { width: 3508, height: 4961, name: 'A3' },
    a2: { width: 4961, height: 7016, name: 'A2' }
};


const TEMPLATES = {
    cosmic: {
        abstract: {
            id: 'abstract',
            name: 'Abstract Poster',
            description: 'Bold typography with pattern background',
            fields: ['title', 'subtitle', 'dateLeft', 'dateRight', 'nameLeft', 'nameRight'],
            defaults: {
                title: 'ABSTRACT',
                subtitle: 'poster',
                dateLeft: 'OCT 7, 2025',
                dateRight: 'OCT 7, 2025',
                nameLeft: 'MUHAMMED',
                nameRight: 'MUHAMMED'
            },
            layout: function(canvas, pattern, text) {
                const ctx = canvas.getContext('2d');
                const { width, height } = canvas;
                
                // White background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                
                // Draw pattern at top (65% of height)
                const patternHeight = height * 0.65;
                ctx.drawImage(pattern, 0, 0, width, patternHeight);
                
                // Margins
                const leftMargin = width * 0.06;
                const rightMargin = width * 0.94;
                
                // TOP DATES (small text)
                ctx.fillStyle = '#000000';
                ctx.font = `500 ${width * 0.012}px neue-haas-grotesk-display, sans-serif`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
                ctx.fillText(text.dateLeft, leftMargin, height * 0.73);
                
                ctx.textAlign = 'right';
                ctx.fillText(text.dateRight, rightMargin, height * 0.73);
                
                // MAIN TITLE "ABSTRACT"
                const titleSize = width * 0.21;
                const title = text.title.toUpperCase();
                const titleY = height * 0.84;
                
                ctx.fillStyle = '#000000';
                ctx.font = `500 ${titleSize}px neue-haas-grotesk-display, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Manual letter spacing (negative)
                const letterSpacing = titleSize * -0.07;
                let totalWidth = 0;
                
                for (let char of title) {
                    totalWidth += ctx.measureText(char).width + letterSpacing;
                }
                totalWidth -= letterSpacing;
                
                let titleX = (width / 2) - (totalWidth / 2);
                
                for (let char of title) {
                    ctx.fillText(char, titleX, titleY);
                    titleX += ctx.measureText(char).width + letterSpacing;
                }
                
                // SUBTITLE "poster" (script font, blue)
                ctx.fillStyle = '#4169E1';
                const subtitleSize = width * 0.13;
                ctx.font = `400 ${subtitleSize}px sloop-script-two, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text.subtitle, width * 0.5, height * 0.905);
                
                // BOTTOM NAMES
                ctx.fillStyle = '#000000';
                ctx.font = `500 ${width * 0.012}px neue-haas-grotesk-display, sans-serif`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'alphabetic';
                ctx.fillText(text.nameLeft, leftMargin, height * 0.97);
                
                ctx.textAlign = 'right';
                ctx.fillText(text.nameRight, rightMargin, height * 0.97);
            }
        },
        
        concert: {
            id: 'concert',
            name: 'Concert Poster',
            description: 'Coming soon - send me the design',
            fields: ['title'],
            defaults: { title: 'CONCERT' },
            layout: function(canvas, pattern, text) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#999';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Template 2 - Send me the design!', canvas.width/2, canvas.height/2);
            }
        }
    },
    
    pixelated: {
        portrait: {
            id: 'portrait',
            name: 'Portrait Poster',
            description: 'Coming soon - send me the design',
            fields: ['title'],
            defaults: { title: 'PORTRAIT' },
            layout: function(canvas, pattern, text) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#999';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Pixelated Template - Send me the design!', canvas.width/2, canvas.height/2);
            }
        }
    }
};

// ===== GLOBAL STATE =====
let currentSize = 'a4';
let currentTemplate = null;
let currentTemplateKey = null;
let patternImage = null;
let patternType = null;

// ===== INITIALIZATION =====
function init() {
    // Get pattern from sessionStorage
    const patternData = localStorage.getItem('patternImage');
    patternType = localStorage.getItem('patternType');
    
    if (!patternData || !patternType) {
        alert('No pattern found! Please create a pattern first.');
        window.location.href = './index.html';
        return;
    }
    
    // Load pattern image
    patternImage = new Image();
    patternImage.onload = () => {
        loadTemplates();
        setupEventListeners();
    };
    patternImage.onerror = () => {
        alert('Error loading pattern image!');
        window.location.href = './index.html';
    };
    patternImage.src = patternData;
}

// ===== LOAD TEMPLATES =====
function loadTemplates() {
    const gallery = document.getElementById('template-gallery');
    const templates = TEMPLATES[patternType];
    
    if (!templates) {
        gallery.innerHTML = '<p style="color:#999;text-align:center;">No templates available</p>';
        return;
    }
    
    gallery.innerHTML = '';
    
    // Create template cards
    Object.keys(templates).forEach((key, index) => {
        const template = templates[key];
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.template = key;
        
        if (index === 0) {
            card.classList.add('active');
            currentTemplateKey = key;
            currentTemplate = template;
            loadTextFields(template);
        }
        
        card.innerHTML = `
            <div class="template-thumbnail">
                <div>
                    <strong>${template.name}</strong><br>
                    <small>${template.description}</small>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => selectTemplate(key, card));
        gallery.appendChild(card);
    });
    
    renderPoster();
}

// ===== SELECT TEMPLATE =====
function selectTemplate(key, card) {
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    
    currentTemplateKey = key;
    currentTemplate = TEMPLATES[patternType][key];
    
    loadTextFields(currentTemplate);
    renderPoster();
}

// ===== LOAD TEXT FIELDS =====
function loadTextFields(template) {
    const container = document.getElementById('text-controls');
    container.innerHTML = '';
    
    const fieldLabels = {
        title: 'Main Title',
        subtitle: 'Subtitle',
        dateLeft: 'Date (Top Left)',
        dateRight: 'Date (Top Right)',
        nameLeft: 'Name (Bottom Left)',
        nameRight: 'Name (Bottom Right)'
    };
    
    template.fields.forEach(field => {
        const label = document.createElement('label');
        label.innerHTML = `
            ${fieldLabels[field] || field}
            <input 
                type="text" 
                id="field-${field}" 
                placeholder="${template.defaults[field] || ''}"
                value="${template.defaults[field] || ''}"
                maxlength="50"
            >
        `;
        container.appendChild(label);
        
        label.querySelector('input').addEventListener('input', renderPoster);
    });
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    document.getElementById('size-select').addEventListener('change', (e) => {
        currentSize = e.target.value;
        renderPoster();
    });
    
    document.getElementById('download-btn').addEventListener('click', downloadPoster);
    
    document.getElementById('back-btn').addEventListener('click', () => {
        if (confirm('Go back to pattern editor? (Unsaved changes will be lost)')) {
            window.location.href = '/';
        }
    });
}

// ===== RENDER POSTER =====
function renderPoster() {
    if (!currentTemplate || !patternImage) return;
    
    const canvas = document.getElementById('poster-canvas');
    const size = POSTER_SIZES[currentSize];
    
    canvas.width = size.width;
    canvas.height = size.height;
    
    // Get text values
    const text = {};
    currentTemplate.fields.forEach(field => {
        const input = document.getElementById(`field-${field}`);
        text[field] = input ? input.value : currentTemplate.defaults[field];
    });
    
    // Render template
    currentTemplate.layout(canvas, patternImage, text);
}

// ===== DOWNLOAD POSTER =====
function downloadPoster() {
    const canvas = document.getElementById('poster-canvas');
    const size = POSTER_SIZES[currentSize];
    
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `poster-${currentTemplateKey}-${size.name}-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
}

// ===== START =====
init();