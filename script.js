/* 1) CONFIGURACIÓN GLOBAL DE PRUEBAS. */
const FASE_CLASIFICACION = ['hazme-fan', 'fabrica-historias', 'voces-derecho', 'duelo-personajes'];
const FASE_FINAL         = ['declamacion', 'palabra-caliente', 'duelo-personajes-final', 'minuto-oro'];

const SALAS_ORDEN = ['Auditorio', 'Ludoteca', 'Poli 2'];

let salaSorteoActual  = '';
let rondaSorteoActual = '';
let rondaActual       = '';

function equiposDeSalaYRonda(sala, turno) {
    if (!sala) return equipos;
    const turnoEfectivo = turno || '1';
    const idx = SALAS_ORDEN.indexOf(sala);
    if (idx === -1) return equipos;
    const idxOrigen = ((idx - (Number(turnoEfectivo) - 1)) % 3 + 3) % 3;
    const salaOrigen = SALAS_ORDEN[idxOrigen];
    const filtrados = equipos.filter(e => e.sala === salaOrigen);
    return filtrados.length ? filtrados : equipos;
}

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
        descripcion: 'En esta prueba, el alumno o la alumna deberá realizar un discurso oral sobre un artículo o derecho constitucional que elegirá por azar de entre la selección aquí mostrada. El objetivo no es la mera memorización, sino explicar con palabras propias en qué consiste el derecho, por qué es importante, cómo se protege y qué problemas podrían surgir si no se respetara.',
        columnas: ['numero', 'descripcion'],
        tipo: 'simple'
    },
    'duelo-personajes': {
        titulo: 'Prueba 4 — Duelo de Personajes',
        descripcion: 'En esta prueba, el alumno o la alumna deberá defender a un personaje frente a otro personaje contrapuesto, mostrando por qué es mejor, más admirable o más completo. Se busca desarrollar la capacidad de argumentación comparativa y de persuasión oral. En la fase de clasificación, la prueba se plantea como una intervención individual: el participante defiende el personaje que quiera de la dupla que le haya sido asignada por azar, y realiza la comparación con su antagonista sin enfrentamiento directo entre dos equipos.',
        columnas: ['personaje_a', 'personaje_b'],
        tipo: 'dupla'
    },
    'declamacion': {
        titulo: 'Final 1 — Declamación',
        descripcion: 'En esta prueba, el alumno o la alumna deberá leer e interpretar un texto en voz alta, transmitiendo su significado mediante la entonación, el ritmo, la emoción y la expresividad. El objetivo es evaluar la expresión oral interpretativa, la capacidad de transmitir emociones y el control de la voz.',
        columnas: ['genero', 'titulo', 'texto'],
        tipo: 'genero-texto'
    },
    'palabra-caliente': {
        titulo: 'Final 2 — La Palabra Caliente',
        descripcion: 'En esta prueba, dos participantes, cada uno perteneciente a un equipo distinto, deberán construir un discurso de forma alterna a partir de una situación comunicativa común. Cada alumno tendrá que continuar la intervención del anterior, manteniendo el sentido, la coherencia y el interés del discurso. La prueba evalúa improvisación, escucha activa y capacidad para construir un discurso compartido.',
        columnas: ['nombre', 'descripcion'],
        tipo: 'simple'
    },
    'duelo-personajes-final': {
        titulo: 'Final 3 — Duelo de Personajes',
        descripcion: 'Esta prueba mantiene la misma esencia que el duelo de personajes de la fase de clasificación, pero incorpora un componente de debate directo entre participantes. Dos alumnos, uno de cada equipo, deberán defender personajes contrapuestos, comparándolos y respondiendo a los argumentos del rival. En la final se añade incertidumbre, escucha activa y réplica directa.',
        columnas: ['personaje_a', 'personaje_b'],
        tipo: 'dupla'
    },
    'minuto-oro': {
        titulo: 'Final 4 — El Minuto de Oro',
        descripcion: 'En esta prueba, un representante de cada equipo realizará un discurso breve y persuasivo para convencer al jurado de por qué su equipo debe ganar la final del II Concurso de Oratoria. Se trata de un elevator pitch preparado previamente en el que deberá sintetizar ideas, emocionar y persuadir en un tiempo muy limitado.',
        tipo: 'minuto-oro'
    }
};

const CRITERIOS_POR_PRUEBA = {
    'hazme-fan': [
        { id: 'opinion',   nombre: 'Contenido y argumentos', descripciones: { 1: 'Apenas explica por qué recomienda la obra.', 2: 'Da pocas razones o demasiado generales.', 3: 'Da razones adecuadas, aunque poco desarrolladas.', 4: 'Da razones claras, bien explicadas y personales.' } },
        { id: 'razones',   nombre: 'Persuasión y emoción',    descripciones: { 1: 'No trasmite ganas de leer o ver la obra', 2: 'Proyecta poca emoción o un tono plano', 3: 'Muestra interes y emoción en varios momentos', 4: 'Transmite mucha emoción y entusiasmo; engancha al público' } },
        { id: 'emocion',   nombre: 'Expresión oral',           descripciones: { 1: 'Presenta dificultades claras para expresarse', 2: 'A veces habla bajo o excesivamente rápido', 3: 'Se le entiende bien, con pequeños fallos', 4: 'Habla con claridad buen volumen, ritmo y entonación' } },
        { id: 'enganchar', nombre: 'Lenguaje corporal',         descripciones: { 1: 'Evita mirar al público o adopta una postura cerrada', 2: 'Muestra poco contacto visual o movimientos nerviosos', 3: 'Mantiene contacto visual , frecuente y postura correcta', 4: 'Mantiene buen contacto visual , gestos naturales y postura segura.' } },
        { id: 'organizar', nombre: 'Organización del discurso', descripciones: { 1: 'El discurso resulta confuso', 2: 'Las ideas aparecen poco conectadas', 3: 'Está bien organizado, aunque con algun desajuste', 4: 'El discurso es claro, ordenado y finaliza con un buen cierre' } }
    ],
    'fabrica-historias': [
        { id: 'inicio',    nombre: 'Creatividad',descripciones: { 1: ' La historia es muy pobre o incoherente. ', 2: ' La historia es sencilla y poco original. ', 3: ' La historia resulta interesante y bien planteada. ', 4: 'La historia es muy original e imaginativa. ' } },
        { id: 'nudo',      nombre: 'Estructura narrativa ', descripciones: { 1: 'No se distingue la estructura narrativa. .', 2: 'Falta claridad en alguna de las partes. .', 3: 'Las tres partes están presentes. ', 4: 'Inicio, nudo y desenlace están muy claros. ' } },
        { id: 'desenlace', nombre: 'Coherencia ', descripciones: { 1: 'La historia resulta difícil de entender. ', 2: 'Contiene varias partes confusas. ', 3: 'Presenta algún pequeño salto, pero se entiende. ', 4: 'La historia tiene sentido de principio a fin. ' } },
        { id: 'personajes', nombre: 'Expresión oral  ', descripciones: { 1: 'Presenta dificultades claras al hablar.  ', 2: 'A veces no se le entiende.  ', 3: 'Se expresa bien, con pequeños fallos. ', 4: 'Voz clara, buen ritmo y entonación adecuada.  ' } },   
        { id: 'emocion',   nombre: 'Lenguaje corporal y expresividad  ', descripciones: { 1: 'Su lenguaje corporal es inexistente o bloqueado.  ', 2: 'Muestra muy poca expresión corporal.  ', 3: 'Acompaña la historia con algunos gestos.  ', 4: 'Usa gestos, mirada y expresión facial al servicio del relato.  ' } }
    ],
    'voces-derecho': [
        { id: 'explicar',    nombre: 'Comprensión del artículo o derecho ', descripciones: { 1: 'No se entiende el derecho elegido. ', 2: 'La explicación es incompleta o poco clara. ', 3: 'Lo explica bien, aunque de manera sencilla. ', 4: 'Lo explica con claridad y con sus propias palabras. ' } },
        { id: 'argumentar',  nombre: 'Razonamiento y argumentos ', descripciones: { 1: 'Apenas aporta razones. ', 2: 'Sus razones están poco desarrolladas. ', 3: 'Aporta razones adecuadas. ', 4: 'Aporta razones claras y bien pensadas. ' } },
        { id: 'defender',    nombre: 'Organización del discurso ' ,descripciones: { 1: 'Es muy desorganizado.  ', 2: 'Resulta algo desordenado. ', 3: 'Bien organizado, con pequeños saltos.  ', 4: 'Discurso muy ordenado y fácil de seguir.  ' } },
        { id: 'reflexionar', nombre: 'Expresión oral ' ,descripciones: { 1: 'Presenta dificultades claras para expresarse. ', 2: 'A veces habla bajo o muy rápido.   ', 3: 'Se le entiende bien.  ', 4: 'Habla con claridad, volumen y ritmo adecuados.  ' } },
        { id: 'lenguaje', nombre: 'Lenguaje corporal y seguridad  ' ,descripciones: { 1: 'Evita mirar al público o muestra bloqueo.  ', 2: 'Presenta poco contacto visual.   ', 3: 'Mantiene contacto visual frecuente.   ', 4: 'Mantiene buen contacto visual y postura segura.   ' } }

    ],
    'duelo-personajes': [
        { id: 'argumentacion', nombre: 'Argumentación comparativa' ,descripciones: { 1: 'Apenas compara.   ', 2: 'Las comparaciones son poco claras.   ', 3: 'Compara bien, aunque de forma sencilla.   ', 4: 'Compara con claridad y buenos argumentos.  ' } },
        { id: 'defensa',       nombre: 'Defensa del personaje' ,descripciones: { 1: 'La defensa es muy pobre.  ', 2: 'Su defensa es poco desarrollada.  ', 3: 'Defiende bien al personaje.  ', 4: 'Destaca muy bien sus cualidades y valores.   ' } },
        { id: 'replica',       nombre: 'Capacidad de respuesta ' ,descripciones: { 1: 'No logra reforzar su postura.  ', 2: 'Sus respuestas resultan poco claras.  ', 3: 'Responde o refuerza adecuadamente.', 4: 'Refuerza su postura con rapidez y buenos argumentos cuando procede.  ' } },
        { id: 'expresion',     nombre: 'Expresión oral' ,descripciones: { 1: 'Presenta dificultad clara al hablar. ', 2: 'A veces no se le entiende.  ', 3: 'Se le entiende bien. ', 4: 'Voz clara, buen ritmo y entonación. ' } },  
        { id: 'actitud',      nombre: 'Actitud y respeto' ,descripciones: { 1: 'Su actitud resulta poco respetuosa.  ', 2: 'Se aprecia algún comentario inadecuado.  ', 3: 'Mantiene una actitud correcta.  ', 4: 'Expone con respeto y seguridad.' } }
    ],
    'declamacion': [
        { id: 'expresividad', nombre: 'Expresividad e intención',descripciones: { 1: 'Realiza una lectura plana y sin emoción. ', 2: 'Proyecta poca expresividad. ', 3: 'Buena intención comunicativa ', 4: 'Transmite emociones claramente y con intención.  ' } },
        { id: 'voz',          nombre: 'Uso de la voz', descripciones: { 1: 'La voz resulta monótona o muy baja.  ', 2: 'Su uso de la voz es limitado.   ', 3: 'Hace un buen uso de la voz.  ', 4: 'Varía tono y volumen adecuadamente.' } },
        { id: 'ritmo',        nombre: 'Ritmo y pausas', descripciones: { 1: 'El ritmo es inadecuado.', 2: 'A veces resulta demasiado rápido o demasiado lento.  ', 3: 'El ritmo es correcto.   ', 4: 'Mantiene un ritmo adecuado con pausas naturales.   ' } },
        { id: 'comprension',  nombre: 'Comprensión del texto', descripciones: { 1: 'No transmite el sentido del texto.   ', 2: 'La interpretación resulta poco clara.   ', 3: 'Comprende bien el texto.  ', 4: 'Interpreta claramente el significado.  ' } },
        { id: 'presencia',    nombre: 'Seguridad y presencia escénica', descripciones: { 1: 'Se muestra muy nervioso o evita mirar.  ', 2: 'Se aprecia cierta inseguridad.  ', 3: 'Muestra una buena seguridad  ', 4: 'Mira al público y transmite confianza. ' } }
    ],
    'palabra-caliente': [
        { id: 'escucha',    nombre: 'Escucha y adaptación',descripciones: { 1: 'No conecta con el discurso del otro participante. ', 2: 'La adaptación es limitada.   ', 3: 'Muestra buena adaptación.  ', 4: 'Responde perfectamente a lo dicho por el otro. ' } },
        { id: 'coherencia', nombre: 'Coherencia de la intervención', descripciones: { 1: 'No guarda relación con el discurso.  ', 2: 'Resulta algo desconectada.  ', 3: 'La intervención es coherente.  ', 4: 'La intervención es muy clara y conectada.   ' } },
        { id: 'aportacion', nombre: 'Aportación de ideas', descripciones: { 1: 'Apenas aporta contenido.  ', 2: 'Las ideas están poco desarrolladas.  ', 3: 'Aporta ideas adecuadas.  ', 4: 'Añade ideas relevantes y originales.  ' } },
        { id: 'expresion',  nombre: 'Expresión oral', descripciones: { 1: 'La expresión resulta poco clara. ', 2: 'Se aprecian algunas dificultades.  ', 3: 'Presenta una buena expresión oral.  ', 4: 'Habla con claridad y seguridad. ' } },
        { id: 'fluidez',    nombre: 'Seguridad y fluidez', descripciones: { 1: 'Se muestra muy inseguro.  ', 2: 'Se aprecia cierta inseguridad. ', 3: 'Muestra seguridad adecuada. ', 4: 'Interviene con naturalidad y confianza.   ' } }
    ],
    'duelo-personajes-final': [
        { id: 'argumentacion', nombre: 'Argumentación comparativa',descripciones: { 1: 'Apenas compara.', 2: 'Las comparaciones son poco claras.', 3: 'Realiza una comparación adecuada.', 4: 'Compara claramente con buenos argumentos. ' } },
        { id: 'defensa',       nombre: 'Defensa del personaje', descripciones: { 1: 'La defensa es muy pobre. ', 2: 'La defensa es limitada.', 3: 'Realiza una buena defensa.', 4: 'Destaca muy bien sus cualidades ' } },
        { id: 'replica',       nombre: 'Capacidad de réplica', descripciones: { 1: 'No logra responder', 2: 'La respuesta es poco clara.', 3: 'Ofrece una buena respuesta.', 4: 'Responde con rapidez y refuta argumentos. ' } },
        { id: 'escucha',       nombre: 'Escucha activa', descripciones: { 1: 'No conecta con el rival. ', 2: 'La escucha es limitada.', 3: 'Escucha de forma adecuada.', 4: 'Responde directamente a lo dicho por el rival.  ' } },
        { id: 'expresion',     nombre: 'Expresión oral', descripciones: { 1: 'Presenta dificultad clara al hablar. ', 2: 'A veces no se le entiende. ', 3: 'Se le entiende bien.', 4: 'Voz clara, segura y convincente.' } }
    ],
    'minuto-oro': [
        { id: 'persuasion',  nombre: 'Capacidad de persuasión',descripciones: { 1: 'No logra persuadir ', 2: 'El discurso resulta poco convincente.', 3: 'El discurso es persuasivo. ', 4: 'El discurso resulta muy convincente.' } },
        { id: 'estructura',  nombre: 'Estructura del discurso', descripciones: { 1: 'El discurso es desordenado.', 2: 'La organizacion es limitada.', 3: 'Presenta buena organización.', 4: 'Esta muy bien organizado y es muy claro ' } },
        { id: 'expresion',   nombre: 'Expresión oral y seguridad', descripciones: { 1: 'Presenta dificultad hablar.  ', 2: 'Se aprecian algunas dudas. ', 3: 'Presenta buena expresión oral. ', 4: 'Habla con claridad y confianza ' } },
        { id: 'creatividad', nombre: 'Creatividad y originalidad', descripciones: { 1: 'El discurso es muy básico.', 2: 'Resulta poco creativo. ', 3: 'Incluye algún elemento creativo.', 4: 'Hace un uso creativo del humor o de otros recursos.' } },
        { id: 'respeto',     nombre: 'Trabajo en equipo y respeto ', descripciones: { 1: 'No incorpora estos aspectos  ', 2: 'La mención al equipo es limitada.', 3: 'Reconoce adecuadamente al equipo. ', 4: 'Destaca  bien al equipo y respeta al rival.' } }
    ]
};

function getCriteriosPrueba(prueba) {
    return CRITERIOS_POR_PRUEBA[prueba] || [];
}


/*
   2) ESTADO Y PERSISTENCIA ----- */
let datosPrueba = {};
let usados = {};
let canvasList = [];

let equipos = [];
let logoBase64Cache = null;
let puntuaciones = [];
let rubricaActual = {};

const API_DATOS = '/api/datos';

function mostrarEstadoServidor(texto, esError) {
    const el = $('servidor-estado');
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle('error', !!esError);
}

async function precargarLogo() {
    try {
        const resp = await fetch('/api/logo');
        if (!resp.ok) return;
        const { base64 } = await resp.json();
        if (base64) logoBase64Cache = base64;
    } catch { logoBase64Cache = null; }
}

async function cargarDatos() {
    try {
        const respuesta = await fetch(API_DATOS);
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        equipos      = Array.isArray(datos.equipos)      ? datos.equipos      : [];
        puntuaciones = Array.isArray(datos.puntuaciones) ? datos.puntuaciones : [];
        mostrarEstadoServidor(`✓ Servidor conectado — ${equipos.length} equipos cargados`);
    } catch (err) {
        console.error('[API] Error al cargar datos:', err);
        equipos      = [];
        puntuaciones = [];
        mostrarEstadoServidor(
            '✗ No se puede conectar con el servidor. Abre la página desde iniciar.bat (http://localhost:3000)',
            true
        );
    }
}

async function guardarDatos() {
    try {
        const respuesta = await fetch(API_DATOS, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ equipos, puntuaciones })
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        mostrarEstadoServidor(`✓ Guardado — ${equipos.length} equipos`);
        return true;
    } catch (err) {
        console.error('[API] Error al guardar datos:', err);
        mostrarEstadoServidor('✗ Error al guardar. Comprueba que el servidor está arrancado.', true);
        return false;
    }
}

function aplicarDatosServidor(datos) {
    equipos      = Array.isArray(datos.equipos)      ? datos.equipos      : equipos;
    puntuaciones = Array.isArray(datos.puntuaciones) ? datos.puntuaciones : puntuaciones;
    mostrarEstadoServidor(`✓ Guardado — ${equipos.length} equipos`);
}



/*3) ATAJOS AL DOM */
const $ = id => document.getElementById(id);
const pruebaSelect        = $('prueba-select');
const cargarPruebaBtn     = $('cargar-prueba');
const ruletaSection       = $('ruleta-section');
const tituloPrueba        = $('titulo-prueba');
const ruletaContainer     = $('ruleta-container');
const girarBtn            = $('girar-btn');
const usarCsvBtn          = $('usar-csv-btn');
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

const hazmeFanSection    = $('hazme-fan-section');
const cronoDisplay       = $('cronometro-display');
const cronoIniciar       = $('crono-iniciar');
const cronoPausar        = $('crono-pausar');
const cronoReset         = $('crono-reset');
const cronoEstado        = $('crono-estado');
const hazmeFanVolver     = $('hazme-fan-volver');

const hazmeEquiposGrid    = $('hazme-equipos-grid');
const hazmeSeleccionarBtn = $('hazme-seleccionar-btn');
const hazmeEstado         = $('hazme-selector-estado');
const hazmePopup          = $('hazme-popup');
const hazmePopupNombre    = $('hazme-popup-nombre');
const hazmePopupCuenta    = $('hazme-popup-cuenta');

const ruletaEquiposSelector = $('ruleta-equipos-selector');
const ruletaEquiposGrid     = $('ruleta-equipos-grid');
const ruletaSeleccionarBtn  = $('ruleta-seleccionar-btn');
const ruletaSelectorEstado  = $('ruleta-selector-estado');

const fabricaCrono       = $('fabrica-crono');
const fabricaDisplay     = $('fabrica-display');
const fabricaFaseNombre  = $('fabrica-fase-nombre');
const fabricaIniciar     = $('fabrica-iniciar');
const fabricaDiscurso    = $('fabrica-discurso');
const fabricaPausar      = $('fabrica-pausar');
const fabricaReset       = $('fabrica-reset');
const fabricaEstado      = $('fabrica-estado');
const avisoRepetida      = $('aviso-repetida');

const vocesCrono         = $('voces-crono');
const vocesDisplay       = $('voces-display');
const vocesIniciar       = $('voces-iniciar');
const vocesPausar        = $('voces-pausar');
const vocesReset         = $('voces-reset');
const vocesEstado        = $('voces-estado');

const dueloEleccion      = $('duelo-eleccion');
const dueloBtnA          = $('duelo-btn-a');
const dueloBtnB          = $('duelo-btn-b');
const dueloCrono         = $('duelo-crono');
const dueloDisplay       = $('duelo-display');
const dueloFaseNombre    = $('duelo-fase-nombre');
const dueloIniciar       = $('duelo-iniciar');
const dueloArgumentar    = $('duelo-argumentar');
const dueloPausar        = $('duelo-pausar');
const dueloReset         = $('duelo-reset');
const dueloEstado        = $('duelo-estado');

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

const declaCrono         = $('decla-crono');
const declaDisplay       = $('decla-display');
const declaFaseNombre    = $('decla-fase-nombre');
const declaIniciar       = $('decla-iniciar');
const declaDiscurso      = $('decla-discurso');
const declaPausar        = $('decla-pausar');
const declaReset         = $('decla-reset');
const declaEstado        = $('decla-estado');

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

const minutoOroSection       = $('minuto-oro-section');
const minutoOroAsignarDiv    = $('minuto-oro-asignar');
const minutoOroAsignarBtn    = $('minuto-oro-asignar-btn');
const minutoOroAsignarEstado = $('minuto-oro-asignar-estado');
const minutoOroCronos        = $('minuto-oro-cronos');
const estrellaA              = $('estrella-a');
const estrellaB              = $('estrella-b');
const estrellaC              = $('estrella-c');
const estrellaD              = $('estrella-d');
const minutoADisplay         = $('minuto-a-display');
const minutoBDisplay         = $('minuto-b-display');
const minutoCDisplay         = $('minuto-c-display');
const minutoDDisplay         = $('minuto-d-display');
const minutoANombre          = $('minuto-a-nombre');
const minutoBNombre          = $('minuto-b-nombre');
const minutoCNombre          = $('minuto-c-nombre');
const minutoDNombre          = $('minuto-d-nombre');
const minutoAIniciar         = $('minuto-a-iniciar');
const minutoBIniciar         = $('minuto-b-iniciar');
const minutoCIniciar         = $('minuto-c-iniciar');
const minutoDIniciar         = $('minuto-d-iniciar');
const minutoAPausar          = $('minuto-a-pausar');
const minutoBPausar          = $('minuto-b-pausar');
const minutoCPausar          = $('minuto-c-pausar');
const minutoDPausar          = $('minuto-d-pausar');
const minutoAReset           = $('minuto-a-reset');
const minutoBReset           = $('minuto-b-reset');
const minutoCReset           = $('minuto-c-reset');
const minutoDReset           = $('minuto-d-reset');
const minutoAEstado          = $('minuto-a-estado');
const minutoBEstado          = $('minuto-b-estado');
const minutoCEstado          = $('minuto-c-estado');
const minutoDEstado          = $('minuto-d-estado');
const minutoOroPuntuacionesBtn   = $('minuto-oro-puntuaciones');

const fabricaPopup          = $('fabrica-popup');
const fabricaPopupContexto  = $('fabrica-popup-contexto');
const fabricaPopupProblema  = $('fabrica-popup-problema');
const fabricaPopupPersonaje = $('fabrica-popup-personaje');
const fabricaPopupCerrar    = $('fabrica-popup-cerrar');


/* 4) ARRANQUE */
document.addEventListener('DOMContentLoaded', init);
async function init() {
    await Promise.all([cargarDatos(), precargarLogo()]);
    montarTabs();
    montarModalContrasena();
    montarSorteos();
    montarHazmeFan();
    montarHazmeSelector();
    montarRuletaSelector();
    montarFabrica();
    montarFabricaPopup();
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
    poblarColegiosFijos();
}


// /* 5) NAVEGACIÓN ENTRE PESTAÑAS */
const TABS_PROTEGIDAS = ['equipos', 'ranking'];
const CONTRASENA_TABS = 'oratoria2025';
let tabsDesbloqueadas = false;
let tabPendiente = null;

function montarTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const modo = tab.dataset.modo;
            if (TABS_PROTEGIDAS.includes(modo) && !tabsDesbloqueadas) {
                tabPendiente = modo;
                $('modal-contrasena').classList.remove('hidden');
                setTimeout(() => $('modal-input-pass').focus(), 50);
                return;
            }
            activarTab(modo);
        });
    });
}

function activarTab(modo) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-activa'));
    document.querySelector(`.tab[data-modo="${modo}"]`).classList.add('tab-activa');
    document.querySelectorAll('.modo').forEach(m => m.classList.remove('activo'));
    $('modo-' + modo).classList.add('activo');
    if (modo === 'ranking') { renderRanking(); renderDetalleRanking(); }
}

function montarModalContrasena() {
    const modal    = $('modal-contrasena');
    const input    = $('modal-input-pass');
    const error    = $('modal-error');
    const cancelar = $('modal-cancelar');
    const confirmar = $('modal-confirmar');

    function cerrar() {
        modal.classList.add('hidden');
        input.value = '';
        error.classList.add('hidden');
        tabPendiente = null;
    }

    function intentar() {
        if (input.value === CONTRASENA_TABS) {
            tabsDesbloqueadas = true;
            const destino = tabPendiente;
            cerrar();
            activarTab(destino);
        } else {
            error.classList.remove('hidden');
            input.value = '';
            input.focus();
        }
    }

    cancelar.addEventListener('click', cerrar);
    confirmar.addEventListener('click', intentar);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') intentar(); });
    modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
}

/* 6) MODO SORTEOS — Carga y navegación.-*/
function montarSorteos() {
    cargarPruebaBtn.addEventListener('click', cargarPrueba);
    procesarCsvBtn.addEventListener('click', procesarCsv);
    girarBtn.addEventListener('click', girarRuleta);
    volverBtn.addEventListener('click', volverSeleccion);
    limpiarHistorialBtn.addEventListener('click', limpiarHistorial);
    usarCsvBtn.addEventListener('click', () => {
        csvUpload.classList.remove('hidden');
        usarCsvBtn.classList.add('hidden');
    });
    $('cerrar-prueba-overlay').addEventListener('click', cerrarPruebaOverlay);
    $('cerrar-crono-overlay').addEventListener('click', () => { ocultarCronoGigante(); cerrarCronoOverlay(); volverSeleccion(); });
    $('crono-gigante-cerrar').addEventListener('click', ocultarCronoGigante);

    $('sorteo-sala-select').addEventListener('change', e => {
        salaSorteoActual = e.target.value;
        actualizarSesionInfo();
        renderHazmeEquipos();
        renderRuletaEquipos();
    });
    $('sorteo-turno-select').addEventListener('change', e => {
        rondaSorteoActual = e.target.value;
        actualizarSesionInfo();
        renderHazmeEquipos();
        renderRuletaEquipos();
    });
    $('sorteo-ronda-select').addEventListener('change', e => {
        rondaActual = e.target.value;
        actualizarSesionInfo();
        sincronizarRondaEnPuntuacion();
    });
}

function actualizarSesionInfo() {
    const info = $('sesion-equipos-info');
    if (!info) return;
    if (!salaSorteoActual) { info.textContent = ''; return; }
    const turnoEfectivo = rondaSorteoActual || '1';
    const equiposFiltrados = equiposDeSalaYRonda(salaSorteoActual, turnoEfectivo);
    const idx = SALAS_ORDEN.indexOf(salaSorteoActual);
    const idxOrigen = ((idx - (Number(turnoEfectivo) - 1)) % 3 + 3) % 3;
    const salaOrigen = SALAS_ORDEN[idxOrigen];
    const turnoTxt = rondaSorteoActual ? ` · Turno ${rondaSorteoActual}` : '';
    const rondaTxt = rondaActual ? ` · Ronda ${rondaActual}` : '';
    info.textContent = `Equipos de ${salaOrigen} en ${salaSorteoActual}${turnoTxt}${rondaTxt} — ${equiposFiltrados.length} equipo${equiposFiltrados.length !== 1 ? 's' : ''}`;
}

function sincronizarRondaEnPuntuacion() {
    const sel = $('punt-ronda');
    if (sel && rondaActual) sel.value = rondaActual;
}

function abrirCronoOverlay(prepararFn, extrasIds = []) {
    const body = $('crono-overlay-body');
    body.appendChild($('crono-contenido'));
    extrasIds.forEach(id => { const el = $(id); if (el) body.appendChild(el); });
    resultadoDiv.classList.remove('hidden');
    $('crono-overlay').classList.remove('hidden');
    if (prepararFn) prepararFn();
}

function cerrarCronoOverlay() {
    const overlay = $('crono-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    const asides = document.querySelector('.sorteo-asides');
    ['historial-panel', 'palabra-crono-panel', 'duelo-final-panel'].forEach(id => {
        const el = $(id);
        if (el && el.closest('#crono-overlay') && asides) {
            el.classList.add('hidden');
            asides.appendChild(el);
        }
    });
    fabricaCrono.classList.add('hidden');
    vocesCrono.classList.add('hidden');
    dueloCrono.classList.add('hidden');
    declaCrono.classList.add('hidden');
    resultadoDiv.classList.add('hidden');
    pararFabricaSilencioso();
    pararVocesSilencioso();
    pararDueloSilencioso();
    pararDeclaSilencioso();
    pararPalabraCalienteSilencioso();
    pararDueloFinalSilencioso();
    const ruletaSection  = $('ruleta-section');
    const accionesRuleta = ruletaSection.querySelector('.acciones-ruleta');
    ruletaSection.insertBefore($('crono-contenido'), accionesRuleta);
    overlay.classList.add('hidden');
}

function abrirPruebaOverlay(prueba) {
    const overlayBody = $('prueba-overlay-body');
    overlayBody.appendChild($('prueba-contenido'));
    overlayBody.appendChild(document.querySelector('.sorteo-asides'));
    $('prueba-overlay').classList.remove('hidden');
    continuarCargaPrueba(prueba);
}

function cerrarPruebaOverlay() {
    volverSeleccion();
}

function cargarPrueba() {
    const prueba = pruebaSelect.value;
    if (!prueba) return;

    const config = configuraciones[prueba];
    ocultarSeccionesSorteo();

    const usaSelector = FASE_CLASIFICACION.includes(prueba) || prueba === 'declamacion';
    if (usaSelector) {
        ruletaEquiposSelector.classList.remove('hidden');
        inicializarRuletaSelector(null);
    }

    const btnWrapper = $('btn-acceder-prueba-wrapper');
    const btnAcceder = $('btn-acceder-prueba');
    btnAcceder.onclick = () => {
        abrirIntroPrueba(prueba, config);
    };
    btnWrapper.classList.remove('hidden');
}

function abrirIntroPrueba(prueba, config) {
    const partes  = (config.titulo || '').split(' — ');
    const prefijo = partes.length > 1 ? partes[0] : '';
    const nombre  = partes.length > 1 ? partes.slice(1).join(' — ') : config.titulo;
    $('intro-prueba-numero').textContent      = prefijo.toUpperCase();
    $('intro-prueba-titulo').textContent      = nombre;
    $('intro-prueba-descripcion').textContent = config.descripcion || '';
    $('intro-prueba-comenzar').onclick = () => {
        $('intro-prueba-overlay').classList.add('hidden');
        abrirPruebaOverlay(prueba);
    };
    $('intro-prueba-volver').onclick = () => {
        $('intro-prueba-overlay').classList.add('hidden');
    };
    $('intro-prueba-overlay').classList.remove('hidden');
}

function continuarCargaPrueba(prueba) {
    const config = configuraciones[prueba];

    if (config.tipo === 'cronometro') {
        hazmeFanSection.classList.remove('hidden');
        resetCronometro();
        inicializarHazmeSelector();
        $('hazme-equipos-selector').classList.add('hidden');
    } else if (config.tipo === 'minuto-oro') {
        minutoOroSection.classList.remove('hidden');
        inicializarMinutoOro();
    } else if (prueba === 'palabra-caliente' || prueba === 'duelo-personajes-final') {
        tituloPrueba.textContent = config.titulo;
        mostrarEmparejamientoFinal(prueba);
    } else {
        tituloPrueba.textContent = config.titulo;
        if (prueba !== 'duelo-personajes-final') {
            ruletaEquiposSelector.classList.remove('hidden');

            inicializarRuletaSelector(null);
        }

        if (DATOS_PRUEBAS[prueba]) {
            cargarDatosEnRuleta(prueba, DATOS_PRUEBAS[prueba], true);
        } else {
            csvUpload.classList.remove('hidden');
        }
    }
}

function cargarDatosEnRuleta(prueba, data, desdeEmbebidos = false) {
    datosPrueba[prueba] = data;
    usados[prueba] = usados[prueba] || [];
    csvUpload.classList.add('hidden');
    ruletaSection.classList.remove('hidden');
    usarCsvBtn.classList.toggle('hidden', !desdeEmbebidos);
    historialPanel.classList.add('hidden');
    palabraCronoPanel.classList.add('hidden');
    if (prueba === 'palabra-caliente') actualizarHistorial(prueba);
    if (prueba === 'duelo-personajes-final') resetDueloFinal();
    inicializarRuleta(prueba);
}

function ocultarSeccionesSorteo() {
    const overlay = $('prueba-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        const seccionRuleta  = document.querySelector('.seccion-ruleta');
        const contPrincipal  = document.querySelector('#modo-sorteos .contenedor-principal');
        seccionRuleta.appendChild($('prueba-contenido'));
        contPrincipal.appendChild(document.querySelector('.sorteo-asides'));
        overlay.classList.add('hidden');
    }
    cerrarCronoOverlay();
    clearTimeout(resultadoTimerId); resultadoTimerId = null; resultadoPopupPrepFn = null;
    fabricaPopup.classList.add('hidden');
    $('resultado-popup').classList.add('hidden');
    $('btn-ir-crono').classList.add('hidden');
    infoPrueba.classList.add('hidden');
    $('btn-acceder-prueba-wrapper').classList.add('hidden');
    csvUpload.classList.add('hidden');
    ruletaSection.classList.add('hidden');
    usarCsvBtn.classList.add('hidden');
    historialPanel.classList.add('hidden');
    hazmeFanSection.classList.add('hidden');
    minutoOroSection.classList.add('hidden');
    ruletaEquiposSelector.classList.add('hidden');
    const empPanel = $('final-emparejamiento-panel');
    if (empPanel) empPanel.classList.add('hidden');
    fabricaCrono.classList.add('hidden');
    vocesCrono.classList.add('hidden');
    dueloEleccion.classList.add('hidden');
    dueloCrono.classList.add('hidden');
    declaCrono.classList.add('hidden');
    palabraCronoPanel.classList.add('hidden');
    dueloFinalAsignarDiv.classList.add('hidden');
    dueloFinalPanel.classList.add('hidden');
    avisoRepetida.classList.add('hidden');
    pararFabricaSilencioso();
    pararVocesSilencioso();
    pararDueloSilencioso();
    pararDueloEleccionSilencioso();
    pararDeclaSilencioso();
    pararPalabraCalienteSilencioso();
    pararDueloFinalSilencioso();
    pararAsignarDueloFinalSilencioso();
    pararMinutoOroSilencioso();
    pararRuletaSelectorSilencioso();
    resultadoDiv.innerHTML = '';
}

function volverSeleccion() {
    ocultarSeccionesSorteo();
    pruebaSelect.value = '';
    if (ordenGlobalTurnos.length > 0) {
        ruletaEquiposSelector.classList.remove('hidden');
        renderRuletaEquipos();
    }
}
/*  
   7) MODO SORTEOS — Carga del CSV */
function procesarCsv() {
    const file = csvFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => parsearCsv(e.target.result);
    reader.readAsText(file);
}
function parsearLineaCsv(line) {
    const fields = [];
    let current = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { fields.push(current); current = ''; continue; }
        current += ch;
    }
    fields.push(current);
    return fields;
}
function parsearCsv(csv) {
    const lines = csv.split(/\r?\n/).filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map(line => {
        const values = parsearLineaCsv(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] ? values[i].trim() : ''; });
        return obj;
    });
    cargarDatosEnRuleta(pruebaSelect.value, data);
}
/*  8) RULETAS — Inicialización- */
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
    const fabricaInstr = $('fabrica-instrucciones');
    if (fabricaInstr) {
        fabricaInstr.classList.toggle('hidden', prueba !== 'fabrica-historias');
    }

    if (config.tipo === 'multiple') {
        const etiquetasUI = { contexto: 'Contexto', problema: 'Problema', personaje: 'Personaje' };
        config.columnas.forEach(col => {
            const opciones = datosPrueba[prueba].map(row => row[col]).filter(v => v);
            crearRuleta(col, opciones, {
                etiqueta: etiquetasUI[col] || col,
                conResultadoBloque: true
            });
        });
    } else if (config.tipo === 'simple') {
        const opciones = datosPrueba[prueba].map(row => {
            if (prueba === 'voces-derecho') return row.descripcion;
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


/* 9) RULETAS — Dibujo */
function dibujarRuleta(canvas, opciones) {
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 14;
    const ang = (2 * Math.PI) / opciones.length;
    const colors = ['#1a6fc4', '#3a9bd5', '#42A5F5', '#1565C0', '#0288D1', '#29B6F6', '#1976D2', '#0097A7'];
    const fontSize = Math.max(12, Math.round(canvas.width * 0.032));

    opciones.forEach((opcion, i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, i * ang, (i + 1) * ang);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(i * ang + ang / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'black';
        ctx.font = `bold ${fontSize}px Fredoka, "Baloo 2", Arial`;
        const maxChars = Math.max(6, Math.floor((radius * 0.85 - 18) / (fontSize * 0.58)));
        const texto = opcion.length > maxChars ? opcion.slice(0, maxChars - 1) + '…' : opcion;
        ctx.fillText(texto, radius - 18, fontSize / 3);
        ctx.restore();
    });

    ctx.fillStyle = '#0d1b2a';
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx - 18, 38);
    ctx.lineTo(cx + 18, 38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0d1b2a';
    ctx.lineWidth = 3;
    ctx.stroke();
}


/* 10) RULETAS — Giro */
function girarRuleta() {
    cerrarCronoOverlay();
    clearTimeout(resultadoTimerId); resultadoTimerId = null; resultadoPopupPrepFn = null;
    fabricaPopup.classList.add('hidden');
    $('resultado-popup').classList.add('hidden');
    $('btn-ir-crono').classList.add('hidden');
    const prueba = pruebaSelect.value;
    const config = configuraciones[prueba];

    if (config.tipo === 'multiple') {
        // Antes de que gire se limpia avisos, cronómetro y resultados.
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
        // Las tres ruletas giran a la vez. Cuando todas terminan, se muestra resumen.
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
        // Solo La Palabra Caliente no puede repetir; filtramos los ya usados.
        if (prueba === 'palabra-caliente') {
            const disponibles = opciones.filter(op => !usados[prueba].includes(op));
            if (disponibles.length === 0) {
                resultadoDiv.innerHTML =
                    `<div class="resultado-articulo"><strong>¡Todas las situaciones sorteadas!</strong>Se ha reseteado. Puedes girar de nuevo.</div>`;
                usados[prueba] = [];
                actualizarHistorial(prueba);
                return;
            }
            opciones = disponibles;
        }
        girarCanvas(canvasList[0].canvas, opciones);
    } else if (config.tipo === 'dupla') {
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
        declaCrono.classList.add('hidden');
        pararDeclaSilencioso();
        girarCanvas(canvasList[0].canvas, canvasList[0].opciones, 'genero');
    }
}

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


/* 11) RULETAS — Mostrar resultados */
function mostrarResultadoMultiple(resultados) {
    const orden = ['contexto', 'problema', 'personaje'];
    const etiquetas = { contexto: 'Contexto', problema: 'Problema', personaje: 'Personaje' };

    canvasList.forEach(({ resBox, nombre }) => {
        if (!resBox) return;
        const valor = resultados[nombre] || '';
        resBox.classList.remove('vacio');
        resBox.textContent = valor;
        resBox.classList.add('recien-aterrizado');
        setTimeout(() => resBox.classList.remove('recien-aterrizado'), 800);
    });

    const lineas = orden.map(n =>
        `<div class="resultado-item"><strong>${etiquetas[n] || n}:</strong> ${resultados[n] || ''}</div>`
    );
    resultadoDiv.innerHTML = `<div class="resultado-multiple">${lineas.join('')}</div>`;

    const prueba = pruebaSelect.value;
    if (prueba === 'fabrica-historias') {
        const clave = orden.map(c => resultados[c] || '').join('|');
        usados[prueba] = usados[prueba] || [];
        const yaSalio = usados[prueba].includes(clave);
        avisoRepetida.classList.toggle('hidden', !yaSalio);
        if (!yaSalio) usados[prueba].push(clave);

        mostrarFabricaPopup(resultados);
        mostrarPopupConTimer(fabricaPopup, () => abrirCronoOverlay(prepararCronometroFabrica));
    }
}
function mostrarResultado(resultado, tipoExtra) {
    const prueba = pruebaSelect.value;
    const config = configuraciones[prueba];

    if (config.tipo === 'dupla') {
        usados[prueba] = usados[prueba] || [];
        const yaSalio = usados[prueba].includes(resultado);
        avisoRepetida.classList.toggle('hidden', !yaSalio);
        if (!yaSalio) usados[prueba].push(resultado);

        resultadoDiv.innerHTML =
            `<div class="resultado-dupla"><strong>Dupla sorteada:</strong> ${escapar(resultado)}</div>`;
        if (prueba === 'duelo-personajes-final') {
            mostrarAsignacionFinalDuelo(resultado);
        } else {
            mostrarEleccionDuelo(resultado);
        }
    } else if (config.tipo === 'genero-texto') {
        const disponibles = datosPrueba[prueba].filter(r => r.genero === resultado && !usados[prueba].includes(r.titulo));
        if (disponibles.length > 0) {
            const sel = disponibles[Math.floor(Math.random() * disponibles.length)];
            resultadoDiv.innerHTML =
                `<div class="resultado-genero">
                    <strong>Género:</strong> ${escapar(sel.genero)}<br>
                    <strong>Obra:</strong> ${escapar(sel.obra)}<br>
                    <strong>Título:</strong> ${escapar(sel.titulo)}<br>
                    ${sel.autor ? `<strong>Autor/a:</strong> ${escapar(sel.autor)}` : ''}
                </div>`;
            usados[prueba].push(sel.titulo);
            $('resultado-popup-body').innerHTML =
                `<div class="resultado-genero">
                    <strong>Género:</strong> ${escapar(sel.genero)}<br>
                    <strong>Obra:</strong> ${escapar(sel.obra)}<br>
                    <strong>Título:</strong> ${escapar(sel.titulo)}<br>
                    ${sel.autor ? `<strong>Autor/a:</strong> ${escapar(sel.autor)}` : ''}
                </div>`;
            mostrarPopupConTimer($('resultado-popup'), () => abrirCronoOverlay(prepararCronometroDecla));
        } else {
            resultadoDiv.textContent = 'No hay fragmentos disponibles para este género.';
        }
    } else if (prueba === 'voces-derecho') {
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
        $('resultado-popup-body').innerHTML =
            `<div class="resultado-articulo">
                <div class="articulo-etiqueta">Artículo de la Constitución</div>
                <div class="articulo-numero">Art. ${escapar(numero)}</div>
                <div class="articulo-descripcion">${escapar(descripcion)}</div>
            </div>`;
        mostrarPopupConTimer($('resultado-popup'), () => abrirCronoOverlay(prepararCronometroVoces));
    } else if (prueba === 'palabra-caliente') {
        const sit = datosPrueba[prueba].find(r => `${r.nombre}: ${r.descripcion}` === resultado);
        resultadoDiv.innerHTML =
            `<div class="resultado-palabra"><strong>Situación:</strong> ${sit.nombre}<br><br><strong>Descripción:</strong><br>${sit.descripcion}</div>`;
        if (!usados[prueba].includes(resultado)) usados[prueba].push(resultado);
        actualizarHistorial(prueba);
        $('resultado-popup-body').innerHTML =
            `<div class="resultado-palabra"><strong>${escapar(sit.nombre)}</strong><br><br>${escapar(sit.descripcion)}</div>`;
        resetPalabraCaliente();
        mostrarPopupConTimer($('resultado-popup'), () => abrirCronoOverlay(
            () => { palabraCronoPanel.classList.remove('hidden'); historialPanel.classList.remove('hidden'); },
            ['historial-panel', 'palabra-crono-panel']
        ));
    } else {
        resultadoDiv.innerHTML = `<div class="resultado-simple">${resultado}</div>`;
        usados[prueba] = usados[prueba] || [];
        usados[prueba].push(resultado);
    }
}
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


/*12) HAZME FAN — Cronómetro simple- */
const CRONO_TOTAL_MS = 2 * 60 * 1000;
const CRONO_MIN_MS   = 30 * 1000;
let cronoIntervalo          = null;
let cronoFin                = 0;
let cronoRestanteMs         = CRONO_TOTAL_MS;
let cronoEnMarcha           = false;
let cronoTerminadoNotif     = false;


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
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    cronoDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;

    cronoDisplay.classList.remove('crono-minimo', 'crono-final');
    if (ms <= 10 * 1000)         cronoDisplay.classList.add('crono-final');
    else if (ms <= CRONO_MIN_MS) cronoDisplay.classList.add('crono-minimo');
}

function iniciarCronometro() {
    if (cronoEnMarcha) return;
    mostrarCronoGigante('cronometro-display', 'Hazme Fan', 'hazme-botones');
    cronoEnMarcha = true;
    cronoFin = Date.now() + cronoRestanteMs;
    cronoIniciar.disabled = true;
    cronoPausar.disabled  = false;
    cronoEstado.textContent = 'Tienes entre 1:30 y 2:00 para completar la prueba.';
    cronoIntervalo = setInterval(() => {
        cronoRestanteMs = cronoFin - Date.now();
        pintarCrono(cronoRestanteMs);
        if (cronoRestanteMs <= 0 && !cronoTerminadoNotif) {
            cronoTerminadoNotif = true;
            cronoEstado.textContent = '¡Tiempo! El cronómetro continúa en negativo.';
            bip(660);
        }
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
    cronoRestanteMs = cronoFin - Date.now();
    cronoIniciar.disabled = false;
    cronoPausar.disabled  = true;
    cronoEstado.textContent = 'Pausa — pulsa Iniciar para seguir.';
}

function resetCronometro() {
    pararCronometroSilencioso();
    cronoTerminadoNotif = false;
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


// /*    12b) HAZME FAN — Selector de equipos 
let hazmeEquiposSeleccionados = [];
let hazmeCuentaInterval = null;

function montarHazmeSelector() {
    hazmeSeleccionarBtn.addEventListener('click', seleccionarEquipoHazme);
}

function inicializarHazmeSelector() {
    hazmeEquiposSeleccionados = [];
    clearInterval(hazmeCuentaInterval);
    hazmeCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    renderHazmeEquipos();
}

function renderHazmeEquipos() {
    if (!hazmeEquiposGrid) return;

    const equiposSala = equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual);
    const restantes = equiposSala.filter(e => !hazmeEquiposSeleccionados.includes(e.id));

    if (equiposSala.length < 3) {
        hazmeEquiposGrid.innerHTML = '';
        hazmeSeleccionarBtn.disabled = true;
        hazmeEstado.textContent = 'Debe añadir 3 o más equipos para usar el selector.';
        return;
    }

    hazmeEquiposGrid.innerHTML = equiposSala.map(e => {
        const cls = hazmeEquiposSeleccionados.includes(e.id) ? 'seleccionado' : '';
        return `<div class="hazme-equipo-chip ${cls}" data-id="${e.id}">${escapar(e.nombre)}</div>`;
    }).join('');

    if (restantes.length === 0) {
        hazmeSeleccionarBtn.disabled = true;
        hazmeEstado.textContent = 'Han sido seleccionados todos los equipos.';
    } else {
        hazmeSeleccionarBtn.disabled = false;
        hazmeEstado.textContent = restantes.length === equiposSala.length
            ? `${equiposSala.length} equipo${equiposSala.length !== 1 ? 's' : ''} disponible${equiposSala.length !== 1 ? 's' : ''}.`
            : `Quedan ${restantes.length} equipo${restantes.length !== 1 ? 's' : ''} por seleccionar.`;
    }
}

function seleccionarEquipoHazme() {
    const equiposSala = equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual);
    const restantes = equiposSala.filter(e => !hazmeEquiposSeleccionados.includes(e.id));
    if (restantes.length === 0) return;

    const eq = restantes[0];

    hazmeEquiposGrid.querySelectorAll('.hazme-equipo-chip').forEach(c => c.classList.remove('iluminado'));
    const chip = hazmeEquiposGrid.querySelector(`.hazme-equipo-chip[data-id="${eq.id}"]`);
    if (chip) chip.classList.add('iluminado');

    hazmeSeleccionarBtn.disabled = true;

    hazmePopupNombre.textContent = eq.nombre;
    hazmePopupCuenta.textContent = '5';
    hazmePopup.classList.remove('hidden');

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
                chip.classList.add('seleccionado');
            }
            hazmeEquiposSeleccionados.push(eq.id);
            renderHazmeEquipos();
        }
    }, 1000);
}


/*  12) SELECTOR DE EQUIPOS PARA RULETAS (Pruebas 2, 3, 4 y Finales) */

let ruletaEquiposSeleccionados = [];

let ordenGlobalTurnos  = [];
let ordenGlobalOffset  = 0;
let pruebaConOrden     = null;

let ruletaCuentaInterval = null;
let ruletaEquiposPermitidos = null;

function obtenerTop2Clasificacion() {
    return equipos
        .map(eq => ({ id: eq.id, nombre: eq.nombre, pts: totalEquipo(eq.id, 'clasificacion') }))
        .filter(eq => eq.pts > 0)
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 2)
        .map(eq => eq.id);
}

function obtenerTop4Clasificacion() {
    return equipos
        .map(eq => ({ id: eq.id, nombre: eq.nombre, pts: totalEquipo(eq.id, 'clasificacion') }))
        .filter(eq => eq.pts > 0)
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 4);
}

function obtenerEquiposFinales() {
    return equipos.map(eq => ({ id: eq.id, nombre: eq.nombre }));
}
let finalEquipo1 = null;
let finalEquipo2 = null;
let finalEquipo3 = null;
let finalEquipo4 = null;

function oradorAleatorio() { return Math.random() < 0.5 ? 'Orador A' : 'Orador B'; }

let finalEquipo5 = null;

function mostrarEmparejamientoFinal(prueba) {
    const panel      = $('final-emparejamiento-panel');
    const resultado  = $('final-emparejamiento-resultado');
    const acciones   = $('final-sorteo-acciones');
    const empBtn     = $('final-emparejar-btn');
    const repetirBtn = $('final-emparejar-btn-repetir');
    const confirmarBtn = $('final-confirmar-emparejamiento');
    const mesaBloque = $('final-mesa-bloque');
    const enf2Bloque = $('final-enf2-bloque');

    resultado.classList.add('hidden');
    acciones.classList.add('hidden');
    panel.classList.remove('hidden');

    const esPalabraCaliente = prueba === 'palabra-caliente';

    // Palabra Caliente: 2 parejas con top 4 clasificados
    // Duelo Final:      2 duelos con top 4 clasificados
    mesaBloque.style.display  = 'none';
    enf2Bloque.style.display  = '';
    const enf3Bloque = $('final-enf3-bloque');
    if (enf3Bloque) enf3Bloque.style.display = 'none';

    $('final-enf1-titulo').textContent = esPalabraCaliente ? 'Pareja 1' : 'Duelo 1';
    $('final-enf2-titulo').textContent = esPalabraCaliente ? 'Pareja 2' : 'Duelo 2';

    function sortear() {
        const clasificados = obtenerTop4Clasificacion();
        if (clasificados.length < 4) {
            alert('Necesitas al menos 4 equipos con puntuación en la fase de clasificación para sortear.');
            return;
        }
        const m = [...clasificados].sort(() => Math.random() - 0.5);
        finalEquipo1 = m[0]; finalEquipo2 = m[1];
        finalEquipo3 = m[2]; finalEquipo4 = m[3];

        $('f1-eq1-nombre').textContent = finalEquipo1.nombre;
        $('f1-eq1-orador').textContent = '(' + oradorAleatorio() + ')';
        $('f1-eq2-nombre').textContent = finalEquipo2.nombre;
        $('f1-eq2-orador').textContent = '(' + oradorAleatorio() + ')';
        $('f3-eq1-nombre').textContent = finalEquipo3.nombre;
        $('f3-eq1-orador').textContent = '(' + oradorAleatorio() + ')';
        $('f3-eq2-nombre').textContent = finalEquipo4.nombre;
        $('f3-eq2-orador').textContent = '(' + oradorAleatorio() + ')';

        resultado.classList.remove('hidden');
        acciones.classList.remove('hidden');
        empBtn.classList.add('hidden');
    }

    empBtn.onclick     = sortear;
    repetirBtn.onclick = sortear;

    confirmarBtn.onclick = () => {
        panel.classList.add('hidden');
        empBtn.classList.remove('hidden');
        continuarPruebaFinal(prueba);
    };
}

function continuarPruebaFinal(prueba) {
    if (prueba === 'palabra-caliente') {
        ruletaEquiposSelector.classList.remove('hidden');
        inicializarRuletaSelector(null);
        if (DATOS_PRUEBAS[prueba]) {
            cargarDatosEnRuleta(prueba, DATOS_PRUEBAS[prueba], true);
        } else {
            csvUpload.classList.remove('hidden');
        }
    } else if (prueba === 'duelo-personajes-final') {
        if (DATOS_PRUEBAS[prueba]) {
            cargarDatosEnRuleta(prueba, DATOS_PRUEBAS[prueba], true);
        } else {
            csvUpload.classList.remove('hidden');
        }
    }
}

let palabraPcEqActual   = null;
let palabraPcChipActual = null;

const palabraPcPopup      = $('palabrapc-popup');
const palabraPcNombre     = $('palabrapc-nombre');
const palabraPcAlumno     = $('palabrapc-alumno');
const palabraPcSortearBtn = $('palabrapc-sortear-btn');
const palabraPcCerrarBtn  = $('palabrapc-cerrar-btn');

function montarRuletaSelector() {
    ruletaSeleccionarBtn.addEventListener('click', seleccionarEquipoRuleta);

    palabraPcSortearBtn.addEventListener('click', () => {
        if (!palabraPcEqActual || !(palabraPcEqActual.alumnos && palabraPcEqActual.alumnos.length)) return;
        const alumnos = palabraPcEqActual.alumnos;
        const alumno  = alumnos[Math.floor(Math.random() * alumnos.length)];
        palabraPcAlumno.textContent = alumno;
    });

    palabraPcCerrarBtn.addEventListener('click', () => {
        palabraPcPopup.classList.add('hidden');
        if (palabraPcChipActual) {
            palabraPcChipActual.classList.remove('iluminado');
            palabraPcChipActual.classList.add('seleccionado');
        }
        if (palabraPcEqActual) {
            ruletaEquiposSeleccionados.push(palabraPcEqActual.id);
        }
        palabraPcEqActual   = null;
        palabraPcChipActual = null;
        renderRuletaEquipos();
        ruletaSeleccionarBtn.disabled = false;
    });
}

function pararRuletaSelectorSilencioso() {
    clearInterval(ruletaCuentaInterval);
    ruletaCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    if (palabraPcPopup) palabraPcPopup.classList.add('hidden');
    palabraPcEqActual   = null;
    palabraPcChipActual = null;
}

const primerosEnSala = {};

function registrarPrimero(sala, ronda, equipoId) {
    const clave = `${sala}|${ronda}`;
    if (!primerosEnSala[clave]) primerosEnSala[clave] = [];
    const equiposDeSala = equiposDeSalaYRonda(sala, ronda).map(e => e.id);
    const yaUsados = primerosEnSala[clave];
    const pendientes = equiposDeSala.filter(id => !yaUsados.includes(id));
    if (pendientes.length === 0) {
        primerosEnSala[clave] = [equipoId];
    } else {
        primerosEnSala[clave].push(equipoId);
    }
}

function equiposPendientesDePrimero(sala, ronda) {
    const clave = `${sala}|${ronda}`;
    const equiposDeSala = equiposDeSalaYRonda(sala, ronda).map(e => e.id);
    const yaUsados = primerosEnSala[clave] || [];
    const pendientes = equiposDeSala.filter(id => !yaUsados.includes(id));
    return pendientes.length > 0 ? pendientes : equiposDeSala;
}

function inicializarRuletaSelector(equiposPermitidos = null) {
    ruletaEquiposSeleccionados = [];
    ruletaEquiposPermitidos    = equiposPermitidos;
    clearInterval(ruletaCuentaInterval);
    ruletaCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');

    const prueba = pruebaSelect ? pruebaSelect.value : '';

    if (ordenGlobalTurnos.length > 0 && !equiposPermitidos) {
        if (prueba !== pruebaConOrden) {
            if (pruebaConOrden !== null) ordenGlobalOffset++;
            pruebaConOrden = prueba;
        }
        const n = ordenGlobalTurnos.length;
        const off = ordenGlobalOffset % n;
        ruletaOrdenTurnos = [
            ...ordenGlobalTurnos.slice(off),
            ...ordenGlobalTurnos.slice(0, off)
        ];
        ruletaEquiposSeleccionados = [...ruletaOrdenTurnos];
    } else {
        ruletaOrdenTurnos = [];
    }

    renderRuletaEquipos();
}

let ruletaOrdenTurnos = [];

function renderRuletaEquipos() {
    if (!ruletaEquiposGrid) return;

    const prueba = pruebaSelect ? pruebaSelect.value : '';
    const usarFiltroSala = FASE_CLASIFICACION.includes(prueba) && !!salaSorteoActual;

    const equiposActivos = ruletaEquiposPermitidos
        ? equipos.filter(e => ruletaEquiposPermitidos.includes(e.id))
        : usarFiltroSala
            ? equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual)
            : equipos;

    if (ruletaEquiposPermitidos !== null && equiposActivos.length === 0) {
        ruletaEquiposGrid.innerHTML = '';
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent =
            'Aún no hay equipos clasificados. Puntúa las 4 pruebas de clasificación primero.';
        return;
    }

    if (ruletaEquiposPermitidos === null && equiposActivos.length < 2) {
        ruletaEquiposGrid.innerHTML = '';
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent = 'Debe añadir 2 o más equipos para usar el selector.';
        return;
    }

    const ordenYaAsignado = ruletaOrdenTurnos.length > 0;

    ruletaEquiposGrid.innerHTML = equiposActivos.map(e => {
        const turno = ruletaOrdenTurnos.indexOf(e.id);
        const numTurno = turno + 1;
        const esPrimero = turno === 0;
        const clsChip = esPrimero ? 'turno-primero' : '';
        if (ordenYaAsignado) {
            return `<div class="hazme-equipo-chip-wrap">
                <span class="hazme-equipo-turno">${numTurno}º</span>
                <div class="hazme-equipo-chip ${clsChip}" data-id="${e.id}">${escapar(e.nombre)}</div>
            </div>`;
        }
        return `<div class="hazme-equipo-chip" data-id="${e.id}">${escapar(e.nombre)}</div>`;
    }).join('');

    if (ordenYaAsignado) {
        ruletaSeleccionarBtn.disabled = true;
        ruletaSeleccionarBtn.textContent = 'Orden fijado';
        const primero = equipos.find(e => e.id === ruletaOrdenTurnos[0]);
        const vuelta  = ordenGlobalOffset > 0 ? ` (rotación ${ordenGlobalOffset})` : '';
        ruletaSelectorEstado.textContent = `Empieza: ${primero ? escapar(primero.nombre) : '—'}${vuelta}`;
    } else {
        ruletaSeleccionarBtn.disabled = false;
        ruletaSeleccionarBtn.textContent = 'Seleccionar equipo';
        if (ruletaEquiposPermitidos !== null) {
            const nombres = equiposActivos.map(e => escapar(e.nombre)).join(' y ');
            ruletaSelectorEstado.textContent = `Finalistas: ${nombres}. Selecciona el orden de participación.`;
        } else {
            ruletaSelectorEstado.textContent =
                `${equiposActivos.length} equipo${equiposActivos.length !== 1 ? 's' : ''} disponible${equiposActivos.length !== 1 ? 's' : ''}. Pulsa para sortear el orden.`;
        }
    }
}

function seleccionarEquipoRuleta() {
    const prueba = pruebaSelect.value;
    const esFinal = !!ruletaEquiposPermitidos;

    const equiposActivos = esFinal
        ? equipos.filter(e => ruletaEquiposPermitidos.includes(e.id))
        : equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual);

    if (equiposActivos.length === 0) return;

    if (prueba === 'palabra-caliente') {
        const restantes = equiposActivos.filter(e => !ruletaEquiposSeleccionados.includes(e.id));
        if (restantes.length === 0) return;
        const eq   = restantes[Math.floor(Math.random() * restantes.length)];
        const chip = ruletaEquiposGrid.querySelector(`.hazme-equipo-chip[data-id="${eq.id}"]`);
        palabraPcEqActual            = eq;
        palabraPcChipActual          = chip;
        palabraPcNombre.textContent  = eq.nombre;
        palabraPcAlumno.textContent  = '';
        palabraPcPopup.classList.remove('hidden');
        ruletaSeleccionarBtn.disabled = true;
        return;
    }

    // Para fase final con solo 2 equipos se mantiene el flujo original
    if (esFinal) {
        const restantes = equiposActivos.filter(e => !ruletaEquiposSeleccionados.includes(e.id));
        if (restantes.length === 0) return;
        const eq   = restantes[Math.floor(Math.random() * restantes.length)];
        const chip = ruletaEquiposGrid.querySelector(`.hazme-equipo-chip[data-id="${eq.id}"]`);
        if (chip) { chip.classList.remove('iluminado'); chip.classList.add('iluminado'); }
        ruletaSeleccionarBtn.disabled = true;
        hazmePopupNombre.textContent = eq.nombre;
        hazmePopupCuenta.textContent = '5';
        hazmePopup.classList.remove('hidden');
        let cuenta = 5;
        clearInterval(ruletaCuentaInterval);
        ruletaCuentaInterval = setInterval(() => {
            cuenta--;
            hazmePopupCuenta.textContent = cuenta;
            if (cuenta <= 0) {
                clearInterval(ruletaCuentaInterval);
                ruletaCuentaInterval = null;
                hazmePopup.classList.add('hidden');
                if (chip) { chip.classList.remove('iluminado'); chip.classList.add('seleccionado'); }
                ruletaEquiposSeleccionados.push(eq.id);
                renderRuletaEquipos();
            }
        }, 1000);
        return;
    }

    const inicio = Math.floor(Math.random() * equiposActivos.length);
    const ordenCalculado = [
        ...equiposActivos.slice(inicio),
        ...equiposActivos.slice(0, inicio)
    ].map(e => e.id);
    const primerEquipo = equiposActivos[inicio];
    mostrarPopupSorteoOrden(primerEquipo.nombre, () => {
        ruletaOrdenTurnos          = ordenCalculado;
        ordenGlobalTurnos          = [...ordenCalculado];
        ordenGlobalOffset          = 0;
        pruebaConOrden             = pruebaSelect ? pruebaSelect.value : null;
        ruletaEquiposSeleccionados = [...ordenCalculado];
        renderRuletaEquipos();
    });
}

let _sorteoPopupInterval = null;

function mostrarPopupSorteoOrden(nombreEquipo, onFin) {
    const popup    = $('sorteo-orden-popup');
    const cuentaEl = $('sorteo-orden-cuenta');
    const nombreEl = $('sorteo-orden-nombre');
    const subEl    = $('sorteo-orden-sub');
    const progreso = $('sorteo-reloj-progreso');
    const agujaEl  = $('sorteo-reloj-seg');

    const TOTAL   = 3;
    const CIRCUNF = 276.46;
    let cuenta    = TOTAL;

    cuentaEl.textContent = cuenta;
    cuentaEl.classList.remove('pulso', 'hidden');
    nombreEl.classList.add('hidden');
    nombreEl.textContent = nombreEquipo;
    subEl.textContent    = '…';
    progreso.style.transition = 'none';
    progreso.style.strokeDashoffset = '0';
    agujaEl.style.transition = 'none';
    agujaEl.style.transform  = 'rotate(0deg)';
    void progreso.getBoundingClientRect();
    progreso.style.transition = 'stroke-dashoffset 1s linear';
    agujaEl.style.transition  = 'transform 1s linear';
    popup.classList.remove('hidden');

    iniciarRedoble(TOTAL);

    clearInterval(_sorteoPopupInterval);
    _sorteoPopupInterval = setInterval(() => {
        cuenta--;
        progreso.style.strokeDashoffset = String(CIRCUNF * (1 - cuenta / TOTAL));
        agujaEl.style.transform = `rotate(${(1 - cuenta / TOTAL) * 360}deg)`;
        cuentaEl.classList.remove('pulso');
        void cuentaEl.offsetWidth;
        cuentaEl.classList.add('pulso');

        if (cuenta <= 0) {
            clearInterval(_sorteoPopupInterval);
            _sorteoPopupInterval = null;
            cuentaEl.classList.add('hidden');
            subEl.textContent = '';
            setTimeout(() => {
                nombreEl.classList.remove('hidden');
                subEl.textContent = '¡Empieza primero!';
                golpeFinal();
                setTimeout(() => {
                    popup.classList.add('hidden');
                    cuentaEl.classList.remove('hidden');
                    cuentaEl.textContent = TOTAL;
                    onFin();
                }, 2000);
            }, 400);
        } else {
            cuentaEl.textContent = cuenta;
        }
    }, 1000);
}

function _getAudioCtx() {
    if (!window._sorteoAudioCtx || window._sorteoAudioCtx.state === 'closed') {
        window._sorteoAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = window._sorteoAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function _baquetazo(ctx, time, vol) {
    const sr = ctx.sampleRate;

    const cLen = Math.floor(sr * 0.007);
    const cBuf = ctx.createBuffer(1, cLen, sr);
    const cd   = cBuf.getChannelData(0);
    for (let i = 0; i < cLen; i++)
        cd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.0018));
    const cSrc = ctx.createBufferSource(); cSrc.buffer = cBuf;
    const cHP  = ctx.createBiquadFilter(); cHP.type = 'highpass'; cHP.frequency.value = 5500;
    const cG   = ctx.createGain(); cG.gain.value = vol * 3.0;
    cSrc.connect(cHP); cHP.connect(cG); cG.connect(ctx.destination);
    cSrc.start(time); cSrc.stop(time + 0.009);

    const pLen = Math.floor(sr * 0.07);
    const pBuf = ctx.createBuffer(1, pLen, sr);
    const pd   = pBuf.getChannelData(0);
    for (let i = 0; i < pLen; i++) {
        const s = i / sr;
        pd[i] = (Math.random() * 2 - 1) * Math.exp(-s / 0.012)
              + Math.sin(2 * Math.PI * 210 * s) * Math.exp(-s / 0.020) * 0.5;
    }
    const pSrc = ctx.createBufferSource(); pSrc.buffer = pBuf;
    const pBP  = ctx.createBiquadFilter(); pBP.type = 'bandpass'; pBP.frequency.value = 1800; pBP.Q.value = 0.7;
    const pG   = ctx.createGain(); pG.gain.setValueAtTime(vol, time);
    pG.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    pSrc.connect(pBP); pBP.connect(pG); pG.connect(ctx.destination);
    pSrc.start(time); pSrc.stop(time + 0.08);
}

function iniciarRedoble(duracionSegundos) {
    try {
        const ctx   = _getAudioCtx();
        const start = ctx.currentTime + 0.08;
        const end   = start + duracionSegundos - 0.35;

        let t = start, interv = 0.19, idx = 0;
        while (t < end) {
            const prog = (t - start) / (end - start);
            const vol = (0.25 + prog * 0.65) * (idx % 2 === 0 ? 1.0 : 0.72);
            _baquetazo(ctx, t, vol);
            t += interv;
            interv = Math.max(0.034, interv * 0.924);
            idx++;
        }
    } catch (e) { console.warn('Audio error:', e); }
}

function golpeFinal() {
    try {
        const ctx = _getAudioCtx();
        const t   = ctx.currentTime + 0.05;

        [261.6, 329.6, 392.0, 523.3].forEach((freq, i) => {
            const o = ctx.createOscillator(); o.type = 'triangle';
            const g = ctx.createGain();
            o.frequency.value = freq;
            g.gain.setValueAtTime(0, t + i * 0.035);
            g.gain.linearRampToValueAtTime(0.20 - i * 0.02, t + i * 0.035 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
            o.connect(g); g.connect(ctx.destination);
            o.start(t + i * 0.035); o.stop(t + 1.1);
        });

        const len = Math.floor(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp  = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 0.8;
        const g   = ctx.createGain();
        g.gain.setValueAtTime(1.0, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        src.connect(bp); bp.connect(g); g.connect(ctx.destination);
        src.start(t);
    } catch (e) { console.warn('Audio error:', e); }
}


// 13) FÁBRICA DE HISTORIAS — Cronómetro doble (preparación + discurso)
const FABRICA_PREP_MS = 30 * 1000;
const FABRICA_DISC_MS = 2 * 60 * 1000;
let fabricaIntervalo      = null;
let fabricaRestanteMs     = FABRICA_PREP_MS;
let fabricaFin            = 0;
let fabricaFase           = 'prep'; // 'prep' | 'discurso'
let fabricaFaseNotificada = false;

let resultadoTimerId       = null;
let resultadoPopupPrepFn   = null;

function mostrarPopupConTimer(popup, accionFn) {
    clearTimeout(resultadoTimerId);
    resultadoPopupPrepFn = accionFn;
    popup.classList.remove('hidden');
    const btn = $('btn-ir-crono');
    btn.onclick = accionFn;
    btn.classList.remove('hidden');
    resultadoTimerId = setTimeout(() => popup.classList.add('hidden'), 5000);
}

function cerrarPopupActual() {
    clearTimeout(resultadoTimerId);
    resultadoTimerId = null;
    const accion = resultadoPopupPrepFn;
    resultadoPopupPrepFn = null;
    fabricaPopup.classList.add('hidden');
    $('resultado-popup').classList.add('hidden');
    const btn = $('btn-ir-crono');
    btn.onclick = null;
    btn.classList.add('hidden');
    if (accion) accion();
}

function montarFabricaPopup() {
    fabricaPopupCerrar.addEventListener('click', cerrarPopupActual);
    fabricaPopup.addEventListener('click', e => { if (e.target === fabricaPopup) cerrarPopupActual(); });

    $('resultado-popup-cerrar').addEventListener('click', cerrarPopupActual);
    $('resultado-popup').addEventListener('click', e => { if (e.target === $('resultado-popup')) cerrarPopupActual(); });
}

function mostrarFabricaPopup(resultados) {
    fabricaPopupContexto.textContent  = resultados['contexto']  || '';
    fabricaPopupProblema.textContent  = resultados['problema']  || '';
    fabricaPopupPersonaje.textContent = resultados['personaje'] || '';
    fabricaPopup.classList.remove('hidden');
}

function montarFabrica() {
    fabricaIniciar.addEventListener('click',  iniciarFabricaPrep);
    fabricaDiscurso.addEventListener('click', iniciarFabricaDiscurso);
    fabricaPausar.addEventListener('click',   pausarFabrica);
    fabricaReset.addEventListener('click',    resetCronometroFabrica);
}

function prepararCronometroFabrica() {
    fabricaCrono.classList.remove('hidden');
    resetCronometroFabrica();
}

function pintarFabrica(ms) {
    const neg = ms < 0;
    // Math.floor para cuenta regresiva (feedback inmediato en el 1er tick),
    // Math.ceil para el tiempo en negativo (tiempo de descuento).
    const abs = neg ? Math.ceil(Math.abs(ms) / 1000) : Math.floor(ms / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    fabricaDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;

    fabricaDisplay.classList.remove('crono-final');
    if (ms <= 5 * 1000) fabricaDisplay.classList.add('crono-final');
}

function iniciarFabricaPrep() {
    mostrarCronoGigante('fabrica-display', 'Preparación', 'fabrica-botones');
    pararFabricaSilencioso();
    fabricaFase = 'prep';
    fabricaFaseNotificada = false;
    fabricaRestanteMs = FABRICA_PREP_MS;
    fabricaFin = Date.now() + fabricaRestanteMs;

    fabricaFaseNombre.textContent = 'Preparación';
    fabricaDisplay.classList.remove('fase-discurso');
    fabricaIniciar.disabled  = true;
    fabricaDiscurso.disabled = true;
    fabricaPausar.disabled   = false;
    fabricaEstado.textContent = '▶ 30 segundos para pensar la historia.';
    pintarFabrica(fabricaRestanteMs - 1);
    iniciarFabricaTick();
}

function iniciarFabricaDiscurso() {
    mostrarCronoGigante('fabrica-display', 'Fábrica de Historias', 'fabrica-botones');
    pararFabricaSilencioso();
    fabricaFase = 'discurso';
    fabricaFaseNotificada = false;
    fabricaRestanteMs = FABRICA_DISC_MS;
    fabricaFin = Date.now() + fabricaRestanteMs;

    fabricaFaseNombre.textContent = 'Discurso';
    fabricaDisplay.classList.add('fase-discurso');
    fabricaIniciar.disabled  = true;
    fabricaDiscurso.disabled = true;
    fabricaPausar.disabled   = false;
    fabricaEstado.textContent = '▶ 2 minutos para contar la historia.';
    pintarFabrica(fabricaRestanteMs - 1);
    iniciarFabricaTick();
}

function iniciarFabricaTick() {
    fabricaIntervalo = setInterval(() => {
        fabricaRestanteMs = fabricaFin - Date.now();
        pintarFabrica(fabricaRestanteMs);
        if (fabricaRestanteMs <= 0 && !fabricaFaseNotificada) {
            fabricaFaseNotificada = true;
            if (fabricaFase === 'prep') {
                bip(880);
                fabricaEstado.textContent = '¡Tiempo de preparación agotado! Pulsa "Iniciar discurso".';
                fabricaDiscurso.disabled = false;
            } else {
                bip(440);
                fabricaEstado.textContent = '¡Fin del discurso!';
            }
        }
    }, 200);
}

function pausarFabrica() {
    if (!fabricaIntervalo) return;
    clearInterval(fabricaIntervalo);
    fabricaIntervalo = null;
    fabricaRestanteMs = fabricaFin - Date.now();
    fabricaPausar.disabled = true;
    if (fabricaFase === 'prep') fabricaIniciar.disabled = false;
    else                        fabricaDiscurso.disabled = false;
    fabricaEstado.textContent = 'Pausa.';
}

function pararFabricaSilencioso() {
    clearInterval(fabricaIntervalo);
    fabricaIntervalo = null;
}

function resetCronometroFabrica() {
    pararFabricaSilencioso();
    fabricaFaseNotificada = false;
    fabricaFase = 'prep';
    fabricaRestanteMs = FABRICA_PREP_MS;
    pintarFabrica(FABRICA_PREP_MS);
    fabricaDisplay.classList.remove('fase-discurso', 'crono-final');
    fabricaFaseNombre.textContent = 'Preparación';
    fabricaIniciar.disabled  = false;
    fabricaDiscurso.disabled = false;
    fabricaPausar.disabled   = true;
    fabricaEstado.textContent = 'Pulsa el botón de la fase que quieras iniciar.';
}


/* 13b) VOCES CON DERECHO — Cronómetro simple (hasta 2:00) */

const VOCES_TOTAL_MS = 2 * 60 * 1000;
let vocesIntervalo         = null;
let vocesRestanteMs        = VOCES_TOTAL_MS;
let vocesFin               = 0;
let vocesEnMarcha          = false;
let vocesTerminadoNotif    = false;

function montarVoces() {
    vocesIniciar.addEventListener('click', iniciarCronometroVoces);
    vocesPausar.addEventListener('click',  pausarCronometroVoces);
    vocesReset.addEventListener('click',   resetCronometroVoces);
}
function prepararCronometroVoces() {
    vocesCrono.classList.remove('hidden');
    resetCronometroVoces();
}
function pintarVoces(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    vocesDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;
    vocesDisplay.classList.toggle('crono-final', ms <= 10 * 1000);
}
function iniciarCronometroVoces() {
    if (vocesEnMarcha) return;
    mostrarCronoGigante('voces-display', 'Voces con Derecho', 'voces-botones');
    vocesEnMarcha = true;
    vocesFin = Date.now() + vocesRestanteMs;
    vocesIniciar.disabled = true;
    vocesPausar.disabled  = false;
    vocesEstado.textContent = 'En marcha — máximo 2:00.';
    vocesIntervalo = setInterval(() => {
        vocesRestanteMs = vocesFin - Date.now();
        pintarVoces(vocesRestanteMs);
        if (vocesRestanteMs <= 0 && !vocesTerminadoNotif) {
            vocesTerminadoNotif = true;
            vocesEstado.textContent = '¡Tiempo agotado! El cronómetro continúa en negativo.';
            bip(660);
        }
    }, 200);
}

function pausarCronometroVoces() {
    if (!vocesEnMarcha) return;
    clearInterval(vocesIntervalo);
    vocesIntervalo = null;
    vocesEnMarcha = false;
    vocesRestanteMs = vocesFin - Date.now();
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
    vocesTerminadoNotif = false;
    vocesRestanteMs = VOCES_TOTAL_MS;
    pintarVoces(VOCES_TOTAL_MS);
    vocesDisplay.classList.remove('crono-final');
    vocesIniciar.disabled = false;
    vocesPausar.disabled  = true;
    vocesEstado.textContent = 'Pulsa "Iniciar" cuando el alumno empiece.';
}

/* 13c) DUELO DE PERSONAJES — Elección de personaje + cronómetro doble */
const DUELO_IMAGENES = {
    'Rafa Nadal':           'img/Rafael_nadal.jpg',
    'Carlos Alcaraz':       'img/Carlos_Alcaraz.jpg',
    'Spider-Man':           'img/spiderman.jpg',
    'Batman':               'img/batman.jpg',
    'Galileo Galilei':      'img/galileo galei.jpg',
    'Isaac Newton':         'img/isaacnewton.jpg',
    'Isabel I de Castilla': 'img/isabelIcastilla.jpg',
    'Juana I de Castilla':  'img/juanaicastilla.jpg',
    'Pablo Picasso':        'img/pablopicasso.jpg',
    'Salvador Dalí':        'img/dali.jpg',
};

const dueloPersonajesPopup  = $('duelo-personajes-popup');
const dueloPopupCardA       = $('duelo-popup-card-a');
const dueloPopupCardB       = $('duelo-popup-card-b');
const dueloPopupImgA        = $('duelo-popup-img-a');
const dueloPopupImgB        = $('duelo-popup-img-b');
const dueloPopupNombreA     = $('duelo-popup-nombre-a');
const dueloPopupNombreB     = $('duelo-popup-nombre-b');
const dueloPopupCuenta      = $('duelo-popup-cuenta');
const dueloPopupEquipoA     = $('duelo-popup-equipo-a');
const dueloPopupEquipoB     = $('duelo-popup-equipo-b');
const dueloPopupSubtitulo   = $('duelo-popup-subtitulo');
let dueloPersonajesPopupInterval = null;

const DUELO_PREP_MS = 60 * 1000;
const DUELO_ARG_MS  = 90 * 1000;

let dueloIntervalo      = null;
let dueloRestanteMs     = DUELO_PREP_MS;
let dueloFin            = 0;
let dueloFase           = 'prep';
let dueloFaseNotificada = false;

function mostrarResultadoSeleccionDuelo(personaje) {
    const img = DUELO_IMAGENES[personaje] || '';
    resultadoDiv.innerHTML = `
        <div class="resultado-seleccion-duelo">
            ${img ? `<img src="${escapar(img)}" alt="${escapar(personaje)}" class="resultado-duelo-img">` : ''}
            <div class="resultado-duelo-etiqueta">Personaje elegido</div>
            <div class="resultado-duelo-nombre">${escapar(personaje)}</div>
        </div>`;
}

function montarDuelo() {
    dueloBtnA.addEventListener('click', () => {
        dueloEleccion.classList.add('hidden');
        mostrarResultadoSeleccionDuelo(dueloBtnA.textContent);
        abrirCronoOverlay(prepararCronometroDuelo);
    });
    dueloBtnB.addEventListener('click', () => {
        dueloEleccion.classList.add('hidden');
        mostrarResultadoSeleccionDuelo(dueloBtnB.textContent);
        abrirCronoOverlay(prepararCronometroDuelo);
    });
    dueloIniciar.addEventListener('click',    iniciarDueloPrep);
    dueloArgumentar.addEventListener('click', iniciarDueloArgumentar);
    dueloPausar.addEventListener('click',     pausarDuelo);
    dueloReset.addEventListener('click',      resetCronometroDuelo);
}

function mostrarEleccionDuelo(resultado) {
    const partes = resultado.split(' vs ');
    const pA = partes[0] ? partes[0].trim() : resultado;
    const pB = partes[1] ? partes[1].trim() : '—';

    dueloBtnA.textContent = pA;
    dueloBtnB.textContent = pB;
    dueloCrono.classList.add('hidden');
    dueloEleccion.classList.add('hidden');
    pararDueloSilencioso();

    dueloPopupImgA.src = DUELO_IMAGENES[pA] || '';
    dueloPopupImgA.alt = pA;
    dueloPopupImgB.src = DUELO_IMAGENES[pB] || '';
    dueloPopupImgB.alt = pB;
    dueloPopupNombreA.textContent = pA;
    dueloPopupNombreB.textContent = pB;
    dueloPopupCuenta.textContent = '10';
    dueloPersonajesPopup.classList.remove('hidden');

    function cerrarPopupYElegir(personajeElegido) {
        clearInterval(dueloPersonajesPopupInterval);
        dueloPersonajesPopupInterval = null;
        dueloPersonajesPopup.classList.add('hidden');
        dueloPopupCardA.removeEventListener('click', elegirA);
        dueloPopupCardB.removeEventListener('click', elegirB);
        mostrarResultadoSeleccionDuelo(personajeElegido);
        abrirCronoOverlay(prepararCronometroDuelo);
    }
    const elegirA = () => cerrarPopupYElegir(pA);
    const elegirB = () => cerrarPopupYElegir(pB);
    dueloPopupCardA.addEventListener('click', elegirA);
    dueloPopupCardB.addEventListener('click', elegirB);

    let cuenta = 10;
    clearInterval(dueloPersonajesPopupInterval);
    dueloPersonajesPopupInterval = setInterval(() => {
        cuenta--;
        dueloPopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(dueloPersonajesPopupInterval);
            dueloPersonajesPopupInterval = null;
            dueloPopupCardA.removeEventListener('click', elegirA);
            dueloPopupCardB.removeEventListener('click', elegirB);
            dueloPersonajesPopup.classList.add('hidden');
            dueloEleccion.classList.remove('hidden');
        }
    }, 1000);
}

function pararDueloEleccionSilencioso() {
    clearInterval(dueloPersonajesPopupInterval);
    dueloPersonajesPopupInterval = null;
    if (dueloPersonajesPopup) dueloPersonajesPopup.classList.add('hidden');
    if (dueloEleccion) dueloEleccion.classList.add('hidden');
}
function prepararCronometroDuelo() {
    dueloCrono.classList.remove('hidden');
    resetCronometroDuelo();
}
function pintarDuelo(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    dueloDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;
    dueloDisplay.classList.toggle('crono-final', ms <= 5 * 1000);
}

function iniciarDueloPrep() {
    mostrarCronoGigante('duelo-display', 'Preparación', 'duelo-botones');
    pararDueloSilencioso();
    dueloFase = 'prep';
    dueloFaseNotificada = false;
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
    mostrarCronoGigante('duelo-display', 'Argumentación', 'duelo-botones');
    pararDueloSilencioso();
    dueloFase = 'argumentar';
    dueloFaseNotificada = false;
    dueloRestanteMs = DUELO_ARG_MS;
    dueloFin = Date.now() + dueloRestanteMs;
    dueloFaseNombre.textContent = 'Argumentación';
    dueloDisplay.classList.add('fase-argumentar');
    dueloIniciar.disabled    = false;
    dueloArgumentar.disabled = true;
    dueloPausar.disabled     = false;
    dueloEstado.textContent = '1 minuto y medio para defender al personaje.';
    iniciarDueloTick();
}

function iniciarDueloTick() {
    dueloIntervalo = setInterval(() => {
        dueloRestanteMs = dueloFin - Date.now();
        pintarDuelo(dueloRestanteMs);
        if (dueloRestanteMs <= 0 && !dueloFaseNotificada) {
            dueloFaseNotificada = true;
            if (dueloFase === 'prep') {
                bip(880);
                dueloEstado.textContent = '¡Tiempo de preparación agotado! El cronómetro sigue en negativo.';
                dueloArgumentar.disabled = false;
            } else {
                bip(440);
                dueloEstado.textContent = '¡Fin de la argumentación! El cronómetro sigue en negativo.';
            }
        }
    }, 200);
}

function pausarDuelo() {
    if (!dueloIntervalo) return;
    clearInterval(dueloIntervalo);
    dueloIntervalo = null;
    dueloRestanteMs = dueloFin - Date.now();
    dueloPausar.disabled = true;
    if (dueloFase === 'prep') dueloIniciar.disabled = false;
    else                      dueloArgumentar.disabled = false;
    dueloEstado.textContent = 'Pausa.';
}

function pararDueloSilencioso() {
    clearInterval(dueloIntervalo);
    dueloIntervalo = null;
}

function resetCronometroDuelo() {
    pararDueloSilencioso();
    dueloFase = 'prep';
    dueloFaseNotificada = false;
    dueloRestanteMs = DUELO_PREP_MS;
    pintarDuelo(DUELO_PREP_MS);
    dueloDisplay.classList.remove('fase-argumentar', 'crono-final');
    dueloFaseNombre.textContent = 'Preparación';
    dueloIniciar.disabled    = false;
    dueloArgumentar.disabled = false;
    dueloPausar.disabled     = true;
    dueloEstado.textContent = 'Pulsa "Iniciar preparación" cuando los participantes estén listos.';
}


/* 13d) FINAL 1 — DECLAMACIÓN — Cronómetro doble (preparación + declamación) */

const DECLA_PREP_MS    = 2 * 60 * 1000;
const DECLA_DISC_MS    = 2 * 60 * 1000;
const DECLA_MIN_MS     = 30 * 1000;

let declaIntervalo   = null;
let declaRestanteMs  = DECLA_PREP_MS;
let declaFin         = 0;
let declaFase        = 'prep';
let declaFaseNotificada = false;

function montarDeclamacion() {
    declaIniciar.addEventListener('click',  iniciarDeclaPrep);
    declaDiscurso.addEventListener('click', iniciarDeclaDiscurso);
    declaPausar.addEventListener('click',   pausarDecla);
    declaReset.addEventListener('click',    resetDecla);
}

function prepararCronometroDecla() {
    declaCrono.classList.remove('hidden');
    resetDecla();
}

function pintarDecla(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    declaDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;

    declaDisplay.classList.remove('crono-minimo', 'crono-final');
    if (ms < 0) {
        declaDisplay.classList.add('crono-final');
    } else if (declaFase === 'declamacion') {
        if (ms <= 10 * 1000)         declaDisplay.classList.add('crono-final');
        else if (ms <= DECLA_MIN_MS) declaDisplay.classList.add('crono-minimo');
    }
}

function iniciarDeclaPrep() {
    mostrarCronoGigante('decla-display', 'Preparación', 'decla-botones');
    pararDeclaSilencioso();
    declaFase = 'prep';
    declaFaseNotificada = false;
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

function iniciarDeclaDiscurso() {
    mostrarCronoGigante('decla-display', 'Declamación', 'decla-botones');
    pararDeclaSilencioso();
    declaFase = 'declamacion';
    declaFaseNotificada = false;
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

function iniciarDeclaTick() {
    declaIntervalo = setInterval(() => {
        declaRestanteMs = declaFin - Date.now();
        pintarDecla(declaRestanteMs);
        if (declaRestanteMs <= 0 && !declaFaseNotificada) {
            declaFaseNotificada = true;
            if (declaFase === 'prep') {
                bip(880);
                declaEstado.textContent = '¡Preparación terminada! El cronómetro sigue en negativo.';
                declaDiscurso.disabled = false;
            } else {
                bip(440);
                declaEstado.textContent = '¡Tiempo máximo agotado! El cronómetro sigue en negativo.';
            }
        }
        if (declaFase === 'declamacion' &&
            declaRestanteMs <= DECLA_MIN_MS && declaRestanteMs > 0 &&
            !declaDisplay.dataset.avisoMin) {
            declaDisplay.dataset.avisoMin = '1';
            declaEstado.textContent = '¡Ya llegaste al mínimo de 1:30! Puedes terminar.';
        }
    }, 200);
}

function pausarDecla() {
    if (!declaIntervalo) return;
    clearInterval(declaIntervalo);
    declaIntervalo = null;
    declaRestanteMs = declaFin - Date.now();
    declaPausar.disabled = true;
    if (declaFase === 'prep') declaIniciar.disabled = false;
    else                      declaDiscurso.disabled = false;
    declaEstado.textContent = 'Pausa — pulsa el botón de fase para seguir.';
}

function pararDeclaSilencioso() {
    clearInterval(declaIntervalo);
    declaIntervalo = null;
}
function resetDecla() {
    pararDeclaSilencioso();
    declaFase = 'prep';
    declaFaseNotificada = false;
    declaRestanteMs = DECLA_PREP_MS;
    pintarDecla(DECLA_PREP_MS);
    declaDisplay.classList.remove('fase-declamacion', 'crono-minimo', 'crono-final');
    delete declaDisplay.dataset.avisoMin;
    declaFaseNombre.textContent = 'Preparación';
    declaIniciar.disabled  = false;
    declaDiscurso.disabled = false;
    declaPausar.disabled   = true;
    declaEstado.textContent = 'Pulsa "Iniciar preparación" cuando el alumno esté listo.';
}


/*13e) FINAL 2 — LA PALABRA CALIENTE — Cronómetro de intervenciones*/
const PALABRA_PREP_SEG  = 15;
const PALABRA_TURNO_SEG = 20;
const PALABRA_TURNOS    = 6;
let palabraTurnoIdx      = 0;
let palabraIntervalo     = null;
let palabraFinInterval   = null;
let palabraRestanteMs    = PALABRA_TURNO_SEG * 1000;
let palabraSegFin        = 0;
let palabraEnMarcha      = false;
let palabraEnPrep        = false;
let palabraPrepRealizada = false;
let palabraMarcasA       = 0;
let palabraMarcasB       = 0;

function montarPalabraCaliente() {
    palabraIniciarBtn.addEventListener('click', iniciarPalabraCaliente);
    palabraPausarBtn.addEventListener('click',  pausarPalabraCaliente);
    palabraResetBtn.addEventListener('click',   resetPalabraCaliente);
}

function pintarPalabraCaliente(ms) {
    const seg = Math.max(0, Math.ceil(ms / 1000));
    palabraCuentaDisplayEl.textContent = `0:${seg.toString().padStart(2, '0')}`;
    palabraCuentaDisplayEl.classList.toggle('crono-urgente', ms <= 5000);
}

function iniciarPalabraCaliente() {
    if (palabraEnMarcha) return;
    mostrarCronoGigante('palabra-cuenta-display', 'La Palabra Caliente', 'palabra-botones');
    palabraEnMarcha = true;

    if (!palabraPrepRealizada && !palabraEnPrep) {
        palabraEnPrep     = true;
        palabraRestanteMs = PALABRA_PREP_SEG * 1000;
        palabraSegFin     = Date.now() + palabraRestanteMs;
        renderTurnoPalabra();
        palabraCronoEstado.textContent = '¡Preparaos! 15 segundos antes de la primera intervención.';
    } else {
        palabraSegFin = Date.now() + palabraRestanteMs;
        palabraCronoEstado.textContent = palabraEnPrep
            ? '¡Preparaos! 15 segundos antes de la primera intervención.'
            : turnoDescripcionPalabra();
    }

    palabraIniciarBtn.disabled = true;
    palabraPausarBtn.disabled  = false;
    palabraIntervalo = setInterval(palabraTick, 100);
}






function palabraTick() {
    palabraRestanteMs = palabraSegFin - Date.now();
    if (palabraRestanteMs <= 0) {
        pintarPalabraCaliente(0);
        if (palabraEnPrep) {
            palabraEnPrep        = false;
            palabraPrepRealizada = true;
            bip(880);
            palabraRestanteMs = PALABRA_TURNO_SEG * 1000;
            palabraSegFin     = Date.now() + palabraRestanteMs;
            renderTurnoPalabra();
            palabraCronoEstado.textContent = turnoDescripcionPalabra();
            pintarPalabraCaliente(palabraRestanteMs);
        } else {
            avanzarTurnoPalabra();
        }
    } else {
        pintarPalabraCaliente(palabraRestanteMs);
    }
}

function avanzarTurnoPalabra() {
    if (palabraTurnoIdx % 2 === 0) palabraMarcasA++;
    else                            palabraMarcasB++;
    renderPalitos();

    palabraTurnoIdx++;

    if (palabraTurnoIdx >= PALABRA_TURNOS) {
        clearInterval(palabraIntervalo);
        palabraIntervalo = null;
        palabraEnMarcha  = false;
        terminarPalabraCaliente();
        return;
    }

    bip(880);
    palabraRestanteMs = PALABRA_TURNO_SEG * 1000;
    palabraSegFin     = Date.now() + palabraRestanteMs;
    renderTurnoPalabra();
    palabraCronoEstado.textContent = turnoDescripcionPalabra();
}

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

function pararPalabraCalienteSilencioso() {
    clearInterval(palabraIntervalo);
    palabraIntervalo = null;
    clearInterval(palabraFinInterval);
    palabraFinInterval = null;
    palabraEnMarcha = false;
}

function terminarPalabraCaliente() {
    bip(660);
    setTimeout(() => bip(660), 350);
    palabraCronoEstado.textContent = '¡Las 6 intervenciones han concluido!';

    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Tiempo agotado!';
    hazmePopupNombre.textContent  = '3 intervenciones por participante';
    hazmePopupCuenta.textContent  = '✓';
    hazmePopup.classList.remove('hidden');

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
            if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
        }
    }, 1000);
}

function resetPalabraCaliente() {
    pararPalabraCalienteSilencioso();
    palabraTurnoIdx      = 0;
    palabraMarcasA       = 0;
    palabraMarcasB       = 0;
    palabraRestanteMs    = PALABRA_TURNO_SEG * 1000;
    palabraEnMarcha      = false;
    palabraEnPrep        = false;
    palabraPrepRealizada = false;
    renderTurnoPalabra();
    renderPalitos();
    pintarPalabraCaliente(PALABRA_TURNO_SEG * 1000);
    palabraIniciarBtn.disabled = false;
    palabraPausarBtn.disabled  = true;
    palabraCronoEstado.textContent = 'Pulsa Iniciar para comenzar la preparación (15 s).';
}

function renderTurnoPalabra() {
    if (palabraEnPrep) {
        palabraTurnoDisplayEl.classList.remove('turno-a', 'turno-b');
        palabraTurnoDisplayEl.classList.add('turno-prep');
        palabraParticipanteLabel.textContent = 'Preparación';
        palabraTurnoInfoEl.textContent       = '15 segundos';
        palabraCuentaDisplayEl.classList.remove('crono-urgente');
        return;
    }
    palabraTurnoDisplayEl.classList.remove('turno-prep');
    const esA = palabraTurnoIdx % 2 === 0;
    palabraTurnoDisplayEl.classList.toggle('turno-a',  esA);
    palabraTurnoDisplayEl.classList.toggle('turno-b', !esA);
    palabraParticipanteLabel.textContent = esA ? 'Participante A' : 'Participante B';
    palabraTurnoInfoEl.textContent = `Turno ${palabraTurnoIdx + 1} de ${PALABRA_TURNOS}`;
    palabraCuentaDisplayEl.classList.remove('crono-urgente');
}

function turnoDescripcionPalabra() {
    const esA     = palabraTurnoIdx % 2 === 0;
    const quien   = esA ? 'Participante A' : 'Participante B';
    const nInterv = Math.floor(palabraTurnoIdx / 2) + 1;
    return `${quien} — intervención ${nInterv}/3. ¡20 segundos!`;
}

function renderPalitos() {
    if (!palitosA || !palitosB) return;
    palitosA.innerHTML = generarPalitos(palabraMarcasA);
    palitosB.innerHTML = generarPalitos(palabraMarcasB);
}

function generarPalitos(n) {
    let html = '';
    for (let i = 0; i < n; i++) {
        const ultimo = i === n - 1 ? ' palito-ultimo' : '';
        html += `<span class="palito${ultimo}"></span>`;
    }
    return html;
}


/* 13f) FINAL 3 — DUELO DE PERSONAJES FINAL — Sorteo de equipos + cronómetro*/
const DUELO_FINAL_PREP_MS     = 60 * 1000;
const DUELO_FINAL_EXPO_MS     = 60 * 1000;
const DUELO_FINAL_REPLICA_SEG = 30;
const DUELO_FINAL_REPLICAS    = 6;

let dueloFinalEquipoA     = '';
let dueloFinalEquipoB     = '';
let dueloFinalPersonajeA  = '';
let dueloFinalPersonajeB  = '';

let dueloFinalFase         = 'prep';
let dueloFinalIntervalo    = null;
let dueloFinalRestanteMs   = DUELO_FINAL_PREP_MS;
let dueloFinalFin          = 0;
let dueloFinalFaseNotificada = false;

let dueloFinalAsignarInterval = null;
let dueloFinalFinInterval     = null;
let dueloFinalActivo           = 1;

let dueloFinalReplicaIdx  = 0;
let dueloFinalReplicasA   = 0;
let dueloFinalReplicasB   = 0;

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
function mostrarAsignacionFinalDuelo(resultado) {
    const partes = resultado.split(' vs ');
    dueloFinalPersonajeA = partes[0] ? partes[0].trim() : resultado;
    dueloFinalPersonajeB = partes[1] ? partes[1].trim() : '—';

    dueloFinalAsignarDiv.classList.remove('hidden');
    dueloFinalPanel.classList.add('hidden');
}

function sortearEquiposDueloFinal() {
    const eqA = dueloFinalActivo === 1 ? finalEquipo1 : finalEquipo3;
    const eqB = dueloFinalActivo === 1 ? finalEquipo2 : finalEquipo4;

    if (!eqA || !eqB) {
        dueloFinalEstado.textContent = 'Primero realiza el sorteo de emparejamientos.';
        return;
    }

    dueloFinalActivo = dueloFinalActivo === 1 ? 2 : 1;

    const [t1, t2] = Math.random() < 0.5 ? [eqA, eqB] : [eqB, eqA];

    dueloFinalEquipoA = t1.nombre;
    dueloFinalEquipoB = t2.nombre;

    dueloFinalAsignarBtn.disabled = true;

    dueloPopupImgA.src = DUELO_IMAGENES[dueloFinalPersonajeA] || '';
    dueloPopupImgA.alt = dueloFinalPersonajeA;
    dueloPopupImgB.src = DUELO_IMAGENES[dueloFinalPersonajeB] || '';
    dueloPopupImgB.alt = dueloFinalPersonajeB;
    dueloPopupNombreA.textContent = dueloFinalPersonajeA;
    dueloPopupNombreB.textContent = dueloFinalPersonajeB;

    dueloPopupEquipoA.textContent = dueloFinalEquipoA;
    dueloPopupEquipoB.textContent = dueloFinalEquipoB;
    dueloPopupEquipoA.classList.remove('hidden');
    dueloPopupEquipoB.classList.remove('hidden');

    document.querySelectorAll('.duelo-popup-elegir-label').forEach(el => el.classList.add('hidden'));
    dueloPopupSubtitulo.textContent = '¡Asignación por sorteo!';

    dueloPopupCardA.disabled = true;
    dueloPopupCardB.disabled = true;

    dueloPopupCuenta.textContent = '10';
    dueloPersonajesPopup.classList.remove('hidden');

    let cuenta = 10;
    clearInterval(dueloFinalAsignarInterval);
    dueloFinalAsignarInterval = setInterval(() => {
        cuenta--;
        dueloPopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(dueloFinalAsignarInterval);
            dueloFinalAsignarInterval = null;
            dueloPersonajesPopup.classList.add('hidden');
            dueloPopupEquipoA.classList.add('hidden');
            dueloPopupEquipoB.classList.add('hidden');
            document.querySelectorAll('.duelo-popup-elegir-label').forEach(el => el.classList.remove('hidden'));
            dueloPopupSubtitulo.textContent = 'Pulsa al personaje que vas a defender';
            dueloPopupCardA.disabled = false;
            dueloPopupCardB.disabled = false;
            activarPanelDueloFinal();
        }
    }, 1000);
}

function pararAsignarDueloFinalSilencioso() {
    clearInterval(dueloFinalAsignarInterval);
    dueloFinalAsignarInterval = null;
    if (dueloPersonajesPopup) dueloPersonajesPopup.classList.add('hidden');
    if (dueloPopupEquipoA) dueloPopupEquipoA.classList.add('hidden');
    if (dueloPopupEquipoB) dueloPopupEquipoB.classList.add('hidden');
    document.querySelectorAll('.duelo-popup-elegir-label').forEach(el => el.classList.remove('hidden'));
    if (dueloPopupSubtitulo) dueloPopupSubtitulo.textContent = 'Pulsa al personaje que vas a defender';
    if (dueloPopupCardA) dueloPopupCardA.disabled = false;
    if (dueloPopupCardB) dueloPopupCardB.disabled = false;
}

function activarPanelDueloFinal() {
    const btn = $('btn-ir-crono');
    btn.onclick = () => abrirCronoOverlay(prepararDueloFinalCrono, ['duelo-final-panel']);
    btn.classList.remove('hidden');
}

function prepararDueloFinalCrono() {
    dueloFinalAsignarDiv.classList.add('hidden');
    replicaNombreA.textContent = dueloFinalEquipoA;
    replicaNombreB.textContent = dueloFinalEquipoB;
    dueloFinalIniciarExpoA.textContent = `Exposición: ${dueloFinalEquipoA} (1:00)`;
    dueloFinalIniciarExpoB.textContent = `Exposición: ${dueloFinalEquipoB} (1:00)`;

    const imgA = DUELO_IMAGENES[dueloFinalPersonajeA] || '';
    const imgB = DUELO_IMAGENES[dueloFinalPersonajeB] || '';
    resultadoDiv.innerHTML = `
        <div class="resultado-duelo-final-dupla">
            <div class="resultado-duelo-card">
                ${imgA ? `<img src="${escapar(imgA)}" alt="${escapar(dueloFinalPersonajeA)}" class="resultado-duelo-img">` : ''}
                <div class="resultado-duelo-nombre">${escapar(dueloFinalPersonajeA)}</div>
                <div class="resultado-duelo-equipo">${escapar(dueloFinalEquipoA)}</div>
            </div>
            <div class="resultado-duelo-vs">VS</div>
            <div class="resultado-duelo-card">
                ${imgB ? `<img src="${escapar(imgB)}" alt="${escapar(dueloFinalPersonajeB)}" class="resultado-duelo-img">` : ''}
                <div class="resultado-duelo-nombre">${escapar(dueloFinalPersonajeB)}</div>
                <div class="resultado-duelo-equipo">${escapar(dueloFinalEquipoB)}</div>
            </div>
        </div>`;

    dueloFinalPanel.classList.remove('hidden');
    dueloFinalFase       = 'prep';
    dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    dueloFinalReplicaIdx = 0;
    dueloFinalReplicasA  = 0;
    dueloFinalReplicasB  = 0;
    resetDueloFinalUI();
}

function pintarDueloFinal(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    dueloFinalDisplayEl.textContent = `${neg ? '-' : ''}${m}:${s}`;
    const umbral = dueloFinalFase === 'replica' ? 5000 : 10000;
    dueloFinalDisplayEl.classList.toggle('crono-urgente', ms <= umbral);
}
function iniciarDueloFinalPrep() {
    mostrarCronoGigante('duelo-final-display', 'Preparación', 'duelo-final-botones');
    if (dueloFinalFase !== 'prep') {
        dueloFinalFase = 'prep';
        dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    }
    pararDueloFinalSilencioso();
    dueloFinalFaseNotificada = false;
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalBloque.className = 'duelo-final-bloque fase-prep';
    dueloFinalQuienEl.textContent = 'Preparación';
    dueloFinalFaseInfoEl.textContent = 'Fase 1 de 4';
    dueloFinalIniciarPrep.disabled = true;
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = '1 minuto para que ambos equipos preparen sus argumentos.';
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

function iniciarDueloFinalExpoA() {
    mostrarCronoGigante('duelo-final-display', 'Exposición A', 'duelo-final-botones');
    if (dueloFinalFase !== 'expo-a') {
        dueloFinalFase = 'expo-a';
        dueloFinalRestanteMs = DUELO_FINAL_EXPO_MS;
    }
    pararDueloFinalSilencioso();
    dueloFinalFaseNotificada = false;
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalBloque.className = 'duelo-final-bloque turno-a';
    dueloFinalQuienEl.textContent = dueloFinalEquipoA;
    dueloFinalFaseInfoEl.textContent = 'Fase 2 de 4';
    dueloFinalIniciarExpoA.disabled = true;
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = `1 minuto de exposición inicial para ${dueloFinalEquipoA}.`;
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

function iniciarDueloFinalExpoB() {
    mostrarCronoGigante('duelo-final-display', 'Exposición B', 'duelo-final-botones');
    if (dueloFinalFase !== 'expo-b') {
        dueloFinalFase = 'expo-b';
        dueloFinalRestanteMs = DUELO_FINAL_EXPO_MS;
    }
    pararDueloFinalSilencioso();
    dueloFinalFaseNotificada = false;
    dueloFinalFin = Date.now() + dueloFinalRestanteMs;

    dueloFinalBloque.className = 'duelo-final-bloque turno-b';
    dueloFinalQuienEl.textContent = dueloFinalEquipoB;
    dueloFinalFaseInfoEl.textContent = 'Fase 3 de 4';
    dueloFinalIniciarExpoB.disabled = true;
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = `1 minuto de exposición inicial para ${dueloFinalEquipoB}.`;
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

function iniciarDueloFinalReplica() {
    mostrarCronoGigante('duelo-final-display', 'Réplicas', 'duelo-final-botones');
    if (dueloFinalFase !== 'replica') {
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

    dueloFinalIniciarReplica.disabled = true;
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = turnoDescripcionReplicaDueloFinal();
    dueloFinalIntervalo = setInterval(dueloFinalTick, 100);
}

function dueloFinalTick() {
    dueloFinalRestanteMs = dueloFinalFin - Date.now();
    pintarDueloFinal(dueloFinalRestanteMs);
    if (dueloFinalRestanteMs <= 0) {
        if (dueloFinalFase === 'replica') {
            terminarFaseDueloFinal();
        } else if (!dueloFinalFaseNotificada) {
            dueloFinalFaseNotificada = true;
            if (dueloFinalFase === 'prep') {
                bip(880);
                dueloFinalEstado.textContent =
                    '¡Preparación terminada! El cronómetro sigue en negativo. Pulsa la exposición cuando estés listo.';
                dueloFinalIniciarExpoA.classList.remove('hidden');
                dueloFinalIniciarExpoA.disabled = false;
            } else if (dueloFinalFase === 'expo-a') {
                bip(880);
                dueloFinalEstado.textContent =
                    `¡Tiempo de ${dueloFinalEquipoA}! El cronómetro sigue en negativo.`;
                dueloFinalIniciarExpoB.classList.remove('hidden');
                dueloFinalIniciarExpoB.disabled = false;
            } else if (dueloFinalFase === 'expo-b') {
                bip(880);
                dueloFinalEstado.textContent =
                    `¡Tiempo de ${dueloFinalEquipoB}! El cronómetro sigue en negativo. Pulsa "Iniciar réplicas" para continuar.`;
                dueloFinalIniciarReplica.classList.remove('hidden');
                dueloFinalIniciarReplica.disabled = false;
            }
        }
    }
}

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
        if (dueloFinalReplicaIdx % 2 === 0) dueloFinalReplicasA++;
        else                                  dueloFinalReplicasB++;
        renderReplicasDueloFinal();

        dueloFinalReplicaIdx++;

        if (dueloFinalReplicaIdx >= DUELO_FINAL_REPLICAS) {
            dueloFinalPausarBtn.disabled = true;
            terminarDueloFinal();
            return;
        }

        bip(880);
        dueloFinalRestanteMs = DUELO_FINAL_REPLICA_SEG * 1000;
        dueloFinalFin        = Date.now() + dueloFinalRestanteMs;
        renderTurnoReplicaDueloFinal();
        dueloFinalEstado.textContent = turnoDescripcionReplicaDueloFinal();
        dueloFinalIntervalo = setInterval(dueloFinalTick, 100);
    }
}

function turnoDescripcionReplicaDueloFinal() {
    const esA   = dueloFinalReplicaIdx % 2 === 0;
    const quien = esA ? dueloFinalEquipoA : dueloFinalEquipoB;
    const nRep  = Math.floor(dueloFinalReplicaIdx / 2) + 1;
    return `${quien} — réplica ${nRep}/3. ¡30 segundos!`;
}

function renderTurnoReplicaDueloFinal() {
    const esA = dueloFinalReplicaIdx % 2 === 0;
    dueloFinalBloque.className = 'duelo-final-bloque ' + (esA ? 'turno-a' : 'turno-b');
    dueloFinalQuienEl.textContent = esA ? dueloFinalEquipoA : dueloFinalEquipoB;
    dueloFinalFaseInfoEl.textContent =
        `Fase 4 de 4 — Réplica ${dueloFinalReplicaIdx + 1} de ${DUELO_FINAL_REPLICAS}`;
    dueloFinalDisplayEl.classList.remove('crono-urgente');
    pintarDueloFinal(dueloFinalRestanteMs);
}

function renderReplicasDueloFinal() {
    if (!replicasAEl || !replicasBEl) return;
    replicasAEl.innerHTML = generarPalitos(dueloFinalReplicasA);
    replicasBEl.innerHTML = generarPalitos(dueloFinalReplicasB);
}

function pausarDueloFinal() {
    if (!dueloFinalIntervalo) return;
    clearInterval(dueloFinalIntervalo);
    dueloFinalIntervalo  = null;
    dueloFinalRestanteMs = dueloFinalFin - Date.now();
    dueloFinalPausarBtn.disabled = true;
    if      (dueloFinalFase === 'prep')    dueloFinalIniciarPrep.disabled    = false;
    else if (dueloFinalFase === 'expo-a')  dueloFinalIniciarExpoA.disabled   = false;
    else if (dueloFinalFase === 'expo-b')  dueloFinalIniciarExpoB.disabled   = false;
    else if (dueloFinalFase === 'replica') dueloFinalIniciarReplica.disabled = false;
    dueloFinalEstado.textContent = 'Pausa — pulsa el botón de fase para continuar.';
}

function pararDueloFinalSilencioso() {
    clearInterval(dueloFinalIntervalo);
    dueloFinalIntervalo = null;
    clearInterval(dueloFinalFinInterval);
    dueloFinalFinInterval = null;
}

function terminarDueloFinal() {
    bip(660);
    setTimeout(() => bip(660), 350);
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

function resetDueloFinalUI() {
    dueloFinalFaseNotificada = false;
    pintarDueloFinal(DUELO_FINAL_PREP_MS);
    dueloFinalBloque.className = 'duelo-final-bloque fase-prep';
    dueloFinalQuienEl.textContent = 'Preparación';
    dueloFinalFaseInfoEl.textContent = 'Fase 1 de 4';
    dueloFinalDisplayEl.classList.remove('crono-urgente');
    dueloFinalIniciarPrep.disabled    = false;
    dueloFinalIniciarPrep.classList.remove('hidden');
    dueloFinalIniciarExpoA.classList.remove('hidden');
    dueloFinalIniciarExpoA.disabled   = false;
    dueloFinalIniciarExpoB.classList.remove('hidden');
    dueloFinalIniciarExpoB.disabled   = false;
    dueloFinalIniciarReplica.classList.remove('hidden');
    dueloFinalIniciarReplica.disabled = false;
    dueloFinalPausarBtn.disabled = true;
    dueloFinalReplicasTabla.classList.add('hidden');
    renderReplicasDueloFinal();
    dueloFinalEstado.textContent = 'Pulsa "Iniciar preparación" cuando los equipos estén listos.';
}

function resetDueloFinal() {
    pararDueloFinalSilencioso();
    dueloFinalFase       = 'prep';
    dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    dueloFinalReplicaIdx = 0;
    dueloFinalReplicasA  = 0;
    dueloFinalReplicasB  = 0;
    dueloFinalActivo      = 1;
    if (dueloFinalAsignarBtn) dueloFinalAsignarBtn.disabled = false;
}


/*13g) FINAL 4 — EL MINUTO DE ORO — Dos cronómetros en estrella*/

const MINUTO_ORO_MS = 60 * 1000;

let minutoOroEquipoA = '';
let minutoOroEquipoB = '';
let minutoOroEquipoC = '';
let minutoOroEquipoD = '';

let minutoAIntervalo    = null;
let minutoARestanteMs   = MINUTO_ORO_MS;
let minutoAFin          = 0;
let minutoAEnMarcha     = false;
let minutoATerminado    = false;
let minutoANotificada   = false;

let minutoBIntervalo    = null;
let minutoBRestanteMs   = MINUTO_ORO_MS;
let minutoBFin          = 0;
let minutoBEnMarcha     = false;
let minutoBTerminado    = false;
let minutoBNotificada   = false;

let minutoCIntervalo    = null;
let minutoCRestanteMs   = MINUTO_ORO_MS;
let minutoCFin          = 0;
let minutoCEnMarcha     = false;
let minutoCTerminado    = false;
let minutoCNotificada   = false;

let minutoDIntervalo    = null;
let minutoDRestanteMs   = MINUTO_ORO_MS;
let minutoDFin          = 0;
let minutoDEnMarcha     = false;
let minutoDTerminado    = false;
let minutoDNotificada   = false;

let minutoOroAsignarInterval = null;
let minutoOroFinInterval     = null;

function montarMinutoOro() {
    minutoOroAsignarBtn.addEventListener('click', sortearEquiposMinutoOro);
    minutoAIniciar.addEventListener('click', iniciarMinutoA);
    minutoAPausar.addEventListener('click',  pausarMinutoA);
    minutoAReset.addEventListener('click',   resetMinutoA);
    minutoBIniciar.addEventListener('click', iniciarMinutoB);
    minutoBPausar.addEventListener('click',  pausarMinutoB);
    minutoBReset.addEventListener('click',   resetMinutoB);
    minutoCIniciar.addEventListener('click', iniciarMinutoC);
    minutoCPausar.addEventListener('click',  pausarMinutoC);
    minutoCReset.addEventListener('click',   resetMinutoC);
    minutoDIniciar.addEventListener('click', iniciarMinutoD);
    minutoDPausar.addEventListener('click',  pausarMinutoD);
    minutoDReset.addEventListener('click',   resetMinutoD);
    minutoOroPuntuacionesBtn.addEventListener('click', () => irAPuntuar('minuto-oro'));
    $('minuto-oro-volver').addEventListener('click', () => {
        pararMinutoOroSilencioso();
        volverSeleccion();
    });
}
function inicializarMinutoOro() {
    pararMinutoOroSilencioso();
    minutoOroCronos.classList.add('hidden');
    minutoOroPuntuacionesBtn.classList.add('hidden');
    minutoOroAsignarEstado.textContent = '';
    minutoOroAsignarBtn.disabled = false;
    minutoOroAsignarDiv.classList.remove('hidden');

    resetMinutoA();
    resetMinutoB();
    resetMinutoC();
    resetMinutoD();
}

function sortearEquiposMinutoOro() {
    const clasificados = equipos
        .slice()
        .sort((a, b) => totalEquipo(b.id, 'total') - totalEquipo(a.id, 'total'))
        .slice(0, 4);

    if (clasificados.length < 4) {
        minutoOroAsignarEstado.textContent =
            'Necesitas al menos 4 equipos registrados para sortear.';
        return;
    }

    const barajados = clasificados.slice().sort(() => Math.random() - 0.5);
    minutoOroEquipoA = barajados[0].nombre;
    minutoOroEquipoB = barajados[1].nombre;
    minutoOroEquipoC = barajados[2].nombre;
    minutoOroEquipoD = barajados[3].nombre;

    minutoOroAsignarBtn.disabled = true;

    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Equipos del Minuto de Oro!';
    hazmePopupNombre.textContent =
        `⭐ ${escapar(minutoOroEquipoA)}\n⭐ ${escapar(minutoOroEquipoB)}\n⭐ ${escapar(minutoOroEquipoC)}\n⭐ ${escapar(minutoOroEquipoD)}`;
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

function pararAsignarMinutoOroSilencioso() {
    clearInterval(minutoOroAsignarInterval);
    minutoOroAsignarInterval = null;
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
}

function activarCronosMinutoOro() {
    minutoANombre.textContent = minutoOroEquipoA;
    minutoBNombre.textContent = minutoOroEquipoB;
    minutoCNombre.textContent = minutoOroEquipoC;
    minutoDNombre.textContent = minutoOroEquipoD;
    minutoOroCronos.classList.remove('hidden');
    resetMinutoA();
    resetMinutoB();
    resetMinutoC();
    resetMinutoD();
}

function pintarMinutoA(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    minutoADisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;
    minutoADisplay.classList.toggle('crono-final', ms <= 10000 && ms > 0);
}

function pintarMinutoB(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    minutoBDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;
    minutoBDisplay.classList.toggle('crono-final', ms <= 10000 && ms > 0);
}

function iniciarMinutoA() {
    if (minutoAEnMarcha || minutoATerminado) return;
    mostrarCronoGigante('minuto-a-display', minutoOroEquipoA || 'Equipo A', 'minuto-a-botones', 'estrella-a');
    minutoAEnMarcha = true;
    minutoAFin = Date.now() + minutoARestanteMs;
    minutoAIniciar.disabled = true;
    minutoAPausar.disabled  = false;
    minutoAEstado.textContent = `¡1 minuto para ${minutoOroEquipoA || 'Equipo A'}!`;
    minutoAIntervalo = setInterval(() => {
        minutoARestanteMs = minutoAFin - Date.now();
        pintarMinutoA(minutoARestanteMs);
        if (minutoARestanteMs <= 0 && !minutoANotificada) {
            minutoANotificada = true;
            bip(660);
            minutoAEstado.textContent = `¡Tiempo de ${minutoOroEquipoA || 'Equipo A'} agotado! El cronómetro sigue en negativo.`;
            minutoADisplay.classList.remove('crono-final');
            estrellaA.classList.add('terminada');
            minutoOroPuntuacionesBtn.classList.remove('hidden');
        }
    }, 200);
}

function pausarMinutoA() {
    if (!minutoAEnMarcha) return;
    clearInterval(minutoAIntervalo);
    minutoAIntervalo  = null;
    minutoAEnMarcha   = false;
    minutoARestanteMs = minutoAFin - Date.now();
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
    minutoANotificada = false;
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
    estrellaA.classList.add('terminada');
    minutoAIniciar.disabled = true;
    minutoAPausar.disabled  = true;
    minutoAEstado.textContent = `¡Tiempo de ${minutoOroEquipoA || 'Equipo A'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden');
    bip(660);
    verificarFinMinutoOro();
}

function iniciarMinutoB() {
    if (minutoBEnMarcha || minutoBTerminado) return;
    mostrarCronoGigante('minuto-b-display', minutoOroEquipoB || 'Equipo B', 'minuto-b-botones', 'estrella-b');
    minutoBEnMarcha = true;
    minutoBFin = Date.now() + minutoBRestanteMs;
    minutoBIniciar.disabled = true;
    minutoBPausar.disabled  = false;
    minutoBEstado.textContent = `¡1 minuto para ${minutoOroEquipoB || 'Equipo B'}!`;
    minutoBIntervalo = setInterval(() => {
        minutoBRestanteMs = minutoBFin - Date.now();
        pintarMinutoB(minutoBRestanteMs);
        if (minutoBRestanteMs <= 0 && !minutoBNotificada) {
            minutoBNotificada = true;
            bip(660);
            minutoBEstado.textContent = `¡Tiempo de ${minutoOroEquipoB || 'Equipo B'} agotado! El cronómetro sigue en negativo.`;
            minutoBDisplay.classList.remove('crono-final');
            estrellaB.classList.add('terminada');
            minutoOroPuntuacionesBtn.classList.remove('hidden');
        }
    }, 200);
}

function pausarMinutoB() {
    if (!minutoBEnMarcha) return;
    clearInterval(minutoBIntervalo);
    minutoBIntervalo  = null;
    minutoBEnMarcha   = false;
    minutoBRestanteMs = minutoBFin - Date.now();
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
    minutoBNotificada = false;
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
    estrellaB.classList.add('terminada');
    minutoBIniciar.disabled = true;
    minutoBPausar.disabled  = true;
    minutoBEstado.textContent = `¡Tiempo de ${minutoOroEquipoB || 'Equipo B'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden');
    bip(660);
    verificarFinMinutoOro();
}

function iniciarMinutoC() {
    if (minutoCEnMarcha || minutoCTerminado) return;
    mostrarCronoGigante('minuto-c-display', minutoOroEquipoC || 'Equipo C', 'minuto-c-botones', 'estrella-c');
    minutoCEnMarcha = true;
    minutoCFin = Date.now() + minutoCRestanteMs;
    minutoCIniciar.disabled = true;
    minutoCPausar.disabled  = false;
    minutoCEstado.textContent = `¡1 minuto para ${minutoOroEquipoC || 'Equipo C'}!`;
    minutoCIntervalo = setInterval(() => {
        minutoCRestanteMs = minutoCFin - Date.now();
        pintarMinutoC(minutoCRestanteMs);
        if (minutoCRestanteMs <= 0 && !minutoCNotificada) {
            minutoCNotificada = true;
            bip(660);
            minutoCEstado.textContent = `¡Tiempo de ${minutoOroEquipoC || 'Equipo C'} agotado! El cronómetro sigue en negativo.`;
            minutoCDisplay.classList.remove('crono-final');
            estrellaC.classList.add('terminada');
            minutoOroPuntuacionesBtn.classList.remove('hidden');
        }
    }, 200);
}

function pausarMinutoC() {
    if (!minutoCEnMarcha) return;
    clearInterval(minutoCIntervalo);
    minutoCIntervalo  = null;
    minutoCEnMarcha   = false;
    minutoCRestanteMs = minutoCFin - Date.now();
    minutoCIniciar.disabled = false;
    minutoCPausar.disabled  = true;
    minutoCEstado.textContent = 'Pausa — pulsa Iniciar para continuar.';
}

function pararMinutoCSilencioso() {
    clearInterval(minutoCIntervalo);
    minutoCIntervalo = null;
    minutoCEnMarcha  = false;
}

function resetMinutoC() {
    pararMinutoCSilencioso();
    minutoCRestanteMs = MINUTO_ORO_MS;
    minutoCTerminado  = false;
    minutoCNotificada = false;
    pintarMinutoC(MINUTO_ORO_MS);
    if (estrellaC) estrellaC.classList.remove('terminada');
    if (minutoCDisplay) minutoCDisplay.classList.remove('crono-final');
    if (minutoCIniciar) minutoCIniciar.disabled = false;
    if (minutoCPausar)  minutoCPausar.disabled  = true;
    if (minutoCEstado)  minutoCEstado.textContent = 'Listo para empezar.';
}

function terminarMinutoC() {
    pararMinutoCSilencioso();
    minutoCTerminado = true;
    pintarMinutoC(0);
    minutoCDisplay.classList.remove('crono-final');
    estrellaC.classList.add('terminada');
    minutoCIniciar.disabled = true;
    minutoCPausar.disabled  = true;
    minutoCEstado.textContent = `¡Tiempo de ${minutoOroEquipoC || 'Equipo C'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden');
    bip(660);
    verificarFinMinutoOro();
}

function pintarMinutoC(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    minutoCDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;
    minutoCDisplay.classList.toggle('crono-final', ms <= 10000 && ms > 0);
}

function iniciarMinutoD() {
    if (minutoDEnMarcha || minutoDTerminado) return;
    mostrarCronoGigante('minuto-d-display', minutoOroEquipoD || 'Equipo D', 'minuto-d-botones', 'estrella-d');
    minutoDEnMarcha = true;
    minutoDFin = Date.now() + minutoDRestanteMs;
    minutoDIniciar.disabled = true;
    minutoDPausar.disabled  = false;
    minutoDEstado.textContent = `¡1 minuto para ${minutoOroEquipoD || 'Equipo D'}!`;
    minutoDIntervalo = setInterval(() => {
        minutoDRestanteMs = minutoDFin - Date.now();
        pintarMinutoD(minutoDRestanteMs);
        if (minutoDRestanteMs <= 0 && !minutoDNotificada) {
            minutoDNotificada = true;
            bip(660);
            minutoDEstado.textContent = `¡Tiempo de ${minutoOroEquipoD || 'Equipo D'} agotado! El cronómetro sigue en negativo.`;
            minutoDDisplay.classList.remove('crono-final');
            estrellaD.classList.add('terminada');
            minutoOroPuntuacionesBtn.classList.remove('hidden');
        }
    }, 200);
}

function pausarMinutoD() {
    if (!minutoDEnMarcha) return;
    clearInterval(minutoDIntervalo);
    minutoDIntervalo  = null;
    minutoDEnMarcha   = false;
    minutoDRestanteMs = minutoDFin - Date.now();
    minutoDIniciar.disabled = false;
    minutoDPausar.disabled  = true;
    minutoDEstado.textContent = 'Pausa — pulsa Iniciar para continuar.';
}

function pararMinutoDSilencioso() {
    clearInterval(minutoDIntervalo);
    minutoDIntervalo = null;
    minutoDEnMarcha  = false;
}

function resetMinutoD() {
    pararMinutoDSilencioso();
    minutoDRestanteMs = MINUTO_ORO_MS;
    minutoDTerminado  = false;
    minutoDNotificada = false;
    pintarMinutoD(MINUTO_ORO_MS);
    if (estrellaD) estrellaD.classList.remove('terminada');
    if (minutoDDisplay) minutoDDisplay.classList.remove('crono-final');
    if (minutoDIniciar) minutoDIniciar.disabled = false;
    if (minutoDPausar)  minutoDPausar.disabled  = true;
    if (minutoDEstado)  minutoDEstado.textContent = 'Listo para empezar.';
}

function terminarMinutoD() {
    pararMinutoDSilencioso();
    minutoDTerminado = true;
    pintarMinutoD(0);
    minutoDDisplay.classList.remove('crono-final');
    estrellaD.classList.add('terminada');
    minutoDIniciar.disabled = true;
    minutoDPausar.disabled  = true;
    minutoDEstado.textContent = `¡Tiempo de ${minutoOroEquipoD || 'Equipo D'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden');
    bip(660);
    verificarFinMinutoOro();
}

function pintarMinutoD(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    minutoDDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;
    minutoDDisplay.classList.toggle('crono-final', ms <= 10000 && ms > 0);
}

function verificarFinMinutoOro() {
    if (minutoATerminado && minutoBTerminado && minutoCTerminado && minutoDTerminado) {
        terminarMinutoOro();
    }
}

function terminarMinutoOro() {
    bip(660);
    setTimeout(() => bip(660), 350);

    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Minuto de Oro completado!';
    hazmePopupNombre.textContent =
        `${escapar(minutoOroEquipoA)} ⭐\n${escapar(minutoOroEquipoB)} ⭐\n${escapar(minutoOroEquipoC)} ⭐\n${escapar(minutoOroEquipoD)} ⭐`;
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

function pararMinutoOroSilencioso() {
    pararMinutoASilencioso();
    pararMinutoBSilencioso();
    pararMinutoCSilencioso();
    pararMinutoDSilencioso();
    pararAsignarMinutoOroSilencioso();
    clearInterval(minutoOroFinInterval);
    minutoOroFinInterval = null;
}



/* 14) PUNTUACIÓN */

function montarPuntuacion() {


    $('form-equipo').addEventListener('submit', async e => {
        e.preventDefault();
        const nombre  = $('equipo-nombre').value.trim();
        const sala    = $('equipo-sala').value.trim();
        const alumnos = [...document.querySelectorAll('.alumno-input')]
            .map(i => i.value.trim())
            .filter(a => a);

        if (!nombre || alumnos.length < 3) {
            alert('Elige un colegio y rellena al menos los 3 primeros alumnos.');
            return;
        }
        const nuevoEquipo = { id: 'eq_' + Date.now(), nombre, sala, alumnos };
        try {
            const resp = await fetch('/api/equipos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEquipo)
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            aplicarDatosServidor(await resp.json());
        } catch (err) {
            console.error('[API] Error guardando equipo:', err);
            mostrarEstadoServidor('✗ Error al guardar equipo. Comprueba que el servidor está arrancado.', true);
            return;
        }
        renderEquipos();
        refrescarSelectoresEquipos();
        e.target.reset();
    });

    const _resetForm = () => {
        limpiarRubrica();
        $('punt-aviso').value = '';
        actualizarVistaPorAviso('', $('punt-prueba').value);
    };

    $('punt-sala').addEventListener('change',   _resetForm);
    $('punt-equipo').addEventListener('change', () => { _resetForm(); actualizarSelectorAlumnos(); });
    $('punt-alumno').addEventListener('change', _resetForm);
    $('guardar-puntuacion').addEventListener('click', guardarPuntuacion);

    $('punt-prueba').addEventListener('change', () => {
        limpiarRubrica();
        $('punt-aviso').value = '';
        renderRubrica($('punt-prueba').value);
        actualizarVistaPorAviso('', $('punt-prueba').value);
    });

    $('punt-aviso').addEventListener('change', () => {
        actualizarVistaPorAviso($('punt-aviso').value, $('punt-prueba').value);
    });
}

function poblarColegiosFijos() {
    const colegios = [
        'Brewster',
        'Asunción Rincón',
        'Claudio Moyano',
        'Divina Pastora A',
        'Divina Pastora B',
        'Esclavas Chamberí A',
        'Esclavas Chamberí B',
        'Esclavas Chamberí C',
        'La Salle San Rafael',
        'María Inmaculada A',
        'María Inmaculada B',
        'Rufino Blanco A',
        'Rufino Blanco B',
    ];
    const sel = $('equipo-nombre');
    sel.innerHTML =
        '<option value="">— Elige un colegio —</option>' +
        colegios.map(n => `<option value="${escapar(n)}">${escapar(n)}</option>`).join('');
}


function actualizarContadoresSala() {
    const salas = { 'Auditorio': 0, 'Ludoteca': 0, 'Poli 2': 0 };
    equipos.forEach(eq => { if (salas[eq.sala] !== undefined) salas[eq.sala]++; });
    $('num-auditorio').textContent = salas['Auditorio'];
    $('num-ludoteca').textContent  = salas['Ludoteca'];
    $('num-poli2').textContent     = salas['Poli 2'];
}

function renderEquipos() {
    actualizarContadoresSala();
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
                    <h4>${escapar(eq.nombre)}${eq.sala ? ` <span class="equipo-sala-tag">${escapar(eq.sala)}</span>` : ''}</h4>
                    <div class="equipo-alumnos">${eq.alumnos.map(escapar).join(' · ')}</div>
                </div>
                <div class="equipo-puntos">${total} pts</div>
                <button class="btn-borrar-equipo" data-id="${eq.id}">Borrar</button>
            </div>`;
    }).join('');

    cont.querySelectorAll('.btn-borrar-equipo').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.dataset.id;
            if (!confirm('¿Borrar este equipo y todas sus puntuaciones?')) return;
            try {
                const resp = await fetch('/api/equipos/borrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                aplicarDatosServidor(await resp.json());
            } catch (err) {
                console.error('[API] Error borrando equipo:', err);
                mostrarEstadoServidor('✗ Error al borrar equipo. Comprueba que el servidor está arrancado.', true);
                return;
            }
            renderEquipos();
            refrescarSelectoresEquipos();
        });
    });
}

function refrescarSelectoresEquipos() {
    poblarSelectDescarga();
    const opcionesEquipos = equipos.map(e => `<option value="${e.id}">${escapar(e.nombre)}</option>`).join('');
    $('punt-equipo').innerHTML    = '<option value="">— elige —</option>' + opcionesEquipos;
    $('detalle-equipo').innerHTML = '<option value="">Todos los equipos</option>' + opcionesEquipos;
    actualizarSelectorAlumnos();
    if (!hazmeFanSection.classList.contains('hidden'))      renderHazmeEquipos();
    if (!ruletaEquiposSelector.classList.contains('hidden')) renderRuletaEquipos();
}

function actualizarSelectorAlumnos() {
    const id = $('punt-equipo').value;
    const sel = $('punt-alumno');
    const otroInput = $('punt-alumno-otro');
    if (!id) {
        sel.innerHTML = '<option value="">— elige —</option>';
        otroInput.style.display = 'none';
        return;
    }
    const eq = equipos.find(e => e.id === id);
    if (!eq) return;
    sel.innerHTML = '<option value="">— elige —</option>' +
        eq.alumnos.map((a, i) => `<option value="${i}">${escapar(a)}</option>`).join('') +
        '<option value="otro">Otro</option>';

    sel.onchange = () => {
        otroInput.style.display = sel.value === 'otro' ? 'block' : 'none';
        if (sel.value !== 'otro') otroInput.value = '';
    };
    otroInput.style.display = 'none';
}

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

    if (maxEl) maxEl.textContent = `/ ${criterios.length * 4}`;

    const usaTabla = criterios.some(c => c.descripciones);

    if (usaTabla) {
        cont.innerHTML = `
            <table class="rubrica-tabla">
                <thead>
                    <tr>
                        <th class="rubrica-th-criterio"></th>
                        ${[1,2,3,4].map(v => `<th class="rubrica-th-num">${v}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${criterios.map(c => `
                        <tr>
                            <td class="rubrica-td-nombre">${c.nombre}</td>
                            ${[1,2,3,4].map(v => `<td class="opcion-puntos" data-valor="${v}" data-criterio="${c.id}">${c.descripciones?.[v] || ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
        cont.querySelectorAll('td.opcion-puntos').forEach(td => {
            td.addEventListener('click', () => {
                const cid = td.dataset.criterio;
                cont.querySelectorAll(`td.opcion-puntos[data-criterio="${cid}"]`).forEach(o => o.classList.remove('seleccionada'));
                td.classList.add('seleccionada');
                rubricaActual[cid] = parseInt(td.dataset.valor, 10);
                actualizarTotal(prueba);
            });
        });
    } else {
        cont.innerHTML = criterios.map(c => `
            <div class="criterio" data-criterio="${c.id}">
                <div class="criterio-nombre">${c.nombre}</div>
                <div class="criterio-opciones">
                    ${[1,2,3,4].map(v => `<div class="opcion-puntos" data-valor="${v}">${v}</div>`).join('')}
                </div>
            </div>
        `).join('');
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
    }
    actualizarTotal(prueba);
}

function actualizarTotal(prueba) {
    if ($('punt-aviso').value === 'falta-grave') return;
    const p         = prueba ?? $('punt-prueba').value;
    const criterios = getCriteriosPrueba(p);
    let total       = criterios.reduce((s, c) => s + (rubricaActual[c.id] || 0), 0);
    if ($('punt-aviso').value === 'falta-leve') total -= 1;
    $('punt-total').textContent = total;
}

function limpiarRubrica() {
    rubricaActual = {};
    document.querySelectorAll('#rubrica .opcion-puntos').forEach(o => o.classList.remove('seleccionada'));
    actualizarTotal();
}

function actualizarVistaPorAviso(aviso, prueba) {
    const rubricaEl = $('rubrica');
    const totalEl   = $('punt-total');
    const maxEl     = $('punt-max');
    if (aviso === 'falta-leve') {
        rubricaEl.style.opacity        = '';
        rubricaEl.style.pointerEvents  = '';
        totalEl.style.color            = '#e53935';
        if (maxEl) maxEl.style.visibility = '';
        actualizarTotal(prueba);
    } else if (aviso === 'falta-grave') {
        rubricaEl.style.opacity        = '0.25';
        rubricaEl.style.pointerEvents  = 'none';
        totalEl.textContent            = '---';
        totalEl.style.color            = '#e53935';
        if (maxEl) maxEl.style.visibility = 'hidden';
    } else {
        rubricaEl.style.opacity        = '';
        rubricaEl.style.pointerEvents  = '';
        totalEl.style.color            = '';
        if (maxEl) maxEl.style.visibility = '';
        actualizarTotal(prueba);
    }
}

async function guardarPuntuacion() {
    const sala      = $('punt-sala').value;
    const equipoId  = $('punt-equipo').value;
    const alumnoVal = $('punt-alumno').value;
    const prueba    = $('punt-prueba').value;

    if (!equipoId || alumnoVal === '' || !prueba) {
        alert('Elige equipo, alumno y prueba antes de guardar.');
        return;
    }

    let alumnoIdx;
    let alumnoNombreOtro = null;
    if (alumnoVal === 'otro') {
        alumnoNombreOtro = $('punt-alumno-otro').value.trim();
        if (!alumnoNombreOtro) {
            alert('Escribe el nombre del alumno en el campo de texto.');
            return;
        }
        alumnoIdx = -1;
    } else {
        alumnoIdx = parseInt(alumnoVal, 10);
    }
    const criterios = getCriteriosPrueba(prueba);
    const aviso = $('punt-aviso').value || null;
    let total;
    if (aviso === 'falta-grave') {
        total = 0;
    } else {
        if (criterios.some(c => !rubricaActual[c.id])) {
            alert(`Puntúa los ${criterios.length} criterios (1 a 4) antes de guardar.`);
            return;
        }
        total = criterios.reduce((s, c) => s + rubricaActual[c.id], 0);
        if (aviso === 'falta-leve') total -= 1;
    }

    const nuevaPuntuacion = {
        id: 'p_' + Date.now(),
        equipoId,
        alumnoIdx,
        alumnoNombreOtro,
        prueba,
        sala,
        ronda: $('punt-ronda').value || null,
        criterios: { ...rubricaActual },
        total,
        aviso,
        fecha: new Date().toISOString()
    };
    try {
        const resp = await fetch('/api/puntuaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaPuntuacion)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        aplicarDatosServidor(await resp.json());
    } catch (err) {
        console.error('[API] Error guardando puntuación:', err);
        mostrarEstadoServidor('✗ Error al guardar puntuación. Comprueba que el servidor está arrancado.', true);
        return;
    }
    renderEquipos();
    renderDetalleRanking();

    const msgGuardado = aviso === 'falta-grave'
        ? 'Falta grave registrada.'
        : aviso === 'falta-leve'
            ? `Falta leve registrada (total: ${total} pts).`
            : `Puntuación guardada: ${total} puntos.`;
    alert(msgGuardado);
    $('punt-aviso').value = '';
    actualizarVistaPorAviso('', prueba);
}

function irAPuntuar(prueba) {
    document.querySelector('.tab[data-modo="puntuacion"]').click();
    if (prueba) {
        $('punt-prueba').value = prueba;
        limpiarRubrica();
        renderRubrica(prueba);
    }
    if (salaSorteoActual) {
        const salaIdx = SALAS_ORDEN.indexOf(salaSorteoActual) + 1;
        if (salaIdx > 0) $('punt-sala').value = String(salaIdx);
    }
    sincronizarRondaEnPuntuacion();
}


/* 15) MODO RANKING */
function montarRanking() {
    $('ranking-fase').addEventListener('change', renderRanking);
    $('detalle-equipo').addEventListener('change', renderDetalleRanking);
    $('detalle-sala').addEventListener('change',   renderDetalleRanking);
    $('detalle-prueba').addEventListener('change', renderDetalleRanking);

    const selectColegio = $('descargar-colegio-select');
    const btnDescargar  = $('descargar-csv-btn');
    const btnVerQr    = $('ver-qr-btn');

    selectColegio.addEventListener('change', () => {
        const hay = !!selectColegio.value;
        btnDescargar.disabled = !hay;
        btnVerQr.disabled     = !hay;
    });
    btnDescargar.addEventListener('click', () => {
        const eq = equipos.find(e => e.id === selectColegio.value);
        if (eq) descargarClasificacionCSV(eq);
    });
    btnVerQr.addEventListener('click', () => {
        const eq = equipos.find(e => e.id === selectColegio.value);
        if (eq) mostrarQrColegio(eq);
    });
}

async function mostrarQrColegio(eq) {
    if (typeof QRCode === 'undefined') {
        alert('La librería de QR no está cargada. Recarga la página e inténtalo de nuevo.');
        return;
    }

    let url;
    try {
        const resp = await fetch('/api/mi-ip');
        if (!resp.ok) throw new Error();
        const { baseUrl } = await resp.json();
        url = `${baseUrl}/resultados/${encodeURIComponent(eq.id)}`;
    } catch {
        url = `${window.location.origin}/resultados/${encodeURIComponent(eq.id)}`;
    }

    $('qr-modal-titulo').textContent    = eq.nombre;
    $('qr-modal-subtitulo').textContent = `Total general: ${totalEquipo(eq.id, 'total')} pts`;
    $('qr-modal').classList.remove('hidden');

    const canvas = $('qr-canvas');
    QRCode.toCanvas(canvas, url, { width: 320, margin: 2, color: { dark: '#0D2B55', light: '#FFFFFF' } });

    $('qr-descargar-btn').onclick = () => {
        const a  = document.createElement('a');
        a.href   = canvas.toDataURL('image/png');
        a.download = `QR_${eq.nombre.replace(/\s+/g, '_')}.png`;
        a.click();
    };

    $('qr-cerrar-btn').onclick = () => $('qr-modal').classList.add('hidden');
    $('qr-modal').onclick      = e => { if (e.target === $('qr-modal')) $('qr-modal').classList.add('hidden'); };
}

function poblarSelectDescarga() {
    const sel = $('descargar-colegio-select');
    if (!sel) return;
    const opciones = equipos.map(e => `<option value="${e.id}">${escapar(e.nombre)}</option>`).join('');
    sel.innerHTML = '<option value="">— Elige un colegio —</option>' + opciones;
    $('descargar-csv-btn').disabled = true;
    $('ver-qr-btn').disabled        = true;
}
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
        const top = i < 4 ? `top-${i+1}` : '';
        return `
            <div class="ranking-fila ${top}">
                <div class="pos">${i + 1}º</div>
                <div>
                    <div class="nombre-equipo">${escapar(f.eq.nombre)}</div>
                    <div class="detalle-equipo">${f.pruebasPuntuadas} intervenciones puntuadas</div>
                </div>
                <div class="puntos-totales">${f.total} pts</div>
            </div>`;
    }).join('');
}

async function descargarClasificacionCSV(eq) {
    if (typeof ExcelJS === 'undefined') {
        alert('La librería de Excel no está cargada todavía. Recarga la página e inténtalo de nuevo.');
        return;
    }

    const PRUEBAS = [
        { id: 'hazme-fan',              label: 'Prueba 1 — Hazme Fan' },
        { id: 'fabrica-historias',      label: 'Prueba 2 — Fábrica de Historias' },
        { id: 'voces-derecho',          label: 'Prueba 3 — Voces con Derecho' },
        { id: 'duelo-personajes',       label: 'Prueba 4 — Duelo de Personajes' },
        { id: 'declamacion',            label: 'Final 1 — Declamación' },
        { id: 'palabra-caliente',       label: 'Final 2 — Palabra Caliente' },
        { id: 'duelo-personajes-final', label: 'Final 3 — Duelo Final' },
        { id: 'minuto-oro',             label: 'Final 4 — Minuto de Oro' },
    ];
    const CLASIF = ['hazme-fan','fabrica-historias','voces-derecho','duelo-personajes'];
    const FINAL  = ['declamacion','palabra-caliente','duelo-personajes-final','minuto-oro'];

    const puntsEq     = puntuaciones.filter(p => p.equipoId === eq.id);
    const totalClasif = puntsEq.filter(p => CLASIF.includes(p.prueba)).reduce((s,p) => s+p.total, 0);
    const totalFinal  = puntsEq.filter(p => FINAL.includes(p.prueba)).reduce((s,p) => s+p.total, 0);
    const totalGen    = puntsEq.reduce((s,p) => s+p.total, 0);

    // Paleta
    const NAVY  = { argb: 'FF0D2B55' };
    const BLUE  = { argb: 'FF1A6FC4' };
    const LBLUE = { argb: 'FF3A9BD5' };
    const XBLUE = { argb: 'FFD6EAF8' };
    const WHITE = { argb: 'FFFFFFFF' };
    const ALTBG = { argb: 'FFEDF5FF' };
    const GREY  = { argb: 'FF888888' };

    const brd    = (c = 'FFB0C4D8') => ({ style: 'thin',   color: { argb: c } });
    const medBrd = (c = 'FF1A6FC4') => ({ style: 'medium', color: { argb: c } });
    const allBorders = () => ({ top: brd(), bottom: brd(), left: brd(), right: brd() });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(eq.nombre.slice(0, 31));

    ws.columns = [
        { width: 30 }, { width: 22 }, { width: 22 },
        { width: 22 }, { width: 22 }, { width: 22 },
        { width: 10 }, { width: 14 },
    ];

    let logoId = null;
    try {
        if (logoBase64Cache) {
            const raw = logoBase64Cache.includes(',')
                ? logoBase64Cache.split(',')[1]
                : logoBase64Cache;
            logoId = wb.addImage({ base64: raw, extension: 'png' });
        }
    } catch { logoId = null; }

    ws.mergeCells('A1:A3');
    const logoCell = ws.getCell('A1');
    logoCell.fill   = { type:'pattern', pattern:'solid', fgColor: WHITE };
    logoCell.border = { top: medBrd(), bottom: medBrd(), left: medBrd(), right: medBrd() };

    if (logoId !== null) {
        ws.addImage(logoId, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
    }

    ws.mergeCells('B1:H1');
    const c1 = ws.getCell('B1');
    c1.value = eq.nombre;
    c1.font  = { bold: true, size: 22, color: NAVY, name: 'Arial' };
    c1.fill  = { type:'pattern', pattern:'solid', fgColor: WHITE };
    c1.alignment = { vertical: 'bottom', horizontal: 'left', indent: 2 };
    c1.border    = { top: medBrd(), right: medBrd() };
    ws.getRow(1).height = 48;

    ws.mergeCells('B2:H2');
    const c2 = ws.getCell('B2');
    c2.value = 'II Torneo de Oratoria de Chamberí';
    c2.font  = { size: 11, color: BLUE, name: 'Arial' };
    c2.fill  = { type:'pattern', pattern:'solid', fgColor: WHITE };
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    c2.border    = { right: medBrd() };
    ws.getRow(2).height = 26;

    ws.mergeCells('B3:H3');
    const c3 = ws.getCell('B3');
    c3.value = `Resultados del equipo · ${new Date().toLocaleDateString('es-ES')}`;
    c3.font  = { size: 9, color: GREY, name: 'Arial' };
    c3.fill  = { type:'pattern', pattern:'solid', fgColor: WHITE };
    c3.alignment = { vertical: 'top', horizontal: 'left', indent: 2 };
    c3.border    = { bottom: medBrd(), right: medBrd() };
    ws.getRow(3).height = 24;

    ws.addRow([]).height = 8;

    PRUEBAS.forEach(pr => {
        const registros = puntsEq.filter(p => p.prueba === pr.id);
        if (!registros.length) return;

        const criterios  = getCriteriosPrueba(pr.id);
        const criNombres = criterios.map(c => c.nombre);
        while (criNombres.length < 5) criNombres.push('');

        const rPrueba = ws.addRow([pr.label]);
        ws.mergeCells(`A${rPrueba.number}:H${rPrueba.number}`);
        const pCell = ws.getCell(`A${rPrueba.number}`);
        pCell.fill      = { type:'pattern', pattern:'solid', fgColor: BLUE };
        pCell.font      = { bold: true, size: 11, color: WHITE, name: 'Arial' };
        pCell.alignment = { vertical:'middle', horizontal:'left', indent: 1 };
        rPrueba.height  = 20;

        const rHead = ws.addRow(['Alumno', ...criNombres, 'Total', 'Aviso']);
        rHead.eachCell(cell => {
            cell.fill      = { type:'pattern', pattern:'solid', fgColor: LBLUE };
            cell.font      = { bold: true, size: 9, color: WHITE, name: 'Arial' };
            cell.alignment = { vertical:'middle', horizontal:'center', wrapText: true };
            cell.border    = allBorders();
        });
        rHead.getCell(1).alignment = { vertical:'middle', horizontal:'left', indent: 1 };
        rHead.height = 22;

        registros.forEach((p, idx) => {
            const alumno = p.alumnoNombreOtro || (eq.alumnos && eq.alumnos[p.alumnoIdx]) || `Alumno ${p.alumnoIdx + 1}`;
            const criPts = criterios.map(c => (p.criterios && p.criterios[c.id] != null) ? Number(p.criterios[c.id]) : '');
            while (criPts.length < 5) criPts.push('');

            const bg    = idx % 2 === 1 ? ALTBG : WHITE;
            const totalExcel = p.aviso === 'falta-leve' ? `${p.total + 1} - 1 = ${p.total}` : p.total;
            const rData = ws.addRow([alumno, ...criPts, totalExcel, p.aviso || '—']);
            rData.eachCell(cell => {
                cell.fill      = { type:'pattern', pattern:'solid', fgColor: bg };
                cell.font      = { size: 9, name: 'Arial' };
                cell.alignment = { vertical:'middle', horizontal:'center' };
                cell.border    = allBorders();
            });
            rData.getCell(1).alignment = { vertical:'middle', horizontal:'left', indent: 1 };
            rData.height = 18;
        });

        ws.addRow([]).height = 6;
    });

    ws.addRow([]).height = 6;
    [
        { label: 'Total Clasificación', pts: totalClasif, dark: false },
        { label: 'Total Final',         pts: totalFinal,  dark: false },
        { label: 'TOTAL GENERAL',       pts: totalGen,    dark: true  },
    ].forEach(({ label, pts, dark }) => {
        const r  = ws.addRow([label, '', '', '', '', '', pts, '']);
        const fg = dark ? NAVY : XBLUE;
        ws.mergeCells(`A${r.number}:F${r.number}`);
        r.eachCell(cell => {
            cell.fill      = { type:'pattern', pattern:'solid', fgColor: fg };
            cell.font      = { bold: true, size: dark ? 11 : 10, color: dark ? WHITE : NAVY, name: 'Arial' };
            cell.alignment = { vertical:'middle', horizontal:'left', indent: 1 };
            cell.border    = allBorders();
        });
        r.getCell(7).alignment = { vertical:'middle', horizontal:'center' };
        r.height = 22;
    });

    const buffer   = await wb.xlsx.writeBuffer();
    const blob     = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `${eq.nombre.replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/g, '_')}_oratoria.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}





function renderDetalleRanking() {
    const equipoId = $('detalle-equipo').value;
    const sala     = $('detalle-sala').value;
    const prueba   = $('detalle-prueba').value;
    const cont     = $('detalle-tabla');

    let registros = puntuaciones.slice();
    if (equipoId) registros = registros.filter(p => p.equipoId === equipoId);
    if (sala)     registros = registros.filter(p => String(p.sala) === sala);
    if (prueba)   registros = registros.filter(p => p.prueba === prueba);

    if (registros.length === 0) {
        cont.innerHTML = '<p class="ayuda" style="margin-top:12px">No hay registros con los filtros seleccionados.</p>';
        return;
    }

    const filas = registros.map(p => {
        const eq     = equipos.find(e => e.id === p.equipoId);
        const nombre = eq ? escapar(eq.nombre) : '—';
        const alumno = p.alumnoIdx === -1
            ? escapar(p.alumnoNombreOtro ?? 'Otro')
            : (eq ? escapar(eq.alumnos[p.alumnoIdx] ?? '—') : '—');
        const SALA_NOMBRES = { '1': 'Auditorio', '2': 'Ludoteca', '3': 'Poli 2' };
        const salaLabel = p.sala ? (SALA_NOMBRES[String(p.sala)] ?? String(p.sala)) : '—';
        const AVISO_LABELS = { 'aviso': 'Aviso', 'falta-leve': 'Falta leve', 'falta-grave': 'Falta grave' };
        const AVISO_COLORES = { 'aviso': '#f59e0b', 'falta-leve': '#f97316', 'falta-grave': '#e53935' };
        const avisoHtml = p.aviso
            ? `<span style="background:${AVISO_COLORES[p.aviso]};color:#fff;padding:2px 8px;border-radius:99px;font-size:.78rem;font-weight:600;">${AVISO_LABELS[p.aviso]}</span>`
            : '—';
        const rondaLabel = p.ronda ? `R${p.ronda}` : '—';
        return `
            <div class="detalle-fila" data-id="${p.id}">
                <div class="detalle-celda detalle-equipo-nombre">${nombre}</div>
                <div class="detalle-celda">${alumno}</div>
                <div class="detalle-celda">${salaLabel}</div>
                <div class="detalle-celda">${escapar(p.prueba)}</div>
                <div class="detalle-celda">${rondaLabel}</div>
                <div class="detalle-celda detalle-pts" style="${p.aviso === 'falta-leve' || p.aviso === 'falta-grave' ? 'color:#e53935;font-weight:700;' : ''}">
                    ${p.aviso === 'falta-grave' ? '---' : p.aviso === 'falta-leve' ? `${p.total + 1} - 1 = ${p.total} pts` : p.total + ' pts'}
                </div>
                <div class="detalle-celda">${avisoHtml}</div>
                <div class="detalle-celda">
                    <button class="btn-borrar-punt" data-id="${p.id}" title="Borrar este registro" style="background:none;border:none;cursor:pointer;color:#e53935;font-size:1.1rem;">🗑</button>
                </div>
            </div>`;
    }).join('');

    cont.innerHTML = `
        <div class="detalle-cabecera">
            <div class="detalle-celda">Equipo</div>
            <div class="detalle-celda">Alumno</div>
            <div class="detalle-celda">Sala</div>
            <div class="detalle-celda">Prueba</div>
            <div class="detalle-celda">Ronda</div>
            <div class="detalle-celda">Puntos</div>
            <div class="detalle-celda">Aviso</div>
            <div class="detalle-celda"></div>
        </div>
        ${filas}`;

    cont.querySelectorAll('.btn-borrar-punt').forEach(btn => {
        btn.addEventListener('click', () => borrarPuntuacion(btn.dataset.id));
    });
}

async function borrarPuntuacion(id) {
    if (!confirm('¿Seguro que quieres borrar este registro? Esta acción no se puede deshacer.')) return;
    try {
        const resp = await fetch('/api/puntuaciones/borrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const datos = await resp.json();
        equipos       = datos.equipos       ?? [];
        puntuaciones  = datos.puntuaciones  ?? [];
        renderDetalleRanking();
        renderRanking();
    } catch (err) {
        alert('Error al borrar el registro. Comprueba que el servidor está arrancado.');
    }
}

/*  16) UTILIDADES- */

function escapar(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let _giganteInterval          = null;
let _giganteSourceEl          = null;
let _giganteBotonesEl         = null;
let _giganteBotonesParent     = null;
let _giganteEstrellaSourceEl  = null;

function mostrarCronoGigante(sourceId, label, botonesId, estrellaId) {
    clearInterval(_giganteInterval);
    if (_giganteBotonesEl && _giganteBotonesParent) {
        _giganteBotonesParent.appendChild(_giganteBotonesEl);
    }
    _giganteSourceEl         = $(sourceId);
    _giganteEstrellaSourceEl = estrellaId ? $(estrellaId) : null;
    const popup     = $('crono-gigante');
    const disp      = $('crono-gigante-display');
    const lbl       = $('crono-gigante-label');
    const slot      = $('crono-gigante-botones');
    const estrellaEl = $('crono-gigante-estrella');
    lbl.textContent = label || '';
    if (_giganteSourceEl) disp.textContent = _giganteSourceEl.textContent;
    if (_giganteEstrellaSourceEl) {
        popup.classList.add('modo-estrella');
        estrellaEl.classList.toggle('terminada', _giganteEstrellaSourceEl.classList.contains('terminada'));
    } else {
        popup.classList.remove('modo-estrella');
    }
    _giganteBotonesEl = botonesId ? $(botonesId) : null;
    if (_giganteBotonesEl) {
        _giganteBotonesParent = _giganteBotonesEl.parentNode;
        slot.appendChild(_giganteBotonesEl);
    }
    popup.classList.remove('hidden');
    _giganteInterval = setInterval(() => {
        if (!_giganteSourceEl) return;
        disp.textContent = _giganteSourceEl.textContent;
        disp.classList.toggle('crono-final',  _giganteSourceEl.classList.contains('crono-final'));
        disp.classList.toggle('crono-minimo', _giganteSourceEl.classList.contains('crono-minimo'));
        if (_giganteEstrellaSourceEl) {
            estrellaEl.classList.toggle('terminada', _giganteEstrellaSourceEl.classList.contains('terminada'));
        }
    }, 100);
}

function ocultarCronoGigante() {
    clearInterval(_giganteInterval);
    _giganteInterval         = null;
    _giganteSourceEl         = null;
    _giganteEstrellaSourceEl = null;
    if (_giganteBotonesEl && _giganteBotonesParent) {
        _giganteBotonesParent.appendChild(_giganteBotonesEl);
    }
    _giganteBotonesEl     = null;
    _giganteBotonesParent = null;
    const popup = $('crono-gigante');
    popup.classList.remove('modo-estrella');
    popup.classList.add('hidden');
}
