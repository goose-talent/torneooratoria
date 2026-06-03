/**
 * server.js — Servidor del Torneo de Oratoria de Chamberí
 * =========================================================
 * Servidor HTTP minimalista escrito en Node.js puro (sin npm, sin dependencias).
 * Hace dos cosas:
 *   1. Sirve los ficheros estáticos del proyecto (HTML, CSS, JS, CSV, imágenes).
 *   2. Expone dos endpoints de API para leer y escribir los datos del torneo:
 *        GET  /api/datos  → devuelve datos.json como JSON
 *        POST /api/datos  → recibe JSON y lo guarda en datos.json
 *
 * Para arrancarlo: ejecuta "iniciar.bat" o en la terminal:
 *   node server.js
 * Luego abre el navegador en: http://localhost:3000
 */

'use strict';

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');
const ExcelJS = require('exceljs');

// ── Configuración ───────────────────────────────────────────────────────────
const PORT      = 3000;
// Ruta absoluta al fichero JSON que hace de "base de datos"
const DATA_FILE = path.join(__dirname, 'datos.json');
// Carpeta raíz desde la que servir los ficheros estáticos
const ROOT      = __dirname;

// ── Tipos MIME ───────────────────────────────────────────────────────────────
// El navegador necesita saber el tipo de cada fichero para procesarlo bien.
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.csv':  'text/csv; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

// ── Utilidad: leer el cuerpo completo de una petición POST ──────────────────
function leerCuerpo(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data',  chunk => body += chunk.toString());
        req.on('end',   ()    => resolve(body));
        req.on('error', err   => reject(err));
    });
}

// ── Helpers de acceso a datos.json ──────────────────────────────────────────
// readFileSync y writeFileSync son síncronos: entre ellos ninguna otra petición
// puede ejecutarse en el event loop, por lo que la secuencia leer→modificar→escribir
// es atómica respecto a otras peticiones concurrentes.
function leerDatos() {
    if (!fs.existsSync(DATA_FILE)) return { equipos: [], puntuaciones: [] };
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch { return { equipos: [], puntuaciones: [] }; }
}
function escribirDatos(datos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2), 'utf8');
}

// ── Manejador principal de peticiones ───────────────────────────────────────
const server = http.createServer(async (req, res) => {

    // Cabeceras CORS: permiten que el navegador llame a la API aunque el origen
    // no sea exactamente el mismo (útil en desarrollo).
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Los navegadores modernos envían una petición OPTIONS ("preflight") antes de
    // cada POST con cabeceras personalizadas. Respondemos con 204 (sin contenido).
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url.split('?')[0]; // ignorar query string
// IMPORTANTE POR LA SIMULTANEIDAD: cada petición se maneja de forma independiente, sin variables globales compartidas.
    // ── POST /api/equipos 

    if (req.method === 'POST' && url === '/api/equipos') {
        try {
            const body   = await leerCuerpo(req);
            const equipo = JSON.parse(body);
            const datos  = leerDatos();
            if (!datos.equipos.find(e => e.id === equipo.id)) {
                datos.equipos.push(equipo);
                escribirDatos(datos);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(datos));
        } catch (err) {
            console.error('[API] Error añadiendo equipo:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al añadir equipo.' }));
        }
        return;
    }

    // ── POST /api/equipos/borrar
    if (req.method === 'POST' && url === '/api/equipos/borrar') {
        try {
            const body      = await leerCuerpo(req);
            const { id }    = JSON.parse(body);
            const datos     = leerDatos();
            datos.equipos      = datos.equipos.filter(e => e.id !== id);
            datos.puntuaciones = datos.puntuaciones.filter(p => p.equipoId !== id);
            escribirDatos(datos);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(datos));
        } catch (err) {
            console.error('[API] Error borrando equipo:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al borrar equipo.' }));
        }
        return;
    }

    // ── POST /api/puntuaciones
    if (req.method === 'POST' && url === '/api/puntuaciones') {
        try {
            const body  = await leerCuerpo(req);
            const punt  = JSON.parse(body);
            const datos = leerDatos();
            if (!datos.puntuaciones.find(p => p.id === punt.id)) {
                datos.puntuaciones.push(punt);
                escribirDatos(datos);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(datos));
        } catch (err) {
            console.error('[API] Error añadiendo puntuación:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al añadir puntuación.' }));
        }
        return;
    }

    // ── POST /api/puntuaciones/borrar
    if (req.method === 'POST' && url === '/api/puntuaciones/borrar') {
        try {
            const body  = await leerCuerpo(req);
            const { id } = JSON.parse(body);
            const datos = leerDatos();
            datos.puntuaciones = datos.puntuaciones.filter(p => p.id !== id);
            escribirDatos(datos);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(datos));
        } catch (err) {
            console.error('[API] Error borrando puntuación:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al borrar puntuación.' }));
        }
        return;
    }

    // ── GET /api/logo ───────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/api/logo') {
        const logoPath = path.join(ROOT, 'img', 'logo.png');
        if (fs.existsSync(logoPath)) {
            const b64 = fs.readFileSync(logoPath).toString('base64');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ base64: 'data:image/png;base64,' + b64 }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ base64: null }));
        }
        return;
    }

    // ── GET /api/mi-ip ──────────────────────────────────────────────────────
    if (req.method === 'GET' && url === '/api/mi-ip') {
        const interfaces = os.networkInterfaces();
        let ip = 'localhost';
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) { ip = iface.address; break; }
            }
            if (ip !== 'localhost') break;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ baseUrl: `http://${ip}:${PORT}` }));
        return;
    }

    // ── GET /api/excel/:id ──────────────────────────────────────────────────
    if (req.method === 'GET' && url.startsWith('/api/excel/')) {
        const id    = decodeURIComponent(url.split('/api/excel/')[1]);
        const datos = leerDatos();
        const eq    = datos.equipos.find(e => e.id === id);
        if (!eq) { res.writeHead(404); res.end('Equipo no encontrado'); return; }
        try {
            const wb       = await generarExcelEquipo(eq, datos.puntuaciones);
            const filename = `${eq.nombre.replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/g, '_')}_oratoria.xlsx`;
            res.writeHead(200, {
                'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            });
            await wb.xlsx.write(res);
            res.end();
        } catch (err) {
            console.error('[Excel]', err);
            res.writeHead(500);
            res.end('Error generando Excel');
        }
        return;
    }

    // ── GET /resultados/:id ─────────────────────────────────────────────────
    if (req.method === 'GET' && url.startsWith('/resultados/')) {
        const id     = decodeURIComponent(url.split('/resultados/')[1]);
        const datos  = leerDatos();
        const eq     = datos.equipos.find(e => e.id === id);
        if (!eq) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h2>Equipo no encontrado</h2>');
            return;
        }
        const html = generarPaginaResultados(eq, datos.puntuaciones);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // ── GET /api/datos ───────────────────────────────────────────────────────
    // Devuelve el contenido de datos.json. Si el fichero no existe todavía,
    // devuelve un objeto vacío con las dos claves esperadas.
    if (req.method === 'GET' && url === '/api/datos') {
        try {
            const contenido = fs.existsSync(DATA_FILE)
                ? fs.readFileSync(DATA_FILE, 'utf8')
                : JSON.stringify({ equipos: [], puntuaciones: [] }, null, 2);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(contenido);
        } catch (err) {
            console.error('[API] Error leyendo datos.json:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error interno al leer los datos.' }));
        }
        return;
    }

    // ── POST /api/datos ──────────────────────────────────────────────────────
    // Recibe un JSON con { equipos, puntuaciones } y lo guarda en datos.json.
    if (req.method === 'POST' && url === '/api/datos') {
        try {
            const body = await leerCuerpo(req);
            // Validamos que sea JSON válido antes de escribirlo a disco
            JSON.parse(body);
            // Guardamos con formato legible (sangría de 2 espacios) por si alguien
            // necesita abrir datos.json en un editor de texto
            const formateado = JSON.stringify(JSON.parse(body), null, 2);
            fs.writeFileSync(DATA_FILE, formateado, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        } catch (err) {
            console.error('[API] Error guardando datos.json:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'JSON inválido o error al escribir.' }));
        }
        return;
    }

    // ── Ficheros estáticos ───────────────────────────────────────────────────
    // Todo lo que no sea /api/... se sirve como fichero estático.
    // "/" se redirige a "/index.html".
    const ficheroRelativo = url === '/' ? '/index.html' : url;
    const rutaAbsoluta    = path.join(ROOT, ficheroRelativo);

    // Comprobación de seguridad: que la ruta no salga fuera del directorio raíz
    // (previene ataques de path traversal como "/../../../etc/passwd")
    if (!rutaAbsoluta.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Acceso denegado');
        return;
    }

    if (fs.existsSync(rutaAbsoluta) && fs.statSync(rutaAbsoluta).isFile()) {
        const ext      = path.extname(rutaAbsoluta).toLowerCase();
        const mimeType = MIME[ext] || 'application/octet-stream';
        const contenido = fs.readFileSync(rutaAbsoluta);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(contenido);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`No encontrado: ${ficheroRelativo}`);
    }
});

// ── Criterios por prueba (solo id+nombre, para las cabeceras del Excel) ─────
const CRITERIOS_XLS = {
    'hazme-fan':              [{ id:'opinion',       nombre:'Contenido y argumentos' }, { id:'razones',   nombre:'Persuasión y emoción' },    { id:'emocion',   nombre:'Expresión oral' },          { id:'enganchar', nombre:'Lenguaje corporal' },              { id:'organizar',    nombre:'Organización del discurso' }],
    'fabrica-historias':      [{ id:'inicio',        nombre:'Creatividad' },            { id:'nudo',      nombre:'Estructura narrativa' },     { id:'desenlace', nombre:'Coherencia' },              { id:'personajes', nombre:'Expresión oral' },                { id:'emocion',      nombre:'Lenguaje corporal' }],
    'voces-derecho':          [{ id:'explicar',      nombre:'Comprensión del artículo'},{ id:'argumentar',nombre:'Razonamiento y argumentos' },{ id:'defender',  nombre:'Organización del discurso' },{ id:'reflexionar',nombre:'Expresión oral' },              { id:'lenguaje',     nombre:'Lenguaje corporal y seguridad' }],
    'duelo-personajes':       [{ id:'argumentacion', nombre:'Argumentación comparativa'},{ id:'defensa',  nombre:'Defensa del personaje' },   { id:'replica',   nombre:'Capacidad de respuesta' },   { id:'expresion',  nombre:'Expresión oral' },               { id:'actitud',      nombre:'Actitud y respeto' }],
    'declamacion':            [{ id:'expresividad',  nombre:'Expresividad e intención'},{ id:'voz',       nombre:'Uso de la voz' },            { id:'ritmo',     nombre:'Ritmo y pausas' },           { id:'comprension',nombre:'Comprensión del texto' },        { id:'presencia',    nombre:'Seguridad y presencia' }],
    'palabra-caliente':       [{ id:'escucha',       nombre:'Escucha y adaptación' },   { id:'coherencia',nombre:'Coherencia' },               { id:'aportacion',nombre:'Aportación de ideas' },     { id:'expresion',  nombre:'Expresión oral' },               { id:'fluidez',      nombre:'Seguridad y fluidez' }],
    'duelo-personajes-final': [{ id:'argumentacion', nombre:'Argumentación comparativa'},{ id:'defensa',  nombre:'Defensa del personaje' },   { id:'replica',   nombre:'Capacidad de réplica' },     { id:'escucha',    nombre:'Escucha activa' },               { id:'expresion',    nombre:'Expresión oral' }],
    'minuto-oro':             [{ id:'persuasion',    nombre:'Capacidad de persuasión' }, { id:'estructura',nombre:'Estructura del discurso' },  { id:'expresion', nombre:'Expresión oral y seguridad' },{ id:'creatividad',nombre:'Creatividad y originalidad' },  { id:'respeto',      nombre:'Trabajo en equipo y respeto' }],
};

// ── Generador de Excel con ExcelJS ───────────────────────────────────────────
async function generarExcelEquipo(eq, puntuaciones) {
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

    const brd = (color = 'FFB0C4D8') => ({ style: 'thin', color: { argb: color } });
    const allBorders = () => ({ top: brd(), bottom: brd(), left: brd(), right: brd() });
    const medBorder  = (c = 'FF1A6FC4') => ({ style: 'medium', color: { argb: c } });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Torneo Oratoria Chamberí';
    const ws = wb.addWorksheet(eq.nombre.slice(0, 31));

    ws.columns = [
        { width: 30 }, { width: 22 }, { width: 22 },
        { width: 22 }, { width: 22 }, { width: 22 },
        { width: 10 }, { width: 14 },
    ];

    // ── Cabecera: logo izquierda · nombre derecha ──
    ws.mergeCells('A1:A3');
    const logoCell = ws.getCell('A1');
    logoCell.fill   = { type:'pattern', pattern:'solid', fgColor: WHITE };
    logoCell.border = { top: medBorder(), bottom: medBorder(), left: medBorder(), right: medBorder() };

    const logoPath = path.join(ROOT, 'img', 'logo.png');
    if (fs.existsSync(logoPath)) {
        const imgId = wb.addImage({ filename: logoPath, extension: 'png' });
        ws.addImage(imgId, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
    }

    ws.mergeCells('B1:H1');
    const c1 = ws.getCell('B1');
    c1.value     = eq.nombre;
    c1.font      = { bold: true, size: 22, color: NAVY, name: 'Arial' };
    c1.fill      = { type:'pattern', pattern:'solid', fgColor: WHITE };
    c1.alignment = { vertical: 'bottom', horizontal: 'left', indent: 2 };
    c1.border    = { top: medBorder(), right: medBorder() };
    ws.getRow(1).height = 48;

    ws.mergeCells('B2:H2');
    const c2 = ws.getCell('B2');
    c2.value     = 'II Torneo de Oratoria de Chamberí';
    c2.font      = { size: 11, color: BLUE, name: 'Arial' };
    c2.fill      = { type:'pattern', pattern:'solid', fgColor: WHITE };
    c2.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };
    c2.border    = { right: medBorder() };
    ws.getRow(2).height = 26;

    ws.mergeCells('B3:H3');
    const c3 = ws.getCell('B3');
    c3.value     = `Resultados del equipo · ${new Date().toLocaleDateString('es-ES')}`;
    c3.font      = { size: 9, color: GREY, name: 'Arial' };
    c3.fill      = { type:'pattern', pattern:'solid', fgColor: WHITE };
    c3.alignment = { vertical: 'top', horizontal: 'left', indent: 2 };
    c3.border    = { bottom: medBorder(), right: medBorder() };
    ws.getRow(3).height = 24;

    ws.addRow([]).height = 8;

    // ── Secciones por prueba ──
    PRUEBAS.forEach(pr => {
        const registros = puntsEq.filter(p => p.prueba === pr.id);
        if (!registros.length) return;

        const criterios  = CRITERIOS_XLS[pr.id] || [];
        const criNombres = criterios.map(c => c.nombre);
        while (criNombres.length < 5) criNombres.push('');

        // Fila de prueba
        const rPrueba = ws.addRow([pr.label]);
        ws.mergeCells(`A${rPrueba.number}:H${rPrueba.number}`);
        const pCell = ws.getCell(`A${rPrueba.number}`);
        pCell.fill      = { type:'pattern', pattern:'solid', fgColor: BLUE };
        pCell.font      = { bold: true, size: 11, color: WHITE, name: 'Arial' };
        pCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        rPrueba.height  = 20;

        // Cabecera de columnas
        const rHead = ws.addRow(['Alumno', ...criNombres, 'Total', 'Aviso']);
        rHead.eachCell(cell => {
            cell.fill      = { type:'pattern', pattern:'solid', fgColor: LBLUE };
            cell.font      = { bold: true, size: 9, color: WHITE, name: 'Arial' };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border    = allBorders();
        });
        rHead.getCell(1).alignment = { vertical:'middle', horizontal:'left', indent:1 };
        rHead.height = 22;

        // Filas de datos
        registros.forEach((p, idx) => {
            const alumno = p.alumnoNombreOtro || (eq.alumnos && eq.alumnos[p.alumnoIdx]) || `Alumno ${p.alumnoIdx + 1}`;
            const criPts = criterios.map(c => (p.criterios && p.criterios[c.id] != null) ? Number(p.criterios[c.id]) : '');
            while (criPts.length < 5) criPts.push('');

            const rData = ws.addRow([alumno, ...criPts, p.total, p.aviso || '—']);
            const bg    = idx % 2 === 1 ? ALTBG : WHITE;
            rData.eachCell(cell => {
                cell.fill      = { type:'pattern', pattern:'solid', fgColor: bg };
                cell.font      = { size: 9, name: 'Arial' };
                cell.alignment = { vertical:'middle', horizontal:'center' };
                cell.border    = allBorders();
            });
            rData.getCell(1).alignment = { vertical:'middle', horizontal:'left', indent:1 };
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
        const r = ws.addRow([label, '', '', '', '', '', pts, '']);
        ws.mergeCells(`A${r.number}:F${r.number}`);
        const fg = dark ? NAVY : XBLUE;
        r.eachCell(cell => {
            cell.fill      = { type:'pattern', pattern:'solid', fgColor: fg };
            cell.font      = { bold: true, size: dark ? 11 : 10, color: dark ? WHITE : NAVY, name: 'Arial' };
            cell.alignment = { vertical:'middle', horizontal:'left', indent:1 };
            cell.border    = allBorders();
        });
        r.getCell(7).alignment = { vertical:'middle', horizontal:'center' };
        r.height = 22;
    });

    return wb;
}

// ── Página de resultados por equipo ─────────────────────────────────────────
function generarPaginaResultados(eq, puntuaciones) {
    const PRUEBAS = [
        { id: 'hazme-fan',              label: 'Prueba 1 — Hazme Fan',             fase: 'Clasificación' },
        { id: 'fabrica-historias',      label: 'Prueba 2 — Fábrica de Historias', fase: 'Clasificación' },
        { id: 'voces-derecho',          label: 'Prueba 3 — Voces con Derecho',     fase: 'Clasificación' },
        { id: 'duelo-personajes',       label: 'Prueba 4 — Duelo de Personajes',   fase: 'Clasificación' },
        { id: 'declamacion',            label: 'Final 1 — Declamación',            fase: 'Final' },
        { id: 'palabra-caliente',       label: 'Final 2 — Palabra Caliente',       fase: 'Final' },
        { id: 'duelo-personajes-final', label: 'Final 3 — Duelo Final',            fase: 'Final' },
        { id: 'minuto-oro',             label: 'Final 4 — Minuto de Oro',          fase: 'Final' },
    ];
    const CLASIF_IDS = ['hazme-fan', 'fabrica-historias', 'voces-derecho', 'duelo-personajes'];
    const FINAL_IDS  = ['declamacion', 'palabra-caliente', 'duelo-personajes-final', 'minuto-oro'];

    const puntsEq     = puntuaciones.filter(p => p.equipoId === eq.id);
    const totalClasif = puntsEq.filter(p => CLASIF_IDS.includes(p.prueba)).reduce((s, p) => s + p.total, 0);
    const totalFinal  = puntsEq.filter(p => FINAL_IDS.includes(p.prueba)).reduce((s, p) => s + p.total, 0);
    const totalGen    = puntsEq.reduce((s, p) => s + p.total, 0);

    // Construir datos para el PDF
    const secciones = [];
    PRUEBAS.forEach(pr => {
        const registros = puntsEq.filter(p => p.prueba === pr.id);
        if (!registros.length) return;
        secciones.push({
            label: pr.label,
            fase:  pr.fase,
            filas: registros.map(p => ({
                alumno: p.alumnoNombreOtro || (eq.alumnos && eq.alumnos[p.alumnoIdx]) || `Alumno ${p.alumnoIdx + 1}`,
                total:  p.total,
                aviso:  p.aviso || '—'
            }))
        });
    });

    const datos = JSON.stringify({
        nombre:   eq.nombre,
        secciones,
        totales: { clasificacion: totalClasif, final: totalFinal, general: totalGen }
    });

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${eq.nombre} — Resultados</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:Arial,sans-serif; background:#f4f7fb; color:#0D2B55; display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; gap:16px; padding:24px; }
        .msg { font-size:1.1rem; font-weight:bold; color:#1A6FC4; }
        .sub { font-size:0.9rem; color:#666; }
        .btn { background:#1A6FC4; color:white; border:none; padding:12px 28px; border-radius:8px; font-size:1rem; font-weight:bold; cursor:pointer; margin-top:8px; }
        .btn:hover { background:#0D2B55; }
    </style>
</head>
<body>
    <div class="msg">Generando PDF de ${eq.nombre}…</div>
    <div class="sub">La descarga comenzará en unos segundos.</div>
    <button class="btn" onclick="generarPDF()">⬇ Descargar de nuevo</button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"></script>
    <script>
    const DATA = ${datos};

    function cargarLogo() {
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width  = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(null);
            img.src = '/img/logo.png';
        });
    }

    async function generarPDF() {
        const logoData = await cargarLogo();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        let y = 0;

        // Cabecera
        doc.setFillColor(13, 43, 85);
        doc.rect(0, 0, W, 32, 'F');

        // Texto a la izquierda
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(DATA.nombre, 14, 13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('II Torneo de Oratoria de Chamberí — Resultados', 14, 23);

        // Logo arriba a la derecha con fondo blanco
        if (logoData) {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(W - 37, 3, 26, 26, 3, 3, 'F');
            doc.addImage(logoData, 'PNG', W - 36, 4, 24, 24);
        }
        y = 38;

        // Secciones
        DATA.secciones.forEach(sec => {
            if (y > 250) { doc.addPage(); y = 14; }

            // Título prueba
            doc.setFillColor(26, 111, 196);
            doc.rect(14, y, W - 28, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(sec.label, 16, y + 5.5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(sec.fase, W - 16, y + 5.5, { align: 'right' });
            y += 10;

            // Tabla
            doc.autoTable({
                startY: y,
                margin: { left: 14, right: 14 },
                head: [['Alumno', 'Puntuación', 'Aviso']],
                body: sec.filas.map(f => [f.alumno, f.total + ' pts', f.aviso]),
                headStyles:    { fillColor: [58, 155, 213], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                bodyStyles:    { fontSize: 8, textColor: [13, 43, 85] },
                alternateRowStyles: { fillColor: [237, 245, 255] },
                columnStyles:  { 1: { halign: 'center' }, 2: { halign: 'center' } },
                theme: 'grid',
            });
            y = doc.lastAutoTable.finalY + 6;
        });

        // Totales
        if (y > 240) { doc.addPage(); y = 14; }
        doc.autoTable({
            startY: y,
            margin: { left: 14, right: 14 },
            body: [
                ['Total Clasificación', DATA.totales.clasificacion + ' pts'],
                ['Total Final',         DATA.totales.final         + ' pts'],
                ['TOTAL GENERAL',       DATA.totales.general       + ' pts'],
            ],
            bodyStyles: { fontSize: 9, textColor: [13, 43, 85] },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
            didParseCell: (data) => {
                if (data.row.index === 2) {
                    data.cell.styles.fillColor  = [13, 43, 85];
                    data.cell.styles.textColor  = [255, 255, 255];
                    data.cell.styles.fontStyle  = 'bold';
                } else {
                    data.cell.styles.fillColor = [214, 234, 248];
                }
            },
            theme: 'grid',
        });

        doc.save(DATA.nombre.replace(/\\s+/g, '_') + '_resultados.pdf');
    }

    window.addEventListener('load', generarPDF);
    </script>
</body>
</html>`;
}

// ── Arrancar el servidor ─────────────────────────────────────────────────────
server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.error('');
        console.error('  ✗ El puerto ' + PORT + ' ya está en uso.');
        console.error('  → El servidor ya está arrancado. Abre el navegador en: http://localhost:' + PORT);
        console.error('  → Si quieres reiniciarlo, cierra primero la otra ventana del servidor.');
        console.error('');
    } else {
        console.error(err);
    }
    process.exit(1);
});

server.listen(PORT, () => {
    console.log('');
    console.log('  ✓ Servidor del Torneo de Oratoria arrancado');
    console.log(`  → Abre en el navegador: http://localhost:${PORT}`);
    console.log(`  → Datos guardados en:   ${DATA_FILE}`);
    console.log('  → Para parar el servidor: Ctrl + C');
    console.log('');
});
