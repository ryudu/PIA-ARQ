// Crear tablero
const board = document.getElementById("board");

// Mapa simple, tú puedes ajustarlo
const map = Array.from({ length: 15 }, () =>
    Array(15).fill(1)
);

// Generar celdas
map.forEach(row => {
    row.forEach(cell => {
        const div = document.createElement("div");
        div.classList.add("cell");

        if (cell === 1) {
            div.classList.add("active");
            div.contentEditable = true;
        }

        board.appendChild(div);
    });
});
