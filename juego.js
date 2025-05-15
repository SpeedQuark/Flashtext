// Referencias a elementos del DOM
const menu = document.getElementById('menu');
const juego = document.getElementById('juego');
const resultado = document.getElementById('resultado');

const form = document.getElementById('configForm');
const nivelSelect = document.getElementById('nivel');
const espaciadoInput = document.getElementById('espaciado');
const intentosInput = document.getElementById('intentos');
const tiempoInput = document.getElementById('tiempo');

const fraseContainer = document.getElementById('fraseContainer');
const correctoBtn = document.getElementById('correctoBtn');
const incorrectoBtn = document.getElementById('incorrectoBtn');
const tiempoRespuestaP = document.getElementById('tiempoRespuesta');

const resumenIntentos = document.getElementById('resumenIntentos');
const resumenCorrectas = document.getElementById('resumenCorrectas');
const resumenIncorrectas = document.getElementById('resumenIncorrectas');
const resumenTiempo = document.getElementById('resumenTiempo');
const reiniciarBtn = document.getElementById('reiniciarBtn');

// Variables de estado
let nivel, espacioPx, maxIntentos, tiempoMs;
let intentos = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let tiemposRespuestas = [];

let frasesNivel = [];
let frasesJuego = [];
let fraseActual = '';
let fraseCorrecta = true; // si la frase mostrada es correcta o no
let tiempoInicio = 0;
let timerOcultar = null;

// Función para agregar espacio entre palabras según la configuración
function mostrarFrase(texto) {
  // Reemplazar espacios por espacios con margen (usando &nbsp; para evitar colapso)
  // Para controlar con pixeles, usaremos CSS: word-spacing
  fraseContainer.style.wordSpacing = `${espacioPx}px`;
  fraseContainer.textContent = texto;
}

// Función para mezclar un arreglo (Fisher-Yates)
function mezclarArray(arr) {
  let array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para generar frases incorrectas a partir de una correcta
function generarFraseIncorrecta(frase) {
  // Estrategias sencillas:
  // 1. Cambiar un artículo por otro (el/la/una/un)
  // 2. Cambiar el orden de dos palabras
  // 3. Agregar o quitar una palabra

  const articulos = ['el', 'la', 'un', 'una'];
  let palabras = frase.split(' ');

  // Elegir aleatoriamente la estrategia
  const estrategia = Math.floor(Math.random() * 3);

  if (estrategia === 0) {
    // Cambiar artículo (primera palabra)
    if (articulos.includes(palabras[0].toLowerCase())) {
      let nuevosArticulos = articulos.filter(a => a !== palabras[0].toLowerCase());
      let nuevoArticulo = nuevosArticulos[Math.floor(Math.random() * nuevosArticulos.length)];
      palabras[0] = nuevoArticulo;
    }
  } else if (estrategia === 1 && palabras.length > 1) {
    // Cambiar orden de dos palabras (cambiar la posición 1 y 2)
    let i = 1;
    let j = 2;
    if (palabras.length === 2) j = 1; // si solo tiene dos palabras, intercambiar 0 y 1
    if (palabras.length > 2) {
      // elegir dos índices aleatorios excepto el primero (artículo)
      i = Math.floor(Math.random() * (palabras.length - 1)) + 1;
      j = Math.floor(Math.random() * (palabras.length - 1)) + 1;
      while (j === i) {
        j = Math.floor(Math.random() * (palabras.length - 1)) + 1;
      }
    }
    [palabras[i], palabras[j]] = [palabras[j], palabras[i]];
  } else if (estrategia === 2) {
    // Agregar o quitar una palabra (si es posible)
    if (palabras.length > 2 && Math.random() < 0.5) {
      // quitar una palabra aleatoria excepto artículo
      let idx = Math.floor(Math.random() * (palabras.length - 1)) + 1;
      palabras.splice(idx, 1);
    } else {
      // agregar una palabra común aleatoria
      const palabrasExtra = ['grande', 'rápido', 'azul', 'viejo', 'nuevo', 'fuerte'];
      let palabraAgregar = palabrasExtra[Math.floor(Math.random() * palabrasExtra.length)];
      let pos = Math.floor(Math.random() * (palabras.length)) + 1;
      palabras.splice(pos, 0, palabraAgregar);
    }
  }
  return palabras.join(' ');
}

// Preparar frases para el juego: mezcla y combinación correcto/incorrecto
function prepararFrases() {
  frasesJuego = [];
  // Tomar un subconjunto aleatorio del nivel
  let frasesElegidas = mezclarArray(frasesNivel).slice(0, maxIntentos);

  for (let i = 0; i < frasesElegidas.length; i++) {
    let frase = frasesElegidas[i];
    // 50% probabilidad que la frase sea correcta o incorrecta
    if (Math.random() < 0.5) {
      frasesJuego.push({ texto: frase, correcta: true });
    } else {
      let fraseErr = generarFraseIncorrecta(frase);
      // Asegurarse que la frase incorrecta no sea igual a la correcta
      if (fraseErr === frase) {
        fraseErr += " extra"; // si es igual, cambiar para que no se repita
      }
      frasesJuego.push({ texto: fraseErr, correcta: false });
    }
  }
}

// Mostrar frase actual y registrar tiempo de inicio
function mostrarFraseActual() {
  if (fraseActual >= frasesJuego.length) {
    terminarJuego();
    return;
  }
  let objFrase = frasesJuego[fraseActual];
  mostrarFrase(objFrase.texto);
  fraseCorrecta = objFrase.correcta;
  tiempoRespuestaP.textContent = '';
  tiempoInicio = performance.now();

  // Si el usuario no responde en el tiempo, avanzar automáticamente con respuesta incorrecta
  timerOcultar = setTimeout(() => {
    registrarRespuesta(false, true); // tiempo agotado
  }, tiempoMs);
}

let fraseActual = 0;

// Registrar respuesta del usuario
// tiempoAgotado = true si la respuesta es automática por tiempo agotado
function registrarRespuesta(respuestaUsuario, tiempoAgotado = false) {
  clearTimeout(timerOcultar);
  let tiempoFin = performance.now();
  let tiempo = tiempoFin - tiempoInicio;

  // Solo contar intento si no es automático por tiempo agotado sin respuesta
  intentos++;
  tiemposRespuestas.push(tiempo);

  // Verificar si respuesta fue correcta
  let acierto = (respuestaUsuario === fraseCorrecta);
  if (acierto) {
    respuestasCorrectas++;
  } else {
    respuestasIncorrectas++;
  }

  // Mostrar tiempo que tardó el usuario
  tiempoRespuestaP.textContent = tiempoAgotado
    ? `Tiempo agotado. La frase era ${fraseCorrecta ? 'correcta' : 'incorrecta'}.`
    : `Tiempo: ${tiempo.toFixed(0)} ms - ${acierto ? 'Correcto' : 'Incorrecto'}`;

  // Avanzar a la siguiente frase tras un pequeño delay para que vea resultado
  fraseActual++;
  setTimeout(() => {
    if (fraseActual < maxIntentos) {
      mostrarFraseActual();
    } else {
      terminarJuego();
    }
  }, 1000);
}

function terminarJuego() {
  juego.classList.add('oculto');
  resultado.classList.remove('oculto');

  resumenIntentos.textContent = `Número de intentos: ${intentos}`;
  resumenCorrectas.textContent = `Respuestas correctas: ${respuestasCorrectas}`;
  resumenIncorrectas.textContent = `Respuestas incorrectas: ${respuestasIncorrectas}`;
  let sumaTiempos = tiemposRespuestas.reduce((a, b) => a + b, 0);
  let promedio = (sumaTiempos / tiemposRespuestas.length) || 0;
  resumenTiempo.textContent = `Tiempo promedio: ${promedio.toFixed(0)} ms`;
}

// Reiniciar al menú
reiniciarBtn.addEventListener('click', () => {
  resultado.classList.add('oculto');
  menu.classList.remove('oculto');
  // Reset variables
  intentos = 0;
  respuestasCorrectas = 0;
  respuestasIncorrectas = 0;
  tiemposRespuestas = [];
  fraseActual = 0;
});

// Manejar formulario y comenzar juego
form.addEventListener('submit', (e) => {
  e.preventDefault();

  nivel = nivelSelect.value;
  espacioPx = Number(espaciadoInput.value);
  maxIntentos = Number(intentosInput.value);
  tiempoMs = Number(tiempoInput.value);

  // Obtener frases del nivel
  frasesNivel = frasesPorNivel[nivel];
  if (!frasesNivel || frasesNivel.length === 0) {
    alert('No hay frases para este nivel');
    return;
  }

  // Preparar frases para juego
  prepararFrases();

  // Reset variables
  intentos = 0;
  respuestasCorrectas = 0;
  respuestasIncorrectas = 0;
  tiemposRespuestas = [];
  fraseActual = 0;

  menu.classList.add('oculto');
  resultado.classList.add('oculto');
  juego.classList.remove('oculto');

  mostrarFraseActual();
});

// Botones responder
correctoBtn.addEventListener('click', () => registrarRespuesta(true));
incorrectoBtn.addEventListener('click', () => registrarRespuesta(false));
