import './style.css'
import * as THREE from "three";

let scene, camera, renderer;
let cosmicMaterial, pixelatedMaterial, mesh;
let cosmicUniforms, pixelatedUniforms;
let currentShader = 'cosmic';
let isFrozen = false;
const gallery = [];
let videoTexture, video;

const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    video = document.getElementById('video');
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    initCosmicShader();
    initPixelatedShader();

    const geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, cosmicMaterial);
    scene.add(mesh);

    window.addEventListener('resize', onWindowResize);
}

const initCosmicShader = () => {
    // These values found through experimentation
    // Lower values = smoother animation but less interesting
    cosmicUniforms = {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
        u_timeScale: { value: 0.125 },
        u_ditherIntensity: { value: 1.5 },
        u_frequency: { value: 71.0 },
        u_seed: { value: 42.0 },
    };

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float iTime;
        uniform vec3 iResolution;
        uniform float u_timeScale;
        uniform float u_ditherIntensity;
        uniform float u_frequency;
        uniform float u_seed;
        varying vec2 vUv;

        float swayRandomized(float seed, float value) {
            float f = floor(value);
            float start = sin((cos(f * seed) + sin(f * 1024.)) * 345. + seed);
            float end = sin((cos((f+1.) * seed) + sin((f+1.) * 1024.)) * 345. + seed);
            return mix(start, end, smoothstep(0., 1., value - f));
        }

        float cosmic(float seed, vec3 con) {
            float sum = swayRandomized(seed, con.z + con.x);
            sum = sum + swayRandomized(seed, con.x + con.y + sum);
            sum = sum + swayRandomized(seed, con.y + con.z + sum);
            return sum * 0.3333333333;
        }

        vec4 dither(float chance, vec2 uv) {
            return vec4(vec3(step(chance * u_ditherIntensity, dot(sin(uv.xy), cos(uv.yx)))), 1.0);
        }

        void main() {
            vec2 fragCoord = vUv * iResolution.xy;
            vec2 uv = fragCoord / iResolution.xy;
            
            float aTime = iTime * u_timeScale;
            vec3 s = vec3(swayRandomized(-16405.31527, aTime - 1.11),
                          swayRandomized(-77664.8142, aTime + 1.41),
                          swayRandomized(-50993.5190, aTime + 2.61)) * 5.;
            vec3 c = vec3(swayRandomized(-10527.92407, aTime - 1.11),
                          swayRandomized(-61557.6687, aTime + 1.41),
                          swayRandomized(-43527.8990, aTime + 2.61)) * 5.;
            vec3 con = vec3(0.0004375, 0.0005625, 0.0008125) * aTime + c * uv.x + s * uv.y;
            con.x = cosmic(u_seed, con);
            con.y = cosmic(u_seed, con);
            con.z = cosmic(u_seed, con);
            
            gl_FragColor = dither(sin(con.z * 3.14159265), uv * iTime * u_frequency);
        }
    `;

    cosmicMaterial = new THREE.ShaderMaterial({
        uniforms: cosmicUniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

const initPixelatedShader = () => {
    pixelatedUniforms = {
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iChannel0: { value: videoTexture },
        u_vxOffset: { value: 1.5 },
        u_pixelW: { value: 10.0 },
        u_pixelH: { value: 10.0 },
        u_bgColor: { value: new THREE.Color(0.63, 0.67, 0.02) },
        u_fgColor: { value: new THREE.Color(0.11, 0.42, 0.42) },
        u_threshold: { value: 0.9 },
        u_style: { value: 0.0 },
    };

    const vertexShader = `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        precision mediump float;
        uniform vec2 iResolution;
        uniform sampler2D iChannel0;
        uniform float u_vxOffset;
        uniform float u_pixelW;
        uniform float u_pixelH;
        uniform vec3 u_bgColor;
        uniform vec3 u_fgColor;
        uniform float u_threshold;
        uniform float u_style;

        vec3 getPixelatedColor(vec2 uv) {
            vec2 sampleSize = vec2(1.0 / iResolution.x, 1.0 / iResolution.y);
            float dx = u_pixelW * sampleSize.x;
            float dy = u_pixelH * sampleSize.y;
            vec2 coord = vec2(dx * floor(uv.x / dx), dy * floor(uv.y / dy));
            
            if (u_style < 0.5) {
                return texture2D(iChannel0, coord).rgb;
            }
            else if (u_style < 1.5) {
                vec2 pixelCenter = coord + vec2(dx, dy) * 0.5;
                vec2 pixelPos = uv - pixelCenter;
                float dist = length(pixelPos / vec2(dx, dy));
                
                if (dist < 0.5) {
                    return texture2D(iChannel0, coord).rgb;
                } else {
                    return vec3(0.0);
                }
            }
            else if (u_style < 2.5) {
                vec2 hexCoord = uv / vec2(dx, dy);
                vec2 r = vec2(1.0, 1.732);
                vec2 h = r * 0.5;
                vec2 a = mod(hexCoord, r) - h;
                vec2 b = mod(hexCoord - h, r) - h;
                
                vec2 gv = length(a) < length(b) ? a : b;
                vec2 id = hexCoord - gv;
                
                vec2 hexCenter = id * vec2(dx, dy);
                float hexDist = length(gv);
                
                if (hexDist < 0.5) {
                    return texture2D(iChannel0, hexCenter).rgb;
                } else {
                    return vec3(0.0);
                }
            }
            else {
                return texture2D(iChannel0, coord).rgb;
            }
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            vec3 color = vec3(1.0, 0.0, 0.0);
            
            if (uv.x < (u_vxOffset - 0.005)) {
                color = getPixelatedColor(uv);
            }
            else if (uv.x >= (u_vxOffset + 0.005)) {
                color = texture2D(iChannel0, uv).rgb;
            }
            
            if (dot(color, vec3(1.0, 1.0, 1.0)) > u_threshold) {
                color = u_bgColor;
            } else {
                color = u_fgColor;
            }
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    pixelatedMaterial = new THREE.ShaderMaterial({
        uniforms: pixelatedUniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });
}

const onWindowResize = () =>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    cosmicUniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
    pixelatedUniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
}

const switchShader = (shader) => {
    currentShader = shader;
    
    document.getElementById('cosmic-controls').style.display = shader === 'cosmic' ? 'block' : 'none';
    document.getElementById('pixelated-controls').style.display = shader === 'pixelated' ? 'block' : 'none';
    
    if (shader === 'cosmic') {
        mesh.material = cosmicMaterial;
        stopWebcam();
    } else {
        mesh.material = pixelatedMaterial;
        startWebcam();
    }
}

const stopWebcam = () => {
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        document.getElementById('status').textContent = 'Camera stopped';
        document.getElementById('status').style.color = '#ff9900';
    }
}

const startWebcam = async () => {
    if (video.srcObject) {
        document.getElementById('status').textContent = 'Camera Active';
        document.getElementById('status').style.color = '#ffffffff';
        return;
    }
    
    try {
        document.getElementById('status').textContent = 'Starting camera...';
        document.getElementById('status').style.color = '#ffffffff';
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 } 
        });
        video.srcObject = stream;
        video.play();
        document.getElementById('status').textContent = 'Camera Active';
        document.getElementById('status').style.color = '#ffffffff';
    } catch (err) {
        console.error('Webcam error:', err);
        document.getElementById('status').textContent = 'Camera Access Denied';
        document.getElementById('status').style.color = '#ff4444';
    }
}

const animate = () => {
    requestAnimationFrame(animate);

    if (!isFrozen && currentShader === 'cosmic') {
        cosmicUniforms.iTime.value += 0.016;
    }

    renderer.render(scene, camera);
}

const toggleControlPanel = () => {
    const panel = document.querySelector('.control-panel');
    const toggleBtn = document.getElementById('toggle-panel-btn');
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        toggleBtn.textContent = '✕';
        toggleBtn.style.right = '10px';
    } else {
        panel.classList.add('hidden');
        toggleBtn.textContent = '☰';
        toggleBtn.style.right = '10px';
    }
}

const setupControls = () => {
    document.getElementById('shader-select').addEventListener('change', (e) => {
        switchShader(e.target.value);
    });

    document.getElementById('toggle-panel-btn').addEventListener('click', toggleControlPanel);

    
    const cosmicSliders = [
        { id: 'speed', uniform: 'u_timeScale', display: 'speed-value', decimals: 3 },
        { id: 'intensity', uniform: 'u_ditherIntensity', display: 'intensity-value', decimals: 1 },
        { id: 'frequency', uniform: 'u_frequency', display: 'frequency-value', decimals: 1 },
        { id: 'seed', uniform: 'u_seed', display: 'seed-value', decimals: 1 },
    ];

    cosmicSliders.forEach(slider => {
        const input = document.getElementById(slider.id);
        const display = document.getElementById(slider.display);
        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            cosmicUniforms[slider.uniform].value = value;
            display.textContent = value.toFixed(slider.decimals);
        });
    });

    document.getElementById('cosmic-randomize-btn').addEventListener('click', randomizeCosmic);
    document.getElementById('cosmic-freeze-btn').addEventListener('click', toggleFreeze);
    document.getElementById('cosmic-export-btn').addEventListener('click', exportPNG);
    document.getElementById('cosmic-poster-btn').addEventListener('click', createPoster);

    document.getElementById('style').addEventListener('change', (e) => {
        pixelatedUniforms.u_style.value = parseFloat(e.target.value);
    });

    document.getElementById('split').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        pixelatedUniforms.u_vxOffset.value = value;
        document.getElementById('split-value').textContent = value.toFixed(2);
    });

    document.getElementById('pixel-w').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        pixelatedUniforms.u_pixelW.value = value;
        document.getElementById('pixel-w-value').textContent = Math.round(value);
    });

    document.getElementById('pixel-h').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        pixelatedUniforms.u_pixelH.value = value;
        document.getElementById('pixel-h-value').textContent = Math.round(value);
    });

    document.getElementById('threshold').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        pixelatedUniforms.u_threshold.value = value;
        document.getElementById('threshold-value').textContent = value.toFixed(2);
    });

    
    document.getElementById('bg-color').addEventListener('input', (e) => {
        pixelatedUniforms.u_bgColor.value.set(e.target.value);
    });

    document.getElementById('fg-color').addEventListener('input', (e) => {
        pixelatedUniforms.u_fgColor.value.set(e.target.value);
    });

    document.getElementById('reset-btn').addEventListener('click', resetPixelatedDefaults);
    document.getElementById('pixelated-export-btn').addEventListener('click', exportPNG);
    document.getElementById('pixelated-poster-btn').addEventListener('click', createPoster);
}

const createPoster = () => {
     renderer.render(scene, camera);
    const patternImage = renderer.domElement.toDataURL('image/png');
    
    
    localStorage.setItem('patternImage', patternImage);
    localStorage.setItem('patternType', currentShader); 
    
    
    window.location.href = '/poster.html';
    
}

const randomizeCosmic = () => {
    cosmicUniforms.u_timeScale.value = Math.random() * 0.5;
    cosmicUniforms.u_ditherIntensity.value = Math.random() * 2.5 + 0.5;
    cosmicUniforms.u_frequency.value = Math.random() * 190 + 10;
    cosmicUniforms.u_seed.value = Math.random() * 99 + 1;

    document.getElementById('speed').value = cosmicUniforms.u_timeScale.value;
    document.getElementById('speed-value').textContent = cosmicUniforms.u_timeScale.value.toFixed(3);
    document.getElementById('intensity').value = cosmicUniforms.u_ditherIntensity.value;
    document.getElementById('intensity-value').textContent = cosmicUniforms.u_ditherIntensity.value.toFixed(1);
    document.getElementById('frequency').value = cosmicUniforms.u_frequency.value;
    document.getElementById('frequency-value').textContent = cosmicUniforms.u_frequency.value.toFixed(1);
    document.getElementById('seed').value = cosmicUniforms.u_seed.value;
    document.getElementById('seed-value').textContent = cosmicUniforms.u_seed.value.toFixed(1);
}

const resetPixelatedDefaults = () => {
    pixelatedUniforms.u_vxOffset.value = 1.5;
    document.getElementById('split').value = 1.5;
    document.getElementById('split-value').textContent = '1.50';
    
    pixelatedUniforms.u_pixelW.value = 10.0;
    document.getElementById('pixel-w').value = 10;
    document.getElementById('pixel-w-value').textContent = '10';
    
    pixelatedUniforms.u_pixelH.value = 10.0;
    document.getElementById('pixel-h').value = 10;
    document.getElementById('pixel-h-value').textContent = '10';
    
    pixelatedUniforms.u_threshold.value = 0.9;
    document.getElementById('threshold').value = 0.9;
    document.getElementById('threshold-value').textContent = '0.90';
    
    pixelatedUniforms.u_style.value = 0.0;
    document.getElementById('style').value = '0';
    
    pixelatedUniforms.u_bgColor.value.setRGB(0.63, 0.67, 0.02);
    document.getElementById('bg-color').value = '#a1ab05';
    
    pixelatedUniforms.u_fgColor.value.setRGB(0.11, 0.42, 0.42);
    document.getElementById('fg-color').value = '#1c6b6b';
}

const toggleFreeze = () => {
    isFrozen = !isFrozen;
    const btn = document.getElementById('cosmic-freeze-btn');
    btn.textContent = isFrozen ? 'Unfreeze' : 'Freeze';
    if (isFrozen) {
        addToGallery();
    }
}

const addToGallery = () => {
    renderer.render(scene, camera);
    const canvas = renderer.domElement;
    const thumbnail = document.createElement('canvas');
    thumbnail.width = 200;
    thumbnail.height = 200;
    thumbnail.classList.add('gallery-item');

    const ctx = thumbnail.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 200, 200);

    thumbnail.addEventListener('click', () => {
        exportImage(thumbnail);
    });

    document.getElementById('cosmic-gallery').appendChild(thumbnail);
    gallery.push(thumbnail);

    if (gallery.length > 9) {
        const removed = gallery.shift();
        removed.remove();
    }
}

const exportPNG =() => {
    renderer.render(scene, camera);
    const canvas = renderer.domElement;
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${currentShader}-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });
}

const exportImage = (canvas) => {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `gallery-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });
}


init();
setupControls();
animate();