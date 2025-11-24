const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');

// Ajustar el tamaño del canvas al de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- CONFIGURACIÓN DE LA GALAXIA ---
const numStars = 500;
const stars = [];
const centerOrb = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 40,
    color: 'rgba(150, 0, 255, 0.8)', // Púrpura brillante
    angle: 0
};

// --- FUNCIÓN PARA CREAR UNA ESTRELLA ---
class Star {
    constructor() {
        // Posición aleatoria, concentrándose cerca del centro para el efecto galáctico
        this.x = centerOrb.x + (Math.random() - 0.5) * canvas.width * 0.8;
        this.y = centerOrb.y + (Math.random() - 0.5) * canvas.height * 0.8;
        
        // Calcular la distancia al centro para determinar la velocidad de órbita
        this.distance = Math.sqrt((this.x - centerOrb.x) ** 2 + (this.y - centerOrb.y) ** 2);
        
        // Velocidad de órbita: más lento cuanto más lejos esté
        this.velocity = (100 / this.distance) * 0.001 + 0.0005; // Ajusta el 0.001 y 0.0005 para la velocidad
        
        this.radius = Math.random() * 1.5 + 0.5; // Tamaño de la estrella
        this.opacity = Math.random();
        
        // Ángulo inicial
        this.angle = Math.atan2(this.y - centerOrb.y, this.x - centerOrb.x);
    }

    // Dibujar la estrella
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }

    // Actualizar la posición para la órbita
    update() {
        this.angle += this.velocity; // Incrementar el ángulo para mover la estrella
        
        // Recalcular la posición usando el ángulo y la distancia
        this.x = centerOrb.x + Math.cos(this.angle) * this.distance;
        this.y = centerOrb.y + Math.sin(this.angle) * this.distance;
        
        // Efecto de "parpadeo" sutil
        this.opacity = 0.5 + Math.sin(Date.now() * 0.001 + this.distance * 0.01) * 0.5;

        this.draw();
    }
}

// --- INICIALIZAR ESTRELLAS ---
function init() {
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

// --- DIBUJAR EL ORBE CENTRAL ---
function drawCenterOrb() {
    // Sombra/resplandor púrpura
    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgb(150, 0, 255)';
    
    ctx.beginPath();
    ctx.arc(centerOrb.x, centerOrb.y, centerOrb.radius, 0, Math.PI * 2);
    ctx.fillStyle = centerOrb.color;
    ctx.fill();
    
    // Quitar la sombra para el resto del dibujo
    ctx.shadowBlur = 0;
}

// --- BUCLE PRINCIPAL DE ANIMACIÓN ---
function animate() {
    // La función requestAnimationFrame llama a 'animate' en el siguiente cuadro
    requestAnimationFrame(animate); 

    // Limpiar el canvas en cada cuadro. 
    // Usamos una pequeña opacidad para un efecto de "rastro" sutil.
    ctx.fillStyle = 'rgba(13, 0, 26, 0.1)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar el orbe central
    drawCenterOrb();

    // Actualizar y dibujar todas las estrellas
    stars.forEach(star => {
        star.update();
    });
}

// Iniciar la creación de estrellas y el bucle de animación
init();
animate();

// Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reiniciar las estrellas para ajustarse al nuevo tamaño
    stars.length = 0;
    centerOrb.x = canvas.width / 2;
    centerOrb.y = canvas.height / 2;
    init();
});
