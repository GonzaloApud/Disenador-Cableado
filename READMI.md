# Generador de Conexiones y Cableado para Pantallas LED

Una herramienta web diseñada para configurar, organizar y simular el cableado físico y lógico (señal RJ45, fibra óptica y energía) en instalaciones de pantallas LED.

## Link

[https://gonzaloapud.github.io/Disenador-Cableado/](https://gonzaloapud.github.io/Disenador-Cableado/)

---

## Características Principales

* **Modos de Operación**: Permite alternar entre desplazamiento (Drag & Drop), trazado de cables, eliminación de conexiones y eliminación de componentes de hardware.
* **Gestión de Pantallas y Módulos**: Cálculo automático de columnas y filas basado en las dimensiones físicas ingresadas y las medidas de los módulos (50x50 cm o 100x50 cm).
* **Topología de Hardware**: Integración de dispositivos de control como Switches y Procesadores de video dentro del espacio de trabajo interactivo.
* **Validación Estricta de Enlaces**: Restricciones lógicas para la fibra óptica (conectable únicamente entre módulos y switch, o entre switch y procesador) y limitación de puertos de señal por módulo.
* **Señalización Automática de Fin de Línea**: Generación visual de una cruz roja de advertencia en módulos que se quedan con una sola conexión de señal sin cerrar el bucle o llegar a la fibra.
* **Exportación a PDF**: Funcionalidad adaptada para exportar todo el diagrama del espacio de trabajo a un documento PDF sin cortes de renderizado.

---

## Estructura del Repositorio

* `index.html`: Punto de entrada principal con la interfaz de control superior y el área de trabajo SVG.
* `app.js`: Lógica central de enrutamiento, gestión de eventos de mouse, validación de puertos y exportación de documentos.
* `style.css`: Estilos visuales basados en un esquema corporativo oscuro y distribución en barra superior.
* `components.js`: Clases lógicas para la instanciación de los módulos de pantalla y componentes de hardware.

---

## Especificaciones

### Librerías Externas

* **html2canvas**: Utilizada para rasterizar el área de trabajo y el lienzo de vectores SVG.
* **jsPDF**: Utilizada para compilar la captura en un archivo PDF orientado de manera horizontal.

---

## Instrucciones de Uso

1. Abre la herramienta en cualquier navegador web moderno.
2. Selecciona el modo de operación deseado en la barra de controles superior (por defecto en **Drag & Drop**).
3. Ingresa el **Ancho** y **Alto** en metros, selecciona el tipo de **Módulo** y haz clic en **Generar Pantalla**.
4. Añade dispositivos de red o control haciendo clic en **Agregar switch** o **Agregar procesador**.
5. Cambia el selector a **Poner Cables**, elige el **Tipo de Cable** (RJ45, Fibra óptica o Energía) y arrastra el cursor entre los componentes para conectar el sistema.
6. Utiliza los modos de eliminación para corregir errores o haz clic en **Exportar PDF** para guardar el diagrama de conexiones localmente.
