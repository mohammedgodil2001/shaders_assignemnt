import './style.css'
import * as THREE from "three";
let scene, camera, renderer, material, uniforms;
let isFrozen = false;
const gallery = [];


function init() {
scene = new THREE.Scene();
camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

uniforms = {
    iTime: { value: 0.0 },
    iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
    u_timeScale: { value: 0.125 },
    u_ditherIntensity: { value: 1.5 },
    u_frequency: { value: 71.0 },
    u_seed: { value: 42.0 }
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

    float swayRandomized(float seed, float value)
    {
        float f = floor(value);
        float start = sin((cos(f * seed) + sin(f * 1024.)) * 345. + seed);
        float end   = sin((cos((f+1.) * seed) + sin((f+1.) * 1024.)) * 345. + seed);
        return mix(start, end, smoothstep(0., 1., value - f));
    }

    float cosmic(float seed, vec3 con)
    {
        float sum = swayRandomized(seed, con.z + con.x);
        sum = sum + swayRandomized(seed, con.x + con.y + sum);
        sum = sum + swayRandomized(seed, con.y + con.z + sum);
        return sum * 0.3333333333;
    }

    vec4 dither(float chance, vec2 uv)
    {
        return vec4(vec3(step(chance * u_ditherIntensity,
                                dot(sin(uv.xy), cos(uv.yx)))
                    ), 1.0);
    }

    void main()
    {
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

material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
renderer.setSize(window.innerWidth, window.innerHeight);
uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
}

function animate() {
requestAnimationFrame(animate);

if (!isFrozen) {
    uniforms.iTime.value += 0.016;
}

renderer.render(scene, camera);
}

function setupControls() {
const sliders = [
    { id: 'speed', uniform: 'u_timeScale', display: 'speed-value', decimals: 3 },
    { id: 'intensity', uniform: 'u_ditherIntensity', display: 'intensity-value', decimals: 1 },
    { id: 'frequency', uniform: 'u_frequency', display: 'frequency-value', decimals: 1 },
    { id: 'seed', uniform: 'u_seed', display: 'seed-value', decimals: 1 }
];

sliders.forEach(slider => {
    const input = document.getElementById(slider.id);
    const display = document.getElementById(slider.display);

    input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        uniforms[slider.uniform].value = value;
        display.textContent = value.toFixed(slider.decimals);
    });
});

document.getElementById('randomize-btn').addEventListener('click', randomize);
document.getElementById('freeze-btn').addEventListener('click', toggleFreeze);
document.getElementById('export-btn').addEventListener('click', exportPNG);
}

function randomize() {
uniforms.u_timeScale.value = Math.random() * 0.5;
uniforms.u_ditherIntensity.value = Math.random() * 2.5 + 0.5;
uniforms.u_frequency.value = Math.random() * 190 + 10;
uniforms.u_seed.value = Math.random() * 99 + 1;

document.getElementById('speed').value = uniforms.u_timeScale.value;
document.getElementById('speed-value').textContent = uniforms.u_timeScale.value.toFixed(3);
document.getElementById('intensity').value = uniforms.u_ditherIntensity.value;
document.getElementById('intensity-value').textContent = uniforms.u_ditherIntensity.value.toFixed(1);
document.getElementById('frequency').value = uniforms.u_frequency.value;
document.getElementById('frequency-value').textContent = uniforms.u_frequency.value.toFixed(1);
document.getElementById('seed').value = uniforms.u_seed.value;
document.getElementById('seed-value').textContent = uniforms.u_seed.value.toFixed(1);
}

function toggleFreeze() {
isFrozen = !isFrozen;
const btn = document.getElementById('freeze-btn');
btn.textContent = isFrozen ? '▶️ Unfreeze' : '❄️ Freeze';
if (isFrozen) {
    addToGallery();
}
}

function addToGallery() {
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

document.getElementById('gallery').appendChild(thumbnail);
gallery.push(thumbnail);

if (gallery.length > 9) {
    const removed = gallery.shift();
    removed.remove();
}
}

function exportPNG() {
renderer.render(scene, camera);
const canvas = renderer.domElement;
canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `cosmic-dither-${Date.now()}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
});
}

function exportImage(canvas) {
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
