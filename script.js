
/* 
   1) CONFIGURACIÓN GLOBAL DE PRUEBAS
   ---------------------------------------------------------------- */

// Filtro del ranking con distinción entre fase de clasificación y fase final 
const FASE_CLASIFICACION = ['hazme-fan', 'fabrica-historias', 'voces-derecho', 'duelo-personajes'];
const FASE_FINAL         = ['declamacion', 'palabra-caliente', 'duelo-personajes-final', 'minuto-oro'];

// Configuración de cada prueba.

const configuraciones = {
    'hazme-fan': {
        titulo: 'Prueba 1 — Hazme fan',
        descripcion: 'Discurso oral de 1:30 a 2:00 minutos recomendando un libro, película o serie. No se permite leer.',
        tipo: 'cronometro'
    },
    'fabrica-historias': {
        titulo: 'Prueba 2 — La Fábrica de Historias',
        descripcion: 'Tres ruletas (contexto, problema y personaje). 30 s para pensar, 2:00 para contar la historia ',
        columnas: ['contexto', 'problema', 'personaje'],
        tipo: 'multiple'
    },
    'voces-derecho': {
        titulo: 'Prueba 3 — Voces con Derecho',
        descripcion: 'Defensa de un artículo de los Derechos del Niño.',
        columnas: ['numero', 'descripcion'],
        tipo: 'simple'
    },
    'duelo-personajes': {
        titulo: 'Prueba 4 — Duelo de Personajes',
        descripcion: 'Cada participante defiende a un personaje frente a otro.',
        columnas: ['personaje_a', 'personaje_b'],
        tipo: 'dupla'
    },
    'declamacion': {
        titulo: 'Final 1 — Declamación',
        descripcion: 'Recitar un texto del género sorteado.',
        columnas: ['genero', 'titulo', 'texto'],
        tipo: 'genero-texto'
    },
    'palabra-caliente': {
        titulo: 'Final 2 — La Palabra Caliente',
        descripcion: 'Discurso improvisado sobre una situación comunicativa.',
        columnas: ['nombre', 'descripcion'],
        tipo: 'simple'
    },
    'duelo-personajes-final': {
        titulo: 'Final 3 — Duelo de Personajes',
        descripcion: 'Duelo de personajes para la fase final.',
        columnas: ['personaje_a', 'personaje_b'],
        tipo: 'dupla'
    },
    'minuto-oro': {
        titulo: 'Final 4 — El Minuto de Oro',
        descripcion: 'Los dos equipos finalistas tienen 1 minuto cada uno para su mejor discurso.',
        tipo: 'minuto-oro'
    }
};

// Criterios de evaluación específicos por prueba (1–4 puntos cada uno).
const CRITERIOS_POR_PRUEBA = {
    'hazme-fan': [
        { id: 'opinion',   nombre: 'Expresar opiniones personales' },
        { id: 'razones',   nombre: 'Dar buenas razones' },
        { id: 'emocion',   nombre: 'Transmitir emoción y pasión' },
        { id: 'enganchar', nombre: 'Enganchar y convencer con la palabra' }
    ],
    'fabrica-historias': [
        { id: 'inicio',    nombre: 'Inicio (presenta personaje y lugar)' },
        { id: 'nudo',      nombre: 'Nudo (aparece el problema)' },
        { id: 'desenlace', nombre: 'Desenlace (el problema se resuelve)' }
    ],
    'voces-derecho': [
        { id: 'explicar',    nombre: 'Explicar el artículo con sus propias palabras' },
        { id: 'argumentar',  nombre: 'Argumentar por qué es importante hoy' },
        { id: 'defender',    nombre: 'Explicar cómo se defiende o protege' },
        { id: 'reflexionar', nombre: 'Reflexionar sobre qué pasaría si no se respetara' }
    ],
    'duelo-personajes': [
        { id: 'argumentacion', nombre: 'Argumentación comparativa' },
        { id: 'defensa',       nombre: 'Defensa del personaje' },
        { id: 'replica',       nombre: 'Capacidad de réplica' },
        { id: 'expresion',     nombre: 'Expresión oral' }
    ],
    'declamacion': [
        { id: 'expresividad', nombre: 'Expresividad e intención' },
        { id: 'voz',          nombre: 'Uso de la voz' },
        { id: 'ritmo',        nombre: 'Ritmo y pausas' },
        { id: 'comprension',  nombre: 'Comprensión del texto' },
        { id: 'presencia',    nombre: 'Seguridad y presencia escénica' }
    ],
    'palabra-caliente': [
        { id: 'escucha',    nombre: 'Escucha y adaptación' },
        { id: 'coherencia', nombre: 'Coherencia de la intervención' },
        { id: 'aportacion', nombre: 'Aportación de ideas' },
        { id: 'expresion',  nombre: 'Expresión oral' },
        { id: 'fluidez',    nombre: 'Seguridad y fluidez' }
    ],
    'duelo-personajes-final': [
        { id: 'argumentacion', nombre: 'Argumentación comparativa' },
        { id: 'defensa',       nombre: 'Defensa del personaje' },
        { id: 'replica',       nombre: 'Capacidad de réplica' },
        { id: 'escucha',       nombre: 'Escucha activa' },
        { id: 'expresion',     nombre: 'Expresión oral' }
    ],
    'minuto-oro': [
        { id: 'persuasion',  nombre: 'Capacidad de persuasión' },
        { id: 'estructura',  nombre: 'Estructura del discurso' },
        { id: 'expresion',   nombre: 'Expresión oral y seguridad' },
        { id: 'creatividad', nombre: 'Creatividad y originalidad' },
        { id: 'respeto',     nombre: 'Respeto al rival y trabajo en equipo' }
    ]
};

// Devuelve los criterios de la prueba indicada (array vacío si no existe).
function getCriteriosPrueba(prueba) {
    return CRITERIOS_POR_PRUEBA[prueba] || [];
}


/*
   2) ESTADO Y PERSISTENCIA
   ---------------------------------------------------------------- */

let datosPrueba = {};       // Datos cargados desde el CSV de cada prueba.
let usados = {};            // Resultados ya sorteados (para no repetir o avisar).
let canvasList = [];        // Bloques { canvas, opciones, nombre, resBox } activos.

let equipos = [];           // [{ id, nombre, profesor, alumnos:[..] }]
let puntuaciones = [];      // [{ id, equipoId, alumnoIdx, prueba, criterios, total, fecha }]
let rubricaActual = {};     // Selección actual del formulario de puntuación.

const STORAGE_EQUIPOS = 'oratoria_equipos_v1';
const STORAGE_PUNTOS  = 'oratoria_puntos_v1';

// Carga datos persistidos al arrancar (localStorage del navegador).
function cargarEstadoLocal() {
    try { equipos      = JSON.parse(localStorage.getItem(STORAGE_EQUIPOS)) || []; } catch { equipos = []; }
    try { puntuaciones = JSON.parse(localStorage.getItem(STORAGE_PUNTOS))  || []; } catch { puntuaciones = []; }
}
function guardarEquipos()      { localStorage.setItem(STORAGE_EQUIPOS, JSON.stringify(equipos)); }
function guardarPuntuaciones() { localStorage.setItem(STORAGE_PUNTOS,  JSON.stringify(puntuaciones)); }


/*
   3) ATAJOS AL DOM
   ---------------------------------------------------------------- */

const $ = id => document.getElementById(id);

const pruebaSelect        = $('prueba-select');
const cargarPruebaBtn     = $('cargar-prueba');
const ruletaSection       = $('ruleta-section');
const tituloPrueba        = $('titulo-prueba');
const ruletaContainer     = $('ruleta-container');
const girarBtn            = $('girar-btn');
const resultadoDiv        = $('resultado');
const volverBtn           = $('volver');
const csvUpload           = $('csv-upload');
const csvFileInput        = $('csv-file');
const procesarCsvBtn      = $('procesar-csv');
const historialPanel      = $('historial-panel');
const historialContenido  = $('historial-contenido');
const limpiarHistorialBtn = $('limpiar-historial');
const infoPrueba          = $('info-prueba');
const infoTitulo          = $('info-titulo');
const infoDescripcion     = $('info-descripcion');
const puntuarDesdeRuleta  = $('puntuar-desde-ruleta');

// Hazme fan — cronómetro simple
const hazmeFanSection    = $('hazme-fan-section');
const cronoDisplay       = $('cronometro-display');
const cronoIniciar       = $('crono-iniciar');
const cronoPausar        = $('crono-pausar');
const cronoReset         = $('crono-reset');
const cronoEstado        = $('crono-estado');
const hazmeFanVolver     = $('hazme-fan-volver');

// Hazme fan — selector de equipos y pop-up de llamada
const hazmeEquiposGrid    = $('hazme-equipos-grid');
const hazmeSeleccionarBtn = $('hazme-seleccionar-btn');
const hazmeEstado         = $('hazme-selector-estado');
const hazmePopup          = $('hazme-popup');         // Pop-up compartido con el selector de ruletas
const hazmePopupNombre    = $('hazme-popup-nombre');
const hazmePopupCuenta    = $('hazme-popup-cuenta');

// Selector de equipos para pruebas 2, 3 y 4 (reutiliza las mismas clases CSS y el mismo pop-up)
const ruletaEquiposSelector = $('ruleta-equipos-selector');
const ruletaEquiposGrid     = $('ruleta-equipos-grid');
const ruletaSeleccionarBtn  = $('ruleta-seleccionar-btn');
const ruletaSelectorEstado  = $('ruleta-selector-estado');

// Fábrica de Historias — cronómetro doble (preparación + discurso)
const fabricaCrono       = $('fabrica-crono');
const fabricaDisplay     = $('fabrica-display');
const fabricaFaseNombre  = $('fabrica-fase-nombre');
const fabricaIniciar     = $('fabrica-iniciar');
const fabricaDiscurso    = $('fabrica-discurso');
const fabricaPausar      = $('fabrica-pausar');
const fabricaReset       = $('fabrica-reset');
const fabricaEstado      = $('fabrica-estado');
const avisoRepetida      = $('aviso-repetida');

// Voces con Derecho — cronómetro simple de hasta 2:00
const vocesCrono         = $('voces-crono');
const vocesDisplay       = $('voces-display');
const vocesIniciar       = $('voces-iniciar');
const vocesPausar        = $('voces-pausar');
const vocesReset         = $('voces-reset');
const vocesEstado        = $('voces-estado');

// Duelo de Personajes — panel de elección de personaje y cronómetro doble
const dueloEleccion      = $('duelo-eleccion');   // panel con los dos botones de personaje
const dueloBtnA          = $('duelo-btn-a');       // botón personaje A
const dueloBtnB          = $('duelo-btn-b');       // botón personaje B
const dueloCrono         = $('duelo-crono');
const dueloDisplay       = $('duelo-display');
const dueloFaseNombre    = $('duelo-fase-nombre');
const dueloIniciar       = $('duelo-iniciar');
const dueloArgumentar    = $('duelo-argumentar');
const dueloPausar        = $('duelo-pausar');
const dueloReset         = $('duelo-reset');
const dueloEstado        = $('duelo-estado');

// Final 2 — La Palabra Caliente — cronómetro de intervenciones alternadas
const palabraCronoPanel        = $('palabra-crono-panel');
const palabraTurnoDisplayEl    = $('palabra-turno-display');
const palabraParticipanteLabel = $('palabra-participante-label');
const palabraCuentaDisplayEl   = $('palabra-cuenta-display');
const palabraTurnoInfoEl       = $('palabra-turno-info');
const palabraIniciarBtn        = $('palabra-iniciar-crono');
const palabraPausarBtn         = $('palabra-pausar-crono');
const palabraResetBtn          = $('palabra-reset-crono');
const palabraCronoEstado       = $('palabra-crono-estado');
const palitosA                 = $('palitos-a');
const palitosB                 = $('palitos-b');

// Final 1 — Declamación — cronómetro doble (preparación + declamación)
const declaCrono         = $('decla-crono');
const declaDisplay       = $('decla-display');
const declaFaseNombre    = $('decla-fase-nombre');
const declaIniciar       = $('decla-iniciar');
const declaDiscurso      = $('decla-discurso');
const declaPausar        = $('decla-pausar');
const declaReset         = $('decla-reset');
const declaEstado        = $('decla-estado');

// Final 3 — Duelo de Personajes Final — botón de sorteo y panel de cronómetro
const dueloFinalAsignarDiv     = $('duelo-final-asignar');
const dueloFinalAsignarBtn     = $('duelo-final-asignar-btn');
const dueloFinalPanel          = $('duelo-final-panel');
const dueloFinalBloque         = $('duelo-final-bloque');
const dueloFinalQuienEl        = $('duelo-final-quien');
const dueloFinalDisplayEl      = $('duelo-final-display');
const dueloFinalFaseInfoEl     = $('duelo-final-fase-info');
const dueloFinalIniciarPrep    = $('duelo-final-iniciar-prep');
const dueloFinalIniciarExpoA   = $('duelo-final-iniciar-expo-a');
const dueloFinalIniciarExpoB   = $('duelo-final-iniciar-expo-b');
const dueloFinalIniciarReplica = $('duelo-final-iniciar-replica');
const dueloFinalPausarBtn      = $('duelo-final-pausar');
const dueloFinalResetBtn       = $('duelo-final-reset');
const dueloFinalEstado         = $('duelo-final-estado');
const dueloFinalReplicasTabla  = $('duelo-final-replicas-tabla');
const replicaNombreA           = $('replica-nombre-a');
const replicaNombreB           = $('replica-nombre-b');
const replicasAEl              = $('replicas-a');
const replicasBEl              = $('replicas-b');

// Final 4 — El Minuto de Oro — dos cronómetros en estrella dorada
const minutoOroSection       = $('minuto-oro-section');
const minutoOroAsignarDiv    = $('minuto-oro-asignar');
const minutoOroAsignarBtn    = $('minuto-oro-asignar-btn');
const minutoOroAsignarEstado = $('minuto-oro-asignar-estado');
const minutoOroCronos        = $('minuto-oro-cronos');
const estrellaA              = $('estrella-a');
const estrellaB              = $('estrella-b');
const minutoADisplay         = $('minuto-a-display');
const minutoBDisplay         = $('minuto-b-display');
const minutoANombre          = $('minuto-a-nombre');
const minutoBNombre          = $('minuto-b-nombre');
const minutoAIniciar         = $('minuto-a-iniciar');
const minutoBIniciar         = $('minuto-b-iniciar');
const minutoAPausar          = $('minuto-a-pausar');
const minutoBPausar          = $('minuto-b-pausar');
const minutoAReset           = $('minuto-a-reset');
const minutoBReset           = $('minuto-b-reset');
const minutoAEstado              = $('minuto-a-estado');
const minutoBEstado              = $('minuto-b-estado');
const minutoOroPuntuacionesBtn   = $('minuto-oro-puntuaciones');


/* ================================================================
   4) ARRANQUE
   ---------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', init);

function init() {
    cargarEstadoLocal();
    montarTabs();
    montarSorteos();
    montarHazmeFan();
    montarHazmeSelector();
    montarRuletaSelector();
    montarFabrica();
    montarVoces();
    montarDuelo();
    montarDueloFinal();
    montarMinutoOro();
    montarDeclamacion();
    montarPalabraCaliente();
    montarPuntuacion();
    montarRanking();
    renderRubrica('');
    refrescarSelectoresEquipos();
    renderEquipos();
}


/* ================================================================
   5) NAVEGACIÓN ENTRE MODOS (TABS)
   ---------------------------------------------------------------- */

function montarTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const modo = tab.dataset.modo;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-activa'));
            tab.classList.add('tab-activa');
            document.querySelectorAll('.modo').forEach(m => m.classList.remove('activo'));
            $('modo-' + modo).classList.add('activo');
            // El ranking se recalcula cada vez que se entra para reflejar los últimos puntos.
            if (modo === 'ranking') renderRanking();
        });
    });
}


/* ================================================================
   6) MODO SORTEOS — Carga y navegación
   ---------------------------------------------------------------- */

function montarSorteos() {
    cargarPruebaBtn.addEventListener('click', cargarPrueba);
    procesarCsvBtn.addEventListener('click', procesarCsv);
    girarBtn.addEventListener('click', girarRuleta);
    volverBtn.addEventListener('click', volverSeleccion);
    limpiarHistorialBtn.addEventListener('click', limpiarHistorial);
    // Atajo: desde el resultado de la ruleta saltar al formulario de puntuación
    // con la prueba ya seleccionada.
    puntuarDesdeRuleta.addEventListener('click', () => irAPuntuar(pruebaSelect.value));
}

// Carga la prueba elegida en el desplegable: muestra info y decide siguiente paso.
function cargarPrueba() {
    const prueba = pruebaSelect.value;
    if (!prueba) return;

    const config = configuraciones[prueba];
    ocultarSeccionesSorteo();

    infoTitulo.textContent      = config.titulo;
    infoDescripcion.textContent = config.descripcion || '';
    infoPrueba.classList.remove('hidden');

    if (config.tipo === 'cronometro') {
        // Hazme fan: salta directo al cronómetro (no hay sorteo).
        hazmeFanSection.classList.remove('hidden');
        resetCronometro();
        inicializarHazmeSelector();
    } else if (config.tipo === 'minuto-oro') {
        // El Minuto de Oro: tampoco usa CSV; muestra su sección propia directamente.
        minutoOroSection.classList.remove('hidden');
        inicializarMinutoOro();
    } else {
        // Pruebas con CSV: mostrar el selector de equipos y luego pedir el CSV.
        tituloPrueba.textContent = config.titulo;

        // El Duelo Final no usa selector de orden: los dos equipos finalistas
        // se sortean al azar automáticamente después de girar la ruleta.
        if (prueba !== 'duelo-personajes-final') {
            ruletaEquiposSelector.classList.remove('hidden');

            // Para las pruebas de fase final (Declamación y La Palabra Caliente)
            // solo participan los dos equipos con más puntos de la clasificación.
            // Para el resto de pruebas se pasan todos los equipos (null = sin filtro).
            if (prueba === 'declamacion' || prueba === 'palabra-caliente') {
                inicializarRuletaSelector(obtenerTop2Clasificacion());
            } else {
                inicializarRuletaSelector();
            }
        }

        csvUpload.classList.remove('hidden');
    }
}

// Oculta todo lo de la pantalla de sorteos y deja la selección limpia.
function ocultarSeccionesSorteo() {
    infoPrueba.classList.add('hidden');
    csvUpload.classList.add('hidden');
    ruletaSection.classList.add('hidden');
    historialPanel.classList.add('hidden');
    hazmeFanSection.classList.add('hidden');
    minutoOroSection.classList.add('hidden');
    ruletaEquiposSelector.classList.add('hidden');  // selector de pruebas 2/3/4
    puntuarDesdeRuleta.classList.add('hidden');
    fabricaCrono.classList.add('hidden');
    vocesCrono.classList.add('hidden');
    dueloEleccion.classList.add('hidden');          // panel de elección de personaje
    dueloCrono.classList.add('hidden');
    declaCrono.classList.add('hidden');
    palabraCronoPanel.classList.add('hidden');
    dueloFinalAsignarDiv.classList.add('hidden');
    dueloFinalPanel.classList.add('hidden');
    avisoRepetida.classList.add('hidden');
    pararFabricaSilencioso();
    pararVocesSilencioso();
    pararDueloSilencioso();
    pararDueloEleccionSilencioso();                 // para el pop-up de elección
    pararDeclaSilencioso();                         // para el cronómetro de Declamación
    pararPalabraCalienteSilencioso();               // para el cronómetro de La Palabra Caliente
    pararDueloFinalSilencioso();                    // para el cronómetro del Duelo Final
    pararAsignarDueloFinalSilencioso();             // para el pop-up de sorteo de equipos
    pararMinutoOroSilencioso();                     // para los dos cronómetros del Minuto de Oro
    pararRuletaSelectorSilencioso();                // para el temporizador del pop-up
    resultadoDiv.innerHTML = '';
}

function volverSeleccion() {
    ocultarSeccionesSorteo();
    pruebaSelect.value = '';
}


/*  
   7) MODO SORTEOS — Carga del CSV
   ---------------------------------------------------------------- */

function procesarCsv() {
    const file = csvFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => parsearCsv(e.target.result);
    reader.readAsText(file);
}

// Convierte el texto CSV en un array de objetos usando la primera fila como cabeceras.
function parsearCsv(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] ? values[i].trim() : ''; });
        return obj;
    });

    const prueba = pruebaSelect.value;
    datosPrueba[prueba] = data;
    usados[prueba] = usados[prueba] || [];

    csvUpload.classList.add('hidden');
    ruletaSection.classList.remove('hidden');
    puntuarDesdeRuleta.classList.remove('hidden');

    // El historial lateral solo se usa en pruebas que no deben repetir resultado.
    if (prueba === 'voces-derecho' || prueba === 'palabra-caliente') {
        historialPanel.classList.remove('hidden');
        actualizarHistorial(prueba);
    } else {
        historialPanel.classList.add('hidden');
    }

    // El cronómetro de intervenciones solo aparece en La Palabra Caliente.
    if (prueba === 'palabra-caliente') {
        palabraCronoPanel.classList.remove('hidden');
        resetPalabraCaliente();
    } else {
        palabraCronoPanel.classList.add('hidden');
    }

    // El panel del Duelo Final se activa tras sortear los equipos, no al cargar el CSV.
    if (prueba === 'duelo-personajes-final') resetDueloFinal();

    inicializarRuleta(prueba);
}


/*
   8) RULETAS — Inicialización

   ---------------------------------------------------------------- */

function inicializarRuleta(prueba) {
    const config = configuraciones[prueba];
    ruletaContainer.innerHTML = '';
    fabricaCrono.classList.add('hidden');
    vocesCrono.classList.add('hidden');
    dueloEleccion.classList.add('hidden');
    dueloCrono.classList.add('hidden');
    declaCrono.classList.add('hidden');
    dueloFinalAsignarDiv.classList.add('hidden');
    avisoRepetida.classList.add('hidden');
    canvasList = [];

    // Instrucciones de Fábrica de Historias: visibles solo en esa prueba
    const fabricaInstr = $('fabrica-instrucciones');
    if (fabricaInstr) {
        fabricaInstr.classList.toggle('hidden', prueba !== 'fabrica-historias');
    }

    if (config.tipo === 'multiple') {
        // Fábrica de Historias: tres ruletas con etiqueta y resultado bajo cada una.
        const etiquetasUI = { contexto: 'Contexto', problema: 'Problema', personaje: 'Personaje' };
        config.columnas.forEach(col => {
            const opciones = datosPrueba[prueba].map(row => row[col]).filter(v => v);
            crearRuleta(col, opciones, {
                etiqueta: etiquetasUI[col] || col,
                conResultadoBloque: true
            });
        });
    } else if (config.tipo === 'simple') {
        // Una sola ruleta grande.
        const opciones = datosPrueba[prueba].map(row => {
            if (prueba === 'voces-derecho') return `Art. ${row.numero} — ${row.descripcion}`;
            return `${row.nombre}: ${row.descripcion}`;
        });
        crearRuleta('ruleta', opciones, { modoSolo: true });
    } else if (config.tipo === 'dupla') {
        const opciones = datosPrueba[prueba].map(row => `${row.personaje_a} vs ${row.personaje_b}`);
        crearRuleta('duplas', opciones, { modoSolo: true });
    } else if (config.tipo === 'genero-texto') {
        const generos = [...new Set(datosPrueba[prueba].map(row => row.genero))];
        crearRuleta('generos', generos, { modoSolo: true });
    }
}

// Crea un bloque de ruleta con etiqueta opcional y un cuadro de resultado opcional.
function crearRuleta(nombre, opciones, opts = {}) {
    const { etiqueta = null, modoSolo = false, conResultadoBloque = false } = opts;

    const bloque = document.createElement('div');
    bloque.className = 'ruleta-bloque' + (modoSolo ? ' solo' : '');
    bloque.dataset.nombre = nombre;

    if (etiqueta) {
        const lbl = document.createElement('div');
        lbl.className = 'ruleta-etiqueta';
        lbl.textContent = etiqueta;
        bloque.appendChild(lbl);
    }

    // Resolución alta del canvas: el CSS lo escala manteniendo nitidez.
    const canvas = document.createElement('canvas');
    canvas.width  = 480;
    canvas.height = 480;
    canvas.id = nombre;
    bloque.appendChild(canvas);

    let resBox = null;
    if (conResultadoBloque) {
        resBox = document.createElement('div');
        resBox.className = 'ruleta-resultado vacio';
        resBox.dataset.nombre = nombre;
        resBox.textContent = '—';
        bloque.appendChild(resBox);
    }

    ruletaContainer.appendChild(bloque);
    canvasList.push({ canvas, opciones, nombre, resBox, bloque });
    dibujarRuleta(canvas, opciones);
}


/* 
   9) RULETAS — Dibujo
   ---------------------------------------------------------------- */

function dibujarRuleta(canvas, opciones) {
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 14;
    const ang = (2 * Math.PI) / opciones.length;
    // Paleta infantil rotativa.
    const colors = ['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#FF6FA3', '#00BCD4'];
    // Tamaño de fuente proporcional al canvas para que escale bien en pantallas grandes.
    const fontSize = Math.max(13, Math.round(canvas.width * 0.038));

    opciones.forEach((opcion, i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, i * ang, (i + 1) * ang);
        ctx.closePath();
        ctx.fill();

        // Borde blanco entre sectores: queda más limpio en tamaños grandes.
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Texto del sector (truncado si no cabe).
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(i * ang + ang / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Fredoka, "Baloo 2", Arial`;
        const maxChars = Math.max(8, Math.floor(radius / (fontSize * 0.55)));
        const texto = opcion.length > maxChars ? opcion.slice(0, maxChars - 1) + '…' : opcion;
        ctx.fillText(texto, radius - 22, fontSize / 3);
        ctx.restore();
    });

    // Flecha indicadora (apunta al sector ganador en la parte superior).
    ctx.fillStyle = '#2C2C54';
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx - 18, 38);
    ctx.lineTo(cx + 18, 38);
    ctx.closePath();
    ctx.fill();

    // Círculo central decorativo.
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#2C2C54';
    ctx.lineWidth = 3;
    ctx.stroke();
}


/* 
   10) RULETAS — Giro
   ---------------------------------------------------------------- */

function girarRuleta() {
    const prueba = pruebaSelect.value;
    const config = configuraciones[prueba];

    if (config.tipo === 'multiple') {
        // Antes de un nuevo giro en Fábrica: limpiar avisos, cronómetro y resultados.
        if (prueba === 'fabrica-historias') {
            avisoRepetida.classList.add('hidden');
            fabricaCrono.classList.add('hidden');
            pararFabricaSilencioso();
            canvasList.forEach(({ resBox }) => {
                if (!resBox) return;
                resBox.textContent = '—';
                resBox.classList.add('vacio');
                resBox.classList.remove('recien-aterrizado');
            });
        }

        // Las tres ruletas giran a la vez. Cuando todas terminan, mostramos resumen.
        const resultados = {};
        let completados = 0;
        canvasList.forEach(({ canvas, opciones, nombre }) => {
            girarCanvas(canvas, opciones, null, resultado => {
                resultados[nombre] = resultado;
                if (++completados === canvasList.length) mostrarResultadoMultiple(resultados);
            });
        });
    } else if (config.tipo === 'simple') {
        // Antes de un nuevo giro en Voces: ocultar el cronómetro de la intervención previa.
        if (prueba === 'voces-derecho') {
            vocesCrono.classList.add('hidden');
            pararVocesSilencioso();
        }
        // Antes de un nuevo giro en Palabra Caliente: resetear el cronómetro de turnos.
        if (prueba === 'palabra-caliente') {
            pararPalabraCalienteSilencioso();
            resetPalabraCaliente();
        }
        let opciones = canvasList[0].opciones;
        // Voces y Palabra caliente no pueden repetir; filtramos los ya usados.
        if (prueba === 'voces-derecho' || prueba === 'palabra-caliente') {
            const disponibles = opciones.filter(op => !usados[prueba].includes(op));
            if (disponibles.length === 0) {
                const msg = prueba === 'voces-derecho'
                    ? '¡Todos los artículos sorteados!'
                    : '¡Todas las situaciones sorteadas!';
                resultadoDiv.innerHTML =
                    `<div class="resultado-articulo"><strong>${msg}</strong>Se ha reseteado. Puedes girar de nuevo.</div>`;
                usados[prueba] = [];
                actualizarHistorial(prueba);
                return;
            }
            opciones = disponibles;
        }
        girarCanvas(canvasList[0].canvas, opciones);
    } else if (config.tipo === 'dupla') {
        // Antes de un nuevo giro: limpiar el panel de elección y el cronómetro previos.
        dueloEleccion.classList.add('hidden');
        dueloCrono.classList.add('hidden');
        dueloFinalAsignarDiv.classList.add('hidden');
        dueloFinalPanel.classList.add('hidden');
        avisoRepetida.classList.add('hidden');
        pararDueloSilencioso();
        pararDueloEleccionSilencioso();
        pararDueloFinalSilencioso();
        pararAsignarDueloFinalSilencioso();
        if (pruebaSelect.value === 'duelo-personajes-final') resetDueloFinal();
        girarCanvas(canvasList[0].canvas, canvasList[0].opciones, 'dupla');
    } else if (config.tipo === 'genero-texto') {
        // Antes de un nuevo giro: ocultar el cronómetro de la declamación anterior.
        declaCrono.classList.add('hidden');
        pararDeclaSilencioso();
        girarCanvas(canvasList[0].canvas, canvasList[0].opciones, 'genero');
    }
}

// Anima el giro durante 3 s con desaceleración cúbica y calcula el sector ganador.
function girarCanvas(canvas, opciones, tipoExtra = null, callback = null) {
    const ctx = canvas.getContext('2d');
    let rotation = 0;
    const duration = 3000;
    const startTime = Date.now();
    const randomAngle = Math.random() * 2 * Math.PI;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        rotation = easeOut * (10 * Math.PI + randomAngle);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        dibujarRuleta(canvas, opciones);
        ctx.restore();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Sector que ha quedado bajo la flecha (arriba del canvas).
            const ang = (2 * Math.PI) / opciones.length;
            const finalAngle = rotation % (2 * Math.PI);
            const idx = Math.floor((2 * Math.PI - finalAngle) / ang) % opciones.length;
            const resultado = opciones[idx];
            if (typeof callback === 'function') callback(resultado, tipoExtra, canvas);
            else mostrarResultado(resultado, tipoExtra);
        }
    }
    animate();
}


/* 
   11) RULETAS — Mostrar resultados
   ---------------------------------------------------------------- */

function mostrarResultadoMultiple(resultados) {
    const orden = ['contexto', 'problema', 'personaje'];
    const etiquetas = { contexto: 'Contexto', problema: 'Problema', personaje: 'Personaje' };

    // Pintar resultado destacado debajo de cada ruleta.
    canvasList.forEach(({ resBox, nombre }) => {
        if (!resBox) return;
        const valor = resultados[nombre] || '';
        resBox.classList.remove('vacio');
        resBox.textContent = valor;
        resBox.classList.add('recien-aterrizado');
        setTimeout(() => resBox.classList.remove('recien-aterrizado'), 800);
    });

    // Resumen general en el área principal de resultado.
    const lineas = orden.map(n =>
        `<div class="resultado-item"><strong>${etiquetas[n] || n}:</strong> ${resultados[n] || ''}</div>`
    );
    resultadoDiv.innerHTML = `<div class="resultado-multiple">${lineas.join('')}</div>`;

    // Tracking de combinaciones repetidas (sólo en Fábrica de Historias).
    const prueba = pruebaSelect.value;
    if (prueba === 'fabrica-historias') {
        const clave = orden.map(c => resultados[c] || '').join('|');
        usados[prueba] = usados[prueba] || [];
        const yaSalio = usados[prueba].includes(clave);
        avisoRepetida.classList.toggle('hidden', !yaSalio);
        if (!yaSalio) usados[prueba].push(clave);

        // Mostrar el cronómetro de doble fase listo para arrancar.
        prepararCronometroFabrica();
    }
}

// Resultado para los demás tipos de prueba (1 ruleta).
function mostrarResultado(resultado, tipoExtra) {
    const prueba = pruebaSelect.value;
    const config = configuraciones[prueba];

    if (config.tipo === 'dupla') {
        // Tracking de duplas: si la dupla ya había salido, mostramos aviso (no bloqueante).
        usados[prueba] = usados[prueba] || [];
        const yaSalio = usados[prueba].includes(resultado);
        avisoRepetida.classList.toggle('hidden', !yaSalio);
        if (!yaSalio) usados[prueba].push(resultado);

        // Mostrar la dupla en grande y abrir el panel de asignación con alumnos reales.
        // El segundo giro (asignación aleatoria) se dispara desde "Asignar personajes".
        resultadoDiv.innerHTML =
            `<div class="resultado-dupla"><strong>Dupla sorteada:</strong> ${escapar(resultado)}</div>`;
        // El Duelo Final asigna los equipos de forma aleatoria mediante un botón;
        // el Duelo de Clasificación deja al participante elegir su personaje.
        if (prueba === 'duelo-personajes-final') {
            mostrarAsignacionFinalDuelo(resultado);
        } else {
            mostrarEleccionDuelo(resultado);
        }
    } else if (config.tipo === 'genero-texto') {
        // Declamación: tras sortear género, escogemos un texto disponible.
        const disponibles = datosPrueba[prueba].filter(r => r.genero === resultado && !usados[prueba].includes(r.titulo));
        if (disponibles.length > 0) {
            const sel = disponibles[Math.floor(Math.random() * disponibles.length)];
            resultadoDiv.innerHTML =
                `<div class="resultado-genero"><strong>Género:</strong> ${resultado}<br><strong>Título:</strong> ${sel.titulo}<br><strong>Texto:</strong> ${sel.texto}</div>`;
            usados[prueba].push(sel.titulo);
            // Mostrar el cronómetro doble listo para arrancar.
            prepararCronometroDecla();
        } else {
            resultadoDiv.textContent = 'No hay textos disponibles para este género.';
        }
    } else if (prueba === 'voces-derecho') {
        // Voces con Derecho: número de artículo enorme + descripción debajo.
        // El formato del CSV genera la cadena "Art. NN — descripción"; la separamos
        // para que el jurado y el alumno vean el número desde lejos.
        const m = resultado.match(/Art\.\s+(\d+)\s+—\s+(.*)/);
        const numero = m ? m[1] : '';
        const descripcion = m ? m[2] : resultado;
        resultadoDiv.innerHTML = `
            <div class="resultado-articulo">
                <div class="articulo-etiqueta">Artículo de la Constitución</div>
                <div class="articulo-numero">Art. ${escapar(numero)}</div>
                <div class="articulo-descripcion">${escapar(descripcion)}</div>
            </div>`;
        if (!usados[prueba].includes(resultado)) usados[prueba].push(resultado);
        actualizarHistorial(prueba);
        // Mostrar el cronómetro de 2:00 listo para arrancar cuando empiece el alumno.
        prepararCronometroVoces();
    } else if (prueba === 'palabra-caliente') {
        const sit = datosPrueba[prueba].find(r => `${r.nombre}: ${r.descripcion}` === resultado);
        resultadoDiv.innerHTML =
            `<div class="resultado-palabra"><strong>Situación:</strong> ${sit.nombre}<br><br><strong>Descripción:</strong><br>${sit.descripcion}</div>`;
        if (!usados[prueba].includes(resultado)) usados[prueba].push(resultado);
        actualizarHistorial(prueba);
    } else {
        resultadoDiv.innerHTML = `<div class="resultado-simple">${resultado}</div>`;
        usados[prueba] = usados[prueba] || [];
        usados[prueba].push(resultado);
    }
}

// Pinta el panel lateral con los sorteos previos (sólo en pruebas que no repiten).
function actualizarHistorial(prueba) {
    const historial = usados[prueba] || [];
    if (historial.length === 0) {
        historialContenido.innerHTML = '<p class="historial-vacio">Sin sorteos aún</p>';
        return;
    }
    const items = historial.map((item, idx) => {
        let numero = idx + 1;
        let contenido = item;
        if (typeof item === 'string' && item.includes('Art.')) {
            const m = item.match(/Art\.\s+(\d+)\s+—\s+(.*)/);
            if (m) { numero = m[1]; contenido = m[2]; }
        }
        return `<div class="historial-item"><span class="historial-numero">#${numero}</span><span>${contenido}</span></div>`;
    }).join('');
    historialContenido.innerHTML = items;
}

function limpiarHistorial() {
    const prueba = pruebaSelect.value;
    if (prueba) {
        usados[prueba] = [];
        actualizarHistorial(prueba);
    }
}


/*
   12) HAZME FAN — Cronómetro simple
   ---------------------------------------------------------------- */

const CRONO_TOTAL_MS = 2 * 60 * 1000;
const CRONO_MIN_MS   = 30 * 1000; // queda 0:30 → ya cumplió 1:30
let cronoIntervalo  = null;
let cronoFin        = 0;
let cronoRestanteMs = CRONO_TOTAL_MS;
let cronoEnMarcha   = false;

function montarHazmeFan() {
    cronoIniciar.addEventListener('click', iniciarCronometro);
    cronoPausar.addEventListener('click',  pausarCronometro);
    cronoReset.addEventListener('click',   resetCronometro);
    hazmeFanVolver.addEventListener('click', () => {
        pararCronometroSilencioso();
        volverSeleccion();
    });
}

function pintarCrono(ms) {
    const totalSeg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeg / 60).toString().padStart(2, '0');
    const s = (totalSeg % 60).toString().padStart(2, '0');
    cronoDisplay.textContent = `${m}:${s}`;

    cronoDisplay.classList.remove('crono-minimo', 'crono-final');
    if (ms <= 10 * 1000)        cronoDisplay.classList.add('crono-final');
    else if (ms <= CRONO_MIN_MS) cronoDisplay.classList.add('crono-minimo');
}

function iniciarCronometro() {
    if (cronoEnMarcha) return;
    cronoEnMarcha = true;
    cronoFin = Date.now() + cronoRestanteMs;
    cronoIniciar.disabled = true;
    cronoPausar.disabled  = false;
    cronoEstado.textContent = 'Tines entre 1:30 y 2:00 para completar la prueba.';
    cronoIntervalo = setInterval(() => {
        cronoRestanteMs = cronoFin - Date.now();
        if (cronoRestanteMs <= 0) {
            cronoRestanteMs = 0;
            pintarCrono(0);
            terminarCronometro();
            return;
        }
        pintarCrono(cronoRestanteMs);
        if (cronoRestanteMs <= CRONO_MIN_MS && !cronoDisplay.dataset.avisoMin) {
            cronoDisplay.dataset.avisoMin = '1';
            cronoEstado.textContent = '¡Ya llegaste al mínimo de 1:30! Puedes cerrar el discurso.';
        }
    }, 200);
}

function pausarCronometro() {
    if (!cronoEnMarcha) return;
    clearInterval(cronoIntervalo);
    cronoEnMarcha = false;
    cronoRestanteMs = Math.max(0, cronoFin - Date.now());
    cronoIniciar.disabled = false;
    cronoPausar.disabled  = true;
    cronoEstado.textContent = 'Pausa — pulsa Iniciar para seguir.';
}

function resetCronometro() {
    pararCronometroSilencioso();
    cronoRestanteMs = CRONO_TOTAL_MS;
    delete cronoDisplay.dataset.avisoMin;
    pintarCrono(CRONO_TOTAL_MS);
    cronoIniciar.disabled = false;
    cronoPausar.disabled  = true;
    cronoEstado.textContent = 'Listo para empezar';
}

function pararCronometroSilencioso() {
    clearInterval(cronoIntervalo);
    cronoIntervalo = null;
    cronoEnMarcha = false;
}

function terminarCronometro() {
    pararCronometroSilencioso();
    cronoIniciar.disabled = false;
    cronoPausar.disabled  = true;
    cronoEstado.textContent = '¡Tiempo! Fin del discurso.';
    bip(660);
}

// Pequeño bip con WebAudio (sin ficheros externos).
function bip(freq = 660) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
    } catch { /* sin audio */ }
}


/* 
   12b) HAZME FAN — Selector de equipos
   ----------------------------------------------------------------
 */

// Array con los IDs de los equipos que ya han sido llamados en Hazme fan.
// Empieza vacío y se rellena conforme se van seleccionando.
let hazmeEquiposSeleccionados = [];

// Referencia al temporizador del pop-up (necesario para poder pararlo si el
// profesor cancela la prueba antes de que termine la cuenta atrás).
let hazmeCuentaInterval = null;

// ── Montaje ──────────────────────────────────────────────────────
// Conecta el botón con la función que sortea el equipo.
// Se llama UNA SOLA VEZ al arrancar la aplicación (desde init).
function montarHazmeSelector() {
    hazmeSeleccionarBtn.addEventListener('click', seleccionarEquipoHazme);
}

// ── Inicialización ───────────────────────────────────────────────
// Se llama cada vez que el profesor carga la prueba Hazme fan.
// Borra los equipos ya llamados y vuelve a pintar los chips desde cero.
function inicializarHazmeSelector() {
    hazmeEquiposSeleccionados = [];          // Empezamos sin nadie seleccionado
    clearInterval(hazmeCuentaInterval);      // Cancelamos cualquier cuenta atrás pendiente
    hazmeCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    renderHazmeEquipos();
}

// ── Dibujo de chips ──────────────────────────────────────────────
// Crea un cuadro (chip) por cada equipo. Los ya llamados aparecen en gris.
// También actualiza el texto de estado y activa/desactiva el botón.
function renderHazmeEquipos() {
    if (!hazmeEquiposGrid) return;

    // Filtramos los equipos que todavía no han salido
    const restantes = equipos.filter(e => !hazmeEquiposSeleccionados.includes(e.id));

    // Si hay menos de 3 equipos, mostramos aviso y desactivamos el botón
    if (equipos.length < 3) {
        hazmeEquiposGrid.innerHTML = '';
        hazmeSeleccionarBtn.disabled = true;
        hazmeEstado.textContent = 'Debe añadir 3 o más equipos para usar el selector.';
        return;
    }

    // Construimos un chip HTML por cada equipo.
    // La clase 'seleccionado' pone el chip en gris si ya fue llamado.
    hazmeEquiposGrid.innerHTML = equipos.map(e => {
        const cls = hazmeEquiposSeleccionados.includes(e.id) ? 'seleccionado' : '';
        return `<div class="hazme-equipo-chip ${cls}" data-id="${e.id}">${escapar(e.nombre)}</div>`;
    }).join('');

    // Mensaje y botón según si quedan equipos o no
    if (restantes.length === 0) {
        hazmeSeleccionarBtn.disabled = true;
        hazmeEstado.textContent = 'Han sido seleccionados todos los equipos.';
    } else {
        hazmeSeleccionarBtn.disabled = false;
        hazmeEstado.textContent = restantes.length === equipos.length
            ? `${equipos.length} equipo${equipos.length !== 1 ? 's' : ''} disponible${equipos.length !== 1 ? 's' : ''}.`
            : `Quedan ${restantes.length} equipo${restantes.length !== 1 ? 's' : ''} por seleccionar.`;
    }
}

// ── Selección aleatoria ──────────────────────────────────────────
// Se ejecuta al pulsar el botón. Elige un equipo al azar entre los
// que quedan, lo ilumina y abre el pop-up con cuenta atrás.
function seleccionarEquipoHazme() {
    // Solo actuamos si quedan equipos por llamar
    const restantes = equipos.filter(e => !hazmeEquiposSeleccionados.includes(e.id));
    if (restantes.length === 0) return;

    // Math.random() devuelve un número entre 0 y 1.
    // Multiplicado por la cantidad de restantes y redondeado hacia abajo
    // nos da un índice válido dentro del array.
    const eq = restantes[Math.floor(Math.random() * restantes.length)];

    // Quitamos el brillo de cualquier chip anterior y se lo ponemos al elegido
    hazmeEquiposGrid.querySelectorAll('.hazme-equipo-chip').forEach(c => c.classList.remove('iluminado'));
    const chip = hazmeEquiposGrid.querySelector(`.hazme-equipo-chip[data-id="${eq.id}"]`);
    if (chip) chip.classList.add('iluminado');

    // Desactivamos el botón para que no se pueda pulsar mientras el pop-up está abierto
    hazmeSeleccionarBtn.disabled = true;

    // Rellenamos el pop-up con el nombre del equipo y lo mostramos
    hazmePopupNombre.textContent = eq.nombre;
    hazmePopupCuenta.textContent = '5';
    hazmePopup.classList.remove('hidden');

    // setInterval llama a la función cada 1000 ms (1 segundo).
    // Cada vez resta 1 a la cuenta; cuando llega a 0 cierra el pop-up.
    let cuenta = 5;
    clearInterval(hazmeCuentaInterval);
    hazmeCuentaInterval = setInterval(() => {
        cuenta--;
        hazmePopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(hazmeCuentaInterval);
            hazmeCuentaInterval = null;
            hazmePopup.classList.add('hidden');
            if (chip) {
                chip.classList.remove('iluminado');
                chip.classList.add('seleccionado'); // el chip queda gris
            }
            hazmeEquiposSeleccionados.push(eq.id);  // lo marcamos como llamado
            renderHazmeEquipos();                   // actualizamos la vista
        }
    }, 1000);
}


/* ================================================================
   12c) SELECTOR DE EQUIPOS PARA RULETAS (Pruebas 2, 3, 4 y Finales)
    */

// IDs de equipos ya llamados en la prueba de ruleta activa.
// Se resetea cada vez que el profesor carga una nueva prueba.
let ruletaEquiposSeleccionados = [];

// Timer del pop-up para este selector (independiente del de Hazme fan).
let ruletaCuentaInterval = null;

// Lista de IDs permitidos en esta prueba:
// · null  → todos los equipos (pruebas de clasificación).
// · array → solo esos equipos (pruebas de fase final: top 2 de clasificación).
let ruletaEquiposPermitidos = null;

// ── Calcula los dos finalistas ───────────────────────────────────
// Suma los puntos de la fase de clasificación por equipo,
// los ordena de mayor a menor y devuelve los IDs de los dos primeros.
// Se usa al cargar Declamación o La Palabra Caliente.
function obtenerTop2Clasificacion() {
    return equipos
        // Para cada equipo calculamos sus puntos solo en la fase de clasificación
        .map(eq => ({ id: eq.id, nombre: eq.nombre, pts: totalEquipo(eq.id, 'clasificacion') }))
        // Descartamos equipos que no tienen ninguna puntuación todavía
        .filter(eq => eq.pts > 0)
        // sort() con b.pts - a.pts ordena de mayor a menor (descendente)
        .sort((a, b) => b.pts - a.pts)
        // slice(0,2) se queda solo con los dos primeros del array ordenado
        .slice(0, 2)
        // Devolvemos únicamente los IDs (nos basta para filtrar más adelante)
        .map(eq => eq.id);
}

// ── Montaje ──────────────────────────────────────────────────────
// Conecta el botón con la función de sorteo. Solo se llama una vez al arrancar.
function montarRuletaSelector() {
    ruletaSeleccionarBtn.addEventListener('click', seleccionarEquipoRuleta);
}

// ── Para el timer silenciosamente ────────────────────────────────
// Se llama desde ocultarSeccionesSorteo() para no dejar contadores
// "huérfanos" si el profesor cambia de prueba a mitad de la cuenta.
function pararRuletaSelectorSilencioso() {
    clearInterval(ruletaCuentaInterval);
    ruletaCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
}

// ── Inicialización ───────────────────────────────────────────────
// Se llama al cargar cualquier prueba con CSV.
// Si se pasa equiposPermitidos (array de IDs), solo aparecen esos equipos.
// Si no se pasa nada (undefined/null), aparecen todos.
function inicializarRuletaSelector(equiposPermitidos = null) {
    ruletaEquiposSeleccionados = [];          // Empezamos sin nadie seleccionado
    ruletaEquiposPermitidos    = equiposPermitidos; // null = todos; array = solo finalistas
    clearInterval(ruletaCuentaInterval);      // Cancelamos cualquier cuenta pendiente
    ruletaCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    renderRuletaEquipos();
}

// ── Dibujo de chips ──────────────────────────────────────────────
// Crea un chip por equipo (o solo por los finalistas en fase final).
// Los ya llamados aparecen en gris. Actualiza botón y texto de estado.
function renderRuletaEquipos() {
    if (!ruletaEquiposGrid) return;

    // Si ruletaEquiposPermitidos tiene valor, filtramos; si no, usamos todos
    // Esto es el operador ternario: condición ? valorSiTrue : valorSiFalse
    const equiposActivos = ruletaEquiposPermitidos
        ? equipos.filter(e => ruletaEquiposPermitidos.includes(e.id))
        : equipos;

    // Equipos que todavía no han sido llamados en esta prueba
    const restantes = equiposActivos.filter(e => !ruletaEquiposSeleccionados.includes(e.id));

    // ── Caso: fase final sin finalistas clasificados aún ─────────
    if (ruletaEquiposPermitidos !== null && equiposActivos.length === 0) {
        ruletaEquiposGrid.innerHTML = '';
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent =
            'Aún no hay equipos clasificados. Puntúa las 4 pruebas de clasificación primero.';
        return;
    }

    // ── Caso: fase normal sin suficientes equipos (mínimo 3) ─────
    if (ruletaEquiposPermitidos === null && equiposActivos.length < 3) {
        ruletaEquiposGrid.innerHTML = '';
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent = 'Debe añadir 3 o más equipos para usar el selector.';
        return;
    }

    // ── Pintamos los chips ────────────────────────────────────────
    // Solo aparecen los equipos activos (todos o los dos finalistas)
    ruletaEquiposGrid.innerHTML = equiposActivos.map(e => {
        const cls = ruletaEquiposSeleccionados.includes(e.id) ? 'seleccionado' : '';
        return `<div class="hazme-equipo-chip ${cls}" data-id="${e.id}">${escapar(e.nombre)}</div>`;
    }).join('');

    // ── Actualizamos botón y texto de estado ──────────────────────
    if (restantes.length === 0) {
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent = 'Han sido seleccionados todos los equipos.';
    } else {
        ruletaSeleccionarBtn.disabled = false;
        // En fase final: mensaje especial indicando quiénes son los finalistas
        if (ruletaEquiposPermitidos !== null && ruletaEquiposSeleccionados.length === 0) {
            const nombres = equiposActivos.map(e => escapar(e.nombre)).join(' y ');
            ruletaSelectorEstado.textContent = `Finalistas: ${nombres}. Selecciona el orden de participación.`;
        } else {
            ruletaSelectorEstado.textContent = restantes.length === equiposActivos.length
                ? `${equiposActivos.length} equipo${equiposActivos.length !== 1 ? 's' : ''} disponible${equiposActivos.length !== 1 ? 's' : ''}.`
                : `Quedan ${restantes.length} equipo${restantes.length !== 1 ? 's' : ''} por seleccionar.`;
        }
    }
}

// ── Selección aleatoria ──────────────────────────────────────────
// Mismo flujo que seleccionarEquipoHazme():
// 1) Elige al azar entre los restantes (que pueden ser solo los finalistas),
// 2) ilumina el chip, 3) muestra pop-up con cuenta atrás.
function seleccionarEquipoRuleta() {
    // Trabajamos solo con los equipos permitidos en esta prueba
    const equiposActivos = ruletaEquiposPermitidos
        ? equipos.filter(e => ruletaEquiposPermitidos.includes(e.id))
        : equipos;
    const restantes = equiposActivos.filter(e => !ruletaEquiposSeleccionados.includes(e.id));
    if (restantes.length === 0) return;

    // Selección aleatoria: índice entre 0 y restantes.length - 1
    const eq = restantes[Math.floor(Math.random() * restantes.length)];

    // Quitamos brillo previo y lo ponemos en el chip elegido
    ruletaEquiposGrid.querySelectorAll('.hazme-equipo-chip').forEach(c => c.classList.remove('iluminado'));
    const chip = ruletaEquiposGrid.querySelector(`.hazme-equipo-chip[data-id="${eq.id}"]`);
    if (chip) chip.classList.add('iluminado');

    // Bloqueamos el botón durante el pop-up
    ruletaSeleccionarBtn.disabled = true;

    // Mostramos el pop-up compartido con los datos del equipo elegido
    hazmePopupNombre.textContent = eq.nombre;
    hazmePopupCuenta.textContent = '5';
    hazmePopup.classList.remove('hidden');

    // Cuenta atrás: cada segundo restamos 1; al llegar a 0 cerramos el pop-up
    let cuenta = 5;
    clearInterval(ruletaCuentaInterval);
    ruletaCuentaInterval = setInterval(() => {
        cuenta--;
        hazmePopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(ruletaCuentaInterval);
            ruletaCuentaInterval = null;
            hazmePopup.classList.add('hidden');
            if (chip) {
                chip.classList.remove('iluminado');
                chip.classList.add('seleccionado');   // chip queda gris
            }
            ruletaEquiposSeleccionados.push(eq.id);  // lo marcamos como llamado
            renderRuletaEquipos();                    // actualizamos la vista
        }
    }, 1000);
}


/* ================================================================
   13) FÁBRICA DE HISTORIAS — Cronómetro doble (preparación + discurso)
   ----------------------------------------------------------------
   Fase 1: 30 s para pensar la historia (color verde-violeta).
   Fase 2: 2:00 para contarla (color azul).
   Cada fin de fase suena un bip distinto y se desbloquea la siguiente.
   ---------------------------------------------------------------- */

const FABRICA_PREP_MS = 30 * 1000;
const FABRICA_DISC_MS = 2 * 60 * 1000;
let fabricaIntervalo  = null;
let fabricaRestanteMs = FABRICA_PREP_MS;
let fabricaFin        = 0;
let fabricaFase       = 'prep'; // 'prep' | 'discurso'

function montarFabrica() {
    fabricaIniciar.addEventListener('click',  iniciarFabricaPrep);
    fabricaDiscurso.addEventListener('click', iniciarFabricaDiscurso);
    fabricaPausar.addEventListener('click',   pausarFabrica);
    fabricaReset.addEventListener('click',    resetCronometroFabrica);
}

// Llamado tras girar Fábrica para mostrar y resetear el cronómetro doble.
function prepararCronometroFabrica() {
    fabricaCrono.classList.remove('hidden');
    resetCronometroFabrica();
}

function pintarFabrica(ms) {
    const totalSeg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeg / 60).toString().padStart(2, '0');
    const s = (totalSeg % 60).toString().padStart(2, '0');
    fabricaDisplay.textContent = `${m}:${s}`;

    // Aviso visual: rojo en los últimos 5 s de la fase actual.
    fabricaDisplay.classList.remove('crono-final');
    if (ms <= 5 * 1000) fabricaDisplay.classList.add('crono-final');
}

function iniciarFabricaPrep() {
    pararFabricaSilencioso();
    fabricaFase = 'prep';
    fabricaRestanteMs = FABRICA_PREP_MS;
    fabricaFin = Date.now() + fabricaRestanteMs;

    fabricaFaseNombre.textContent = 'Preparación';
    fabricaDisplay.classList.remove('fase-discurso');
    fabricaIniciar.disabled  = true;
    fabricaDiscurso.disabled = true;
    fabricaPausar.disabled   = false;
    fabricaEstado.textContent = '30 segundos para pensar la historia.';
    iniciarFabricaTick();
}

function iniciarFabricaDiscurso() {
    pararFabricaSilencioso();
    fabricaFase = 'discurso';
    fabricaRestanteMs = FABRICA_DISC_MS;
    fabricaFin = Date.now() + fabricaRestanteMs;

    fabricaFaseNombre.textContent = 'Discurso';
    fabricaDisplay.classList.add('fase-discurso');
    fabricaIniciar.disabled  = true;
    fabricaDiscurso.disabled = true;
    fabricaPausar.disabled   = false;
    fabricaEstado.textContent = '2 minutos para contar la historia.';
    iniciarFabricaTick();
}

function iniciarFabricaTick() {
    fabricaIntervalo = setInterval(() => {
        fabricaRestanteMs = fabricaFin - Date.now();
        if (fabricaRestanteMs <= 0) {
            pintarFabrica(0);
            terminarFabricaFase();
            return;
        }
        pintarFabrica(fabricaRestanteMs);
    }, 200);
}

function pausarFabrica() {
    if (!fabricaIntervalo) return;
    clearInterval(fabricaIntervalo);
    fabricaIntervalo = null;
    fabricaRestanteMs = Math.max(0, fabricaFin - Date.now());
    fabricaPausar.disabled = true;
    if (fabricaFase === 'prep') fabricaIniciar.disabled = false;
    else                        fabricaDiscurso.disabled = false;
    fabricaEstado.textContent = 'Pausa.';
}

function pararFabricaSilencioso() {
    clearInterval(fabricaIntervalo);
    fabricaIntervalo = null;
}

function terminarFabricaFase() {
    pararFabricaSilencioso();
    if (fabricaFase === 'prep') {
        bip(880);
        fabricaEstado.textContent = '¡Tiempo de preparación agotado! Pulsa "Iniciar discurso".';
        fabricaIniciar.disabled  = true;
        fabricaDiscurso.disabled = false;
        fabricaPausar.disabled   = true;
    } else {
        bip(440);
        fabricaEstado.textContent = '¡Fin del discurso!';
        fabricaIniciar.disabled  = true;
        fabricaDiscurso.disabled = true;
        fabricaPausar.disabled   = true;
    }
}

function resetCronometroFabrica() {
    pararFabricaSilencioso();
    fabricaFase = 'prep';
    fabricaRestanteMs = FABRICA_PREP_MS;
    pintarFabrica(FABRICA_PREP_MS);
    fabricaDisplay.classList.remove('fase-discurso', 'crono-final');
    fabricaFaseNombre.textContent = 'Preparación';
    fabricaIniciar.disabled  = false;
    fabricaDiscurso.disabled = true;
    fabricaPausar.disabled   = true;
    fabricaEstado.textContent = 'Pulsa "Iniciar preparación" cuando el equipo esté listo.';
}


/* ================================================================
   13b) VOCES CON DERECHO — Cronómetro simple (hasta 2:00)
   ----------------------------------------------------------------
   Aparece tras girar la ruleta y mostrar el artículo. El alumno
   dispone de hasta 2:00 minutos para defender el artículo sorteado.
   Pulsa en rojo en los últimos 10 s y suena un bip al terminar.
   ---------------------------------------------------------------- */

const VOCES_TOTAL_MS = 2 * 60 * 1000;
let vocesIntervalo  = null;
let vocesRestanteMs = VOCES_TOTAL_MS;
let vocesFin        = 0;
let vocesEnMarcha   = false;

function montarVoces() {
    vocesIniciar.addEventListener('click', iniciarCronometroVoces);
    vocesPausar.addEventListener('click',  pausarCronometroVoces);
    vocesReset.addEventListener('click',   resetCronometroVoces);
}

// Llamada tras girar la ruleta y pintar el artículo: muestra el cronómetro
// listo para arrancar, sin iniciarlo automáticamente (lo arranca el profesor).
function prepararCronometroVoces() {
    vocesCrono.classList.remove('hidden');
    resetCronometroVoces();
}

function pintarVoces(ms) {
    const totalSeg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeg / 60).toString().padStart(2, '0');
    const s = (totalSeg % 60).toString().padStart(2, '0');
    vocesDisplay.textContent = `${m}:${s}`;
    // En los últimos 10 s pulsa en rojo para avisar de que se acaba el tiempo.
    vocesDisplay.classList.toggle('crono-final', ms <= 10 * 1000);
}

function iniciarCronometroVoces() {
    if (vocesEnMarcha) return;
    vocesEnMarcha = true;
    vocesFin = Date.now() + vocesRestanteMs;
    vocesIniciar.disabled = true;
    vocesPausar.disabled  = false;
    vocesEstado.textContent = 'En marcha — máximo 2:00.';
    vocesIntervalo = setInterval(() => {
        vocesRestanteMs = vocesFin - Date.now();
        if (vocesRestanteMs <= 0) {
            vocesRestanteMs = 0;
            pintarVoces(0);
            terminarCronometroVoces();
            return;
        }
        pintarVoces(vocesRestanteMs);
    }, 200);
}

function pausarCronometroVoces() {
    if (!vocesEnMarcha) return;
    clearInterval(vocesIntervalo);
    vocesIntervalo = null;
    vocesEnMarcha = false;
    vocesRestanteMs = Math.max(0, vocesFin - Date.now());
    vocesIniciar.disabled = false;
    vocesPausar.disabled  = true;
    vocesEstado.textContent = 'Pausa — pulsa Iniciar para seguir.';
}

function pararVocesSilencioso() {
    clearInterval(vocesIntervalo);
    vocesIntervalo = null;
    vocesEnMarcha = false;
}

function resetCronometroVoces() {
    pararVocesSilencioso();
    vocesRestanteMs = VOCES_TOTAL_MS;
    pintarVoces(VOCES_TOTAL_MS);
    vocesDisplay.classList.remove('crono-final');
    vocesIniciar.disabled = false;
    vocesPausar.disabled  = true;
    vocesEstado.textContent = 'Pulsa "Iniciar" cuando el alumno empiece.';
}

function terminarCronometroVoces() {
    pararVocesSilencioso();
    vocesIniciar.disabled = false;
    vocesPausar.disabled  = true;
    vocesEstado.textContent = '¡Tiempo agotado!';
    bip(660);
}


/* ================================================================
   13c) DUELO DE PERSONAJES — Elección de personaje + cronómetro doble
   
   ---------------------------------------------------------------- */

// ── Constantes del cronómetro ────────────────────────────────────
const DUELO_PREP_MS = 60 * 1000;   // 1 minuto para pensar (en milisegundos)
const DUELO_ARG_MS  = 90 * 1000;   // 1 minuto y 30 segundos para argumentar

// ── Variables de estado ──────────────────────────────────────────
let dueloIntervalo      = null;         // Timer del cronómetro (setInterval)
let dueloRestanteMs     = DUELO_PREP_MS;// Milisegundos que quedan en la fase actual
let dueloFin            = 0;            // Marca de tiempo en que termina la fase
let dueloFase           = 'prep';       // Fase actual: 'prep' o 'argumentar'
let dueloEleccionInterval = null;       // Timer del pop-up de elección (5 s)

// ── Montaje ──────────────────────────────────────────────────────
// Conecta todos los botones con sus funciones.
// Se llama UNA SOLA VEZ al arrancar la app (desde init).
function montarDuelo() {
    // Botones de elección de personaje (se rellenan cuando sale la dupla)
    dueloBtnA.addEventListener('click', () => elegirPersonajeDuelo(dueloBtnA.textContent));
    dueloBtnB.addEventListener('click', () => elegirPersonajeDuelo(dueloBtnB.textContent));
    // Botones del cronómetro doble
    dueloIniciar.addEventListener('click',    iniciarDueloPrep);
    dueloArgumentar.addEventListener('click', iniciarDueloArgumentar);
    dueloPausar.addEventListener('click',     pausarDuelo);
    dueloReset.addEventListener('click',      resetCronometroDuelo);
}

// ── Muestra la elección ──────────────────────────────────────────
// Se llama desde mostrarResultado() cuando la prueba es de tipo 'dupla'.
// Parte la cadena "A vs B" en dos nombres y los pone en cada botón.
function mostrarEleccionDuelo(resultado) {
    // split(' vs ') devuelve un array: ["Leo Messi", "Cristiano Ronaldo"]
    const partes = resultado.split(' vs ');
    const pA = partes[0] ? partes[0].trim() : resultado;
    const pB = partes[1] ? partes[1].trim() : '—';

    // Ponemos cada nombre en su botón correspondiente
    dueloBtnA.textContent = pA;
    dueloBtnB.textContent = pB;

    // Mostramos el panel de elección y aseguramos que el cronómetro está oculto
    dueloEleccion.classList.remove('hidden');
    dueloCrono.classList.add('hidden');
    pararDueloSilencioso();
}

// ── Pop-up de confirmación ───────────────────────────────────────
// Se ejecuta al pulsar uno de los dos botones de personaje.
// Muestra la elección en el pop-up compartido durante 5 s.
// Cuando la cuenta llega a 0, cierra el pop-up y abre el cronómetro.
function elegirPersonajeDuelo(personaje) {
    // Ocultamos el panel de elección (ya no hace falta)
    dueloEleccion.classList.add('hidden');

    // Personalizamos el pop-up con el mensaje y el nombre del personaje elegido
    document.querySelector('.hazme-popup-equipo').textContent = '¡Has elegido!';
    hazmePopupNombre.textContent = personaje;
    hazmePopupCuenta.textContent = '5';
    hazmePopup.classList.remove('hidden');

    // Cuenta atrás de 5 segundos: setInterval llama al bloque cada 1000 ms
    let cuenta = 5;
    clearInterval(dueloEleccionInterval);
    dueloEleccionInterval = setInterval(() => {
        cuenta--;
        hazmePopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(dueloEleccionInterval);
            dueloEleccionInterval = null;
            hazmePopup.classList.add('hidden');
            // Restauramos el texto del pop-up para que funcione bien
            // la próxima vez que lo use el selector de equipos
            document.querySelector('.hazme-popup-equipo').textContent = '¡Le toca a!';
            // Abrimos el cronómetro doble listo para arrancar
            prepararCronometroDuelo();
        }
    }, 1000);
}

// ── Para el pop-up de elección silenciosamente ───────────────────
// Se llama cuando el profesor vuelve atrás o vuelve a girar la ruleta,
// para cerrar el pop-up y cancelar el timer antes de empezar de nuevo.
function pararDueloEleccionSilencioso() {
    clearInterval(dueloEleccionInterval);
    dueloEleccionInterval = null;
    if (dueloEleccion) dueloEleccion.classList.add('hidden');
    // Restauramos el texto por si el pop-up estaba abierto
    const popupEquipo = document.querySelector('.hazme-popup-equipo');
    if (popupEquipo) popupEquipo.textContent = '¡Le toca a!';
}

// Muestra y resetea el cronómetro doble del duelo.
function prepararCronometroDuelo() {
    dueloCrono.classList.remove('hidden');
    resetCronometroDuelo();
}

function pintarDuelo(ms) {
    const totalSeg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeg / 60).toString().padStart(2, '0');
    const s = (totalSeg % 60).toString().padStart(2, '0');
    dueloDisplay.textContent = `${m}:${s}`;
    // En los últimos 5 s pulsa para avisar visualmente.
    dueloDisplay.classList.toggle('crono-final', ms <= 5 * 1000);
}

function iniciarDueloPrep() {
    pararDueloSilencioso();
    dueloFase = 'prep';
    dueloRestanteMs = DUELO_PREP_MS;
    dueloFin = Date.now() + dueloRestanteMs;
    dueloFaseNombre.textContent = 'Preparación';
    dueloDisplay.classList.remove('fase-argumentar');
    dueloIniciar.disabled    = true;
    dueloArgumentar.disabled = true;
    dueloPausar.disabled     = false;
    dueloEstado.textContent = '1 minuto para pensar argumentos.';
    iniciarDueloTick();
}

function iniciarDueloArgumentar() {
    pararDueloSilencioso();
    dueloFase = 'argumentar';
    dueloRestanteMs = DUELO_ARG_MS;
    dueloFin = Date.now() + dueloRestanteMs;
    dueloFaseNombre.textContent = 'Argumentación';
    dueloDisplay.classList.add('fase-argumentar');
    dueloIniciar.disabled    = true;
    dueloArgumentar.disabled = true;
    dueloPausar.disabled     = false;
    dueloEstado.textContent = '1 minuto y medio para defender al personaje.';
    iniciarDueloTick();
}

function iniciarDueloTick() {
    dueloIntervalo = setInterval(() => {
        dueloRestanteMs = dueloFin - Date.now();
        if (dueloRestanteMs <= 0) {
            pintarDuelo(0);
            terminarDueloFase();
            return;
        }
        pintarDuelo(dueloRestanteMs);
    }, 200);
}

function pausarDuelo() {
    if (!dueloIntervalo) return;
    clearInterval(dueloIntervalo);
    dueloIntervalo = null;
    dueloRestanteMs = Math.max(0, dueloFin - Date.now());
    dueloPausar.disabled = true;
    if (dueloFase === 'prep') dueloIniciar.disabled = false;
    else                      dueloArgumentar.disabled = false;
    dueloEstado.textContent = 'Pausa.';
}

function pararDueloSilencioso() {
    clearInterval(dueloIntervalo);
    dueloIntervalo = null;
}

function terminarDueloFase() {
    pararDueloSilencioso();
    if (dueloFase === 'prep') {
        bip(880);
        dueloEstado.textContent = '¡Tiempo de preparación agotado! Pulsa "Iniciar argumentación".';
        dueloIniciar.disabled    = true;
        dueloArgumentar.disabled = false;
        dueloPausar.disabled     = true;
    } else {
        bip(440);
        dueloEstado.textContent = '¡Fin de la argumentación!';
        dueloIniciar.disabled    = true;
        dueloArgumentar.disabled = true;
        dueloPausar.disabled     = true;
    }
}

function resetCronometroDuelo() {
    pararDueloSilencioso();
    dueloFase = 'prep';
    dueloRestanteMs = DUELO_PREP_MS;
    pintarDuelo(DUELO_PREP_MS);
    dueloDisplay.classList.remove('fase-argumentar', 'crono-final');
    dueloFaseNombre.textContent = 'Preparación';
    dueloIniciar.disabled    = false;
    dueloArgumentar.disabled = true;
    dueloPausar.disabled     = true;
    dueloEstado.textContent = 'Pulsa "Iniciar preparación" cuando los participantes estén listos.';
}


/* ================================================================
   13d) FINAL 1 — DECLAMACIÓN — Cronómetro doble (preparación + declamación)
   ---------------------------------------------------------------- */

// ── Constantes del cronómetro ────────────────────────────────────
const DECLA_PREP_MS    = 2 * 60 * 1000;  // 2 minutos de preparación
const DECLA_DISC_MS    = 2 * 60 * 1000;  // 2 minutos máximo de declamación
const DECLA_MIN_MS     = 30 * 1000;      // cuando queden 30 s → mínimo de 1:30 cumplido

// ── Variables de estado ──────────────────────────────────────────
let declaIntervalo   = null;              // Timer (setInterval)
let declaRestanteMs  = DECLA_PREP_MS;    // Milisegundos restantes en la fase actual
let declaFin         = 0;                // Marca de tiempo (ms) en que termina la fase
let declaFase        = 'prep';           // Fase actual: 'prep' | 'declamacion'

// ── Montaje ──────────────────────────────────────────────────────
// Conecta los cuatro botones del cronómetro. Solo se llama una vez al arrancar.
function montarDeclamacion() {
    declaIniciar.addEventListener('click',  iniciarDeclaPrep);
    declaDiscurso.addEventListener('click', iniciarDeclaDiscurso);
    declaPausar.addEventListener('click',   pausarDecla);
    declaReset.addEventListener('click',    resetDecla);
}

// ── Preparar ─────────────────────────────────────────────────────
// Se llama desde mostrarResultado() justo después de mostrar el texto.
// Hace visible el cronómetro y lo resetea al estado inicial.
function prepararCronometroDecla() {
    declaCrono.classList.remove('hidden');
    resetDecla();
}

// ── Pintar el display ─────────────────────────────────────────────
// Convierte milisegundos en "MM:SS" y aplica los colores de aviso.
function pintarDecla(ms) {
    const totalSeg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeg / 60).toString().padStart(2, '0');
    const s = (totalSeg % 60).toString().padStart(2, '0');
    declaDisplay.textContent = `${m}:${s}`;

    // Durante la declamación aplicamos los avisos de color:
    //   · crono-minimo (verde) → quedan ≤ 30 s = ya se ha cumplido el mínimo de 1:30.
    //   · crono-final (rojo)   → últimos 10 s.
    if (declaFase === 'declamacion') {
        declaDisplay.classList.remove('crono-minimo', 'crono-final');
        if (ms <= 10 * 1000)        declaDisplay.classList.add('crono-final');
        else if (ms <= DECLA_MIN_MS) declaDisplay.classList.add('crono-minimo');
    }
}

// ── Iniciar preparación ───────────────────────────────────────────
function iniciarDeclaPrep() {
    pararDeclaSilencioso();
    declaFase = 'prep';
    declaRestanteMs = DECLA_PREP_MS;
    declaFin = Date.now() + declaRestanteMs;

    declaFaseNombre.textContent = 'Preparación';
    declaDisplay.classList.remove('fase-declamacion', 'crono-minimo', 'crono-final');
    declaIniciar.disabled  = true;
    declaDiscurso.disabled = true;
    declaPausar.disabled   = false;
    declaEstado.textContent = '2 minutos para preparar el texto.';
    iniciarDeclaTick();
}

// ── Iniciar declamación ───────────────────────────────────────────
// Se habilita automáticamente al terminar la fase de preparación.
function iniciarDeclaDiscurso() {
    pararDeclaSilencioso();
    declaFase = 'declamacion';
    declaRestanteMs = DECLA_DISC_MS;
    declaFin = Date.now() + declaRestanteMs;

    declaFaseNombre.textContent = 'Declamación';
    declaDisplay.classList.add('fase-declamacion');
    declaDisplay.classList.remove('crono-minimo', 'crono-final');
    delete declaDisplay.dataset.avisoMin;
    declaIniciar.disabled  = true;
    declaDiscurso.disabled = true;
    declaPausar.disabled   = false;
    declaEstado.textContent = 'Entre 1:30 y 2:00 para declamar el texto.';
    iniciarDeclaTick();
}

// ── Tick ──────────────────────────────────────────────────────────
// setInterval llama a esto cada 200 ms para suavizar el display.
function iniciarDeclaTick() {
    declaIntervalo = setInterval(() => {
        declaRestanteMs = declaFin - Date.now();
        if (declaRestanteMs <= 0) {
            pintarDecla(0);
            terminarDeclaFase();
            return;
        }
        pintarDecla(declaRestanteMs);
        // Aviso de mínimo cumplido (solo en fase de declamación)
        if (declaFase === 'declamacion' &&
            declaRestanteMs <= DECLA_MIN_MS &&
            !declaDisplay.dataset.avisoMin) {
            declaDisplay.dataset.avisoMin = '1';
            declaEstado.textContent = '¡Ya llegaste al mínimo de 1:30! Puedes terminar.';
        }
    }, 200);
}

// ── Pausar ────────────────────────────────────────────────────────
function pausarDecla() {
    if (!declaIntervalo) return;
    clearInterval(declaIntervalo);
    declaIntervalo = null;
    declaRestanteMs = Math.max(0, declaFin - Date.now());
    declaPausar.disabled = true;
    if (declaFase === 'prep') declaIniciar.disabled = false;
    else                      declaDiscurso.disabled = false;
    declaEstado.textContent = 'Pausa — pulsa el botón de fase para seguir.';
}

// ── Para silenciosamente ──────────────────────────────────────────
// Cancela el timer sin cambiar nada en la pantalla.
// Lo llaman ocultarSeccionesSorteo() e inicializarRuleta() para que
// no queden contadores corriendo en segundo plano.
function pararDeclaSilencioso() {
    clearInterval(declaIntervalo);
    declaIntervalo = null;
}

// ── Fin de fase ───────────────────────────────────────────────────
function terminarDeclaFase() {
    pararDeclaSilencioso();
    if (declaFase === 'prep') {
        bip(880);
        declaEstado.textContent = '¡Preparación terminada! Pulsa "Iniciar declamación".';
        declaIniciar.disabled  = true;
        declaDiscurso.disabled = false;
        declaPausar.disabled   = true;
    } else {
        bip(440);
        declaEstado.textContent = '¡Tiempo máximo agotado! Fin de la declamación.';
        declaIniciar.disabled  = true;
        declaDiscurso.disabled = true;
        declaPausar.disabled   = true;
    }
}

// ── Reiniciar ─────────────────────────────────────────────────────
function resetDecla() {
    pararDeclaSilencioso();
    declaFase = 'prep';
    declaRestanteMs = DECLA_PREP_MS;
    pintarDecla(DECLA_PREP_MS);
    declaDisplay.classList.remove('fase-declamacion', 'crono-minimo', 'crono-final');
    delete declaDisplay.dataset.avisoMin;
    declaFaseNombre.textContent = 'Preparación';
    declaIniciar.disabled  = false;
    declaDiscurso.disabled = true;
    declaPausar.disabled   = true;
    declaEstado.textContent = 'Pulsa "Iniciar preparación" cuando el alumno esté listo.';
}


/*
   13e) FINAL 2 — LA PALABRA CALIENTE — Cronómetro de intervenciones
    */

// ── Constantes ───────────────────────────────────────────────────
const PALABRA_TURNO_SEG = 20;  // segundos por turno (límite máximo)
const PALABRA_TURNOS    = 6;   // 6 turnos: 3 por Participante A + 3 por B

// ── Variables de estado ──────────────────────────────────────────
// · palabraTurnoIdx: indica qué turno está activo (0=A, 1=B, 2=A…).
// · palabraIntervalo: el setInterval que hace ticks cada 100 ms.
// · palabraFinInterval: el setInterval del pop-up de fin.
// · palabraRestanteMs: cuántos milisegundos quedan en el turno activo.
// · palabraSegFin: timestamp (Date.now()) del momento en que termina el turno.
let palabraTurnoIdx    = 0;
let palabraIntervalo   = null;
let palabraFinInterval = null;
let palabraRestanteMs  = PALABRA_TURNO_SEG * 1000;
let palabraSegFin      = 0;
let palabraEnMarcha    = false;
let palabraMarcasA     = 0;   // intervenciones completadas por Participante A
let palabraMarcasB     = 0;   // intervenciones completadas por Participante B

// ── Montaje ──────────────────────────────────────────────────────
// Conecta los tres botones del panel. Se llama UNA vez al arrancar.
function montarPalabraCaliente() {
    palabraIniciarBtn.addEventListener('click', iniciarPalabraCaliente);
    palabraPausarBtn.addEventListener('click',  pausarPalabraCaliente);
    palabraResetBtn.addEventListener('click',   resetPalabraCaliente);
}

// ── Pintar el contador ────────────────────────────────────────────
// Muestra los segundos restantes en el bloque de color.
// En los últimos 5 s añade la clase 'crono-urgente' (número pulsa).
function pintarPalabraCaliente(ms) {
    const seg = Math.max(0, Math.ceil(ms / 1000));
    // padStart(2,'0') convierte "5" en "05" para tener siempre dos dígitos
    palabraCuentaDisplayEl.textContent = `0:${seg.toString().padStart(2, '0')}`;
    palabraCuentaDisplayEl.classList.toggle('crono-urgente', ms <= 5000);
}

// ── Iniciar ───────────────────────────────────────────────────────
// Arranca el contador del turno activo.
function iniciarPalabraCaliente() {
    if (palabraEnMarcha) return;
    palabraEnMarcha = true;
    // Guardamos el timestamp exacto de fin: ahora + ms restantes
    palabraSegFin   = Date.now() + palabraRestanteMs;
    palabraIniciarBtn.disabled = true;
    palabraPausarBtn.disabled  = false;
    palabraCronoEstado.textContent = turnoDescripcionPalabra();
    // setInterval con 100 ms para un display muy fluido
    palabraIntervalo = setInterval(palabraTick, 100);
}

// ── Tick (100 ms) ─────────────────────────────────────────────────
// Se ejecuta 10 veces por segundo. Recalcula cuánto falta y,
// cuando llega a 0, llama a avanzarTurnoPalabra().
function palabraTick() {
    palabraRestanteMs = palabraSegFin - Date.now();
    if (palabraRestanteMs <= 0) {
        pintarPalabraCaliente(0);
        avanzarTurnoPalabra();
    } else {
        pintarPalabraCaliente(palabraRestanteMs);
    }
}

// ── Avanzar turno ─────────────────────────────────────────────────
// Al llegar a 0 s: añade el palito del participante activo y pasa
// al siguiente turno (o termina si ya se hicieron los 6).
function avanzarTurnoPalabra() {
    // ─ ¿Le tocaba a A (par) o a B (impar)? ────────────────────
    // El operador % (módulo) da el resto de dividir por 2:
    //   0 % 2 = 0 → A, 1 % 2 = 1 → B, 2 % 2 = 0 → A, etc.
    if (palabraTurnoIdx % 2 === 0) palabraMarcasA++;
    else                            palabraMarcasB++;
    renderPalitos();

    palabraTurnoIdx++;

    // ─ ¿Han acabado los 6 turnos? ──────────────────────────────
    if (palabraTurnoIdx >= PALABRA_TURNOS) {
        clearInterval(palabraIntervalo);
        palabraIntervalo = null;
        palabraEnMarcha  = false;
        terminarPalabraCaliente();
        return;
    }

    // ─ Preparar el siguiente turno y continuar automáticamente ─
    bip(880); // bip agudo de cambio de turno
    palabraRestanteMs = PALABRA_TURNO_SEG * 1000;
    palabraSegFin     = Date.now() + palabraRestanteMs;
    renderTurnoPalabra();
    palabraCronoEstado.textContent = turnoDescripcionPalabra();
    // El setInterval sigue corriendo: no hace falta pararlo y arrancarlo
}

// ── Pausar ────────────────────────────────────────────────────────
// Detiene el contador sin perder el tiempo restante.
function pausarPalabraCaliente() {
    if (!palabraEnMarcha) return;
    clearInterval(palabraIntervalo);
    palabraIntervalo  = null;
    palabraEnMarcha   = false;
    palabraRestanteMs = Math.max(0, palabraSegFin - Date.now());
    palabraIniciarBtn.disabled = false;
    palabraPausarBtn.disabled  = true;
    palabraCronoEstado.textContent = 'Pausa — pulsa Iniciar para continuar.';
}

// ── Para silenciosamente ──────────────────────────────────────────
// Cancela los dos posibles timers sin tocar la pantalla.
// Lo llaman ocultarSeccionesSorteo() y girarRuleta() para no
// dejar contadores corriendo en segundo plano.
function pararPalabraCalienteSilencioso() {
    clearInterval(palabraIntervalo);
    palabraIntervalo = null;
    clearInterval(palabraFinInterval);
    palabraFinInterval = null;
    palabraEnMarcha = false;
}

// ── Fin del juego ─────────────────────────────────────────────────
// Muestra el pop-up compartido (#hazme-popup) con mensaje de fin
// y una cuenta atrás de 5 s que lo cierra automáticamente.
function terminarPalabraCaliente() {
    bip(660);
    setTimeout(() => bip(660), 350); // doble bip de fin
    palabraCronoEstado.textContent = '¡Las 6 intervenciones han concluido!';

    // Reutilizamos el pop-up compartido con texto personalizado.
    // Es el mismo pop-up que usa el selector de equipos (#hazme-popup).
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Tiempo agotado!';
    hazmePopupNombre.textContent  = '3 intervenciones por participante';
    hazmePopupCuenta.textContent  = '✓';
    hazmePopup.classList.remove('hidden');

    // Cuenta atrás de 5 s que cierra el pop-up automáticamente.
    let cuenta = 5;
    clearInterval(palabraFinInterval);
    palabraFinInterval = setInterval(() => {
        cuenta--;
        if (cuenta > 0) {
            hazmePopupCuenta.textContent = cuenta;
        } else {
            clearInterval(palabraFinInterval);
            palabraFinInterval = null;
            hazmePopup.classList.add('hidden');
            // Restauramos el texto del pop-up para el selector de equipos
            if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
        }
    }, 1000);
}

// ── Reiniciar ─────────────────────────────────────────────────────
// Deja todo en el estado inicial: turno 0 (A), sin palitos.
// Se llama al cargar el CSV y al girar para una nueva situación.
function resetPalabraCaliente() {
    pararPalabraCalienteSilencioso();
    palabraTurnoIdx   = 0;
    palabraMarcasA    = 0;
    palabraMarcasB    = 0;
    palabraRestanteMs = PALABRA_TURNO_SEG * 1000;
    palabraEnMarcha   = false;
    renderTurnoPalabra();
    renderPalitos();
    pintarPalabraCaliente(PALABRA_TURNO_SEG * 1000);
    palabraIniciarBtn.disabled = false;
    palabraPausarBtn.disabled  = true;
    palabraCronoEstado.textContent = 'Pulsa Iniciar cuando los participantes estén listos.';
}

// ── Actualizar display del turno ──────────────────────────────────
// Cambia el color del bloque (azul=A, naranja=B), el nombre del
// participante y el indicador "Turno N de 6".
// La transición CSS de 0.5 s hace el cambio de color suave.
function renderTurnoPalabra() {
    const esA = palabraTurnoIdx % 2 === 0;
    // toggle añade la clase si el segundo parámetro es true, o la elimina si es false
    palabraTurnoDisplayEl.classList.toggle('turno-a',  esA);
    palabraTurnoDisplayEl.classList.toggle('turno-b', !esA);
    palabraParticipanteLabel.textContent = esA ? 'Participante A' : 'Participante B';
    palabraTurnoInfoEl.textContent = `Turno ${palabraTurnoIdx + 1} de ${PALABRA_TURNOS}`;
    // Quitamos el aviso de urgencia al iniciar un turno nuevo
    palabraCuentaDisplayEl.classList.remove('crono-urgente');
}

// ── Descripción del turno (texto de estado) ───────────────────────
// Texto legible que muestra quién habla y qué número de intervención es.
// Math.floor(turnoIdx / 2) + 1 da: turno 0→1, 2→2, 4→3 para A
//                                   turno 1→1, 3→2, 5→3 para B
function turnoDescripcionPalabra() {
    const esA     = palabraTurnoIdx % 2 === 0;
    const quien   = esA ? 'Participante A' : 'Participante B';
    const nInterv = Math.floor(palabraTurnoIdx / 2) + 1;
    return `${quien} — intervención ${nInterv}/3. ¡20 segundos!`;
}

// ── Palitos (sistema de tachado visual) ──────────────────────────
// renderPalitos() actualiza las dos filas de la tabla.
// generarPalitos(n) devuelve n elementos <span class="palito">,
// marcando el último con 'palito-ultimo' para que anime al aparecer.
function renderPalitos() {
    if (!palitosA || !palitosB) return;
    palitosA.innerHTML = generarPalitos(palabraMarcasA);
    palitosB.innerHTML = generarPalitos(palabraMarcasB);
}

function generarPalitos(n) {
    let html = '';
    for (let i = 0; i < n; i++) {
        // Solo el último palito lleva la animación de entrada
        const ultimo = i === n - 1 ? ' palito-ultimo' : '';
        html += `<span class="palito${ultimo}"></span>`;
    }
    return html;
}


/* ================================================================
   13f) FINAL 3 — DUELO DE PERSONAJES FINAL — Sorteo de equipos + cronómetro
 */

// ── Constantes ───────────────────────────────────────────────────
const DUELO_FINAL_PREP_MS     = 60 * 1000;  // 1 min de preparación conjunta
const DUELO_FINAL_EXPO_MS     = 60 * 1000;  // 1 min de exposición por equipo
const DUELO_FINAL_REPLICA_SEG = 30;          // segundos por turno de réplica
const DUELO_FINAL_REPLICAS    = 6;           // 6 turnos = 3 réplicas por equipo

// ── Variables de estado ──────────────────────────────────────────
let dueloFinalEquipoA     = '';      // nombre del equipo que defiende al personaje A
let dueloFinalEquipoB     = '';      // nombre del equipo que defiende al personaje B
let dueloFinalPersonajeA  = '';      // nombre del personaje A (de la dupla sorteada)
let dueloFinalPersonajeB  = '';      // nombre del personaje B

let dueloFinalFase         = 'prep'; // 'prep' | 'expo-a' | 'expo-b' | 'replica'
let dueloFinalIntervalo    = null;   // setInterval del cronómetro de la fase activa
let dueloFinalRestanteMs   = DUELO_FINAL_PREP_MS; // milisegundos que quedan
let dueloFinalFin          = 0;      // timestamp del momento en que termina la fase

let dueloFinalAsignarInterval = null; // timer del pop-up de asignación de equipos
let dueloFinalFinInterval     = null; // timer del pop-up de fin de duelo

let dueloFinalReplicaIdx  = 0;  // turno de réplica activo (0 = A, 1 = B, 2 = A …)
let dueloFinalReplicasA   = 0;  // réplicas completadas por el equipo A
let dueloFinalReplicasB   = 0;  // réplicas completadas por el equipo B

// ── Montaje ──────────────────────────────────────────────────────
// Conecta todos los botones del panel con sus funciones.
// Se llama UNA SOLA VEZ al arrancar la app (desde init).
function montarDueloFinal() {
    dueloFinalAsignarBtn.addEventListener('click',     sortearEquiposDueloFinal);
    dueloFinalIniciarPrep.addEventListener('click',    iniciarDueloFinalPrep);
    dueloFinalIniciarExpoA.addEventListener('click',   iniciarDueloFinalExpoA);
    dueloFinalIniciarExpoB.addEventListener('click',   iniciarDueloFinalExpoB);
    dueloFinalIniciarReplica.addEventListener('click', iniciarDueloFinalReplica);
    dueloFinalPausarBtn.addEventListener('click',      pausarDueloFinal);
    dueloFinalResetBtn.addEventListener('click',       () => {
        pararDueloFinalSilencioso();
        dueloFinalFase       = 'prep';
        dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
        dueloFinalReplicaIdx = 0;
        dueloFinalReplicasA  = 0;
        dueloFinalReplicasB  = 0;
        resetDueloFinalUI();
    });
}

// ── Mostrar botón de sorteo ───────────────────────────────────────
// Se llama desde mostrarResultado() cuando la prueba es duelo-personajes-final.
// Parte "A vs B" en dos nombres y muestra el div de asignación aleatoria.
function mostrarAsignacionFinalDuelo(resultado) {
    const partes = resultado.split(' vs ');
    dueloFinalPersonajeA = partes[0] ? partes[0].trim() : resultado;
    dueloFinalPersonajeB = partes[1] ? partes[1].trim() : '—';

    // Mostramos el botón de sorteo; el panel cronómetro permanece oculto
    dueloFinalAsignarDiv.classList.remove('hidden');
    dueloFinalPanel.classList.add('hidden');
}

// ── Sortear equipos ───────────────────────────────────────────────
// Al pulsar el botón: toma los dos equipos finalistas (top 2 de clasificación),
// los asigna al azar con Math.random() y muestra el pop-up de 5 s.
// Math.random() < 0.5 funciona como lanzar una moneda: 50 % de probabilidad.
function sortearEquiposDueloFinal() {
    const top2Ids = obtenerTop2Clasificacion();
    const finalistas = top2Ids.length >= 2
        ? equipos.filter(e => top2Ids.includes(e.id))
        : equipos.slice(0, 2);

    if (finalistas.length < 2) {
        dueloFinalEstado.textContent = 'Necesitas al menos 2 equipos registrados.';
        return;
    }

    // Asignación aleatoria: la moneda decide quién va primero
    const [t1, t2] = Math.random() < 0.5
        ? [finalistas[0], finalistas[1]]
        : [finalistas[1], finalistas[0]];

    dueloFinalEquipoA = t1.nombre;
    dueloFinalEquipoB = t2.nombre;

    // Bloqueamos el botón durante el pop-up para evitar dobles pulsaciones
    dueloFinalAsignarBtn.disabled = true;

    // Pop-up compartido con las asignaciones en dos líneas.
    // white-space: pre-line en .hazme-popup-nombre convierte el \n en salto de línea.
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Asignación por sorteo!';
    hazmePopupNombre.textContent =
        `${escapar(dueloFinalEquipoA)} → ${escapar(dueloFinalPersonajeA)}\n` +
        `${escapar(dueloFinalEquipoB)} → ${escapar(dueloFinalPersonajeB)}`;
    hazmePopupCuenta.textContent = '5';
    hazmePopup.classList.remove('hidden');

    // Cuenta atrás de 5 s: setInterval llama al bloque cada 1000 ms (1 segundo).
    let cuenta = 5;
    clearInterval(dueloFinalAsignarInterval);
    dueloFinalAsignarInterval = setInterval(() => {
        cuenta--;
        hazmePopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(dueloFinalAsignarInterval);
            dueloFinalAsignarInterval = null;
            hazmePopup.classList.add('hidden');
            // Restauramos el texto del pop-up para que funcione el selector de equipos
            if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
            // Una vez cerrado el pop-up, activamos el panel del cronómetro
            activarPanelDueloFinal();
        }
    }, 1000);
}

// ── Para el timer del pop-up de sorteo silenciosamente ────────────
// Se llama cuando el profesor cambia de prueba o vuelve a girar la ruleta,
// para no dejar el pop-up abierto ni el timer corriendo en segundo plano.
function pararAsignarDueloFinalSilencioso() {
    clearInterval(dueloFinalAsignarInterval);
    dueloFinalAsignarInterval = null;
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
}

// ── Activar el panel del cronómetro ──────────────────────────────
// Se llama cuando el pop-up de sorteo de equipos se cierra.
// Pone los nombres reales en el aside y muestra el panel.
function activarPanelDueloFinal() {
    // Poner los nombres de los equipos en la tabla de réplicas
    replicaNombreA.textContent = dueloFinalEquipoA;
    replicaNombreB.textContent = dueloFinalEquipoB;

    // Actualizar el texto de los botones de exposición con los nombres reales
    dueloFinalIniciarExpoA.textContent =
        `Exposición: ${dueloFinalEquipoA} (1:00)`;
    dueloFinalIniciarExpoB.textContent =
        `Exposición: ${dueloFinalEquipoB} (1:00)`;

    // Mostrar el panel y preparar el cronómetro
    dueloFinalPanel.classList.remove('hidden');
    dueloFinalFase       = 'prep';
    dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    dueloFinalReplicaIdx = 0;
    dueloFinalReplicasA  = 0;
    dueloFinalReplicasB  = 0;
    resetDueloFinalUI();
}

// ── Pintar el display ─────────────────────────────────────────────
// Convierte milisegundos en "MM:SS" y aplica el aviso visual de urgencia.
function pintarDueloFinal(ms) {
    const totalSeg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeg / 60).toString().padStart(2, '0');
    const s = (totalSeg % 60).toString().padStart(2, '0');
    dueloFinalDisplayEl.textContent = `${m}:${s}`;
    // En los últimos 5 s de réplica y 10 s de exposición, el número pulsa
    const umbral = dueloFinalFase === 'replica' ? 5000 : 10000;
    dueloFinalDisplayEl.classList.toggle('crono-urgente', ms <= umbral);
}

// ── Iniciar preparación ───────────────────────────────────────────
// Fase 1: 1 minuto para que ambos equipos lean y preparen sus argumentos.
function iniciarDueloFinalPrep() {
    // Si ya estamos en fase prep (pausa-reanuda), no reiniciamos el tiempo
    if (dueloFinalFase !== 'prep') {
        dueloFinalFase = 'prep';
        dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    }
    pararDueloFinalSilencioso();
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalBloque.className = 'duelo-final-bloque fase-prep';
    dueloFinalQuienEl.textContent = 'Preparación';
    dueloFinalFaseInfoEl.textContent = 'Fase 1 de 4';
    dueloFinalIniciarPrep.disabled = true;
    dueloFinalIniciarExpoA.classList.add('hidden');
    dueloFinalIniciarExpoB.classList.add('hidden');
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = '1 minuto para que ambos equipos preparen sus argumentos.';
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

// ── Iniciar exposición del equipo A ───────────────────────────────
// Fase 2: 1 minuto de exposición inicial para el equipo asignado al personaje A.
function iniciarDueloFinalExpoA() {
    // Si venimos de otra fase (no de pausa en expo-a), reiniciamos el tiempo
    if (dueloFinalFase !== 'expo-a') {
        dueloFinalFase = 'expo-a';
        dueloFinalRestanteMs = DUELO_FINAL_EXPO_MS;
    }
    pararDueloFinalSilencioso();
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalBloque.className = 'duelo-final-bloque turno-a';
    dueloFinalQuienEl.textContent = dueloFinalEquipoA;
    dueloFinalFaseInfoEl.textContent = 'Fase 2 de 4';
    dueloFinalIniciarPrep.classList.add('hidden');
    dueloFinalIniciarExpoA.disabled = true;
    dueloFinalIniciarExpoB.classList.add('hidden');
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = `1 minuto de exposición inicial para ${dueloFinalEquipoA}.`;
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

// ── Iniciar exposición del equipo B ───────────────────────────────
// Fase 3: 1 minuto de exposición inicial para el equipo asignado al personaje B.
function iniciarDueloFinalExpoB() {
    if (dueloFinalFase !== 'expo-b') {
        dueloFinalFase = 'expo-b';
        dueloFinalRestanteMs = DUELO_FINAL_EXPO_MS;
    }
    pararDueloFinalSilencioso();
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalBloque.className = 'duelo-final-bloque turno-b';
    dueloFinalQuienEl.textContent = dueloFinalEquipoB;
    dueloFinalFaseInfoEl.textContent = 'Fase 3 de 4';
    dueloFinalIniciarPrep.classList.add('hidden');
    dueloFinalIniciarExpoA.classList.add('hidden');
    dueloFinalIniciarExpoB.disabled = true;
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = `1 minuto de exposición inicial para ${dueloFinalEquipoB}.`;
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

// ── Iniciar fase de réplicas ──────────────────────────────────────
// Fase 4: 6 turnos de 30 s alternos (A-B-A-B-A-B = 3 réplicas por equipo).
// Si estamos reanudando desde pausa (dueloFinalFase === 'replica'),
// conservamos el replicaIdx y los palitos ya anotados.
function iniciarDueloFinalReplica() {
    if (dueloFinalFase !== 'replica') {
        // Primera vez: reiniciamos todo el estado de réplicas
        dueloFinalFase       = 'replica';
        dueloFinalReplicaIdx = 0;
        dueloFinalReplicasA  = 0;
        dueloFinalReplicasB  = 0;
        dueloFinalRestanteMs = DUELO_FINAL_REPLICA_SEG * 1000;
        dueloFinalReplicasTabla.classList.remove('hidden');
        renderReplicasDueloFinal();
        renderTurnoReplicaDueloFinal();
    }
    pararDueloFinalSilencioso();
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalIniciarPrep.classList.add('hidden');
    dueloFinalIniciarExpoA.classList.add('hidden');
    dueloFinalIniciarExpoB.classList.add('hidden');
    dueloFinalIniciarReplica.disabled = true;
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = turnoDescripcionReplicaDueloFinal();
    dueloFinalIntervalo = setInterval(dueloFinalTick, 100);
}

// ── Tick principal (200 ms fases 1-3 · 100 ms réplicas) ──────────
// Recalcula cuánto queda y, al llegar a 0, cierra la fase.
function dueloFinalTick() {
    dueloFinalRestanteMs = dueloFinalFin - Date.now();
    if (dueloFinalRestanteMs <= 0) {
        pintarDueloFinal(0);
        terminarFaseDueloFinal();
    } else {
        pintarDueloFinal(dueloFinalRestanteMs);
    }
}

// ── Fin de fase ───────────────────────────────────────────────────
// Decide qué ocurre al acabar cada fase: desbloquea la siguiente o
// muestra el pop-up de fin al completar las réplicas.
function terminarFaseDueloFinal() {
    pararDueloFinalSilencioso();

    if (dueloFinalFase === 'prep') {
        bip(880);
        dueloFinalEstado.textContent =
            '¡Preparación terminada! Pulsa el botón de exposición del primer equipo.';
        dueloFinalIniciarPrep.disabled = true;
        dueloFinalIniciarExpoA.classList.remove('hidden');
        dueloFinalIniciarExpoA.disabled = false;
        dueloFinalPausarBtn.disabled = true;

    } else if (dueloFinalFase === 'expo-a') {
        bip(880);
        dueloFinalEstado.textContent =
            `¡Tiempo de ${dueloFinalEquipoA}! Ahora le toca a ${dueloFinalEquipoB}.`;
        dueloFinalIniciarExpoA.disabled = true;
        dueloFinalIniciarExpoB.classList.remove('hidden');
        dueloFinalIniciarExpoB.disabled = false;
        dueloFinalPausarBtn.disabled = true;

    } else if (dueloFinalFase === 'expo-b') {
        bip(880);
        dueloFinalEstado.textContent =
            `¡Tiempo de ${dueloFinalEquipoB}! Pulsa "Iniciar réplicas" para continuar.`;
        dueloFinalIniciarExpoB.disabled = true;
        dueloFinalIniciarReplica.classList.remove('hidden');
        dueloFinalIniciarReplica.disabled = false;
        dueloFinalPausarBtn.disabled = true;

    } else if (dueloFinalFase === 'replica') {
        // Anotar palito al equipo cuyo turno acaba de terminar.
        // El operador % (módulo) da 0 para A (turnos pares) y 1 para B (impares).
        if (dueloFinalReplicaIdx % 2 === 0) dueloFinalReplicasA++;
        else                                  dueloFinalReplicasB++;
        renderReplicasDueloFinal();

        dueloFinalReplicaIdx++;

        if (dueloFinalReplicaIdx >= DUELO_FINAL_REPLICAS) {
            // Todas las réplicas completadas: mostrar pop-up de fin
            dueloFinalPausarBtn.disabled = true;
            terminarDueloFinal();
            return;
        }

        // Pasar al siguiente turno: actualizar display y seguir automáticamente
        bip(880);
        dueloFinalRestanteMs = DUELO_FINAL_REPLICA_SEG * 1000;
        dueloFinalFin        = Date.now() + dueloFinalRestanteMs;
        renderTurnoReplicaDueloFinal();
        dueloFinalEstado.textContent = turnoDescripcionReplicaDueloFinal();
        dueloFinalIntervalo = setInterval(dueloFinalTick, 100);
    }
}

// ── Descripción del turno de réplica (texto de estado) ───────────
// Igual que turnoDescripcionPalabra en La Palabra Caliente:
//   Math.floor(replicaIdx / 2) + 1 da 1 para los turnos 0-1, 2 para 2-3, 3 para 4-5.
function turnoDescripcionReplicaDueloFinal() {
    const esA   = dueloFinalReplicaIdx % 2 === 0;
    const quien = esA ? dueloFinalEquipoA : dueloFinalEquipoB;
    const nRep  = Math.floor(dueloFinalReplicaIdx / 2) + 1;
    return `${quien} — réplica ${nRep}/3. ¡30 segundos!`;
}

// ── Actualizar bloque de color y etiquetas en réplicas ───────────
function renderTurnoReplicaDueloFinal() {
    const esA = dueloFinalReplicaIdx % 2 === 0;
    // classList.toggle añade o quita la clase según el segundo parámetro
    dueloFinalBloque.className = 'duelo-final-bloque ' + (esA ? 'turno-a' : 'turno-b');
    dueloFinalQuienEl.textContent = esA ? dueloFinalEquipoA : dueloFinalEquipoB;
    dueloFinalFaseInfoEl.textContent =
        `Fase 4 de 4 — Réplica ${dueloFinalReplicaIdx + 1} de ${DUELO_FINAL_REPLICAS}`;
    dueloFinalDisplayEl.classList.remove('crono-urgente');
    pintarDueloFinal(dueloFinalRestanteMs);
}

// ── Tabla de réplicas (palitos) ───────────────────────────────────
// Reutiliza generarPalitos(n) de la sección 13e (mismo ámbito global).
function renderReplicasDueloFinal() {
    if (!replicasAEl || !replicasBEl) return;
    replicasAEl.innerHTML = generarPalitos(dueloFinalReplicasA);
    replicasBEl.innerHTML = generarPalitos(dueloFinalReplicasB);
}

// ── Pausar ────────────────────────────────────────────────────────
// Detiene el contador sin perder el tiempo restante.
// Reactiva el botón de la fase activa para que el profesor pueda reanudar.
function pausarDueloFinal() {
    if (!dueloFinalIntervalo) return;
    clearInterval(dueloFinalIntervalo);
    dueloFinalIntervalo  = null;
    dueloFinalRestanteMs = Math.max(0, dueloFinalFin - Date.now());
    dueloFinalPausarBtn.disabled = true;
    if      (dueloFinalFase === 'prep')    dueloFinalIniciarPrep.disabled    = false;
    else if (dueloFinalFase === 'expo-a')  dueloFinalIniciarExpoA.disabled   = false;
    else if (dueloFinalFase === 'expo-b')  dueloFinalIniciarExpoB.disabled   = false;
    else if (dueloFinalFase === 'replica') dueloFinalIniciarReplica.disabled = false;
    dueloFinalEstado.textContent = 'Pausa — pulsa el botón de fase para continuar.';
}

// ── Para silenciosamente ──────────────────────────────────────────
// Cancela los dos timers posibles sin tocar la pantalla.
// Lo llaman ocultarSeccionesSorteo() y girarRuleta().
function pararDueloFinalSilencioso() {
    clearInterval(dueloFinalIntervalo);
    dueloFinalIntervalo = null;
    clearInterval(dueloFinalFinInterval);
    dueloFinalFinInterval = null;
}

// ── Fin del duelo ─────────────────────────────────────────────────
// Muestra el pop-up de fin tras completar las 6 réplicas (3 por equipo).
// El pop-up se cierra automáticamente tras 5 s.
function terminarDueloFinal() {
    bip(660);
    setTimeout(() => bip(660), 350); // doble bip de fin (igual que en Palabra Caliente)
    dueloFinalEstado.textContent = '¡Duelo finalizado! Todas las réplicas completadas.';

    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Duelo finalizado!';
    hazmePopupNombre.textContent =
        `${escapar(dueloFinalEquipoA)}: ${dueloFinalReplicasA} réplica${dueloFinalReplicasA !== 1 ? 's' : ''}\n` +
        `${escapar(dueloFinalEquipoB)}: ${dueloFinalReplicasB} réplica${dueloFinalReplicasB !== 1 ? 's' : ''}`;
    hazmePopupCuenta.textContent = '✓';
    hazmePopup.classList.remove('hidden');

    let cuenta = 5;
    clearInterval(dueloFinalFinInterval);
    dueloFinalFinInterval = setInterval(() => {
        cuenta--;
        if (cuenta > 0) {
            hazmePopupCuenta.textContent = cuenta;
        } else {
            clearInterval(dueloFinalFinInterval);
            dueloFinalFinInterval = null;
            hazmePopup.classList.add('hidden');
            if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
        }
    }, 1000);
}

// ── Reiniciar UI ──────────────────────────────────────────────────
// Deja el panel visible en estado inicial: fase prep, botones listos.
// Se llama desde activarPanelDueloFinal() y desde el botón Reiniciar.
function resetDueloFinalUI() {
    pintarDueloFinal(DUELO_FINAL_PREP_MS);
    dueloFinalBloque.className = 'duelo-final-bloque fase-prep';
    dueloFinalQuienEl.textContent = 'Preparación';
    dueloFinalFaseInfoEl.textContent = 'Fase 1 de 4';
    dueloFinalDisplayEl.classList.remove('crono-urgente');
    dueloFinalIniciarPrep.disabled    = false;
    dueloFinalIniciarPrep.classList.remove('hidden');
    dueloFinalIniciarExpoA.classList.add('hidden');
    dueloFinalIniciarExpoA.disabled   = false;
    dueloFinalIniciarExpoB.classList.add('hidden');
    dueloFinalIniciarExpoB.disabled   = false;
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalIniciarReplica.disabled = false;
    dueloFinalPausarBtn.disabled = true;
    dueloFinalReplicasTabla.classList.add('hidden');
    renderReplicasDueloFinal();
    dueloFinalEstado.textContent = 'Pulsa "Iniciar preparación" cuando los equipos estén listos.';
}

// ── Reiniciar estado (sin UI) ─────────────────────────────────────
// Limpia las variables de estado y reactiva el botón de sorteo.
// Se llama al girar de nuevo, al cargar el CSV o al cambiar de prueba.
function resetDueloFinal() {
    pararDueloFinalSilencioso();
    dueloFinalFase       = 'prep';
    dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    dueloFinalReplicaIdx = 0;
    dueloFinalReplicasA  = 0;
    dueloFinalReplicasB  = 0;
    if (dueloFinalAsignarBtn) dueloFinalAsignarBtn.disabled = false;
}


/* ================================================================
   13g) FINAL 4 — EL MINUTO DE ORO — Dos cronómetros en estrella
  */

// ── Constante ────────────────────────────────────────────────────
const MINUTO_ORO_MS = 60 * 1000;  // 1 minuto exacto para cada equipo

// ── Variables de estado ──────────────────────────────────────────
let minutoOroEquipoA = '';   // nombre del equipo asignado a la estrella A
let minutoOroEquipoB = '';   // nombre del equipo asignado a la estrella B

// Timer de la estrella A
let minutoAIntervalo    = null;
let minutoARestanteMs   = MINUTO_ORO_MS;
let minutoAFin          = 0;
let minutoAEnMarcha     = false;
let minutoATerminado    = false;

// Timer de la estrella B
let minutoBIntervalo    = null;
let minutoBRestanteMs   = MINUTO_ORO_MS;
let minutoBFin          = 0;
let minutoBEnMarcha     = false;
let minutoBTerminado    = false;

// Timers de los pop-ups
let minutoOroAsignarInterval = null;  // cuenta atrás del pop-up de sorteo
let minutoOroFinInterval     = null;  // cuenta atrás del pop-up de fin

// ── Montaje ──────────────────────────────────────────────────────
// Conecta todos los botones de la sección. Se llama UNA VEZ al arrancar.
function montarMinutoOro() {
    minutoOroAsignarBtn.addEventListener('click', sortearEquiposMinutoOro);
    minutoAIniciar.addEventListener('click', iniciarMinutoA);
    minutoAPausar.addEventListener('click',  pausarMinutoA);
    minutoAReset.addEventListener('click',   resetMinutoA);
    minutoBIniciar.addEventListener('click', iniciarMinutoB);
    minutoBPausar.addEventListener('click',  pausarMinutoB);
    minutoBReset.addEventListener('click',   resetMinutoB);
    // Botón "Puntuar equipos": salta a la pestaña de puntuaciones
    minutoOroPuntuacionesBtn.addEventListener('click', () => irAPuntuar('minuto-oro'));
    $('minuto-oro-volver').addEventListener('click', () => {
        pararMinutoOroSilencioso();
        volverSeleccion();
    });
}

// ── Inicialización ────────────────────────────────────────────────
// Se llama desde cargarPrueba(). Muestra la sección y la deja limpia.
function inicializarMinutoOro() {
    pararMinutoOroSilencioso();
    minutoOroCronos.classList.add('hidden');        // ocultar estrellas hasta sortear
    minutoOroPuntuacionesBtn.classList.add('hidden'); // ocultar hasta que acabe el primero
    minutoOroAsignarBtn.disabled = false;
    minutoOroAsignarEstado.textContent = '';
    resetMinutoA();
    resetMinutoB();
}

// ── Sortear equipos ───────────────────────────────────────────────
// Toma los dos equipos finalistas (top 2 de clasificación),
// los asigna al azar a cada estrella y muestra el pop-up de 5 s.
function sortearEquiposMinutoOro() {
    const top2Ids = obtenerTop2Clasificacion();
    const finalistas = top2Ids.length >= 2
        ? equipos.filter(e => top2Ids.includes(e.id))
        : equipos.slice(0, 2);

    if (finalistas.length < 2) {
        minutoOroAsignarEstado.textContent =
            'Necesitas al menos 2 equipos registrados para sortear.';
        return;
    }

    // Math.random() < 0.5 = lanzar una moneda para decidir el orden
    const [t1, t2] = Math.random() < 0.5
        ? [finalistas[0], finalistas[1]]
        : [finalistas[1], finalistas[0]];

    minutoOroEquipoA = t1.nombre;
    minutoOroEquipoB = t2.nombre;

    minutoOroAsignarBtn.disabled = true;

    // Pop-up compartido: dos líneas con el nombre de cada equipo
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Equipos del Minuto de Oro!';
    hazmePopupNombre.textContent =
        `⭐ ${escapar(minutoOroEquipoA)}\n⭐ ${escapar(minutoOroEquipoB)}`;
    hazmePopupCuenta.textContent = '5';
    hazmePopup.classList.remove('hidden');

    let cuenta = 5;
    clearInterval(minutoOroAsignarInterval);
    minutoOroAsignarInterval = setInterval(() => {
        cuenta--;
        hazmePopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(minutoOroAsignarInterval);
            minutoOroAsignarInterval = null;
            hazmePopup.classList.add('hidden');
            if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
            activarCronosMinutoOro();
        }
    }, 1000);
}

// ── Para el pop-up de sorteo silenciosamente ─────────────────────
function pararAsignarMinutoOroSilencioso() {
    clearInterval(minutoOroAsignarInterval);
    minutoOroAsignarInterval = null;
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
}

// ── Mostrar las dos estrellas tras el pop-up ─────────────────────
// Pone los nombres reales en las estrellas y muestra el bloque.
function activarCronosMinutoOro() {
    minutoANombre.textContent = minutoOroEquipoA;
    minutoBNombre.textContent = minutoOroEquipoB;
    minutoOroCronos.classList.remove('hidden');
    resetMinutoA();
    resetMinutoB();
}

// ── Pintar displays ───────────────────────────────────────────────
// Convierte ms en "MM:SS" y aplica el aviso de urgencia (últimos 10 s).
function pintarMinutoA(ms) {
    const seg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    minutoADisplay.textContent = `${m}:${s}`;
    minutoADisplay.classList.toggle('crono-final', ms <= 10000 && ms > 0);
}

function pintarMinutoB(ms) {
    const seg = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    minutoBDisplay.textContent = `${m}:${s}`;
    minutoBDisplay.classList.toggle('crono-final', ms <= 10000 && ms > 0);
}

// ── Iniciar / Pausar / Reiniciar — Estrella A ─────────────────────
function iniciarMinutoA() {
    if (minutoAEnMarcha || minutoATerminado) return;
    minutoAEnMarcha = true;
    // Si se reanuda desde pausa, minutoARestanteMs ya tiene el valor guardado
    minutoAFin = Date.now() + minutoARestanteMs;
    minutoAIniciar.disabled = true;
    minutoAPausar.disabled  = false;
    minutoAEstado.textContent = `¡1 minuto para ${minutoOroEquipoA || 'Equipo A'}!`;
    minutoAIntervalo = setInterval(() => {
        minutoARestanteMs = minutoAFin - Date.now();
        if (minutoARestanteMs <= 0) {
            minutoARestanteMs = 0;
            pintarMinutoA(0);
            terminarMinutoA();
        } else {
            pintarMinutoA(minutoARestanteMs);
        }
    }, 200);
}

function pausarMinutoA() {
    if (!minutoAEnMarcha) return;
    clearInterval(minutoAIntervalo);
    minutoAIntervalo  = null;
    minutoAEnMarcha   = false;
    minutoARestanteMs = Math.max(0, minutoAFin - Date.now());
    minutoAIniciar.disabled = false;
    minutoAPausar.disabled  = true;
    minutoAEstado.textContent = 'Pausa — pulsa Iniciar para continuar.';
}

function pararMinutoASilencioso() {
    clearInterval(minutoAIntervalo);
    minutoAIntervalo = null;
    minutoAEnMarcha  = false;
}

function resetMinutoA() {
    pararMinutoASilencioso();
    minutoARestanteMs = MINUTO_ORO_MS;
    minutoATerminado  = false;
    pintarMinutoA(MINUTO_ORO_MS);
    if (estrellaA) estrellaA.classList.remove('terminada');
    if (minutoADisplay) minutoADisplay.classList.remove('crono-final');
    if (minutoAIniciar) minutoAIniciar.disabled = false;
    if (minutoAPausar)  minutoAPausar.disabled  = true;
    if (minutoAEstado)  minutoAEstado.textContent = 'Listo para empezar.';
}

function terminarMinutoA() {
    pararMinutoASilencioso();
    minutoATerminado = true;
    pintarMinutoA(0);
    minutoADisplay.classList.remove('crono-final');
    estrellaA.classList.add('terminada');             // estrella se vuelve verde
    minutoAIniciar.disabled = true;
    minutoAPausar.disabled  = true;
    minutoAEstado.textContent = `¡Tiempo de ${minutoOroEquipoA || 'Equipo A'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden'); // aparece al terminar el primero
    bip(660);
    verificarFinMinutoOro();
}

// ── Iniciar / Pausar / Reiniciar — Estrella B ─────────────────────
function iniciarMinutoB() {
    if (minutoBEnMarcha || minutoBTerminado) return;
    minutoBEnMarcha = true;
    minutoBFin = Date.now() + minutoBRestanteMs;
    minutoBIniciar.disabled = true;
    minutoBPausar.disabled  = false;
    minutoBEstado.textContent = `¡1 minuto para ${minutoOroEquipoB || 'Equipo B'}!`;
    minutoBIntervalo = setInterval(() => {
        minutoBRestanteMs = minutoBFin - Date.now();
        if (minutoBRestanteMs <= 0) {
            minutoBRestanteMs = 0;
            pintarMinutoB(0);
            terminarMinutoB();
        } else {
            pintarMinutoB(minutoBRestanteMs);
        }
    }, 200);
}

function pausarMinutoB() {
    if (!minutoBEnMarcha) return;
    clearInterval(minutoBIntervalo);
    minutoBIntervalo  = null;
    minutoBEnMarcha   = false;
    minutoBRestanteMs = Math.max(0, minutoBFin - Date.now());
    minutoBIniciar.disabled = false;
    minutoBPausar.disabled  = true;
    minutoBEstado.textContent = 'Pausa — pulsa Iniciar para continuar.';
}

function pararMinutoBSilencioso() {
    clearInterval(minutoBIntervalo);
    minutoBIntervalo = null;
    minutoBEnMarcha  = false;
}

function resetMinutoB() {
    pararMinutoBSilencioso();
    minutoBRestanteMs = MINUTO_ORO_MS;
    minutoBTerminado  = false;
    pintarMinutoB(MINUTO_ORO_MS);
    if (estrellaB) estrellaB.classList.remove('terminada');
    if (minutoBDisplay) minutoBDisplay.classList.remove('crono-final');
    if (minutoBIniciar) minutoBIniciar.disabled = false;
    if (minutoBPausar)  minutoBPausar.disabled  = true;
    if (minutoBEstado)  minutoBEstado.textContent = 'Listo para empezar.';
}

function terminarMinutoB() {
    pararMinutoBSilencioso();
    minutoBTerminado = true;
    pintarMinutoB(0);
    minutoBDisplay.classList.remove('crono-final');
    estrellaB.classList.add('terminada');             // estrella se vuelve verde
    minutoBIniciar.disabled = true;
    minutoBPausar.disabled  = true;
    minutoBEstado.textContent = `¡Tiempo de ${minutoOroEquipoB || 'Equipo B'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden'); // aparece al terminar el primero
    bip(660);
    verificarFinMinutoOro();
}

// ── Verificar si los dos timers han terminado ─────────────────────
// Se llama al terminar cada timer. Si los dos han terminado → pop-up de fin.
function verificarFinMinutoOro() {
    if (minutoATerminado && minutoBTerminado) {
        terminarMinutoOro();
    }
}

// ── Pop-up de fin del Minuto de Oro ──────────────────────────────
// Aparece cuando los DOS cronómetros han llegado a 0.
function terminarMinutoOro() {
    bip(660);
    setTimeout(() => bip(660), 350);  // doble bip de fin

    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Minuto de Oro completado!';
    hazmePopupNombre.textContent =
        `${escapar(minutoOroEquipoA)} ⭐\n${escapar(minutoOroEquipoB)} ⭐`;
    hazmePopupCuenta.textContent = '✓';
    hazmePopup.classList.remove('hidden');

    let cuenta = 5;
    clearInterval(minutoOroFinInterval);
    minutoOroFinInterval = setInterval(() => {
        cuenta--;
        if (cuenta > 0) {
            hazmePopupCuenta.textContent = cuenta;
        } else {
            clearInterval(minutoOroFinInterval);
            minutoOroFinInterval = null;
            hazmePopup.classList.add('hidden');
            if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
        }
    }, 1000);
}

// ── Para silenciosamente todos los timers del Minuto de Oro ──────
// Cancela los cuatro timers posibles (A, B, sorteo, fin) sin tocar UI.
// Lo llaman ocultarSeccionesSorteo() y volverSeleccion().
function pararMinutoOroSilencioso() {
    pararMinutoASilencioso();
    pararMinutoBSilencioso();
    pararAsignarMinutoOroSilencioso();
    clearInterval(minutoOroFinInterval);
    minutoOroFinInterval = null;
}


/* ================================================================
   14) MODO PUNTUACIÓN — Equipos y rúbrica
   ---------------------------------------------------------------- */

function montarPuntuacion() {
    $('form-equipo').addEventListener('submit', e => {
        e.preventDefault();
        const nombre   = $('equipo-nombre').value.trim();
        const profesor = $('equipo-profesor').value.trim();
        const alumnos  = [...document.querySelectorAll('.alumno-input')].map(i => i.value.trim());
        if (!nombre || !profesor || alumnos.some(a => !a)) return;

        equipos.push({
            id: 'eq_' + Date.now(),
            nombre, profesor, alumnos
        });
        guardarEquipos();
        renderEquipos();
        refrescarSelectoresEquipos();
        e.target.reset();
    });

    $('punt-equipo').addEventListener('change', actualizarSelectorAlumnos);
    $('guardar-puntuacion').addEventListener('click', guardarPuntuacion);

    // Al cambiar la prueba, regenerar la rúbrica con sus criterios específicos
    $('punt-prueba').addEventListener('change', () => {
        limpiarRubrica();
        renderRubrica($('punt-prueba').value);
    });
}

function renderEquipos() {
    const cont = $('equipos-lista');
    if (equipos.length === 0) {
        cont.innerHTML = '<p class="ayuda">No hay equipos registrados todavía.</p>';
        return;
    }
    cont.innerHTML = equipos.map(eq => {
        const total = totalEquipo(eq.id, 'total');
        return `
            <div class="equipo-card">
                <div class="equipo-info">
                    <h4>${escapar(eq.nombre)}</h4>
                    <div>Profesor: <strong>${escapar(eq.profesor)}</strong></div>
                    <div class="equipo-alumnos">${eq.alumnos.map(escapar).join(' · ')}</div>
                </div>
                <div class="equipo-puntos">${total} pts</div>
                <button class="btn-borrar-equipo" data-id="${eq.id}">Borrar</button>
            </div>`;
    }).join('');

    cont.querySelectorAll('.btn-borrar-equipo').forEach(b => {
        b.addEventListener('click', () => {
            const id = b.dataset.id;
            if (!confirm('¿Borrar este equipo y todas sus puntuaciones?')) return;
            equipos      = equipos.filter(e => e.id !== id);
            puntuaciones = puntuaciones.filter(p => p.equipoId !== id);
            guardarEquipos();
            guardarPuntuaciones();
            renderEquipos();
            refrescarSelectoresEquipos();
        });
    });
}

function refrescarSelectoresEquipos() {
    const sel = $('punt-equipo');
    sel.innerHTML = '<option value="">— elige —</option>' +
        equipos.map(e => `<option value="${e.id}">${escapar(e.nombre)}</option>`).join('');
    actualizarSelectorAlumnos();
    if (!hazmeFanSection.classList.contains('hidden'))      renderHazmeEquipos();
    if (!ruletaEquiposSelector.classList.contains('hidden')) renderRuletaEquipos();
}

function actualizarSelectorAlumnos() {
    const id = $('punt-equipo').value;
    const sel = $('punt-alumno');
    if (!id) { sel.innerHTML = '<option value="">— elige —</option>'; return; }
    const eq = equipos.find(e => e.id === id);
    if (!eq) return;
    sel.innerHTML = '<option value="">— elige —</option>' +
        eq.alumnos.map((a, i) => `<option value="${i}">${escapar(a)}</option>`).join('');
}

// Genera la rúbrica para la prueba indicada.
// Sin prueba → mensaje de ayuda. Con prueba → criterios específicos + total dinámico.
function renderRubrica(prueba) {
    const cont     = $('rubrica');
    const maxEl    = $('punt-max');
    const criterios = getCriteriosPrueba(prueba);

    if (!criterios.length) {
        cont.innerHTML = '<p class="ayuda" style="margin:1rem 0">Selecciona una prueba para ver los criterios de evaluación.</p>';
        if (maxEl) maxEl.textContent = '/ —';
        actualizarTotal(prueba);
        return;
    }

    cont.innerHTML = criterios.map(c => `
        <div class="criterio" data-criterio="${c.id}">
            <div class="criterio-nombre">${c.nombre}</div>
            <div class="criterio-opciones">
                ${[1,2,3,4].map(v => `<div class="opcion-puntos" data-valor="${v}">${v}</div>`).join('')}
            </div>
        </div>
    `).join('');

    if (maxEl) maxEl.textContent = `/ ${criterios.length * 4}`;

    cont.querySelectorAll('.criterio').forEach(div => {
        const cid = div.dataset.criterio;
        div.querySelectorAll('.opcion-puntos').forEach(op => {
            op.addEventListener('click', () => {
                div.querySelectorAll('.opcion-puntos').forEach(o => o.classList.remove('seleccionada'));
                op.classList.add('seleccionada');
                rubricaActual[cid] = parseInt(op.dataset.valor, 10);
                actualizarTotal(prueba);
            });
        });
    });
    actualizarTotal(prueba);
}

function actualizarTotal(prueba) {
    const p         = prueba ?? $('punt-prueba').value;
    const criterios = getCriteriosPrueba(p);
    const total     = criterios.reduce((s, c) => s + (rubricaActual[c.id] || 0), 0);
    $('punt-total').textContent = total;
}

function limpiarRubrica() {
    rubricaActual = {};
    document.querySelectorAll('#rubrica .opcion-puntos').forEach(o => o.classList.remove('seleccionada'));
    actualizarTotal();
}

function guardarPuntuacion() {
    const equipoId  = $('punt-equipo').value;
    const alumnoIdx = $('punt-alumno').value;
    const prueba    = $('punt-prueba').value;

    if (!equipoId || alumnoIdx === '' || !prueba) {
        alert('Elige equipo, alumno y prueba antes de guardar.');
        return;
    }
    const criterios = getCriteriosPrueba(prueba);
    if (criterios.some(c => !rubricaActual[c.id])) {
        alert(`Puntúa los ${criterios.length} criterios (1 a 4) antes de guardar.`);
        return;
    }
    const total = criterios.reduce((s, c) => s + rubricaActual[c.id], 0);

    puntuaciones.push({
        id: 'p_' + Date.now(),
        equipoId,
        alumnoIdx: parseInt(alumnoIdx, 10),
        prueba,
        criterios: { ...rubricaActual },
        total,
        fecha: new Date().toISOString()
    });
    guardarPuntuaciones();
    renderEquipos();

    alert(`Puntuación guardada: ${total} puntos.`);
    limpiarRubrica();
}

// Salto rápido desde la sección de ruleta al formulario de puntuación.
function irAPuntuar(prueba) {
    document.querySelector('.tab[data-modo="puntuacion"]').click();
    if (prueba) {
        $('punt-prueba').value = prueba;
        limpiarRubrica();
        renderRubrica(prueba);
    }
}


/* ================================================================
   15) MODO RANKING
   ---------------------------------------------------------------- */

function montarRanking() {
    $('ranking-fase').addEventListener('change', renderRanking);
}

// Suma de puntos de un equipo, filtrando por fase si procede.
function totalEquipo(equipoId, fase = 'total') {
    return puntuaciones
        .filter(p => p.equipoId === equipoId)
        .filter(p => {
            if (fase === 'clasificacion') return FASE_CLASIFICACION.includes(p.prueba);
            if (fase === 'final')         return FASE_FINAL.includes(p.prueba);
            return true;
        })
        .reduce((s, p) => s + p.total, 0);
}

function renderRanking() {
    const fase = $('ranking-fase').value;
    const cont = $('ranking-tabla');

    if (equipos.length === 0) {
        cont.innerHTML = '<div class="ranking-vacio">Aún no hay equipos registrados.</div>';
        return;
    }

    const filas = equipos.map(eq => ({
        eq,
        total: totalEquipo(eq.id, fase),
        pruebasPuntuadas: puntuaciones
            .filter(p => p.equipoId === eq.id)
            .filter(p => fase === 'total' ||
                (fase === 'clasificacion' && FASE_CLASIFICACION.includes(p.prueba)) ||
                (fase === 'final'         && FASE_FINAL.includes(p.prueba)))
            .length
    }));

    filas.sort((a, b) => b.total - a.total);

    cont.innerHTML = filas.map((f, i) => {
        const top = i < 3 ? `top-${i+1}` : '';
        return `
            <div class="ranking-fila ${top}">
                <div class="pos">${i + 1}º</div>
                <div>
                    <div class="nombre-equipo">${escapar(f.eq.nombre)}</div>
                    <div class="detalle-equipo">Profesor: ${escapar(f.eq.profesor)} · ${f.pruebasPuntuadas} intervenciones puntuadas</div>
                </div>
                <div class="puntos-totales">${f.total} pts</div>
            </div>`;
    }).join('');
}


/* ================================================================
   16) UTILIDADES
   ---------------------------------------------------------------- */

// Escapa HTML para evitar inyección al pintar nombres de equipos/alumnos.
function escapar(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
