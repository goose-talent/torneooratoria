import streamlit as st
import mysql.connector
import re
import json
import time as _time

TORNEO = "I Concurso de Debate Para Secundaria JMD CHAMBERI"


def validar_dni_nie(documento):
    documento = documento.strip().upper()
    letras = "TRWAGMYFPDXBNJZSQVHLCKE"
    if re.match(r'^\d{8}[A-Z]$', documento):
        return documento[-1] == letras[int(documento[:8]) % 23]
    if re.match(r'^[XYZ]\d{7}[A-Z]$', documento):
        equiv = {"X": "0", "Y": "1", "Z": "2"}
        numero = int(equiv[documento[0]] + documento[1:8])
        return documento[-1] == letras[numero % 23]
    return False


def conectar():
    return mysql.connector.connect(
        host=st.secrets["MYSQL_HOST"],
        port=int(st.secrets["MYSQL_PORT"]),
        user=st.secrets["MYSQL_USER"],
        password=st.secrets["MYSQL_PASSWORD"],
        database=st.secrets["MYSQL_DATABASE"],
    )


# ── Cabecera ──────────────────────────────────────────────────────────────────
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    try:
        st.image("img/logo.png", width=200)
    except Exception:
        pass

st.title("Sistema de Inscripción de Torneos")
st.markdown("<span style='color:red'>*</span> Campos obligatorios", unsafe_allow_html=True)
st.subheader(TORNEO + " *")

# ── Datos del centro ──────────────────────────────────────────────────────────
st.subheader("Datos del centro")
denominacion    = st.text_input("Denominación del centro *")
direccion       = st.text_input("Dirección *")
localidad       = st.text_input("Localidad *", key="localidad_centro")
provincia       = st.text_input("Provincia *")
codigo_postal   = st.text_input("Código postal")
telefono_centro = st.text_input("Teléfono *")
correo_centro   = st.text_input("Correo electrónico *")
director        = st.text_input("Director del centro *")

# ── Profesores ────────────────────────────────────────────────────────────────
st.subheader("Datos de la convocatoria")
num_profesores = st.selectbox("Número de profesores/formadores", [1, 2, 3], index=0)

profesores = []
for i in range(num_profesores):
    st.markdown(f"### Profesor/Formador {i + 1}")
    prof = {
        "nombre":   st.text_input("Nombre *",                    key=f"prof_nombre_{i}"),
        "dni":      st.text_input("DNI/NIE *",                   key=f"prof_dni_{i}"),
        "telefono": st.text_input("Teléfono del profesor *",     key=f"prof_telefono_{i}"),
        "correo":   st.text_input("Correo electrónico del profesor *", key=f"prof_correo_{i}"),
    }
    profesores.append(prof)

# ── Equipos ───────────────────────────────────────────────────────────────────
st.subheader("Equipos participantes")
num_equipos = st.selectbox("Número de equipos", [1, 2, 3, 4], index=0)

equipos = []
for i in range(num_equipos):
    st.markdown("---")
    st.markdown(f"## Equipo {i + 1}")
    nombre_equipo = st.text_input(
        "Nombre del equipo * (Ej: CEIP Maximino A)",
        key=f"equipo_{i}"
    )
    num_miembros = st.selectbox(
        f"Número de integrantes del equipo {i + 1}",
        [1, 2, 3, 4, 5, 6],
        key=f"miembros_{i}"
    )
    miembros = []
    for j in range(num_miembros):
        st.markdown(f"Integrante {j + 1}")
        miembros.append({
            "numero_participante": j + 1,
            "nombre": st.text_input("Nombre y apellidos *", key=f"nombre_{i}_{j}"),
            "dni":    st.text_input("DNI/NIE *",            key=f"dni_{i}_{j}"),
            "curso":  st.text_input("Curso *",              key=f"curso_{i}_{j}"),
            "mail":   st.text_input("Correo electrónico",   key=f"mail_{i}_{j}"),
            "rol":    st.selectbox("Rol *", ["Debatiente", "Capitán", "Suplente"], key=f"rol_{i}_{j}"),
        })
    equipos.append({
        "numero_equipo": i + 1,
        "nombre_equipo": nombre_equipo,
        "miembros":      miembros,
    })

# ── Privacidad ────────────────────────────────────────────────────────────────
st.markdown(
    "[📄 Consultar política de privacidad]"
    "(https://github.com/goose-talent/torneo-debate/raw/main/politica_privacidad_goose_talent.pdf)"
)
privacidad = st.checkbox(
    "Acepto y autorizo a que mis datos sean tratados por GOOSE TALENT, "
    "con la finalidad de remitirme, por cualquier medio, incluidos los electrónicos "
    "(SMS, WhatsApp y correo electrónico), información sobre cualquier curso o "
    "programa actual o futuro de GOOSE TALENT, talleres de orientación y sesiones "
    "informativas, así como recordatorios de las mismas."
)

# ── Envío ─────────────────────────────────────────────────────────────────────
if st.button("Enviar solicitud"):
    # Validaciones
    if not privacidad:
        st.error("Debes aceptar la política de privacidad"); st.stop()
    if not denominacion.strip():
        st.error("La denominación del centro es obligatoria"); st.stop()
    if not localidad.strip():
        st.error("La localidad es obligatoria"); st.stop()
    if not provincia.strip():
        st.error("La provincia es obligatoria"); st.stop()
    if not telefono_centro.strip():
        st.error("El teléfono del centro es obligatorio"); st.stop()
    if not correo_centro.strip():
        st.error("El correo del centro es obligatorio"); st.stop()
    if not director.strip():
        st.error("El director del centro es obligatorio"); st.stop()

    for p in profesores:
        if not p["nombre"].strip():
            st.error("El nombre del profesor es obligatorio"); st.stop()
        if not p["dni"].strip():
            st.error("El DNI/NIE del profesor es obligatorio"); st.stop()
        if not validar_dni_nie(p["dni"]):
            st.error(f"El DNI/NIE del profesor {p['nombre']} no es válido"); st.stop()
        if not p["telefono"].strip():
            st.error("El teléfono del profesor es obligatorio"); st.stop()
        if not p["correo"].strip():
            st.error("El correo del profesor es obligatorio"); st.stop()

    for eq in equipos:
        if not eq["nombre_equipo"].strip():
            st.error("Todos los equipos deben tener nombre"); st.stop()
        for m in eq["miembros"]:
            if not m["nombre"].strip():
                st.error("Todos los participantes deben tener nombre"); st.stop()
            if not m["dni"].strip():
                st.error("Todos los participantes deben tener DNI/NIE"); st.stop()
            if not validar_dni_nie(m["dni"]):
                st.error(f"El DNI/NIE de {m['nombre']} no es válido"); st.stop()
            if not m["curso"].strip():
                st.error(f"El participante {m['nombre']} debe tener curso"); st.stop()

    # Guardar en torneo_debate.inscripciones
    try:
        conn = conectar()
        cur  = conn.cursor()
        id_ins = f"ins_{int(_time.time() * 1000)}"
        cur.execute(
            """INSERT INTO inscripciones
               (id, torneo, denominacion, direccion, localidad, provincia,
                codigo_postal, telefono_centro, correo_centro, director,
                profesores, equipos)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                id_ins, TORNEO, denominacion, direccion, localidad, provincia,
                codigo_postal, telefono_centro, correo_centro, director,
                json.dumps(profesores, ensure_ascii=False),
                json.dumps(equipos,    ensure_ascii=False),
            )
        )
        conn.commit()
        cur.close()
        conn.close()
        st.success("✓ Inscripción enviada correctamente. ¡Gracias por participar!")
    except Exception as e:
        st.error(f"Error al guardar la inscripción: {e}")
