let frases = [];
let intentosTotales = 0;
let fraseActual = 0;
let tiempos = [];
let correctas = 0;
let incorrectas = 0;
let mostrarMs = 0;
let tiempoInicio = 0;

document.getElementById('configForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nivel = parseInt(document.getElementById('nivel').value);
  const espaciado = parseInt(document.getElementById('espaciado').value);
  intentosTotales = parseInt(document.getElementById('intentos').value);
  mostrarMs = parseInt(document.getElementById('tiempo').value);

  frases = [...frasesPorNivel[nivel]];
  frases = frases.sort(() => 0.5 - Math.random()).slice(0, intentosTotales);

  document.documentElement.style.setProperty('--espaciado', `${espaciado}px`);

  document.getElementById('menu').classList.add('oculto');
  document.getElementById('resultado').classList.add('oculto');
  document.getElementById('juego').classList.remove('oculto');

  fraseActual = 0;
  correctas = 0;
  incorrectas = 0;
  tiempos = [];

  mostrarFrase();
});

function mostrarFrase() {
  const frase = frases[fraseActual];
  const fraseContainer = document.getElementById('fraseContainer');
  fraseContainer.textContent = frase.texto;
  document.getElementById('tiempoRespuesta').textContent = '';
  tiempoInicio = Date.now();
}

function procesarRespuesta(usuarioDiceCorrecta) {
  const tiempoFin = Date.now();
  let delta = tiempoFin - tiempoInicio;
  const esCorrecta = frases[fraseActual].correcta === usuarioDiceCorrecta;

  const resultado = document.getElementById('tiempoRespuesta');
  resultado.className = '';

  if (esCorrecta) {
    correctas++;
    resultado.classList.add('correcto');
  } else {
    incorrectas++;
    resultado.classList.add('incorrecto');
    delta += 2000;
  }

  resultado.textContent = `${delta} ms`;
  tiempos.push(delta);

  fraseActual++;
  setTimeout(() => {
    document.getElementById('fraseContainer').textContent = '';
    document.getElementById('tiempoRespuesta').textContent = '';
    if (fraseActual < frases.length) {
      setTimeout(mostrarFrase, 200);
    } else {
      mostrarResultado();
    }
  }, 1000);
}

function mostrarResultado() {
  document.getElementById('juego').classList.add('oculto');
  document.getElementById('resultado').classList.remove('oculto');
  document.getElementById('resumenIntentos').textContent = `Intentos: ${frases.length}`;
  document.getElementById('resumenCorrectas').textContent = `Correctas: ${correctas}`;
  document.getElementById('resumenIncorrectas').textContent = `Incorrectas: ${incorrectas}`;
  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  document.getElementById('resumenTiempo').textContent = `Promedio: ${Math.round(promedio)} ms`;
}

document.getElementById('correctoBtn').addEventListener('click', () => procesarRespuesta(true));
document.getElementById('incorrectoBtn').addEventListener('click', () => procesarRespuesta(false));
document.getElementById('reiniciarBtn').addEventListener('click', () => {
  document.getElementById('menu').classList.remove('oculto');
  document.getElementById('resultado').classList.add('oculto');
});
