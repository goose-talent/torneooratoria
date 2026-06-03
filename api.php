<?php
// api.php — API de datos del Torneo de Oratoria de Chamberí

$DATA_FILE = __DIR__ . '/datos.json';
$VACIO     = ['equipos' => [], 'puntuaciones' => []];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
// flock() garantiza que dos peticiones simultáneas no se solapan al leer/escribir.
function leerDatos($file, $vacio) {
    if (!file_exists($file)) return $vacio;
    $json = file_get_contents($file);
    $datos = json_decode($json, true);
    return is_array($datos) ? $datos : $vacio;
}
function escribirDatos($file, $datos) {
    $fp = fopen($file, 'c+');
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}
function leerDatosLocked($file, $vacio) {
    if (!file_exists($file)) return $vacio;
    $fp = fopen($file, 'r');
    flock($fp, LOCK_SH);
    $json = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $datos = json_decode($json, true);
    return is_array($datos) ? $datos : $vacio;
}

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// ── GET /api/logo — devuelve el logo en base64 ───────────────────────────────
if ($method === 'GET' && str_contains($uri, '/api/logo')) {
    $logoPath = __DIR__ . '/img/logo.png';
    $base64   = file_exists($logoPath)
        ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
        : null;
    echo json_encode(['base64' => $base64]);
    exit;
}

// ── GET /api/mi-ip — devuelve la URL base del servidor ───────────────────────
if ($method === 'GET' && str_contains($uri, '/api/mi-ip')) {
    $scheme  = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host    = $_SERVER['HTTP_HOST'];
    $baseUrl = $scheme . '://' . $host;
    echo json_encode(['baseUrl' => $baseUrl]);
    exit;
}

// ── GET /api/datos ────────────────────────────────────────────────────────────
if ($method === 'GET') {
    echo json_encode(leerDatosLocked($DATA_FILE, $VACIO), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $body   = file_get_contents('php://input');
    $parsed = json_decode($body, true);
    if ($parsed === null) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON inválido']);
        exit;
    }

    // ── POST /api/equipos — añade un equipo de forma atómica ─────────────────
    if (str_ends_with($uri, '/api/equipos') || str_ends_with($uri, '/api.php/equipos')) {
        $equipo = $parsed;
        $fp = fopen($DATA_FILE ?: $DATA_FILE, 'c+');
        flock($fp, LOCK_EX);
        $json  = stream_get_contents($fp) ?: json_encode($VACIO);
        $datos = json_decode($json, true) ?: $VACIO;
        $ids   = array_column($datos['equipos'], 'id');
        if (!in_array($equipo['id'], $ids, true)) {
            $datos['equipos'][] = $equipo;
        }
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        flock($fp, LOCK_UN); fclose($fp);
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ── POST /api/equipos/borrar — elimina un equipo por id ──────────────────
    if (str_ends_with($uri, '/api/equipos/borrar') || str_ends_with($uri, '/api.php/equipos/borrar')) {
        $id = $parsed['id'] ?? null;
        $fp = fopen($DATA_FILE, 'c+');
        flock($fp, LOCK_EX);
        $json  = stream_get_contents($fp) ?: json_encode($VACIO);
        $datos = json_decode($json, true) ?: $VACIO;
        $datos['equipos']      = array_values(array_filter($datos['equipos'],      fn($e) => $e['id'] !== $id));
        $datos['puntuaciones'] = array_values(array_filter($datos['puntuaciones'], fn($p) => $p['equipoId'] !== $id));
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        flock($fp, LOCK_UN); fclose($fp);
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ── POST /api/puntuaciones — añade una puntuación de forma atómica ───────
    if (str_ends_with($uri, '/api/puntuaciones') || str_ends_with($uri, '/api.php/puntuaciones')) {
        $punt = $parsed;
        $fp = fopen($DATA_FILE, 'c+');
        flock($fp, LOCK_EX);
        $json  = stream_get_contents($fp) ?: json_encode($VACIO);
        $datos = json_decode($json, true) ?: $VACIO;
        $ids   = array_column($datos['puntuaciones'], 'id');
        if (!in_array($punt['id'], $ids, true)) {
            $datos['puntuaciones'][] = $punt;
        }
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        flock($fp, LOCK_UN); fclose($fp);
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ── POST /api/datos — reemplaza todo (compatibilidad) ────────────────────
    escribirDatos($DATA_FILE, $parsed);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
