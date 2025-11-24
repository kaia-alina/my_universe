// --- CONFIGURACIÓN BÁSICA DE THREE.JS ---
let scene, camera, renderer, controls;
let galaxyParticles, centerOrb;
const heartParticles = []; // Array para almacenar las partículas de corazón

// --- INICIALIZACIÓN DE LA ESCENA ---
function init() {
    // 1. Escena
    scene = new THREE.Scene();

    // 2. Cámara (PerspectiveCamera)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200; 

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0d001a); 
    document.body.appendChild(renderer.domElement);

    // 4. Controles de Órbita (Navegación)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; 
    controls.maxDistance = 500; 
    controls.minDistance = 20; 

    // 5. Luces
    const ambientLight = new THREE.AmbientLight(0x404040, 2); 
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff00ff, 1, 300); // Luz púrpura en el centro
    scene.add(pointLight);

    // --- CREAR EL ORBE CENTRAL ---
    const orbGeometry = new THREE.SphereGeometry(30, 32, 32);
    const orbMaterial = new THREE.MeshBasicMaterial({ color: 0x9900ff }); 
    centerOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(centerOrb);

    // --- CREAR LA GALAXIA DE PARTÍCULAS ---
    createGalaxy();

    // --- EVENTOS ---
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('click', onDocumentClick); 
    document.addEventListener('touchstart', onDocumentTouch); 
}

// --- FUNCIÓN PARA CREAR LA GALAXIA DE PARTÍCULAS ---
function createGalaxy() {
    const numStars = 5000;
    const galaxyRadius = 150;
    const armThickness = 20;
    const centerDensity = 0.8; 

    const positions = new Float32Array(numStars * 3);
    const colors = new Float32Array(numStars * 3);

    const color = new THREE.Color();
    const white = new THREE.Color(0xffffff);
    const purpleEnd = new THREE.Color(0x8a2be2); 

    for (let i = 0; i < numStars; i++) {
        let x, y, z;
        const radius = Math.random() * galaxyRadius;
        const angle = Math.random() * Math.PI * 2; 
        
        // Distribución en espiral / disco
        const spiralArmOffset = 0.5 * Math.PI * (radius / galaxyRadius); 
        x = radius * Math.cos(angle + spiralArmOffset);
        y = radius * Math.sin(angle + spiralArmOffset);
        z = (Math.random() - 0.5) * armThickness * (1 - radius / galaxyRadius * centerDensity); 

        // Aleatoriedad
        x += (Math.random() - 0.5) * 10;
        y += (Math.random() - 0.5) * 10;
        z += (Math.random() - 0.5) * 10;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Coloración: más púrpuras cerca del centro, más blancas afuera
        const distanceToCenter = Math.sqrt(x * x + y * y + z * z);
        const colorLerpFactor = distanceToCenter / galaxyRadius;
        color.lerpColors(purpleEnd, white, colorLerpFactor);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2, 
        vertexColors: true, 
        blending: THREE.AdditiveBlending, 
        transparent: true,
        opacity: 0.9
    });

    galaxyParticles = new THREE.Points(geometry, material);
    scene.add(galaxyParticles);
}

// --- FUNCIÓN PARA CREAR UNA PARTÍCULA DE CORAZÓN ---
function createHeartParticle(x, y) {
    // Geometría del Corazón
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.7);
    heartShape.bezierCurveTo(0.7, 1.2, 1.2, 0.6, 0, 0);
    heartShape.bezierCurveTo(-1.2, 0.6, -0.7, 1.2, 0, 0.7);

    const geometry = new THREE.ShapeGeometry(heartShape);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 });
    const heart = new THREE.Mesh(geometry, material);

    // Proyectar el punto de clic de 2D a 3D
    const vector = new THREE.Vector3(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera); 

    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    heart.position.copy(pos);
    heart.scale.set(0.5, 0.5, 0.5); 
    
    // Propiedades de la partícula
    heart.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
    heart.life = 60; 
    
    heartParticles.push(heart);
    scene.add(heart);
}

// --- MANEJADORES DE EVENTOS ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentClick(event) {
    createHeartParticle(event.clientX, event.clientY);
}

function onDocumentTouch(event) {
    if (event.touches.length > 0) {
        // Usar la primera posición de toque
        createHeartParticle(event.touches[0].clientX, event.touches[0].clientY);
    }
}

// --- BUCLE DE ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    controls.update(); 

    // Rotar el orbe central
    centerOrb.rotation.y += 0.005;
    centerOrb.rotation.x += 0.002;
    
    // Rotar ligeramente la galaxia para el efecto de movimiento constante
    galaxyParticles.rotation.y += 0.0005; 

    // Actualizar y eliminar partículas de corazón
    for (let i = heartParticles.length - 1; i >= 0; i--) {
        const heart = heartParticles[i];
        heart.position.add(heart.velocity);
        heart.material.opacity -= 0.01; 
        heart.scale.multiplyScalar(1.02); 

        if (heart.material.opacity <= 0 || heart.life <= 0) {
            scene.remove(heart);
            heartParticles.splice(i, 1);
        }
        heart.life--;
    }

    renderer.render(scene, camera);
}

// --- INICIAR TODO ---
init();
animate();
