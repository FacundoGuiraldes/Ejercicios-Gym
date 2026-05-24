// 1. Importamos el módulo nativo File System
const fs = require('fs');

// Explicación: Usamos require() porque es la sintaxis nativa de CommonJS en Node.js 
// para traer módulos, algo clave que se evalúa en este primer módulo del curso.

// 2. Función para leer los ejercicios y filtrarlos
function filtrarEjercicios(grupoBuscar) {
    // Leemos el archivo JSON de forma sincrónica para este ejemplo simple
    fs.readFile('ejercicios.json', 'utf-8', (err, data) => {
        if (err) {
            console.error("Hubo un error al leer el archivo:", err);
            return;
        }

        // Pasamos el texto plano del JSON a un Objeto/Array de JavaScript
        const ejercicios = JSON.parse(data);

        // Filtramos el array según el grupo muscular que pasamos por parámetro
        const resultado = ejercicios.filter(ejercicio => 
            ejercicio.grupoMuscular.toLowerCase() === grupoBuscar.toLowerCase()
        );

        // Mostramos el resultado en la consola
        console.log(`--- Ejercicios para: ${grupoBuscar} ---`);
        console.log(resultado);
    });
}

// 3. Ejecutamos la función buscando, por ejemplo, "pecho"
filtrarEjercicios('pecho');