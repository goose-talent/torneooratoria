<?php
// api.php — API MySQL para producción (Apache + PHP + MySQL en aaPanel)
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$uri    = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// Compatibilidad con server.js: enruta llamadas por ?action= al URI correcto
if (!empty($_GET['action'])) {
    $acciones = [
        'datos'              => ['GET',  '/api/datos'],
        'equipo_añadir'      => ['POST', '/api/equipos'],
        'equipo_editar'      => ['POST', '/api/equipos/editar'],
        'equipo_borrar'      => ['POST', '/api/equipos/borrar'],
        'puntuacion_añadir'  => ['POST', '/api/puntuaciones'],
        'puntuacion_borrar'  => ['POST', '/api/puntuaciones/borrar'],
        'inscripciones'      => ['GET',  '/api/inscripciones'],
        'inscripcion_añadir' => ['POST', '/api/inscripciones'],
        'inscripcion_editar' => ['POST', '/api/inscripciones/editar'],
        'inscripcion_borrar' => ['POST', '/api/inscripciones/borrar'],
    ];
    $a = $_GET['action'];
    if (isset($acciones[$a])) {
        $method = $acciones[$a][0];
        $uri    = $acciones[$a][1];
    }
}

// ── Conexiones ────────────────────────────────────────────────────────────────
function conectarOratoria() {
    return new PDO(
        'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . BD_ORATORIA . ';charset=utf8mb4',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
}
function todosLosDatos($pdo) {
    $equipos = $pdo->query('SELECT * FROM equipos ORDER BY fecha ASC')->fetchAll();
    foreach ($equipos as &$eq) { $eq['alumnos'] = json_decode($eq['alumnos'], true); }
    $punts = $pdo->query('SELECT * FROM puntuaciones ORDER BY fecha ASC')->fetchAll();
    foreach ($punts as &$p) {
        $p['criterios'] = json_decode($p['criterios'], true);
        $p['total']     = (int) $p['total'];
        $p['alumnoIdx'] = (int) $p['alumnoIdx'];
    }
    return ['equipos' => $equipos, 'puntuaciones' => $punts];
}

// ── GET /api/mi-ip ────────────────────────────────────────────────────────────
if ($method === 'GET' && preg_match('#/api/mi-ip$#', $uri)) {
    $scheme  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    echo json_encode(['baseUrl' => $scheme . '://' . $_SERVER['HTTP_HOST']]);
    exit;
}

// ── GET /api/logo ─────────────────────────────────────────────────────────────
if ($method === 'GET' && preg_match('#/api/logo$#', $uri)) {
    $path  = __DIR__ . '/img/logo.png';
    $b64   = file_exists($path) ? 'data:image/png;base64,' . base64_encode(file_get_contents($path)) : null;
    echo json_encode(['base64' => $b64]);
    exit;
}

// ── GET /api/datos ────────────────────────────────────────────────────────────
if ($method === 'GET' && preg_match('#/api/datos$#', $uri)) {
    try { echo json_encode(todosLosDatos(conectarOratoria()), JSON_UNESCAPED_UNICODE); }
    catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/equipos ─────────────────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/equipos$#', $uri)) {
    try {
        $pdo = conectarOratoria();
        $pdo->prepare('INSERT IGNORE INTO equipos (id, nombre, sala, sala_r2, alumnos) VALUES (?,?,?,?,?)')
            ->execute([$body['id'], $body['nombre'], $body['sala'] ?? null, $body['sala_r2'] ?? null, json_encode($body['alumnos'] ?? [])]);
        echo json_encode(todosLosDatos($pdo), JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/equipos/editar ──────────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/equipos/editar$#', $uri)) {
    try {
        $pdo = conectarOratoria();
        $pdo->prepare('UPDATE equipos SET nombre=?, sala=?, sala_r2=?, alumnos=? WHERE id=?')
            ->execute([$body['nombre'], $body['sala'] ?? null, $body['sala_r2'] ?? null, json_encode($body['alumnos'] ?? []), $body['id']]);
        echo json_encode(todosLosDatos($pdo), JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/equipos/borrar ──────────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/equipos/borrar$#', $uri)) {
    try {
        $pdo = conectarOratoria();
        $pdo->prepare('DELETE FROM equipos WHERE id=?')->execute([$body['id']]);
        echo json_encode(todosLosDatos($pdo), JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/puntuaciones ────────────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/puntuaciones$#', $uri)) {
    try {
        $pdo = conectarOratoria();
        $pdo->prepare('INSERT IGNORE INTO puntuaciones (id,equipoId,alumnoIdx,alumnoNombreOtro,prueba,sala,ronda,criterios,total,aviso) VALUES (?,?,?,?,?,?,?,?,?,?)')
            ->execute([$body['id'], $body['equipoId'], $body['alumnoIdx'] ?? 0, $body['alumnoNombreOtro'] ?? null, $body['prueba'], $body['sala'] ?? null, $body['ronda'] ?? null, json_encode($body['criterios'] ?? []), $body['total'] ?? 0, $body['aviso'] ?? null]);
        echo json_encode(todosLosDatos($pdo), JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/puntuaciones/borrar ─────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/puntuaciones/borrar$#', $uri)) {
    try {
        $pdo = conectarOratoria();
        $pdo->prepare('DELETE FROM puntuaciones WHERE id=?')->execute([$body['id']]);
        echo json_encode(todosLosDatos($pdo), JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/inscripciones ───────────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/inscripciones$#', $uri)) {
    try {
        $pdo     = conectarOratoria();
        $tsBase  = round(microtime(true) * 1000);
        $tsOff   = 0;
        $insId   = $body['id'] ?? ('ins_' . $tsBase);
        $eqsBody = $body['equipos'] ?? [];
        $eqErrs  = [];

        $eqCreados = 0;
        foreach ($eqsBody as &$eq) {
            $nombre = trim($eq['nombre'] ?? '');
            if (!$nombre) continue;
            $alumnos = array_values(array_filter(
                array_map(fn($a) => trim($a['nombre'] ?? ''), $eq['alumnos'] ?? [])
            ));
            $eqId     = 'eq_' . ($tsBase + $tsOff++);
            $eq['id'] = $eqId;
            try {
                $pdo->prepare(
                    'INSERT INTO equipos (id, nombre, sala, sala_r2, alumnos) VALUES (?,?,?,?,?)'
                )->execute([$eqId, $nombre, null, null, json_encode($alumnos, JSON_UNESCAPED_UNICODE)]);
                $eqCreados++;
            } catch (PDOException $eErr) {
                $eqErrs[] = $nombre . ': ' . $eErr->getMessage();
            }
        }
        unset($eq);

        $pdo->prepare(
            'INSERT INTO inscripciones
             (id,denominacion,director,direccion,localidad,provincia,codigo_postal,telefono_centro,correo_centro,profesores,equipos)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)'
        )->execute([
            $insId,
            $body['denominacion']    ?? '', $body['director']        ?? '',
            $body['direccion']       ?? '', $body['localidad']        ?? '', $body['provincia']       ?? '',
            $body['codigo_postal']   ?? '', $body['telefono_centro']  ?? '', $body['correo_centro']   ?? '',
            json_encode($body['profesores'] ?? [], JSON_UNESCAPED_UNICODE),
            json_encode($eqsBody,             JSON_UNESCAPED_UNICODE),
        ]);

        $resp = ['ok' => true, 'equiposCreados' => $eqCreados, 'equiposTotal' => count($eqsBody)];
        if ($eqErrs) $resp['error'] = 'Inscripción guardada, pero algunos equipos no se crearon: ' . implode(' | ', $eqErrs);
        echo json_encode($resp);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── GET /api/inscripciones ────────────────────────────────────────────────────
if ($method === 'GET' && preg_match('#/api/inscripciones$#', $uri)) {
    try {
        $rows = conectarOratoria()->query('SELECT * FROM inscripciones ORDER BY fecha DESC')->fetchAll();
        foreach ($rows as &$r) {
            $r['profesores'] = json_decode($r['profesores'], true) ?? [];
            $r['equipos']    = json_decode($r['equipos'],    true) ?? [];
        }
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ── POST /api/inscripciones/borrar ────────────────────────────────────────────
if ($method === 'POST' && preg_match('#/api/inscripciones/borrar$#', $uri)) {
    try {
        $pdo = conectarOratoria();
        $ins = $pdo->prepare('SELECT equipos FROM inscripciones WHERE id=?');
        $ins->execute([$body['id']]);
        $row = $ins->fetch();
        if ($row) {
            foreach (json_decode($row['equipos'], true) ?? [] as $eq) {
                if (!empty($eq['id'])) {
                    $pdo->prepare('DELETE FROM equipos WHERE id=?')->execute([$eq['id']]);
                }
            }
        }
        $pdo->prepare('DELETE FROM inscripciones WHERE id=?')->execute([$body['id']]);
        $rows = $pdo->query('SELECT * FROM inscripciones ORDER BY fecha DESC')->fetchAll();
        foreach ($rows as &$r) {
            $r['profesores'] = json_decode($r['profesores'], true) ?? [];
            $r['equipos']    = json_decode($r['equipos'],    true) ?? [];
        }
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint no encontrado']);
