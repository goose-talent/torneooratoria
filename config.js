// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL TORNEO
// Archivo editable para cambios en otro torneo, sin necesidad de tocar el código fuente.
// ──────────────────────────────────────────────────────────────────────────────

const CONFIG = {
    nombreCompleto:   'II Torneo de Oratoria de Chamberí',
    nombreCorto:      'II Concurso de Oratoria Escolar',
    fecha:            '28 de mayo',
    horario:          '09:00 – 14:00',
    lugar:            'Centro Cultural Galileo',
};

// Aplica los valores al título del navegador y a los elementos de la cabecera
document.title = CONFIG.nombreCompleto + ' — Sistema de Pruebas';
document.addEventListener('DOMContentLoaded', () => {
    const titulo = document.getElementById('cfg-titulo');
    const fecha  = document.getElementById('cfg-fecha');
    const lugar  = document.getElementById('cfg-lugar');
    if (titulo) titulo.textContent = CONFIG.nombreCorto;
    if (fecha)  fecha.textContent  = CONFIG.fecha + ' ' + CONFIG.horario;
    if (lugar)  lugar.textContent  = CONFIG.lugar;
});
