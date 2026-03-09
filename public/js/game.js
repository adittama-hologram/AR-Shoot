import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.128.0/examples/jsm/webxr/ARButton.js';

let scene, camera, renderer, clock;
let icons = [];
let collectedCount = 0;
let timeLeft = 120;
let gameActive = false;
let playerName = localStorage.getItem('ar_shoot_player') || 'Player';

const ICON_COUNT = 10;

// Initialize the game
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Create AR Button but put it in our custom container
    const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.getElementById('game-ui') }
    });

    // Style the default AR button to fit our theme
    arButton.style.position = 'static';
    arButton.style.display = 'block';
    arButton.style.width = '200px';
    arButton.style.margin = '0 auto';
    arButton.style.padding = '15px';
    arButton.style.fontSize = '1.2rem';
    arButton.style.background = '#6a1b9a';
    arButton.style.border = '2px solid white';
    arButton.style.borderRadius = '10px';
    arButton.style.opacity = '1';
    arButton.innerText = "START AR GAME";

    document.getElementById('ar-button-container').appendChild(arButton);

    clock = new THREE.Clock();

    const light = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(light);

    // Initial spawn
    spawnIcons();

    window.addEventListener('resize', onWindowResize, false);

    // Controller for tapping AR icons
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Start Session Listeners
    renderer.xr.addEventListener('sessionstart', () => {
        document.getElementById('start-overlay').style.display = 'none';
        gameActive = true;
        startTimer();
    });

    renderer.xr.addEventListener('sessionend', () => {
        gameActive = false;
        // Optional: show results or reload
    });

    renderer.setAnimationLoop(render);
}

function spawnIcons() {
    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    const iconPaths = [
        'assets/icon1.png', 'assets/icon2.png', 'assets/icon3.png',
        'assets/icon4.png', 'assets/icon5.png', 'assets/icon6.png',
        'assets/icon10.png', 'assets/icon1.png', 'assets/icon2.png', 'assets/icon3.png'
    ];

    const loader = new THREE.TextureLoader();

    for (let i = 0; i < ICON_COUNT; i++) {
        const texture = loader.load(iconPaths[i]);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Place icons on a sphere around (0,0,0)
        // One guaranteed in front
        if (i === 0) {
            mesh.position.set(0, 0, -5);
        } else {
            const radius = 3 + Math.random() * 4;
            const phi = Math.random() * Math.PI * 2;
            const theta = (Math.PI / 2) + (Math.random() - 0.5) * 1.5;

            mesh.position.set(
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.cos(theta),
                radius * Math.sin(theta) * Math.sin(phi)
            );
        }

        mesh.lookAt(0, 0, 0);
        mesh.userData = { id: i, collected: false };

        scene.add(mesh);
        icons.push(mesh);
    }
}

function onSelect(event) {
    if (!gameActive) return;

    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(event.target.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(event.target.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(icons);
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (!obj.userData.collected) collectIcon(obj);
    }
}

function collectIcon(obj) {
    obj.userData.collected = true;
    obj.visible = false;
    collectedCount++;
    document.getElementById('counter').innerText = `Collected: ${collectedCount}/${ICON_COUNT}`;
    playSFX(880, 0.1);
    if (collectedCount === ICON_COUNT) winGame();
}

function playSFX(freq, duration) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gameActive) { clearInterval(timerInterval); return; }
        timeLeft--;
        document.getElementById('timer').innerText = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) { clearInterval(timerInterval); loseGame(); }
    }, 1000);
}

function winGame() {
    gameActive = false;
    const timeSpent = 120 - timeLeft;
    showEndPopup("You Win!", `Your Time: ${timeSpent.toFixed(1)}s`);
    saveScore(playerName, timeSpent);
    if (renderer.xr.getSession()) renderer.xr.getSession().end();
}

function loseGame() {
    gameActive = false;
    showEndPopup("Game Over", "Time's Up!");
    if (renderer.xr.getSession()) renderer.xr.getSession().end();
}

function showEndPopup(title, msg) {
    document.getElementById('end-title').innerText = title;
    document.getElementById('end-message').innerText = msg;
    document.getElementById('end-overlay').style.display = 'block';
    document.getElementById('end-popup').style.display = 'block';
}

async function saveScore(name, time) {
    try {
        await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName: name, time: time })
        });
    } catch (err) { console.error('Error saving score:', err); }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    renderer.render(scene, camera);
}

// Start everything
init();
