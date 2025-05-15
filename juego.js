// Variables globales
let frases = [];
let nivelSeleccionado = "nivel1";
let espacioPx = 10;
let maxIntentos = 10;
let tiempoMuestra = 2000;
let intentosHechos = 0;
let correctas = 0;
let incorrectas = 0;
let tiempos = [];
let tiempoInicio = 0;
let penalizacionMs = 2000;

// Referencias DOM
const menu = document.getElementById("menu");
const juego = document.getElementById("juego");
const pantallaFinal = document.getElementById("pantallaFinal");

const fraseDiv = document.getElementById("frase");
const resultadoDiv = document.getElementById("resultado");

const btnCorrecto = document.getElementById("btnCorrecto");
const btnIncorrecto = document.getElementById("btnIncorrecto");
const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");

// Función para cargar las frases según nivel
function cargarFrases() {
  frases = frasesPorNivel[nivelSeleccionado];
  // Barajar frases para que salga al azar
  frases = frases.sort(() => Math.random() - 0.5);
}

// Mostrar frase
function mostrarFrase() {
  if (intentosHechos >= maxIntentos) {
    terminarJuego();
    return;
  }

  resultadoDiv.textContent = "";
  fraseDiv.style.color = "black";

  const fraseActual = frases[intentosHechos];
  // Aplicar espacio entre palabras
  fraseDiv.style.wordSpacing = `${espacioPx}px`;
  fraseDiv.textContent = fraseActual.texto;

  tiempoInicio = performance.now();
}

// Manejar respuesta del usuario
function responder(esCorrecto) {
  if (intentosHechos >= maxIntentos) return;

  const fraseActual = frases[intentosHechos];
  let tiempoFin = performance.now();
  let tiempoRespuesta = tiempoFin - tiempoInicio;

  let esRespuestaCorrecta = (fraseActual.correcta === esCorrecto);

  if (!esRespuestaCorrecta) {
    tiempoRespuesta += penalizacionMs;
    incorrectas++;
  } else {
    correctas++;
  }

  tiempos.push(tiempoRespuesta);
  intentosHechos++;

  resultadoDiv.textContent = `Tiempo: ${Math.round(tiempoRespuesta)} ms`;
  resultadoDiv.style.color = esRespuestaCorrecta ? "green" : "red";

  fraseDiv.textContent = ""; // limpiar frase

  setTimeout(() => {
    mostrarFrase();
  }, tiempoMuestra);
}

// Finalizar juego
function terminarJuego() {
  juego.classList.add("oculto");
  pantallaFinal.classList.remove("oculto");

  const sumaTiempos = tiempos.reduce((a, b) => a + b, 0);
  const promedio = tiempos.length ? (sumaTiempos / tiempos.length) : 0;

  document.getElementById("finalIntentos").textContent = `Intentos: ${intentosHechos}`;
  document.getElementById("finalCorrectas").textContent = `Respuestas correctas: ${correctas}`;
  document.getElementById("finalIncorrectas").textContent = `Respuestas incorrectas: ${incorrectas}`;
  document.getElementById("finalPromedio").textContent = `Tiempo promedio: ${Math.round(promedio)} ms`;
}

// Reiniciar juego
function reiniciarJuego() {
  pantallaFinal.classList.add("oculto");
  menu.classList.remove("oculto");
  fraseDiv.textContent = "";
  resultadoDiv.textContent = "";
  tiempos = [];
  intentosHechos = 0;
  correctas = 0;
  incorrectas = 0;
}

// Eventos
btnIniciar.addEventListener("click", () => {
  nivelSeleccionado = document.getElementById("nivel").value;
  espacioPx = Number(document.getElementById("espacio").value) || 10;
  maxIntentos = Number(document.getElementById("intentos").value) || 10;
  tiempoMuestra = Number(document.getElementById("tiempo").value) || 2000;

  cargarFrases();

  menu.classList.add("oculto");
  juego.classList.remove("oculto");
  pantallaFinal.classList.add("oculto");

  intentosHechos = 0;
  correctas = 0;
  incorrectas = 0;
  tiempos = [];

  mostrarFrase();  // <-- Muy importante para que empiece mostrando la frase
});

btnCorrecto.addEventListener("click", () => responder(true));
btnIncorrecto.addEventListener("click", () => responder(false));
btnReiniciar.addEventListener("click", reiniciarJuego);
