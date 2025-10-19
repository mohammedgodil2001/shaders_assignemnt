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
                
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                
                
                const patternHeight = height * 0.70;
                ctx.drawImage(pattern, 0, 0, width, patternHeight);
                
                
                const leftMargin = width * 0.055;
                const rightMargin = width - (width * 0.030);
                
                
                
                const titleSize = width * 0.140;
                const title = text.title.toUpperCase();
                
                ctx.fillStyle = '#000000';
                ctx.font = `600 ${titleSize}px neue-haas-grotesk-display, sans-serif`;
                ctx.textBaseline = 'alphabetic';
                
                
                const letterSpacing = titleSize * -0.07;
                let totalWidth = 0;
                
                for (let char of title) {
                    totalWidth += ctx.measureText(char).width + letterSpacing;
                }
                totalWidth -= letterSpacing;
                
                
                let titleX = rightMargin - totalWidth;
                const titleY = height * 0.82;
                
                ctx.textAlign = 'left';
                for (let char of title) {
                    ctx.fillText(char, titleX, titleY);
                    titleX += ctx.measureText(char).width + letterSpacing;
                }
                
                
                ctx.fillStyle = '#1636FF';
                const subtitleSize = width * 0.200;
                
                
                ctx.font = `400 ${subtitleSize}px sloop-script-two, cursive`;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'alphabetic';
                ctx.fillText(text.subtitle, rightMargin - 120, height * 0.870);
                
                
                ctx.fillStyle = '#000000';
                ctx.textBaseline = 'top';

                
                ctx.textAlign = 'left';
                ctx.font = `400 ${width * 0.0200}px neue-haas-grotesk-display, sans-serif`;
                ctx.fillText(text.dateLeft, leftMargin, height * 0.94);

                ctx.font = `400 ${width * 0.0300}px neue-haas-grotesk-display, sans-serif`;
                ctx.fillText(text.nameLeft, leftMargin, height * 0.96);

                
                ctx.textAlign = 'right';
                ctx.font = `400 ${width * 0.0200}px neue-haas-grotesk-display, sans-serif`;
                ctx.fillText(text.dateRight, rightMargin, height * 0.94);

                ctx.font = `400 ${width * 0.0300}px neue-haas-grotesk-display, sans-serif`;
                ctx.fillText(text.nameRight, rightMargin, height * 0.96);
            }
        }
    },
    
pixelated: {
portrait: {
id: 'portrait',
name: 'Portrait Poster',
description: 'Bold typography with pixelated portrait',
fields: ['title', 'subtitle', 'venue', 'time', 'nameLeft', 'nameRight', 'titleColor', 'subtitleColor', 'textColor'],
defaults: {
    title: 'ABSTRACT',
    subtitle: 'poster',
    venue: 'Koninklijke Vlaamse',
    time: '12.07 - 19:30',
    nameLeft: 'Zaal Zilver',
    nameRight: 'Koninklijke Vlaamse',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFD700',
    textColor: '#FFFFFF'
},
layout: function(canvas, pattern, text) {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pattern.width;
    tempCanvas.height = pattern.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(pattern, 0, 0);
    const pixelData = tempCtx.getImageData(0, 0, 1, 1).data;
    const bgColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    
    const patternScale = 1.7; 
    const patternVerticalOffset = 250; 
    const patternAspect = pattern.width / pattern.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    
    const targetHeight = height * 0.60;
    const targetY = height * 0.30 + patternVerticalOffset;;
    
    
    drawWidth = width * patternScale;
    drawHeight = (width * patternScale) / patternAspect;
    
    drawX = 0;
    // drawX = -500;
    drawY = targetY + (targetHeight - drawHeight) / 2;
    
    
    if (drawHeight > targetHeight) {
        drawY = targetY;
    }
    
    ctx.drawImage(pattern, drawX, drawY, drawWidth, drawHeight);
    
    
    const leftMargin = width * 0.065;
    const centerX = width * 0.5;
    const rightMargin = width - (width * 0.065);
    
    
    const titleSize = width * 0.170;
    const title = text.title.toUpperCase();
    
    ctx.fillStyle = text.titleColor || '#FFFFFF';
    ctx.font = `700 ${titleSize}px neue-haas-grotesk-display, sans-serif`;
    ctx.textBaseline = 'top';
    
    
    const letterSpacing = titleSize * -0.06;
    let totalWidth = 0;
    
    for (let char of title) {
        totalWidth += ctx.measureText(char).width + letterSpacing;
    }
    totalWidth -= letterSpacing;
    
    
    let titleX = centerX - (totalWidth / 2);
    const titleY = height * 0.06;
    
    ctx.textAlign = 'left';
    for (let char of title) {
        ctx.fillText(char, titleX, titleY);
        titleX += ctx.measureText(char).width + letterSpacing;
    }
    
    
    ctx.fillStyle = text.subtitleColor || '#FFD700';
    const subtitleSize = width * 0.190;
    
    ctx.font = `400 ${subtitleSize}px sloop-script-two, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top top';
    ctx.fillText(text.subtitle, centerX, height * 0.100); 
    
    
    ctx.fillStyle = text.textColor || '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const infoStartY = height * 0.30;
    const lineSpacing = width * 0.040; 
    
    
    ctx.letterSpacing = 0;
    ctx.font = `600 ${width * 0.0380}px neue-haas-grotesk-display, sans-serif`;
    ctx.fillText(text.nameLeft, leftMargin, infoStartY);
    
    
    ctx.font = `400 ${width * 0.028}px neue-haas-grotesk-display, sans-serif`;
    ctx.fillText(text.venue, leftMargin, infoStartY + lineSpacing + 10);
    
    
    ctx.fillText(text.time, leftMargin, infoStartY + lineSpacing * 2);
    
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    
    
    ctx.font = `400 ${width * 0.028}px neue-haas-grotesk-display, sans-serif`;
    ctx.fillText(text.venue, rightMargin, infoStartY + 90);
    
    
    ctx.fillText(text.time, rightMargin, infoStartY + lineSpacing + 90);
}
}
}
};

let currentSize = 'a4';
let currentTemplate = null;
let currentTemplateKey = null;
let patternImage = null;
let patternType = null;


let patternData = {
    image: null,
    type: null
};

        
const preloadFonts = async () => {
    try {
        await document.fonts.load('400 48px sloop-script-two');
        await document.fonts.load('500 48px neue-haas-grotesk-display');
        console.log('Fonts loaded successfully');
    } catch (error) {
        console.warn('Font loading warning:', error);
    }
};

const init = async () => {
    
    await preloadFonts();
    
    
    const storedImage = patternData.image || localStorage.getItem('patternImage');
    const storedType = patternData.type || localStorage.getItem('patternType');
    
    if (!storedImage || !storedType) {
        alert('No pattern found! Please create a pattern first.');
        window.location.href = '/';
        return;
    }
    
    
    patternData.image = storedImage;
    patternData.type = storedType;
    patternType = storedType;
    
    patternImage = new Image();
    patternImage.onload = () => {
        loadTemplates();
        setupEventListeners();
    };
    patternImage.onerror = () => {
        alert('Error loading pattern image!');
        window.location.href = '/';
    };
    patternImage.src = storedImage;
}

const loadTemplates = () => {
    const select = document.getElementById('template-select');
    const templates = TEMPLATES[patternType];
    
    if (!templates) {
        select.innerHTML = '<option>No templates available</option>';
        return;
    }
    
    select.innerHTML = '';
    
    Object.keys(templates).forEach((key, index) => {
        const template = templates[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${template.name} - ${template.description}`;
        select.appendChild(option);
        
        if (index === 0) {
            currentTemplateKey = key;
            currentTemplate = template;
            loadTextFields(template);
        }
    });
    
    renderPoster();
}

const selectTemplate = (key) => {
    currentTemplateKey = key;
    currentTemplate = TEMPLATES[patternType][key];
    loadTextFields(currentTemplate);
    renderPoster();
}

const loadTextFields = (template) => {
    const container = document.getElementById('text-controls');
    container.innerHTML = '';

    const fieldLabels = {
        title: 'Main Title',
        subtitle: 'Subtitle',
        dateLeft: 'Date (Bottom Left)',
        dateRight: 'Date (Bottom Right)',
        nameLeft: 'Name (Bottom Left)',
        nameRight: 'Name (Bottom Right)',
        venue: 'Venue Name',
        time: 'Time',
        titleColor: 'Title Color',
        subtitleColor: 'Subtitle Color',
        textColor: 'Info Text Color'
    };
    
    template.fields.forEach(field => {
        const label = document.createElement('label');
        
        
        if (field.includes('Color')) {
            label.innerHTML = `
                ${fieldLabels[field] || field}
                <input 
                    type="color" 
                    id="field-${field}" 
                    value="${template.defaults[field] || '#FFFFFF'}"
                >
            `;
        } else {
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
        }
        
        container.appendChild(label);
        label.querySelector('input').addEventListener('input', renderPoster);
    });
}

const setupEventListeners = () => {
    document.getElementById('template-select').addEventListener('change', (e) => {
        selectTemplate(e.target.value);
    });

    document.getElementById('size-select').addEventListener('change', (e) => {
        currentSize = e.target.value;
    });
    
    document.getElementById('download-btn').addEventListener('click', downloadPoster);
    
    document.getElementById('back-btn').addEventListener('click', () => {
        if (confirm('Go back to pattern editor?')) {
            window.location.href = '/';
        }
    });
}

const renderPoster = () => {
    if (!currentTemplate || !patternImage) return;
    
    const canvas = document.getElementById('poster-canvas');
    const size = POSTER_SIZES['a4'];
    
    
    const previewScale = 0.25;
    canvas.width = size.width * previewScale;
    canvas.height = size.height * previewScale;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(previewScale, previewScale);
    
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size.width;
    tempCanvas.height = size.height;
    
    const text = {};
    currentTemplate.fields.forEach(field => {
        const input = document.getElementById(`field-${field}`);
        text[field] = input ? input.value : currentTemplate.defaults[field];
    });
    
    currentTemplate.layout(tempCanvas, patternImage, text);
    
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
}

const downloadPoster = () => {
if (!currentTemplate || !patternImage) return;

const tempCanvas = document.createElement('canvas');
const size = POSTER_SIZES[currentSize];

tempCanvas.width = size.width;
tempCanvas.height = size.height;

const text = {};
currentTemplate.fields.forEach(field => {
    const input = document.getElementById(`field-${field}`);
    text[field] = input ? input.value : currentTemplate.defaults[field];
});

currentTemplate.layout(tempCanvas, patternImage, text);

tempCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `poster-${currentTemplateKey}-${size.name}-${Date.now()}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}, 'image/png', 1.0);
}

init();