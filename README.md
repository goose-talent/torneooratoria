# Ruletas
Proyecto ruletas

# Sistema de Ruletas Digitales - Torneo de Oratoria

Este proyecto es una aplicación web para gestionar sorteos automatizados en el II Torneo de Oratoria para Primaria de Chamberí. Utiliza HTML, CSS y JavaScript para crear ruletas interactivas que cargan datos desde archivos CSV.

## Características

- **Interfaz moderna**: Diseño responsivo con colores atractivos y animaciones suaves.
- **Módulos independientes**: Cada prueba tiene su propia ruleta o conjunto de ruletas.
- **Carga de datos**: Los datos se cargan desde archivos CSV externos.
- **Registro de usados**: Evita repeticiones en pruebas donde es necesario.
- **Animaciones**: Ruletas que giran con efectos visuales.

## Estructura del Proyecto

- `index.html`: Página principal con selección de pruebas y contenedor de ruletas.
- `styles.css`: Estilos CSS para una apariencia moderna y atractiva.
- `script.js`: Lógica JavaScript para manejar las ruletas y la interacción.
- `*.csv`: Archivos de datos para cada prueba.

## Cómo Usar

1. Abre `index.html` en un navegador web.
2. Selecciona la prueba deseada.
3. Sube el archivo CSV correspondiente (o usa los de ejemplo).
4. Haz clic en "Girar Ruleta" para sortear.
5. El resultado se muestra en pantalla.

## Pruebas Soportadas

1. **La Fábrica de Historias**: Tres ruletas simultáneas (contexto, problema, personaje).
2. **Voces con Derecho**: Ruleta de artículos constitucionales.
3. **Duelo de Personajes**: Ruleta de duplas con asignación aleatoria de personajes.
4. **Declamación**: Ruleta de géneros literarios + asignación de texto.
5. **La Palabra Caliente**: Ruleta de situaciones comunicativas.

## Formato de CSV

Cada CSV debe tener encabezados en la primera fila. Consulta los archivos de ejemplo para el formato específico de cada prueba.

## Tecnologías

- HTML5
- CSS3 (con gradientes y animaciones)
- JavaScript (ES6+)
- Canvas API para dibujar ruletas

## Desarrollo

Para modificar o extender:
- Edita `script.js` para agregar lógica nueva.
- Modifica `styles.css` para cambiar la apariencia.
- Actualiza los CSV con datos reales del torneo.

## Licencia

Este proyecto es para uso interno del torneo.
