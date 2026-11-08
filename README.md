# PetCare · Maquetación HTML/CSS (Actividad 2)

Prototipo navegable del MVP de PetCare. No requiere instalación.

## Cómo abrirlo
1. Descomprime la carpeta.
2. Abre `prototipo.html` (mapa de todas las pantallas) o `index.html` en Chrome, Edge o Firefox.
3. En `login.html`, el recuadro **Modo demostración** permite entrar como propietario o como proveedor.

## Modo wireframe
Agrega `?wf=1` al final de cualquier dirección (por ejemplo `buscar.html?wf=1`) para verla en baja fidelidad.

## Datos de demostración
Los cambios (solicitudes, mascotas, servicios) se guardan en el navegador. Antes de cada prueba de usabilidad usa
**Restablecer datos de demostración** en `prototipo.html`.

Flujo completo de prueba: como propietario envía una solicitud → entra como proveedor (Peluquería Huellitas) y acéptala
→ vuelve como propietario y revisa *Mis solicitudes*. (Para que llegue a Huellitas, solicita un servicio de Peluquería Huellitas, Chapinero.)

## Estructura
- `assets/styles.css` — tokens de diseño (variables CSS) y componentes
- `assets/wireframe.css` — modo wireframe
- `assets/data.js` — datos de demostración
- `assets/app.js` — comportamiento del prototipo
- `assets/icons.js` — iconos SVG
- `estilos.html` — guía de estilos (UI Kit) en código

## Pasarlo a Figma
Publica la carpeta (por ejemplo, en GitHub Pages) e importa cada pantalla con el plugin **html.to.design**.

## Ver en línea
Publicado con GitHub Pages: abre `index.html` o `prototipo.html` desde la URL del sitio.

Diseño en Figma: https://www.figma.com/design/nBQw86eUtaH9MV9oPLMYFt
