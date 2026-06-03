/* 1) CONFIGURACIÓN GLOBAL DE PRUEBAS. */
// Filtro del ranking con distinción entre fase de clasificación y fase final 
const FASE_CLASIFICACION = ['hazme-fan', 'fabrica-historias', 'voces-derecho', 'duelo-personajes'];
const FASE_FINAL         = ['declamacion', 'palabra-caliente', 'duelo-personajes-final', 'minuto-oro'];

// Distribución fija de equipos por sala y ronda (fase de clasificación).
const DISTRIBUCION_SALAS = {
    'Auditorio|1': ['Brewster', 'Divina Pastora B', 'Esclavas Chamberí B', 'La Salle San Rafael'],
    'Ludoteca|1':  ['Claudio Moyano', 'Esclavas Chamberí C', 'María Inmaculada B', 'Rufino Blanco B'],
    'Poli 2|1':    ['Asunción Rincón', 'Divina Pastora A', 'Esclavas Chamberí A', 'María Inmaculada A', 'Rufino Blanco A'],
    'Auditorio|2': ['Asunción Rincón', 'Rufino Blanco A', 'Esclavas Chamberí C', 'María Inmaculada B'],
    'Ludoteca|2':  ['Brewster', 'Esclavas Chamberí A', 'María Inmaculada A', 'Divina Pastora B'],
    'Poli 2|2':    ['Claudio Moyano', 'Esclavas Chamberí B', 'La Salle San Rafael', 'Rufino Blanco B', 'Divina Pastora A'],
};

// Sala y ronda activas en el modo sorteos
let salaSorteoActual  = '';
let rondaSorteoActual = '';

// Devuelve los equipos registrados que corresponden a la sala y ronda activas.
// Sin sala/ronda seleccionada devuelve todos (fase final).
function equiposDeSalaYRonda(sala, ronda) {
    const clave = `${sala}|${ronda}`;
    const nombres = DISTRIBUCION_SALAS[clave];
    if (!nombres) return equipos;
    return equipos.filter(e => nombres.includes(e.nombre));
}

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

// Criterios de evaluación específicos por prueba (1–4 puntos cada uno).
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

// Devuelve los criterios de la prueba indicada (array vacío si no existe).
function getCriteriosPrueba(prueba) {
    return CRITERIOS_POR_PRUEBA[prueba] || [];
}


/*
   2) ESTADO Y PERSISTENCIA ----- */
let datosPrueba = {};       // Datos cargados desde el CSV de cada prueba.
let usados = {};            // Resultados ya sorteados (para no repetir o avisar).
let canvasList = [];        // Bloques { canvas, opciones, nombre, resBox } activos.

// Equipos: [{ id, nombre, colegio, alumnos: [nombre1, nombre2, ...] }]
let equipos = [];
let logoBase64Cache = null; // Logo precargado desde /api/logo
// Puntuaciones: [{ id, equipoId, alumnoIdx, prueba, criterios, total, fecha }]
let puntuaciones = [];
// Valores temporales del formulario de puntuación activo
let rubricaActual = {};

// URL base de la API — relativa al servidor que sirve la página
const API_DATOS = '/api/datos';

// Actualiza el indicador visual de estado del servidor (barra superior en la pestaña de Puntuación)
function mostrarEstadoServidor(texto, esError) {
    const el = $('servidor-estado');
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle('error', !!esError);
}

// Precarga el logo desde el servidor (evita problemas de canvas/CORS en iOS)
async function precargarLogo() {
    try {
        const resp = await fetch('/api/logo');
        if (!resp.ok) return;
        const { base64 } = await resp.json();
        if (base64) logoBase64Cache = base64;
    } catch { logoBase64Cache = null; }
}

// Carga equipos y puntuaciones desde el servidor al arrancar la página.
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

// Actualiza el estado local con los datos frescos devueltos por el servidor
// tras cada operación atómica, para que la pestaña no quede desincronizada.
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

// Fábrica de Historias — Pop-up de resultado
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

    // Para pruebas de clasificación mostramos el selector de sala/ronda primero.
    if (FASE_CLASIFICACION.includes(prueba)) {
        mostrarSelectorSalaRonda(prueba);
        return;
    }
    continuarCargaPrueba(prueba);
}

// Muestra el bloque de selección de sala y ronda.
function mostrarSelectorSalaRonda(prueba) {
    const bloque = $('sala-ronda-selector');
    if (!bloque) return;
    bloque.classList.remove('hidden');
    $('sala-ronda-confirmar').onclick = () => {
        const sala  = $('sorteo-sala-select').value;
        const ronda = $('sorteo-ronda-select').value;
        if (!sala || !ronda) { alert('Elige sala y ronda antes de continuar.'); return; }
        salaSorteoActual  = sala;
        rondaSorteoActual = ronda;
        bloque.classList.add('hidden');
        continuarCargaPrueba(prueba);
    };
}

// Continúa la carga de prueba una vez conocida sala+ronda (o sin ellas en fase final).
function continuarCargaPrueba(prueba) {
    const config = configuraciones[prueba];

    if (config.tipo === 'cronometro') {
        // Hazme fan: No tiene sorteo.
        hazmeFanSection.classList.remove('hidden');
        resetCronometro();
        inicializarHazmeSelector();
    } else if (config.tipo === 'minuto-oro') {
        // El Minuto de Oro
        minutoOroSection.classList.remove('hidden');
        inicializarMinutoOro();
    } else if (prueba === 'palabra-caliente' || prueba === 'duelo-personajes-final') {
        // Fase final con emparejamiento: primero sorteo de equipos y oradores
        tituloPrueba.textContent = config.titulo;
        mostrarEmparejamientoFinal(prueba);
    } else {
        // Pruebas con CSV: mostrar el selector de equipos y luego pedir el CSV.
        tituloPrueba.textContent = config.titulo;
        // El Duelo Final no usa selector de orden:  se sortean al azar automáticamente después de girar la ruleta.
        if (prueba !== 'duelo-personajes-final') {
            ruletaEquiposSelector.classList.remove('hidden');

            // Para Declamación usa todos los equipos registrados (los 5 finalistas).
            // Para pruebas de clasificación filtramos por sala y ronda.
            if (prueba === 'declamacion') {
                inicializarRuletaSelector(null);
            } else {
                const filtrados = equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual);
                const ids = filtrados.map(e => e.id);
                inicializarRuletaSelector(ids.length ? ids : null);
            }
        }

        if (DATOS_PRUEBAS[prueba]) {
            cargarDatosEnRuleta(prueba, DATOS_PRUEBAS[prueba], true);
        } else {
            csvUpload.classList.remove('hidden');
        }
    }
}

// Carga los datos de una prueba en la ruleta, tanto si vienen embebidos como del CSV.
// desdeEmbebidos=true muestra el botón de escape a CSV personalizado.
function cargarDatosEnRuleta(prueba, data, desdeEmbebidos = false) {
    datosPrueba[prueba] = data;
    usados[prueba] = usados[prueba] || [];
    csvUpload.classList.add('hidden');
    ruletaSection.classList.remove('hidden');
    usarCsvBtn.classList.toggle('hidden', !desdeEmbebidos);
    if (prueba === 'palabra-caliente') {
        historialPanel.classList.remove('hidden');
        actualizarHistorial(prueba);
        palabraCronoPanel.classList.remove('hidden');
        resetPalabraCaliente();
    } else {
        historialPanel.classList.add('hidden');
        palabraCronoPanel.classList.add('hidden');
    }
    if (prueba === 'duelo-personajes-final') resetDueloFinal();
    inicializarRuleta(prueba);
}

// Oculta todo lo de la pantalla de sorteos y deja la selección limpia.
function ocultarSeccionesSorteo() {
    infoPrueba.classList.add('hidden');
    csvUpload.classList.add('hidden');
    ruletaSection.classList.add('hidden');
    usarCsvBtn.classList.add('hidden');
    historialPanel.classList.add('hidden');
    hazmeFanSection.classList.add('hidden');
    minutoOroSection.classList.add('hidden');
    ruletaEquiposSelector.classList.add('hidden');  // selector de pruebas 2/3/4
    const salaRondaBloque = $('sala-ronda-selector');
    if (salaRondaBloque) salaRondaBloque.classList.add('hidden');
    const empPanel = $('final-emparejamiento-panel');
    if (empPanel) empPanel.classList.add('hidden');
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
// Convierte el texto CSV en un array de objetos usando la primera fila como cabeceras.
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
    const fontSize = Math.max(13, Math.round(canvas.width * 0.038));

    opciones.forEach((opcion, i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, i * ang, (i + 1) * ang);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

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
    ctx.fillStyle = '#0d1b2a';
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
    ctx.strokeStyle = '#0d1b2a';
    ctx.lineWidth = 3;
    ctx.stroke();
}


/* 10) RULETAS — Giro */
function girarRuleta() {
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

// Anima el giro durante 3 s con desaceleración y calcula el sector ganador.
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


/* 11) RULETAS — Mostrar resultados */
function mostrarResultadoMultiple(resultados) {
    const orden = ['contexto', 'problema', 'personaje'];
    const etiquetas = { contexto: 'Contexto', problema: 'Problema', personaje: 'Personaje' };

    // Pone el resultado destacado debajo de cada ruleta.
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
        // Pop-up con el resumen de la combinación sorteada.
        mostrarFabricaPopup(resultados);
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

        // Muestra la dupla en grande y abre el panel de asignación con alumnos reales.
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
        // Declamación: tras sortear género, escogemos un fragmento disponible.
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
            // Mostrar el cronómetro doble listo para arrancar.
            prepararCronometroDecla();
        } else {
            resultadoDiv.textContent = 'No hay fragmentos disponibles para este género.';
        }
    } else if (prueba === 'voces-derecho') {
        // Voces con Derecho: número de artículo.
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
// Crea el panel lateral con los sorteos previos.
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
const CRONO_MIN_MS   = 30 * 1000; // queda 0:30 → ya cumplió 1:30
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

function terminarCronometro() {
    pararCronometroSilencioso();
    cronoIniciar.disabled = false;
    cronoPausar.disabled  = true;
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


// /*    12b) HAZME FAN — Selector de equipos 
let hazmeEquiposSeleccionados = [];
// Referencia al temporizador del pop-up (necesario para poder pararlo si el
// profesor cancela la prueba antes de que termine la cuenta atrás).
let hazmeCuentaInterval = null;

// = Montaje  
function montarHazmeSelector() {
    hazmeSeleccionarBtn.addEventListener('click', seleccionarEquipoHazme);
}
// = Inicialización 
function inicializarHazmeSelector() {
    hazmeEquiposSeleccionados = [];          // Empezamos sin nadie seleccionado
    clearInterval(hazmeCuentaInterval);      // Cancelamos cualquier cuenta atrás pendiente
    hazmeCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    renderHazmeEquipos();
}

// = Dibujo de chips 
function renderHazmeEquipos() {
    if (!hazmeEquiposGrid) return;

    // Equipos de la sala y ronda activas
    const equiposSala = equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual);
    const restantes = equiposSala.filter(e => !hazmeEquiposSeleccionados.includes(e.id));

    // Si hay menos de 3 equipos, mostramos aviso y desactivamos el botón
    if (equiposSala.length < 3) {
        hazmeEquiposGrid.innerHTML = '';
        hazmeSeleccionarBtn.disabled = true;
        hazmeEstado.textContent = 'Debe añadir 3 o más equipos para usar el selector.';
        return;
    }

    // Construimos un chip HTML por cada equipo de la sala.
    // La clase 'seleccionado' pone el chip en gris si ya fue llamado.
    hazmeEquiposGrid.innerHTML = equiposSala.map(e => {
        const cls = hazmeEquiposSeleccionados.includes(e.id) ? 'seleccionado' : '';
        return `<div class="hazme-equipo-chip ${cls}" data-id="${e.id}">${escapar(e.nombre)}</div>`;
    }).join('');

    // Mensaje y botón según si quedan equipos o no
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

// = Selección aleatoria:
// Se ejecuta al pulsar el botón. Elige un equipo al azar entre los
// que quedan, lo ilumina y abre el pop-up con cuenta atrás.
function seleccionarEquipoHazme() {
    // Solo actuamos si quedan equipos por llamar
    const equiposSala = equiposDeSalaYRonda(salaSorteoActual, rondaSorteoActual);
    const restantes = equiposSala.filter(e => !hazmeEquiposSeleccionados.includes(e.id));
    if (restantes.length === 0) return;

    // Si es el primer sorteo de esta prueba, respetar la rotación de primeros
    let candidatos;
    if (hazmeEquiposSeleccionados.length === 0 && salaSorteoActual && rondaSorteoActual) {
        const pendientes = equiposPendientesDePrimero(salaSorteoActual, rondaSorteoActual);
        candidatos = equiposSala.filter(e => pendientes.includes(e.id));
        if (candidatos.length === 0) candidatos = restantes;
    } else {
        candidatos = restantes;
    }

    const eq = candidatos[Math.floor(Math.random() * candidatos.length)];

    // Registrar si es el primero
    if (hazmeEquiposSeleccionados.length === 0 && salaSorteoActual && rondaSorteoActual) {
        registrarPrimero(salaSorteoActual, rondaSorteoActual, eq.id);
    }

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


/*  12c) SELECTOR DE EQUIPOS PARA RULETAS (Pruebas 2, 3, 4 y Finales) */

// IDs de equipos ya llamados en la prueba de ruleta activa.
// Se resetea cada vez que el profesor carga una nueva prueba.
let ruletaEquiposSeleccionados = [];

// Timer del pop-up para este selector (independiente del de Hazme fan).
let ruletaCuentaInterval = null;

// Lista de IDs permitidos en esta prueba:
let ruletaEquiposPermitidos = null;

// = Calcula los dos finalistas 
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

// Devuelve los 4 equipos con más puntos en la fase de clasificación (para la fase final).
function obtenerTop4Clasificacion() {
    return equipos
        .map(eq => ({ id: eq.id, nombre: eq.nombre, pts: totalEquipo(eq.id, 'clasificacion') }))
        .filter(eq => eq.pts > 0)
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 4);
}

// Devuelve todos los equipos registrados como objetos {id, nombre}
function obtenerEquiposFinales() {
    return equipos.map(eq => ({ id: eq.id, nombre: eq.nombre }));
}

// Estado del emparejamiento de fase final
let finalEquipo1 = null;
let finalEquipo2 = null;
let finalEquipo3 = null;
let finalEquipo4 = null;

function oradorAleatorio() { return Math.random() < 0.5 ? 'Orador A' : 'Orador B'; }

// Estado extra para la mesa de 3 equipos (Palabra Caliente)
let finalEquipo5 = null;

// Muestra el panel de emparejamiento de fase final y conecta sus botones.
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

    // Palabra Caliente: duelo (2) + mesa (3) con todos los finalistas
    // Duelo Final: 2 duelos con los top 4 clasificados
    const esPalabraCaliente = prueba === 'palabra-caliente';
    mesaBloque.style.display = esPalabraCaliente ? '' : 'none';
    enf2Bloque.style.display = esPalabraCaliente ? 'none' : '';
    const enf3Bloque = $('final-enf3-bloque');
    if (enf3Bloque) enf3Bloque.style.display = 'none';

    function sortear() {
        if (esPalabraCaliente) {
            const todos = obtenerEquiposFinales();
            if (todos.length < 5) {
                alert('Necesitas 5 equipos registrados para sortear.');
                return;
            }
            const m = [...todos].sort(() => Math.random() - 0.5);
            // Duelo: m[0] vs m[1] | Mesa: m[2] → m[3] → m[4]
            finalEquipo1 = m[0]; finalEquipo2 = m[1];
            finalEquipo3 = m[2]; finalEquipo4 = m[3]; finalEquipo5 = m[4];

            $('f1-eq1-nombre').textContent = finalEquipo1.nombre;
            $('f1-eq1-orador').textContent = '(' + oradorAleatorio() + ')';
            $('f1-eq2-nombre').textContent = finalEquipo2.nombre;
            $('f1-eq2-orador').textContent = '(' + oradorAleatorio() + ')';
            $('f2-eq1-nombre').textContent = finalEquipo3.nombre;
            $('f2-eq1-orador').textContent = '(' + oradorAleatorio() + ')';
            $('f2-eq2-nombre').textContent = finalEquipo4.nombre;
            $('f2-eq2-orador').textContent = '(' + oradorAleatorio() + ')';
            $('f2-eq3-nombre').textContent = finalEquipo5.nombre;
            $('f2-eq3-orador').textContent = '(' + oradorAleatorio() + ')';
        } else {
            // Duelo Final: top 4 clasificados → 2 duelos (1.º vs 2.º y 3.º vs 4.º)
            const clasificados = obtenerTop4Clasificacion();
            if (clasificados.length < 4) {
                alert('Necesitas al menos 4 equipos con puntuación en la fase de clasificación para sortear el Duelo Final.');
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
        }

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

// Continúa con el flujo normal de la prueba tras el emparejamiento y sorteo de oradores.
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

// = Variables del popup de Palabra Caliente  
let palabraPcEqActual   = null;
let palabraPcChipActual = null;

const palabraPcPopup      = $('palabrapc-popup');
const palabraPcNombre     = $('palabrapc-nombre'); //el div donde aparece el nombre del equipo
const palabraPcAlumno     = $('palabrapc-alumno');//el div donde aparece el nombre del alumno
const palabraPcSortearBtn = $('palabrapc-sortear-btn');
const palabraPcCerrarBtn  = $('palabrapc-cerrar-btn');

// = Montaje =
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

// = Para el timer silenciosamente.
function pararRuletaSelectorSilencioso() {
    clearInterval(ruletaCuentaInterval);
    ruletaCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    if (palabraPcPopup) palabraPcPopup.classList.add('hidden');
    palabraPcEqActual   = null;
    palabraPcChipActual = null;
}

// = Inicialización  
// Se llama al cargar cualquier prueba con CSV.
// Si se pasa equiposPermitidos (array de IDs), solo aparecen esos equipos.
// Si no se pasa nada (undefined/null), aparecen todos.
// Registro de qué equipos ya han salido primero en cada sala+ronda.
// Clave: "sala|ronda" → array de ids que ya fueron primeros en alguna prueba.
// Cuando todos los equipos de esa sala+ronda han salido primero una vez, se resetea.
const primerosEnSala = {};

function registrarPrimero(sala, ronda, equipoId) {
    const clave = `${sala}|${ronda}`;
    if (!primerosEnSala[clave]) primerosEnSala[clave] = [];
    const equiposDeSala = equiposDeSalaYRonda(sala, ronda).map(e => e.id);
    // Si ya han salido todos, reiniciamos el ciclo
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
    // Si quedan pendientes, solo ellos pueden ser primeros; si no, todos pueden (ciclo reiniciado)
    return pendientes.length > 0 ? pendientes : equiposDeSala;
}

function inicializarRuletaSelector(equiposPermitidos = null) {
    ruletaEquiposSeleccionados = [];          // Empezamos sin nadie seleccionado
    ruletaEquiposPermitidos    = equiposPermitidos; // null = todos; array = solo finalistas
    clearInterval(ruletaCuentaInterval);      // Cancelamos cualquier cuenta pendiente
    ruletaCuentaInterval = null;
    if (hazmePopup) hazmePopup.classList.add('hidden');
    renderRuletaEquipos();
}

// = Dibujo de chips  
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

    // = Caso: fase final sin finalistas clasificados aún = //
    if (ruletaEquiposPermitidos !== null && equiposActivos.length === 0) {
        ruletaEquiposGrid.innerHTML = '';
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent =
            'Aún no hay equipos clasificados. Puntúa las 4 pruebas de clasificación primero.';
        return;
    }

    // = Caso: fase normal sin suficientes equipos (mínimo 3) = //
    if (ruletaEquiposPermitidos === null && equiposActivos.length < 3) {
        ruletaEquiposGrid.innerHTML = '';
        ruletaSeleccionarBtn.disabled = true;
        ruletaSelectorEstado.textContent = 'Debe añadir 3 o más equipos para usar el selector.';
        return;
    }

    // = Pintamos los chips = //
    // Solo aparecen los equipos activos (todos o los dos finalistas)
    ruletaEquiposGrid.innerHTML = equiposActivos.map(e => {
        const cls = ruletaEquiposSeleccionados.includes(e.id) ? 'seleccionado' : '';
        return `<div class="hazme-equipo-chip ${cls}" data-id="${e.id}">${escapar(e.nombre)}</div>`;
    }).join('');

    // = Actualizamos botón y texto de estado = //
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

// = Selección aleatoria = //
// Mismo flujo que seleccionarEquipoHazme():
function seleccionarEquipoRuleta() {
    const prueba = pruebaSelect.value;
    // Trabajamos solo con los equipos permitidos en esta prueba
    const equiposActivos = ruletaEquiposPermitidos
        ? equipos.filter(e => ruletaEquiposPermitidos.includes(e.id))
        : equipos;

    // Si es el primer sorteo de esta prueba y es fase de clasificación,
    // limitamos los candidatos a los que aún no han salido primero en esta sala+ronda.
    let candidatos;
    if (ruletaEquiposSeleccionados.length === 0 && FASE_CLASIFICACION.includes(prueba) && salaSorteoActual && rondaSorteoActual) {
        const pendientes = equiposPendientesDePrimero(salaSorteoActual, rondaSorteoActual);
        candidatos = equiposActivos.filter(e => pendientes.includes(e.id));
        if (candidatos.length === 0) candidatos = equiposActivos; // fallback
    } else {
        candidatos = equiposActivos.filter(e => !ruletaEquiposSeleccionados.includes(e.id));
    }

    const restantes = equiposActivos.filter(e => !ruletaEquiposSeleccionados.includes(e.id));
    if (restantes.length === 0) return;

    // Selección aleatoria entre los candidatos
    const eq = candidatos[Math.floor(Math.random() * candidatos.length)];

    // Si es el primer equipo sorteado en clasificación, registrarlo
    if (ruletaEquiposSeleccionados.length === 0 && FASE_CLASIFICACION.includes(prueba) && salaSorteoActual && rondaSorteoActual) {
        registrarPrimero(salaSorteoActual, rondaSorteoActual, eq.id);
    }

    // Quitamos brillo previo y lo ponemos en el chip elegido
    ruletaEquiposGrid.querySelectorAll('.hazme-equipo-chip').forEach(c => c.classList.remove('iluminado'));
    const chip = ruletaEquiposGrid.querySelector(`.hazme-equipo-chip[data-id="${eq.id}"]`);
    if (chip) chip.classList.add('iluminado');

    // Bloqueamos el botón durante el pop-up
    ruletaSeleccionarBtn.disabled = true;

    // La Palabra Caliente: popup propio sin cuenta atrás, con sorteo de alumno
    if (prueba === 'palabra-caliente') {
        palabraPcEqActual       = eq;
        palabraPcChipActual     = chip;
        palabraPcNombre.textContent  = eq.nombre;
        palabraPcAlumno.textContent  = '';
        palabraPcPopup.classList.remove('hidden');
        return;
    }

    // Resto de pruebas: pop-up compartido con cuenta atrás de 5 s
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
            if (chip) {
                chip.classList.remove('iluminado');
                chip.classList.add('seleccionado');
            }
            ruletaEquiposSeleccionados.push(eq.id);
            renderRuletaEquipos();

            // Minuto de Oro: mostrar la estrella con el nombre del equipo y resetear timer
            if (prueba === 'minuto-oro') {
                minutoOroEquipoA = eq.nombre;
                minutoANombre.textContent = eq.nombre;
                minutoOroCronos.classList.remove('hidden');
                resetMinutoA();
            }
        }
    }, 1000);
}


// 13) FÁBRICA DE HISTORIAS — Cronómetro doble (preparación + discurso)
const FABRICA_PREP_MS = 30 * 1000;
const FABRICA_DISC_MS = 2 * 60 * 1000;
let fabricaIntervalo      = null;
let fabricaRestanteMs     = FABRICA_PREP_MS;
let fabricaFin            = 0;
let fabricaFase           = 'prep'; // 'prep' | 'discurso'
let fabricaFaseNotificada = false;

function montarFabricaPopup() {
    fabricaPopupCerrar.addEventListener('click', () => {
        fabricaPopup.classList.add('hidden');
    });
    // Cerrar también al pulsar fuera del contenido
    fabricaPopup.addEventListener('click', e => {
        if (e.target === fabricaPopup) fabricaPopup.classList.add('hidden');
    });
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

// Llamado tras girar Fábrica para mostrar y resetear el cronómetro doble.
function prepararCronometroFabrica() {
    fabricaCrono.classList.remove('hidden');
    resetCronometroFabrica();
}

function pintarFabrica(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    fabricaDisplay.textContent = `${neg ? '-' : ''}${m}:${s}`;

    fabricaDisplay.classList.remove('crono-final');
    if (ms <= 5 * 1000) fabricaDisplay.classList.add('crono-final');
}

function iniciarFabricaPrep() {
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
    fabricaEstado.textContent = '30 segundos para pensar la historia.';
    iniciarFabricaTick();
}

function iniciarFabricaDiscurso() {
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
    fabricaEstado.textContent = '2 minutos para contar la historia.';
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
    fabricaFaseNotificada = false;
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

function terminarCronometroVoces() {
    pararVocesSilencioso();
    vocesIniciar.disabled = false;
    vocesPausar.disabled  = true;
    vocesEstado.textContent = '¡Tiempo agotado!';
    bip(660);
}


/* 13c) DUELO DE PERSONAJES — Elección de personaje + cronómetro doble */
// = Mapa de imágenes por personaje 
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

// ── Referencias DOM del pop-up de presentación ──────────────────
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
let dueloPersonajesPopupInterval = null; // Timer del pop-up de elección (10 s)

// ── Constantes del cronómetro 
const DUELO_PREP_MS = 60 * 1000;   
const DUELO_ARG_MS  = 90 * 1000;   

// ── Variables de estado 
let dueloIntervalo      = null;
let dueloRestanteMs     = DUELO_PREP_MS;
let dueloFin            = 0;            
let dueloFase           = 'prep';       
let dueloFaseNotificada = false;

// ── Montaje 
// Conecta todos los botones con sus funciones.
// Se llama UNA SOLA VEZ al arrancar la app (desde init).
function montarDuelo() {
    // Botones de elección de personaje — van directo al cronómetro (sin segundo popup)
    dueloBtnA.addEventListener('click', () => {
        dueloEleccion.classList.add('hidden');
        prepararCronometroDuelo();
    });
    dueloBtnB.addEventListener('click', () => {
        dueloEleccion.classList.add('hidden');
        prepararCronometroDuelo();
    });
    // Botones del cronómetro doble
    dueloIniciar.addEventListener('click',    iniciarDueloPrep);
    dueloArgumentar.addEventListener('click', iniciarDueloArgumentar);
    dueloPausar.addEventListener('click',     pausarDuelo);
    dueloReset.addEventListener('click',      resetCronometroDuelo);
}

// ── Muestra la elección 
// Se llama desde mostrarResultado() cuando la prueba es de tipo 'dupla'.
// Parte la cadena "A vs B" en dos nombres y los pone en cada botón.
function mostrarEleccionDuelo(resultado) {
    const partes = resultado.split(' vs ');
    const pA = partes[0] ? partes[0].trim() : resultado;
    const pB = partes[1] ? partes[1].trim() : '—';

    dueloBtnA.textContent = pA;
    dueloBtnB.textContent = pB;
    dueloCrono.classList.add('hidden');
    dueloEleccion.classList.add('hidden');
    pararDueloSilencioso();

    // Rellenar el popup con las imágenes y nombres
    dueloPopupImgA.src = DUELO_IMAGENES[pA] || '';
    dueloPopupImgA.alt = pA;
    dueloPopupImgB.src = DUELO_IMAGENES[pB] || '';
    dueloPopupImgB.alt = pB;
    dueloPopupNombreA.textContent = pA;
    dueloPopupNombreB.textContent = pB;
    dueloPopupCuenta.textContent = '10';
    dueloPersonajesPopup.classList.remove('hidden');

    // Al pulsar una carta: cerrar popup y abrir cronómetro directamente
    function elegirDesdePopup() {
        clearInterval(dueloPersonajesPopupInterval);
        dueloPersonajesPopupInterval = null;
        dueloPersonajesPopup.classList.add('hidden');
        dueloPopupCardA.removeEventListener('click', elegirDesdePopup);
        dueloPopupCardB.removeEventListener('click', elegirDesdePopup);
        prepararCronometroDuelo();
    }
    dueloPopupCardA.addEventListener('click', elegirDesdePopup);
    dueloPopupCardB.addEventListener('click', elegirDesdePopup);

    // Cuenta atrás de 10 s; si se acaba sin elegir, muestra los botones de selección
    let cuenta = 10;
    clearInterval(dueloPersonajesPopupInterval);
    dueloPersonajesPopupInterval = setInterval(() => {
        cuenta--;
        dueloPopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(dueloPersonajesPopupInterval);
            dueloPersonajesPopupInterval = null;
            dueloPopupCardA.removeEventListener('click', elegirDesdePopup);
            dueloPopupCardB.removeEventListener('click', elegirDesdePopup);
            dueloPersonajesPopup.classList.add('hidden');
            dueloEleccion.classList.remove('hidden');
        }
    }, 1000);
}

// ── Para el pop-up de elección silenciosamente 
// Se llama cuando el profesor vuelve atrás o vuelve a girar la ruleta.
function pararDueloEleccionSilencioso() {
    clearInterval(dueloPersonajesPopupInterval);
    dueloPersonajesPopupInterval = null;
    if (dueloPersonajesPopup) dueloPersonajesPopup.classList.add('hidden');
    if (dueloEleccion) dueloEleccion.classList.add('hidden');
}
// Muestra y resetea el cronómetro doble del duelo.
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
    pararDueloSilencioso();
    dueloFase = 'argumentar';
    dueloFaseNotificada = false;
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
    dueloFaseNotificada = false;
    dueloRestanteMs = DUELO_PREP_MS;
    pintarDuelo(DUELO_PREP_MS);
    dueloDisplay.classList.remove('fase-argumentar', 'crono-final');
    dueloFaseNombre.textContent = 'Preparación';
    dueloIniciar.disabled    = false;
    dueloArgumentar.disabled = true;
    dueloPausar.disabled     = true;
    dueloEstado.textContent = 'Pulsa "Iniciar preparación" cuando los participantes estén listos.';
}


/* 13d) FINAL 1 — DECLAMACIÓN — Cronómetro doble (preparación + declamación) */

// = Constantes del cronómetro  
const DECLA_PREP_MS    = 2 * 60 * 1000;  // 2 minutos de preparación
const DECLA_DISC_MS    = 2 * 60 * 1000;  // 2 minutos máximo de declamación
const DECLA_MIN_MS     = 30 * 1000;      // cuando queden 30 s → mínimo de 1:30 cumplido

// = Variables de estado  
let declaIntervalo   = null;              // Timer (setInterval)
let declaRestanteMs  = DECLA_PREP_MS;    // Milisegundos restantes en la fase actual
let declaFin         = 0;                // Marca de tiempo (ms) en que termina la fase
let declaFase        = 'prep';           // Fase actual: 'prep' | 'declamacion'
let declaFaseNotificada = false;

// = Montaje  
// Conecta los cuatro botones del cronómetro. Solo se llama una vez al arrancar.
function montarDeclamacion() {
    declaIniciar.addEventListener('click',  iniciarDeclaPrep);
    declaDiscurso.addEventListener('click', iniciarDeclaDiscurso);
    declaPausar.addEventListener('click',   pausarDecla);
    declaReset.addEventListener('click',    resetDecla);
}

// = Preparar  
// Se llama desde mostrarResultado() justo después de mostrar el texto.
// Hace visible el cronómetro y lo resetea al estado inicial.
function prepararCronometroDecla() {
    declaCrono.classList.remove('hidden');
    resetDecla();
}

// = Pintar el display  
// Convierte milisegundos en "MM:SS" y aplica los colores de aviso.
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

// = Iniciar preparación = //
function iniciarDeclaPrep() {
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

// = Iniciar declamación = //
// Se habilita automáticamente al terminar la fase de preparación.
function iniciarDeclaDiscurso() {
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

// = Tick = //
// setInterval llama a esto cada 200 ms para suavizar el display.
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

// = Pausar = //
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

// = Para silenciosamente = //
// Cancela el timer sin cambiar nada en la pantalla.
// Lo llaman ocultarSeccionesSorteo() e inicializarRuleta() para que
// no queden contadores corriendo en segundo plano.
function pararDeclaSilencioso() {
    clearInterval(declaIntervalo);
    declaIntervalo = null;
}
// ── Fin de fase 
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
// ── Reiniciar  
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
    declaDiscurso.disabled = true;
    declaPausar.disabled   = true;
    declaEstado.textContent = 'Pulsa "Iniciar preparación" cuando el alumno esté listo.';
}


/*13e) FINAL 2 — LA PALABRA CALIENTE — Cronómetro de intervenciones*/
// ── Constantes  
const PALABRA_PREP_SEG  = 15;  // PREPARACION 
const PALABRA_TURNO_SEG = 20;  // segundos por turno (límite máximo)
const PALABRA_TURNOS    = 6;   // 6 turnos: 3 por Participante A + 3 por B
let palabraTurnoIdx      = 0;
let palabraIntervalo     = null;
let palabraFinInterval   = null;
let palabraRestanteMs    = PALABRA_TURNO_SEG * 1000;
let palabraSegFin        = 0;
let palabraEnMarcha      = false;
let palabraEnPrep        = false;   
let palabraPrepRealizada = false;   
let palabraMarcasA       = 0;   // intervenciones completadas por Participante A
let palabraMarcasB       = 0;   // intervenciones completadas por Participante B

// ── Montaje  
// Conecta los tres botones del panel. Se llama UNA vez al arrancar.
function montarPalabraCaliente() {
    palabraIniciarBtn.addEventListener('click', iniciarPalabraCaliente);
    palabraPausarBtn.addEventListener('click',  pausarPalabraCaliente);
    palabraResetBtn.addEventListener('click',   resetPalabraCaliente);
}

// ── Crear el contador  
// Muestra los segundos restantes en el bloque de color.
// En los últimos 5 s añade la clase 'crono-urgente' (número pulsa).
function pintarPalabraCaliente(ms) {
    const seg = Math.max(0, Math.ceil(ms / 1000));
    palabraCuentaDisplayEl.textContent = `0:${seg.toString().padStart(2, '0')}`;
    palabraCuentaDisplayEl.classList.toggle('crono-urgente', ms <= 5000);
}

// ── Iniciar  
// Arranca el contador del turno activo.
function iniciarPalabraCaliente() {
    if (palabraEnMarcha) return;
    palabraEnMarcha = true;

    if (!palabraPrepRealizada && !palabraEnPrep) {
        // Primera vez: arrancar la fase de preparación
        palabraEnPrep     = true;
        palabraRestanteMs = PALABRA_PREP_SEG * 1000;
        palabraSegFin     = Date.now() + palabraRestanteMs;
        renderTurnoPalabra();
        palabraCronoEstado.textContent = '¡Preparaos! 15 segundos antes de la primera intervención.';
    } else {
        // Reanudar tras pausa (en prep o en turno)
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

// ── Avanzar turno 
// Al llegar a 0 s: añade el palito del participante activo y pasa
// al siguiente turno (o termina si ya se hicieron los 6).
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

// ── Pausar 
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

// ── Para silenciosamente
function pararPalabraCalienteSilencioso() {
    clearInterval(palabraIntervalo);
    palabraIntervalo = null;
    clearInterval(palabraFinInterval);
    palabraFinInterval = null;
    palabraEnMarcha = false;
}

// ── Fin del juego 

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

// ── Reiniciar 
// Deja todo en el estado inicial: turno 0 (A), sin palitos.
// Se llama al cargar el CSV y al girar para una nueva situación.
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

// ── Actualizar display del turno
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

// ── Descripción del turno (texto de estado) 
function turnoDescripcionPalabra() {
    const esA     = palabraTurnoIdx % 2 === 0;
    const quien   = esA ? 'Participante A' : 'Participante B';
    const nInterv = Math.floor(palabraTurnoIdx / 2) + 1;
    return `${quien} — intervención ${nInterv}/3. ¡20 segundos!`;
}

// ── Palitos (sistema de tachado visual) ─
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


/* 13f) FINAL 3 — DUELO DE PERSONAJES FINAL — Sorteo de equipos + cronómetro*/
// ── Constantes 
const DUELO_FINAL_PREP_MS     = 60 * 1000;  // 1 min de preparación conjunta
const DUELO_FINAL_EXPO_MS     = 60 * 1000;  // 1 min de exposición por equipo
const DUELO_FINAL_REPLICA_SEG = 30;          // segundos por turno de réplica
const DUELO_FINAL_REPLICAS    = 6;           // 6 turnos = 3 réplicas por equipo

// ── Variables de estado 
let dueloFinalEquipoA     = '';      // nombre del equipo que defiende al personaje A
let dueloFinalEquipoB     = '';      // nombre del equipo que defiende al personaje B
let dueloFinalPersonajeA  = '';      // nombre del personaje A (de la dupla sorteada)
let dueloFinalPersonajeB  = '';      // nombre del personaje B

let dueloFinalFase         = 'prep'; // 'prep' | 'expo-a' | 'expo-b' | 'replica' - fases del duelo final
let dueloFinalIntervalo    = null;   // setInterval del cronómetro de la fase activa
let dueloFinalRestanteMs   = DUELO_FINAL_PREP_MS; // milisegundos que quedan
let dueloFinalFin          = 0;      // timestamp del momento en que termina la fase
let dueloFinalFaseNotificada = false;

let dueloFinalAsignarInterval = null; // timer del pop-up de asignación de equipos
let dueloFinalFinInterval     = null; // timer del pop-up de fin de duelo
let duelFinalActivo           = 1;    // 1 = Duelo 1 (eq1 vs eq2)  |  2 = Duelo 2 (eq3 vs eq4)

let dueloFinalReplicaIdx  = 0;  // turno de réplica activo 
let dueloFinalReplicasA   = 0;  // réplicas completadas por el equipo A
let dueloFinalReplicasB   = 0;  // réplicas completadas por el equipo B

// ── Montaje 
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
// ── Mostrar botón de sorteo 

function mostrarAsignacionFinalDuelo(resultado) {
    const partes = resultado.split(' vs ');
    dueloFinalPersonajeA = partes[0] ? partes[0].trim() : resultado;
    dueloFinalPersonajeB = partes[1] ? partes[1].trim() : '—';

    // Mostramos el botón de sorteo; el panel cronómetro permanece oculto
    dueloFinalAsignarDiv.classList.remove('hidden');
    dueloFinalPanel.classList.add('hidden');
}

// ── Sortear equipos
function sortearEquiposDueloFinal() {
    const eqA = duelFinalActivo === 1 ? finalEquipo1 : finalEquipo3;
    const eqB = duelFinalActivo === 1 ? finalEquipo2 : finalEquipo4;

    if (!eqA || !eqB) {
        dueloFinalEstado.textContent = 'Primero realiza el sorteo de emparejamientos.';
        return;
    }

    // Avanzar al siguiente duelo para la próxima ruleta
    duelFinalActivo = duelFinalActivo === 1 ? 2 : 1;

    const [t1, t2] = Math.random() < 0.5 ? [eqA, eqB] : [eqB, eqA];

    dueloFinalEquipoA = t1.nombre;
    dueloFinalEquipoB = t2.nombre;

    // Bloqueamos el botón durante el pop-up para evitar dobles pulsaciones
    dueloFinalAsignarBtn.disabled = true;

    // Mostrar fotos y nombres de personajes
    dueloPopupImgA.src = DUELO_IMAGENES[dueloFinalPersonajeA] || '';
    dueloPopupImgA.alt = dueloFinalPersonajeA;
    dueloPopupImgB.src = DUELO_IMAGENES[dueloFinalPersonajeB] || '';
    dueloPopupImgB.alt = dueloFinalPersonajeB;
    dueloPopupNombreA.textContent = dueloFinalPersonajeA;
    dueloPopupNombreB.textContent = dueloFinalPersonajeB;

    // Mostrar el equipo asignado a cada personaje
    dueloPopupEquipoA.textContent = dueloFinalEquipoA;
    dueloPopupEquipoB.textContent = dueloFinalEquipoB;
    dueloPopupEquipoA.classList.remove('hidden');
    dueloPopupEquipoB.classList.remove('hidden');

    // Ocultar el label de elección (no es una fase de elección) y cambiar subtítulo
    document.querySelectorAll('.duelo-popup-elegir-label').forEach(el => el.classList.add('hidden'));
    dueloPopupSubtitulo.textContent = '¡Asignación por sorteo!';

    // Las tarjetas no son clicables en la fase final
    dueloPopupCardA.disabled = true;
    dueloPopupCardB.disabled = true;

    dueloPopupCuenta.textContent = '10';
    dueloPersonajesPopup.classList.remove('hidden');

    // Cuenta atrás de 10 s
    let cuenta = 10;
    clearInterval(dueloFinalAsignarInterval);
    dueloFinalAsignarInterval = setInterval(() => {
        cuenta--;
        dueloPopupCuenta.textContent = cuenta;
        if (cuenta <= 0) {
            clearInterval(dueloFinalAsignarInterval);
            dueloFinalAsignarInterval = null;
            dueloPersonajesPopup.classList.add('hidden');
            // Restaurar el popup al estado normal para la fase de clasificación
            dueloPopupEquipoA.classList.add('hidden');
            dueloPopupEquipoB.classList.add('hidden');
            document.querySelectorAll('.duelo-popup-elegir-label').forEach(el => el.classList.remove('hidden'));
            dueloPopupSubtitulo.textContent = 'Pulsa al personaje que vas a defender';
            dueloPopupCardA.disabled = false;
            dueloPopupCardB.disabled = false;
            // Una vez cerrado el pop-up, activamos el panel del cronómetro
            activarPanelDueloFinal();
        }
    }, 1000);
}

// ── Para el timer del pop-up de sorteo silenciosamente 
// Se llama cuando el profesor cambia de prueba o vuelve a girar la ruleta,
function pararAsignarDueloFinalSilencioso() {
    clearInterval(dueloFinalAsignarInterval);
    dueloFinalAsignarInterval = null;
    if (dueloPersonajesPopup) dueloPersonajesPopup.classList.add('hidden');
    // Restaurar el popup al estado normal por si se interrumpió a mitad
    if (dueloPopupEquipoA) dueloPopupEquipoA.classList.add('hidden');
    if (dueloPopupEquipoB) dueloPopupEquipoB.classList.add('hidden');
    document.querySelectorAll('.duelo-popup-elegir-label').forEach(el => el.classList.remove('hidden'));
    if (dueloPopupSubtitulo) dueloPopupSubtitulo.textContent = 'Pulsa al personaje que vas a defender';
    if (dueloPopupCardA) dueloPopupCardA.disabled = false;
    if (dueloPopupCardB) dueloPopupCardB.disabled = false;
}

// ── Activar el panel del cronómetro 
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

// ── Pintar el display 
// Convierte milisegundos en "MM:SS" y aplica el aviso visual de urgencia.
function pintarDueloFinal(ms) {
    const neg = ms < 0;
    const abs = Math.ceil(Math.abs(ms) / 1000);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const s = (abs % 60).toString().padStart(2, '0');
    dueloFinalDisplayEl.textContent = `${neg ? '-' : ''}${m}:${s}`;
    const umbral = dueloFinalFase === 'replica' ? 5000 : 10000;
    dueloFinalDisplayEl.classList.toggle('crono-urgente', ms <= umbral);
}
// ── Iniciar preparación 
// Fase 1: 1 minuto para que ambos equipos lean y preparen sus argumentos.
function iniciarDueloFinalPrep() {
    // Si ya estamos en fase prep (pausa-reanuda), no reiniciamos el tiempo
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
    dueloFinalIniciarExpoA.classList.add('hidden');
    dueloFinalIniciarExpoB.classList.add('hidden');
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = '1 minuto para que ambos equipos preparen sus argumentos.';
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

// ── Iniciar exposición del equipo A 
// Fase 2: 1 minuto de exposición inicial para el equipo asignado al personaje A.
function iniciarDueloFinalExpoA() {
    // Si venimos de otra fase (no de pausa en expo-a), reiniciamos el tiempo
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
    dueloFinalIniciarPrep.classList.add('hidden');
    dueloFinalIniciarExpoA.disabled = true;
    dueloFinalIniciarExpoB.classList.add('hidden');
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = `1 minuto de exposición inicial para ${dueloFinalEquipoA}.`;
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

// ── Iniciar exposición del equipo B
// Fase 3: 1 minuto de exposición inicial para el equipo asignado al personaje B.
function iniciarDueloFinalExpoB() {
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
    dueloFinalIniciarPrep.classList.add('hidden');
    dueloFinalIniciarExpoA.classList.add('hidden');
    dueloFinalIniciarExpoB.disabled = true;
    dueloFinalIniciarReplica.classList.add('hidden');
    dueloFinalPausarBtn.disabled = false;
    dueloFinalEstado.textContent = `1 minuto de exposición inicial para ${dueloFinalEquipoB}.`;
    dueloFinalIntervalo = setInterval(dueloFinalTick, 200);
}

// ── Iniciar fase de réplicas 
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

// ── Fin de fase
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

// ── Descripción del turno de réplica (texto de estado)
// Igual que turnoDescripcionPalabra en La Palabra Caliente:
//   Math.floor(replicaIdx / 2) + 1 da 1 para los turnos 0-1, 2 para 2-3, 3 para 4-5.
function turnoDescripcionReplicaDueloFinal() {
    const esA   = dueloFinalReplicaIdx % 2 === 0;
    const quien = esA ? dueloFinalEquipoA : dueloFinalEquipoB;
    const nRep  = Math.floor(dueloFinalReplicaIdx / 2) + 1;
    return `${quien} — réplica ${nRep}/3. ¡30 segundos!`;
}

// ── Actualizar bloque de color y etiquetas en réplicas 
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

// ── Tabla de réplicas (palitos) 
// Reutiliza generarPalitos(n) de la sección 13e (mismo ámbito global).
function renderReplicasDueloFinal() {
    if (!replicasAEl || !replicasBEl) return;
    replicasAEl.innerHTML = generarPalitos(dueloFinalReplicasA);
    replicasBEl.innerHTML = generarPalitos(dueloFinalReplicasB);
}

// ── Pausar 
// Detiene el contador sin perder el tiempo restante.
// Reactiva el botón de la fase activa para que el profesor pueda reanudar.
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

// ── Para silenciosamente 
// Cancela los dos timers posibles sin tocar la pantalla.
// Lo llaman ocultarSeccionesSorteo() y girarRuleta().
function pararDueloFinalSilencioso() {
    clearInterval(dueloFinalIntervalo);
    dueloFinalIntervalo = null;
    clearInterval(dueloFinalFinInterval);
    dueloFinalFinInterval = null;
}

// ── Fin del duelo 
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

// ── Reiniciar UI 
// Deja el panel visible en estado inicial: fase prep, botones listos.
// Se llama desde activarPanelDueloFinal() y desde el botón Reiniciar.
function resetDueloFinalUI() {
    dueloFinalFaseNotificada = false;
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

// ── Reiniciar estado (sin UI) 
// Limpia las variables de estado y reactiva el botón de sorteo.
function resetDueloFinal() {
    pararDueloFinalSilencioso();
    dueloFinalFase       = 'prep';
    dueloFinalRestanteMs = DUELO_FINAL_PREP_MS;
    dueloFinalReplicaIdx = 0;
    dueloFinalReplicasA  = 0;
    dueloFinalReplicasB  = 0;
    duelFinalActivo      = 1;
    if (dueloFinalAsignarBtn) dueloFinalAsignarBtn.disabled = false;
}


/*13g) FINAL 4 — EL MINUTO DE ORO — Dos cronómetros en estrella*/

// ── Constante  
const MINUTO_ORO_MS = 60 * 1000;  // 1 minuto exacto para cada equipo

// ── Variables de estado  
let minutoOroEquipoA = '';   // nombre del equipo asignado a la estrella A
let minutoOroEquipoB = '';   // nombre del equipo asignado a la estrella B

// Timer de la estrella A
let minutoAIntervalo    = null;
let minutoARestanteMs   = MINUTO_ORO_MS;
let minutoAFin          = 0;
let minutoAEnMarcha     = false;
let minutoATerminado    = false;
let minutoANotificada   = false;

// Timer de la estrella B
let minutoBIntervalo    = null;
let minutoBRestanteMs   = MINUTO_ORO_MS;
let minutoBFin          = 0;
let minutoBEnMarcha     = false;
let minutoBTerminado    = false;
let minutoBNotificada   = false;

// Timers de los pop-ups
let minutoOroAsignarInterval = null;  // cuenta atrás del pop-up de sorteo
let minutoOroFinInterval     = null;  // cuenta atrás del pop-up de fin

// ── Montaje  
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
// ── Inicialización  
// Se llama desde cargarPrueba(). Muestra la sección y la deja limpia.
function inicializarMinutoOro() {
    pararMinutoOroSilencioso();
    minutoOroCronos.classList.add('hidden');
    minutoOroPuntuacionesBtn.classList.add('hidden');
    minutoOroAsignarDiv.classList.add('hidden');  // ocultar el botón de sorteo clásico

    // Ocultar estrella B — modo de una sola estrella
    const bloqueB = $('estrella-b') ? $('estrella-b').closest('.minuto-oro-equipo') : null;
    if (bloqueB) bloqueB.style.display = 'none';

    // Usar el selector de chips para que salgan todos los equipos
    ruletaEquiposSelector.classList.remove('hidden');
    inicializarRuletaSelector(null);
    resetMinutoA();
}

// ── Sortear equipos  
function sortearEquiposMinutoOro() {
    const finalistas = equipos.slice();

    if (finalistas.length < 2) {
        minutoOroAsignarEstado.textContent =
            'Necesitas al menos 2 equipos registrados para sortear.';
        return;
    }

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

// ── Para el pop-up de sorteo silenciosamente 
function pararAsignarMinutoOroSilencioso() {
    clearInterval(minutoOroAsignarInterval);
    minutoOroAsignarInterval = null;
    const popupEquipoEl = document.querySelector('.hazme-popup-equipo');
    if (popupEquipoEl) popupEquipoEl.textContent = '¡Le toca a!';
}

// ── Mostrar las dos estrellas tras el pop-up ─ 
// Pone los nombres reales en las estrellas y muestra el bloque.
function activarCronosMinutoOro() {
    minutoANombre.textContent = minutoOroEquipoA;
    minutoBNombre.textContent = minutoOroEquipoB;
    minutoOroCronos.classList.remove('hidden');
    resetMinutoA();
    resetMinutoB();
}

// ── Pintar displays 
 
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

// ── Iniciar / Pausar / Reiniciar — Estrella A  
function iniciarMinutoA() {
    if (minutoAEnMarcha || minutoATerminado) return;
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
    estrellaA.classList.add('terminada');             // estrella se vuelve verde
    minutoAIniciar.disabled = true;
    minutoAPausar.disabled  = true;
    minutoAEstado.textContent = `¡Tiempo de ${minutoOroEquipoA || 'Equipo A'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden'); // aparece al terminar el primero
    bip(660);
    verificarFinMinutoOro();
}

// ── Iniciar / Pausar / Reiniciar — Estrella B  
function iniciarMinutoB() {
    if (minutoBEnMarcha || minutoBTerminado) return;
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
    estrellaB.classList.add('terminada');             // estrella se vuelve verde
    minutoBIniciar.disabled = true;
    minutoBPausar.disabled  = true;
    minutoBEstado.textContent = `¡Tiempo de ${minutoOroEquipoB || 'Equipo B'} agotado!`;
    minutoOroPuntuacionesBtn.classList.remove('hidden'); // aparece al terminar el primero
    bip(660);
    verificarFinMinutoOro();
}

// ── Verificar si los dos timers han terminado 
// Se llama al terminar cada timer. Si los dos han terminado → pop-up de fin.
function verificarFinMinutoOro() {
    if (minutoATerminado && minutoBTerminado) {
        terminarMinutoOro();
    }
}

// ── Pop-up de fin del Minuto de Oro  
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



/* 14) PUNTUACIÓN */

function montarPuntuacion() {


    // ── Formulario de añadir equipo 

    $('form-equipo').addEventListener('submit', async e => {
        e.preventDefault();
        const nombre  = $('equipo-nombre').value.trim();
        // Alumnos: recoge los 4 inputs y descarta los vacíos (el 4 es opcional)
        const alumnos = [...document.querySelectorAll('.alumno-input')]
            .map(i => i.value.trim())
            .filter(a => a);

        // Validación: colegio obligatorio
        if (!nombre || alumnos.length < 3) {
            alert('Elige un colegio y rellena al menos los 3 primeros alumnos.');
            return;
        }
        const nuevoEquipo = { id: 'eq_' + Date.now(), nombre, alumnos };
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
        // Limpiamos el formulario para el siguiente equipo
        e.target.reset();
    });

    $('punt-equipo').addEventListener('change', actualizarSelectorAlumnos);
    $('guardar-puntuacion').addEventListener('click', guardarPuntuacion);

    // Al cambiar la prueba, regenerar la rúbrica con sus criterios específicos
    $('punt-prueba').addEventListener('change', () => {
        limpiarRubrica();
        renderRubrica($('punt-prueba').value);
        actualizarVistaPorAviso($('punt-aviso').value, $('punt-prueba').value);
    });

    // Al cambiar el aviso, mostrar u ocultar la rúbrica según la penalización
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

    // Mostrar/ocultar campo de texto según selección
    sel.onchange = () => {
        otroInput.style.display = sel.value === 'otro' ? 'block' : 'none';
        if (sel.value !== 'otro') otroInput.value = '';
    };
    otroInput.style.display = 'none';
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

// Ajusta la vista del formulario según el tipo de penalización seleccionada.
// Falta leve: oculta la rúbrica y muestra -1 como total (no se puntúa).
// Aviso o ninguno: muestra la rúbrica normalmente.
function actualizarVistaPorAviso(aviso, prueba) {
    const rubricaEl = $('rubrica');
    const totalEl   = $('punt-total');
    const maxEl     = $('punt-max');
    if (aviso === 'falta-leve') {
        // Rúbrica activa; el total se recalcula como (suma criterios − 1)
        rubricaEl.style.opacity        = '';
        rubricaEl.style.pointerEvents  = '';
        totalEl.style.color            = '#e53935';
        if (maxEl) maxEl.style.visibility = '';
        actualizarTotal(prueba);
    } else if (aviso === 'falta-grave') {
        // Rúbrica desactivada; se muestra --- como indicador
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

    // Si eligieron "Otro", usamos el texto del campo libre
    let alumnoIdx;
    let alumnoNombreOtro = null;
    if (alumnoVal === 'otro') {
        alumnoNombreOtro = $('punt-alumno-otro').value.trim();
        if (!alumnoNombreOtro) {
            alert('Escribe el nombre del alumno en el campo de texto.');
            return;
        }
        alumnoIdx = -1; // índice especial para "otro"
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
    limpiarRubrica();
    actualizarVistaPorAviso('', prueba);
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

    // Obtener la URL base del servidor (local o público)
    let url;
    try {
        const resp = await fetch('/api/mi-ip');
        if (!resp.ok) throw new Error();
        const { baseUrl } = await resp.json();
        url = `${baseUrl}/resultados/${encodeURIComponent(eq.id)}`;
    } catch {
        url = `${window.location.origin}/resultados/${encodeURIComponent(eq.id)}`;
    }

    // ── Mostrar modal ──
    $('qr-modal-titulo').textContent    = eq.nombre;
    $('qr-modal-subtitulo').textContent = `Total general: ${totalEquipo(eq.id, 'total')} pts`;
    $('qr-modal').classList.remove('hidden');

    // ── Generar QR en el canvas ──
    const canvas = $('qr-canvas');
    QRCode.toCanvas(canvas, url, { width: 320, margin: 2, color: { dark: '#0D2B55', light: '#FFFFFF' } });

    // ── Botón descargar ──
    $('qr-descargar-btn').onclick = () => {
        const a  = document.createElement('a');
        a.href   = canvas.toDataURL('image/png');
        a.download = `QR_${eq.nombre.replace(/\s+/g, '_')}.png`;
        a.click();
    };

    // ── Cerrar ──
    $('qr-cerrar-btn').onclick = () => $('qr-modal').classList.add('hidden');
    $('qr-modal').onclick      = e => { if (e.target === $('qr-modal')) $('qr-modal').classList.add('hidden'); };
}

function poblarSelectDescarga() {
    const sel = $('descargar-colegio-select');
    if (!sel) return;
    const opciones = equipos.map(e => `<option value="${e.id}">${escapar(e.nombre)}</option>`).join('');
    sel.innerHTML = '<option value="">— Elige un colegio —</option>' + opciones;
    $('descargar-csv-btn').disabled = true;
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

    // ── Logo desde caché precargado al inicio ──
    let logoId = null;
    try {
        if (logoBase64Cache) {
            const raw = logoBase64Cache.includes(',')
                ? logoBase64Cache.split(',')[1]
                : logoBase64Cache;
            logoId = wb.addImage({ base64: raw, extension: 'png' });
        }
    } catch { logoId = null; }

    // ── Cabecera ──
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

    // ── Secciones por prueba ──
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
            const rData = ws.addRow([alumno, ...criPts, p.total, p.aviso || '—']);
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

    // ── Totales ──
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

    // ── Descargar ──
    const buffer   = await wb.xlsx.writeBuffer();
    const blob     = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `${eq.nombre.replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/g, '_')}_oratoria.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}

async function descargarClasificacionCSV_OLD(eq) {
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

    let filas = '';

    // ── URL del logo via URL base del servidor ──
    let logoUrl = '';
    try {
        const resp = await fetch('/api/mi-ip');
        if (!resp.ok) throw new Error();
        const { baseUrl } = await resp.json();
        logoUrl = `${baseUrl}/img/logo.png`;
    } catch { logoUrl = ''; }

    // ── Cabecera: fondo blanco · logo izquierda en recuadro azul · texto derecha ──
    const logoCelda = logoUrl
        ? `<img src="${logoUrl}" width="72" height="72" style="background:white;border-radius:4px;padding:4px;display:block;margin:0 auto;">`
        : '';

    filas += `<tr>
        <td rowspan="3" width="100" style="background:#ffffff;padding:12px;text-align:center;vertical-align:middle;border:3px solid #1A6FC4;">
            ${logoCelda}
        </td>
        <td colspan="7" style="background:#fff;color:#0D2B55;font-weight:bold;font-size:22pt;font-family:Arial;padding:16px 22px 4px;vertical-align:bottom;border-top:2px solid #1A6FC4;border-right:2px solid #1A6FC4;">
            ${eq.nombre}
        </td>
    </tr>
    <tr>
        <td colspan="7" style="background:#fff;color:#1A6FC4;font-size:11pt;font-family:Arial;padding:2px 22px;vertical-align:middle;border-right:2px solid #1A6FC4;">
            II Torneo de Oratoria de Chamberí
        </td>
    </tr>
    <tr>
        <td colspan="7" style="background:#fff;color:#888;font-size:9pt;font-family:Arial;padding:4px 22px 14px;vertical-align:top;border-bottom:2px solid #1A6FC4;border-right:2px solid #1A6FC4;">
            Resultados del equipo · ${new Date().toLocaleDateString('es-ES')}
        </td>
    </tr>`;
    filas += `<tr><td colspan="8" style="border:none;height:14px;background:#f4f7fb;"></td></tr>`;

    // ── Pruebas ──
    PRUEBAS.forEach(pr => {
        const registros = puntuaciones.filter(p => p.equipoId === eq.id && p.prueba === pr.id);
        if (!registros.length) return;

        const criterios  = getCriteriosPrueba(pr.id);
        const criNombres = criterios.map(c => c.nombre);
        while (criNombres.length < 5) criNombres.push('');

        // Cabecera de prueba
        filas += `<tr><td colspan="8" style="background:#1A6FC4;color:#fff;font-weight:bold;font-size:11pt;padding:7px 12px;">
                    ${pr.label}</td></tr>`;

        // Cabecera de columnas
        filas += `<tr>
            <td style="background:#3A9BD5;color:#fff;font-weight:bold;text-align:left;">Alumno</td>
            ${criNombres.map(n => `<td style="background:#3A9BD5;color:#fff;font-weight:bold;text-align:center;">${n}</td>`).join('')}
            <td style="background:#3A9BD5;color:#fff;font-weight:bold;text-align:center;">Total</td>
            <td style="background:#3A9BD5;color:#fff;font-weight:bold;text-align:center;">Aviso</td>
        </tr>`;

        // Filas de datos
        registros.forEach((p, idx) => {
            const bg     = idx % 2 === 1 ? '#EDF5FF' : '#FFFFFF';
            const alumno = p.alumnoNombreOtro || (eq.alumnos && eq.alumnos[p.alumnoIdx]) || `Alumno ${p.alumnoIdx + 1}`;
            const criPts = criterios.map(c => (p.criterios && p.criterios[c.id] != null) ? p.criterios[c.id] : '');
            while (criPts.length < 5) criPts.push('');

            filas += `<tr>
                <td style="background:${bg};text-align:left;">${alumno}</td>
                ${criPts.map(v => `<td style="background:${bg};text-align:center;">${v}</td>`).join('')}
                <td style="background:${bg};text-align:center;font-weight:bold;">${p.total}</td>
                <td style="background:${bg};text-align:center;">${p.aviso || '—'}</td>
            </tr>`;
        });

        filas += `<tr><td colspan="8" style="border:none;height:8px;"></td></tr>`;
    });

    // ── Totales ──
    filas += `<tr><td colspan="8" style="border:none;height:8px;"></td></tr>`;
    [
        { label: 'Total Clasificación', pts: totalEquipo(eq.id, 'clasificacion'), dark: false },
        { label: 'Total Final',         pts: totalEquipo(eq.id, 'final'),         dark: false },
        { label: 'TOTAL GENERAL',       pts: totalEquipo(eq.id, 'total'),         dark: true  },
    ].forEach(({ label, pts, dark }) => {
        const bg  = dark ? '#0D2B55' : '#D6EAF8';
        const col = dark ? '#FFFFFF' : '#0D2B55';
        const sz  = dark ? '11pt' : '10pt';
        filas += `<tr>
            <td style="background:${bg};color:${col};font-weight:bold;font-size:${sz};text-align:left;">${label}</td>
            <td colspan="5" style="background:${bg};"></td>
            <td style="background:${bg};color:${col};font-weight:bold;font-size:${sz};text-align:center;">${pts}</td>
            <td style="background:${bg};"></td>
        </tr>`;
    });

    // ── Generar fichero ──
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8">
    <style>
        body  { font-family: Arial, sans-serif; font-size: 10pt; }
        table { border-collapse: collapse; }
        td    { border: 1px solid #B0C4D8; padding: 5px 9px; }
    </style></head>
    <body><table>${filas}</table></body></html>`;

    const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${eq.nombre.replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/g, '_')}_oratoria.xls`;
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
        return `
            <div class="detalle-fila" data-id="${p.id}">
                <div class="detalle-celda detalle-equipo-nombre">${nombre}</div>
                <div class="detalle-celda">${alumno}</div>
                <div class="detalle-celda">${salaLabel}</div>
                <div class="detalle-celda">${escapar(p.prueba)}</div>
                <div class="detalle-celda detalle-pts" style="${p.aviso === 'falta-leve' || p.aviso === 'falta-grave' ? 'color:#e53935;font-weight:700;' : ''}">${p.aviso === 'falta-grave' ? '---' : p.total + ' pts'}</div>
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
            <div class="detalle-celda">Puntos</div>
            <div class="detalle-celda">Aviso</div>
            <div class="detalle-celda"></div>
        </div>
        ${filas}`;

    // Conectar botones de borrar
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

// Escapa HTML para evitar inyección al pintar nombres de equipos/alumnos.
function escapar(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
