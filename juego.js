document.addEventListener("DOMContentLoaded", () => {
  const configForm = document.getElementById("configForm");
  const menu = document.getElementById("menu");
  const juego = document.getElementById("juego");
  const resultado = document.getElementById("resultado");
  const fraseContainer = document.getElementById("fraseContainer");

  // Configuración del juego
  let nivel = 1;
  let espaciado = 5;
  let intentosTotales = 5;
  let tiempoPorFrase = 3000;
  let frases = [];
  let intentoActual = 0;
  let tiempos = [];
  let correctas = 0;
  let incorrectas = 0;
  let fraseActual = '';
  let tiempoInicio = 0;

  configForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Leer configuraciones
    nivel = parseInt(document.getElementById("nivel").value);
    espaciado = parseInt(document.getElementById("espaciado").value);
    intentosTotales = parseInt(document.getElementById("intentos").value);
    tiempoPorFrase = parseInt(document.getElementById("tiempo").value);

    // Preparar frases
    frases = frasesPorNivel[nivel];
    intentoActual = 0;
    tiempos = [];
    correctas = 0;
    incorrectas = 0;

    // Cambiar a vista de juego
    menu.classList.add("oculto");
    resultado.classList.add("oculto");
    juego.classList.remove("oculto");

    siguienteFrase();
  });

  function siguienteFrase() {
    if (intentoActual >= intentosTotales) {
      terminarJuego();
      return;
    }

    // Elegir frase al azar
    const index = Math.floor(Math.random() * frases.length);
    fraseActual = frases[index];
    fraseContainer.innerHTML = fraseActual
      .split(' ')
      .map(p => `<span style="margin-right: ${espaciado}px">${p}</span>`)
      .join('');

    tiempoInicio = Date.now();
    intentoActual++;
  }

  function responder(correcto) {
    const tiempoRespuesta = Date.now() - tiempoInicio;
    tiempos.push(tiempoRespuesta);

    // Aquí puedes usar lógica para saber si la frase estaba correcta o no (por ahora, todas son correctas)
    if (correcto) {
      correctas++;
    } else {
      incorrectas++;
    }

    document.getElementById("tiempoRespuesta").textContent = `Tiempo: ${tiempoRespuesta} ms`;

    setTimeout(() => {
      siguienteFrase();
    }, 500);
  }

  document.getElementById("correctoBtn").addEventListener("click", () => {
    responder(true);
  });

  document.getElementById("incorrectoBtn").addEventListener("click", () => {
    responder(false);
  });

  document.getElementById("reiniciarBtn").addEventListener("click", () => {
    juego.classList.add("oculto");
    resultado.classList.add("oculto");
    menu.classList.remove("oculto");
  });

  function terminarJuego() {
    juego.classList.add("oculto");
    resultado.classList.remove("oculto");

    const promedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);

    document.getElementById("resumenIntentos").textContent = `Intentos: ${intentoActual}`;
    document.getElementById("resumenCorrectas").textContent = `Correctas: ${correctas}`;
    document.getElementById("resumenIncorrectas").textContent = `Incorrectas: ${incorrectas}`;
    document.getElementById("resumenTiempo").textContent = `Promedio de tiempo: ${promedio} ms`;
  }
});
