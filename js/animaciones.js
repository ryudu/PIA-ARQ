// ============================
//   PANTALLA DE CARGA
// ============================

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    const content = document.getElementById("content");

    // animación de salida
    loader.style.animation = "fadeOut 0.7s ease forwards";

    setTimeout(() => {
        loader.style.display = "none";

        // mostrar contenido con animación
        content.classList.remove("hidden");
        content.style.opacity = "0";
        content.style.transform = "translateY(20px)";

        setTimeout(() => {
            content.style.transition = "opacity .6s ease, transform .6s ease";
            content.style.opacity = "1";
            content.style.transform = "translateY(0)";
        }, 50);

    }, 700);
});


// ============================
//     ANIMACIONES AL ESCRIBIR
// ============================

document.addEventListener("input", e => {
    const cell = e.target;

    if (cell.classList.contains("active")) {

        // Marca de celda llena
        cell.classList.add("filled");

        // Animación de rebote suave
        cell.style.transition = "transform .15s ease";
        cell.style.transform = "scale(1.18)";

        setTimeout(() => {
            cell.style.transform = "scale(1)";
        }, 150);

        // Efecto highlight que se desvanece
        cell.style.boxShadow = "0 0 12px rgba(63, 81, 181, 0.8)";
        setTimeout(() => {
            cell.style.transition = "box-shadow .5s ease-out";
            cell.style.boxShadow = "0 0 0px rgba(63, 81, 181, 0)";
        }, 120);

    }
});


// ============================
//     ANIMACIÓN AL SELECCIONAR
// ============================

document.addEventListener("click", e => {
    if (e.target.classList.contains("active")) {
        e.target.style.animation = "pulseSelect 0.25s ease";

        // quitar animación para que pueda repetirse
        setTimeout(() => {
            e.target.style.animation = "";
        }, 300);
    }
});
