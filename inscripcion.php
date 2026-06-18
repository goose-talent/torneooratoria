<?php
// inscripcion.php — Formulario de preinscripción al Torneo de Oratoria
require_once __DIR__ . '/config.php';
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Preinscripción — II Torneo de Oratoria de Chamberí</title>
    <style>
        :root { --azul: #0D2B55; --azul2: #1A6FC4; --gris: #f4f7fb; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, Helvetica, sans-serif; background: var(--gris); color: #222; min-height: 100vh; padding: 20px 16px 48px; }

        .wrap { max-width: 800px; margin: 0 auto; }

        header { display:flex; align-items:center; gap:16px; background:var(--azul); color:white; padding:20px 28px; border-radius:12px 12px 0 0; }
        header img { height:56px; width:56px; object-fit:contain; background:white; border-radius:8px; padding:4px; flex-shrink:0; }
        header h1 { font-size:1.2rem; line-height:1.3; }
        header p  { font-size:0.82rem; opacity:.75; margin-top:5px; }

        .card { background:white; border-radius:0 0 12px 12px; box-shadow:0 4px 24px rgba(0,0,0,.1); padding:28px 32px; }

        .aviso { background:#e8f4fd; border-left:4px solid var(--azul2); color:#0a3560; padding:11px 16px; border-radius:6px; font-size:.85rem; line-height:1.5; margin-bottom:26px; }

        .seccion { margin-bottom:30px; }
        .seccion h2 { font-size:.95rem; color:var(--azul2); border-bottom:2px solid var(--azul2); padding-bottom:7px; margin-bottom:18px; }

        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .full    { grid-column:1/-1; }

        .campo { display:flex; flex-direction:column; gap:5px; }
        .campo label { font-size:.78rem; font-weight:700; color:#444; text-transform:uppercase; letter-spacing:.02em; }
        .campo input { padding:9px 12px; border:1.5px solid #cdd8eb; border-radius:8px; font-size:.9rem; outline:none; transition:border-color .15s; background:#fcfdff; }
        .campo input:focus { border-color:var(--azul2); background:white; }
        .req { color:#d32f2f; }

        .bloque { background:#f5f8fd; border:1.5px solid #dce6f5; border-radius:10px; padding:16px 18px; margin-bottom:12px; }
        .bloque-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .bloque-titulo { font-size:.88rem; font-weight:700; color:var(--azul); }
        .btn-del { background:none; border:1px solid #d32f2f; color:#d32f2f; padding:4px 10px; border-radius:6px; font-size:.78rem; font-weight:600; cursor:pointer; }
        .btn-del:hover { background:#d32f2f; color:white; }

        .alumno-fila { display:grid; grid-template-columns:1fr 140px 30px; gap:8px; align-items:end; margin-bottom:8px; }
        .alumno-fila .campo { margin:0; }
        .btn-x { background:none; border:none; color:#c62828; font-size:1.1rem; cursor:pointer; padding:0 4px; line-height:1; margin-bottom:1px; }
        .btn-x:hover { color:#b71c1c; }

        .btn-add { background:none; border:2px dashed #7da8d8; color:var(--azul2); padding:8px 14px; border-radius:8px; font-size:.82rem; font-weight:700; cursor:pointer; width:100%; margin-top:6px; transition:all .15s; }
        .btn-add:hover { background:var(--azul2); color:white; border-color:var(--azul2); }

        .submit-zona { text-align:center; padding-top:20px; border-top:1px solid #e4ecf5; }
        .btn-submit { background:var(--azul2); color:white; border:none; padding:14px 44px; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; letter-spacing:.01em; transition:background .15s; }
        .btn-submit:hover { background:var(--azul); }
        .btn-submit:disabled { opacity:.55; cursor:default; }
        .err { color:#d32f2f; font-size:.83rem; margin-top:10px; display:none; }

        .exito { display:none; text-align:center; padding:48px 20px; }
        .exito .ico { font-size:3.5rem; margin-bottom:14px; }
        .exito h2 { color:var(--azul); font-size:1.4rem; margin-bottom:10px; }
        .exito p  { color:#555; line-height:1.6; }

        @media (max-width:560px) {
            .grid-2 { grid-template-columns:1fr; }
            .card { padding:18px 14px; }
            .alumno-fila { grid-template-columns:1fr 100px 24px; }
        }
    </style>
</head>
<body>
<div class="wrap">
    <header>
        <img src="img/logo.png" alt="Logo Goose Talent">
        <div>
            <h1>Formulario de Preinscripción</h1>
            <p>II Torneo de Oratoria de Chamberí · 28 de mayo</p>
        </div>
    </header>

    <div class="card">
        <div class="aviso">
            Rellena el formulario con los datos de tu centro y los equipos que deseas inscribir.
            Recibirás confirmación una vez revisada la solicitud.
        </div>

        <div id="form-zona">
            <form id="form-ins" novalidate>

                <div class="seccion">
                    <h2>Datos del centro educativo</h2>
                    <div class="grid-2">
                        <div class="campo full">
                            <label>Nombre del centro <span class="req">*</span></label>
                            <input id="f-denominacion" type="text" placeholder="IES / CEIP / Colegio…" required>
                        </div>
                        <div class="campo">
                            <label>Director/a <span class="req">*</span></label>
                            <input id="f-director" type="text" required>
                        </div>
                        <div class="campo">
                            <label>Correo electrónico <span class="req">*</span></label>
                            <input id="f-correo" type="email" required>
                        </div>
                        <div class="campo">
                            <label>Teléfono de contacto</label>
                            <input id="f-telefono" type="tel">
                        </div>
                        <div class="campo full">
                            <label>Dirección</label>
                            <input id="f-direccion" type="text">
                        </div>
                        <div class="campo">
                            <label>Localidad</label>
                            <input id="f-localidad" type="text">
                        </div>
                        <div class="campo">
                            <label>Provincia</label>
                            <input id="f-provincia" type="text">
                        </div>
                    </div>
                </div>

                <div class="seccion">
                    <h2>Profesores acompañantes</h2>
                    <div id="profs-wrap"></div>
                    <button type="button" class="btn-add" onclick="addProfesor()">+ Añadir profesor</button>
                </div>

                <div class="seccion">
                    <h2>Equipos participantes</h2>
                    <div id="equipos-wrap"></div>
                    <button type="button" class="btn-add" onclick="addEquipo()">+ Añadir equipo</button>
                </div>

                <div class="submit-zona">
                    <button type="submit" class="btn-submit" id="btn-enviar">Enviar preinscripción →</button>
                    <p class="err" id="msg-err"></p>
                </div>
            </form>
        </div>

        <div class="exito" id="zona-exito">
            <div class="ico">✅</div>
            <h2>¡Preinscripción enviada!</h2>
            <p>Hemos recibido los datos de tu centro.<br>
               <span id="msg-equipos" style="display:block;margin:6px 0;font-weight:600;color:#1A6FC4"></span>
               Nos pondremos en contacto contigo para confirmar la participación.</p>
        </div>
    </div>
</div>

<script>
var profesores = [{ nombre:'', telefono:'', correo:'' }];
var equipos    = [{ nombre:'', alumnos:[{ nombre:'', curso:'' }] }];

function esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}

function saveProfesores() {
    profesores.forEach(function(p, i) {
        p.nombre   = (document.getElementById('p-nombre-' + i) || {}).value || '';
        p.telefono = (document.getElementById('p-tel-' + i)    || {}).value || '';
        p.correo   = (document.getElementById('p-correo-' + i) || {}).value || '';
    });
}
function addProfesor()      { saveProfesores(); profesores.push({ nombre:'', telefono:'', correo:'' }); renderProfesores(); }
function removeProfesor(i)  { saveProfesores(); profesores.splice(i, 1); if (!profesores.length) profesores.push({ nombre:'', telefono:'', correo:'' }); renderProfesores(); }
function renderProfesores() {
    document.getElementById('profs-wrap').innerHTML = profesores.map(function(p, i) {
        return '<div class="bloque">' +
            '<div class="bloque-header"><span class="bloque-titulo">Profesor/a ' + (i+1) + '</span>' +
            '<button type="button" class="btn-del" onclick="saveProfesores();removeProfesor(' + i + ')">✕ Eliminar</button></div>' +
            '<div class="grid-2">' +
            '<div class="campo full"><label>Nombre completo</label><input id="p-nombre-' + i + '" value="' + esc(p.nombre) + '" placeholder="Nombre y apellidos"></div>' +
            '<div class="campo"><label>Teléfono</label><input id="p-tel-' + i + '" value="' + esc(p.telefono) + '"></div>' +
            '<div class="campo"><label>Correo electrónico</label><input id="p-correo-' + i + '" type="email" value="' + esc(p.correo) + '"></div>' +
            '</div></div>';
    }).join('');
}

function saveEquipos() {
    equipos.forEach(function(eq, ei) {
        eq.nombre = (document.getElementById('eq-nombre-' + ei) || {}).value || '';
        eq.alumnos.forEach(function(a, ai) {
            a.nombre = (document.getElementById('eq-' + ei + '-a' + ai + '-nombre') || {}).value || '';
            a.curso  = (document.getElementById('eq-' + ei + '-a' + ai + '-curso')  || {}).value || '';
        });
    });
}
function addEquipo()    { saveEquipos(); equipos.push({ nombre:'', alumnos:[{ nombre:'', curso:'' }] }); renderEquipos(); }
function removeEquipo(ei) { saveEquipos(); equipos.splice(ei, 1); if (!equipos.length) equipos.push({ nombre:'', alumnos:[{ nombre:'', curso:'' }] }); renderEquipos(); }
function addAlumno(ei)  { saveEquipos(); equipos[ei].alumnos.push({ nombre:'', curso:'' }); renderEquipos(); }
function removeAlumno(ei, ai) { saveEquipos(); equipos[ei].alumnos.splice(ai, 1); if (!equipos[ei].alumnos.length) equipos[ei].alumnos.push({ nombre:'', curso:'' }); renderEquipos(); }
function renderEquipos() {
    document.getElementById('equipos-wrap').innerHTML = equipos.map(function(eq, ei) {
        var alFils = eq.alumnos.map(function(a, ai) {
            return '<div class="alumno-fila">' +
                '<div class="campo"><label>Nombre del alumno</label><input id="eq-' + ei + '-a' + ai + '-nombre" value="' + esc(a.nombre) + '" placeholder="Nombre y apellidos"></div>' +
                '<div class="campo"><label>Curso</label><input id="eq-' + ei + '-a' + ai + '-curso" value="' + esc(a.curso) + '" placeholder="Ej: 4.º ESO"></div>' +
                '<button type="button" class="btn-x" onclick="saveEquipos();removeAlumno(' + ei + ',' + ai + ')" title="Eliminar">✕</button>' +
                '</div>';
        }).join('');
        return '<div class="bloque">' +
            '<div class="bloque-header"><span class="bloque-titulo">Equipo ' + (ei+1) + '</span>' +
            '<button type="button" class="btn-del" onclick="saveEquipos();removeEquipo(' + ei + ')">✕ Eliminar</button></div>' +
            '<div class="campo" style="margin-bottom:14px"><label>Nombre del equipo <span class="req">*</span></label>' +
            '<input id="eq-nombre-' + ei + '" value="' + esc(eq.nombre) + '" placeholder="Ej: Equipo A del IES…"></div>' +
            '<div style="font-size:.78rem;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.02em;margin-bottom:8px">Alumnos participantes</div>' +
            alFils +
            '<button type="button" class="btn-add" style="margin-top:2px" onclick="saveEquipos();addAlumno(' + ei + ')">+ Añadir alumno</button>' +
            '</div>';
    }).join('');
}

document.getElementById('form-ins').addEventListener('submit', function(e) {
    e.preventDefault();
    saveProfesores();
    saveEquipos();

    var denominacion = document.getElementById('f-denominacion').value.trim();
    var director     = document.getElementById('f-director').value.trim();
    var correo       = document.getElementById('f-correo').value.trim();

    if (!denominacion) return showErr('El nombre del centro es obligatorio.');
    if (!director)     return showErr('El nombre del director/a es obligatorio.');
    if (!correo)       return showErr('El correo electrónico es obligatorio.');

    var payload = {
        id:              'ins_' + Date.now(),
        denominacion:    denominacion,
        director:        director,
        correo_centro:   correo,
        telefono_centro: document.getElementById('f-telefono').value.trim(),
        direccion:       document.getElementById('f-direccion').value.trim(),
        localidad:       document.getElementById('f-localidad').value.trim(),
        provincia:       document.getElementById('f-provincia').value.trim(),
        profesores:      profesores.filter(function(p){ return p.nombre.trim(); }),
        equipos:         equipos.filter(function(eq){ return eq.nombre.trim() || eq.alumnos.some(function(a){ return a.nombre.trim(); }); }),
    };

    var btn = document.getElementById('btn-enviar');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    document.getElementById('msg-err').style.display = 'none';

    fetch('/api/inscripciones', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
    }).then(function(r){ return r.json(); }).then(function(data) {
        if (data.error) throw new Error(data.error);
        document.getElementById('form-zona').style.display  = 'none';
        document.getElementById('zona-exito').style.display = 'block';
        if (data.equiposTotal > 0) {
            var txt = data.equiposCreados + ' de ' + data.equiposTotal + ' equipo(s) registrado(s).';
            document.getElementById('msg-equipos').textContent = txt;
        }
    }).catch(function(err) {
        showErr('Error al enviar: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Enviar preinscripción →';
    });
});

function showErr(msg) {
    var el = document.getElementById('msg-err');
    el.textContent = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior:'smooth', block:'center' });
}

renderProfesores();
renderEquipos();
</script>
</body>
</html>
