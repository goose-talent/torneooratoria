<?php
// resultados.php — Página de resultados por equipo (abierta desde el QR)
header('Content-Type: text/html; charset=utf-8');

$DATA_FILE = __DIR__ . '/datos.json';
$id        = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!$id) { http_response_code(400); echo '<h2>Falta el ID del equipo</h2>'; exit; }

// Leer datos
$datos = ['equipos' => [], 'puntuaciones' => []];
if (file_exists($DATA_FILE)) {
    $json  = file_get_contents($DATA_FILE);
    $leido = json_decode($json, true);
    if (is_array($leido)) $datos = $leido;
}

// Buscar equipo
$eq = null;
foreach ($datos['equipos'] as $e) {
    if ($e['id'] === $id) { $eq = $e; break; }
}
if (!$eq) { http_response_code(404); echo '<h2>Equipo no encontrado</h2>'; exit; }

// Puntuaciones del equipo
$puntsEq = array_filter($datos['puntuaciones'], fn($p) => $p['equipoId'] === $id);

$CLASIF = ['hazme-fan','fabrica-historias','voces-derecho','duelo-personajes'];
$FINAL  = ['declamacion','palabra-caliente','duelo-personajes-final','minuto-oro'];

$totalClasif = array_sum(array_column(array_filter($puntsEq, fn($p) => in_array($p['prueba'], $CLASIF)), 'total'));
$totalFinal  = array_sum(array_column(array_filter($puntsEq, fn($p) => in_array($p['prueba'], $FINAL)),  'total'));
$totalGen    = array_sum(array_column($puntsEq, 'total'));

$PRUEBAS = [
    ['id'=>'hazme-fan',              'label'=>'Prueba 1 — Hazme Fan'],
    ['id'=>'fabrica-historias',      'label'=>'Prueba 2 — Fábrica de Historias'],
    ['id'=>'voces-derecho',          'label'=>'Prueba 3 — Voces con Derecho'],
    ['id'=>'duelo-personajes',       'label'=>'Prueba 4 — Duelo de Personajes'],
    ['id'=>'declamacion',            'label'=>'Final 1 — Declamación'],
    ['id'=>'palabra-caliente',       'label'=>'Final 2 — Palabra Caliente'],
    ['id'=>'duelo-personajes-final', 'label'=>'Final 3 — Duelo Final'],
    ['id'=>'minuto-oro',             'label'=>'Final 4 — Minuto de Oro'],
];

$CRITERIOS_NOMBRES = [
    'hazme-fan'              => ['Contenido y argumentos','Persuasión y emoción','Expresión oral','Lenguaje corporal','Organización del discurso'],
    'fabrica-historias'      => ['Creatividad','Estructura narrativa','Coherencia','Expresión oral','Lenguaje corporal y expresividad'],
    'voces-derecho'          => ['Comprensión del artículo','Razonamiento y argumentos','Organización del discurso','Expresión oral','Lenguaje corporal y seguridad'],
    'duelo-personajes'       => ['Argumentación comparativa','Defensa del personaje','Capacidad de respuesta','Expresión oral','Actitud y respeto'],
    'declamacion'            => ['Expresividad e intención','Uso de la voz','Ritmo y pausas','Comprensión del texto','Seguridad y presencia escénica'],
    'palabra-caliente'       => ['Escucha y adaptación','Coherencia de la intervención','Aportación de ideas','Expresión oral','Seguridad y fluidez'],
    'duelo-personajes-final' => ['Argumentación comparativa','Defensa del personaje','Capacidad de réplica','Escucha activa','Expresión oral'],
    'minuto-oro'             => ['Capacidad de persuasión','Estructura del discurso','Expresión oral y seguridad','Creatividad y originalidad','Trabajo en equipo y respeto'],
];

$CRITERIOS_IDS = [
    'hazme-fan'              => ['opinion','razones','emocion','enganchar','organizar'],
    'fabrica-historias'      => ['inicio','nudo','desenlace','personajes','emocion'],
    'voces-derecho'          => ['explicar','argumentar','defender','reflexionar','lenguaje'],
    'duelo-personajes'       => ['argumentacion','defensa','replica','expresion','actitud'],
    'declamacion'            => ['expresividad','voz','ritmo','comprension','presencia'],
    'palabra-caliente'       => ['escucha','coherencia','aportacion','expresion','fluidez'],
    'duelo-personajes-final' => ['argumentacion','defensa','replica','escucha','expresion'],
    'minuto-oro'             => ['persuasion','estructura','expresion','creatividad','respeto'],
];

// Construir secciones de datos para pasar a jsPDF
$secciones = [];
foreach ($PRUEBAS as $pr) {
    $registros = array_values(array_filter($puntsEq, fn($p) => $p['prueba'] === $pr['id']));
    if (!count($registros)) continue;
    $criIds     = $CRITERIOS_IDS[$pr['id']]    ?? [];
    $criNombres = $CRITERIOS_NOMBRES[$pr['id']] ?? [];
    $filas = [];
    foreach ($registros as $p) {
        $alumno = $p['alumnoNombreOtro']
            ?? ($eq['alumnos'][$p['alumnoIdx']] ?? ('Alumno ' . ($p['alumnoIdx'] + 1)));
        $criPts = array_map(
            fn($id) => isset($p['criterios'][$id]) ? (int)$p['criterios'][$id] : '—',
            $criIds
        );
        $filas[] = [
            'alumno'    => $alumno,
            'criterios' => $criPts,
            'total'     => $p['total'],
            'aviso'     => $p['aviso'] ?? '—',
        ];
    }
    $secciones[] = ['label' => $pr['label'], 'criterios' => $criNombres, 'filas' => $filas];
}

// Logo embebido como base64 directamente desde el servidor
$logoBase64 = '';
$logoPath   = __DIR__ . '/img/logo.png';
if (file_exists($logoPath)) {
    $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
}

$DATA_JSON = json_encode([
    'nombre'   => $eq['nombre'],
    'secciones'=> $secciones,
    'totales'  => ['clasificacion' => $totalClasif, 'final' => $totalFinal, 'general' => $totalGen],
], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);

$nombre = htmlspecialchars($eq['nombre']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title><?= $nombre ?> — Resultados</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:Arial,sans-serif; background:#f4f7fb; color:#0D2B55;
               display:flex; align-items:center; justify-content:center;
               min-height:100vh; flex-direction:column; gap:16px; padding:24px; }
        .msg { font-size:1.1rem; font-weight:bold; color:#1A6FC4; }
        .sub { font-size:0.9rem; color:#666; }
        .btn { background:#1A6FC4; color:white; border:none; padding:12px 28px;
               border-radius:8px; font-size:1rem; font-weight:bold; cursor:pointer; margin-top:8px; }
        .btn:hover { background:#0D2B55; }
    </style>
</head>
<body>
    <div class="msg">Generando PDF de <?= $nombre ?>…</div>
    <div class="sub">La descarga comenzará en unos segundos.</div>
    <button class="btn" onclick="generarPDF()">⬇ Descargar de nuevo</button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"></script>
    <script>
    const DATA      = <?= $DATA_JSON ?>;
    const LOGO_B64  = <?= json_encode($logoBase64) ?>;

    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();

        // Cabecera
        doc.setFillColor(13, 43, 85);
        doc.rect(0, 0, W, 32, 'F');

        // Logo embebido directamente (sin fetch, funciona en todos los dispositivos)
        if (LOGO_B64) {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(W-37, 3, 26, 26, 3, 3, 'F');
            doc.addImage(LOGO_B64, 'PNG', W-36, 4, 24, 24);
        }

        finalizarPDF(doc, W);
    }

    function finalizarPDF(doc, W) {
        let y = 38;

        doc.setTextColor(255,255,255);
        doc.setFont('helvetica','bold');
        doc.setFontSize(16);
        doc.text(DATA.nombre, 14, 13);
        doc.setFont('helvetica','normal');
        doc.setFontSize(9);
        doc.text('II Torneo de Oratoria de Chamberí — Resultados', 14, 23);

        DATA.secciones.forEach(sec => {
            if (y > 250) { doc.addPage(); y = 14; }
            doc.setFillColor(26,111,196);
            doc.rect(14, y, W-28, 8, 'F');
            doc.setTextColor(255,255,255);
            doc.setFont('helvetica','bold');
            doc.setFontSize(9);
            doc.text(sec.label, 16, y+5.5);
            y += 10;

            const nCri = sec.criterios.length;
            const colStyles = {};
            for (let i = 1; i <= nCri; i++) colStyles[i] = { halign:'center', cellWidth: 18 };
            colStyles[nCri + 1] = { halign:'center', fontStyle:'bold', cellWidth: 28 };
            colStyles[nCri + 2] = { halign:'center', cellWidth: 22 };

            doc.autoTable({
                startY: y,
                margin: { left:14, right:14 },
                head: [['Alumno', ...sec.criterios, 'Total', 'Aviso']],
                body: sec.filas.map(f => [
                    f.alumno,
                    ...f.criterios,
                    f.aviso === 'falta-leve' ? `${f.total + 1} - 1 = ${f.total}` : f.total + ' pts',
                    f.aviso
                ]),
                headStyles:    { fillColor:[58,155,213], textColor:255, fontStyle:'bold', fontSize:7 },
                bodyStyles:    { fontSize:7, textColor:[13,43,85] },
                alternateRowStyles: { fillColor:[237,245,255] },
                columnStyles:  colStyles,
                theme: 'grid',
            });
            y = doc.lastAutoTable.finalY + 6;
        });

        if (y > 240) { doc.addPage(); y = 14; }
        doc.autoTable({
            startY: y,
            margin: { left:14, right:14 },
            body: [
                ['Total Clasificación', DATA.totales.clasificacion+' pts'],
                ['Total Final',         DATA.totales.final+' pts'],
                ['TOTAL GENERAL',       DATA.totales.general+' pts'],
            ],
            bodyStyles: { fontSize:9, textColor:[13,43,85] },
            columnStyles: { 1:{halign:'right', fontStyle:'bold'} },
            didParseCell: (data) => {
                if (data.row.index === 2) {
                    data.cell.styles.fillColor = [13,43,85];
                    data.cell.styles.textColor = [255,255,255];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.fillColor = [214,234,248];
                }
            },
            theme: 'grid',
        });

        doc.save(DATA.nombre.replace(/\s+/g,'_')+'_resultados.pdf');
    }

    window.addEventListener('load', generarPDF);
    </script>
</body>
</html>
