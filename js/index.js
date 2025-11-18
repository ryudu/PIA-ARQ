/* -----------------------
   LISTA DE PALABRAS DEFINIDA
   ----------------------- */
const wordList = {
    horizontal: [
        {num: 5,  word: "RPO"},
        {num: 7,  word: "REDUNDANCIA"},
        {num: 10, word: "SIMULACRO"},
        {num: 14, word: "RANSOMWARE"},
        {num: 15, word: "UPS"}
    ],
    vertical: [
        {num: 1,  word: "DATACENTER"},
        {num: 2,  word: "INTEGRIDAD"},
        {num: 3,  word: "FIREWALL"},
        {num: 4,  word: "RTO"},
        {num: 6,  word: "CONFIDENCIALIDAD"},
        {num: 8,  word: "DISPONIBILIDAD"},
        {num: 9,  word: "DRP"},
        {num: 11, word: "LTO"},
        {num: 12, word: "AIREGAP"},
        {num: 13, word: "BACKUP"}
    ]
};

/* -----------------------
   UTILIDADES
   ----------------------- */
function norm(s) {
    return s.normalize('NFC').toUpperCase().trim();
}

// Normalizar todas las palabras
wordList.horizontal.forEach(w => w.word = norm(w.word));
wordList.vertical.forEach(w => w.word = norm(w.word));

/* -----------------------
   GENERADOR DE CRUCIGRAMA MEJORADO
   ----------------------- */
const GRID_SIZE = 25;
let grid = Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(null));
let placed = [];

function canPlace(word, r, c, dir) {
    const L = word.length;

    if (dir === 'H') {
        if (c < 0 || c + L > GRID_SIZE) return false;

        // Verificar celda antes del inicio
        if (c > 0 && grid[r][c-1] !== null) return false;
        // Verificar celda después del final
        if (c + L < GRID_SIZE && grid[r][c + L] !== null) return false;

        for (let i = 0; i < L; i++) {
            const cell = grid[r][c + i];

            // Si la celda está ocupada con una letra diferente
            if (cell !== null && cell !== word[i]) return false;

            // Si la celda está vacía, verificar que no toque otras palabras
            if (cell === null) {
                // Arriba
                if (r > 0 && grid[r-1][c+i] !== null) return false;
                // Abajo
                if (r < GRID_SIZE-1 && grid[r+1][c+i] !== null) return false;
            }
        }
    } else {
        if (r < 0 || r + L > GRID_SIZE) return false;

        // Verificar celda antes del inicio
        if (r > 0 && grid[r-1][c] !== null) return false;
        // Verificar celda después del final
        if (r + L < GRID_SIZE && grid[r + L][c] !== null) return false;

        for (let i = 0; i < L; i++) {
            const cell = grid[r + i][c];

            if (cell !== null && cell !== word[i]) return false;

            if (cell === null) {
                // Izquierda
                if (c > 0 && grid[r+i][c-1] !== null) return false;
                // Derecha
                if (c < GRID_SIZE-1 && grid[r+i][c+1] !== null) return false;
            }
        }
    }
    return true;
}

function placeWord(word, r, c, dir) {
    if (dir === 'H') {
        for (let i = 0; i < word.length; i++) {
            grid[r][c + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[r + i][c] = word[i];
        }
    }
    return true;
}

function generateCrossword() {
    placed = [];
    grid = Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(null));

    // Combinar todas las palabras
    const allWords = [
        ...wordList.horizontal.map(w => ({...w, dir: 'H'})),
        ...wordList.vertical.map(w => ({...w, dir: 'V'}))
    ];

    // Ordenar por longitud (más largas primero)
    allWords.sort((a, b) => b.word.length - a.word.length);

    const center = Math.floor(GRID_SIZE / 2);

    // Colocar la palabra más larga en el centro
    const firstWord = allWords.shift();
    if (firstWord.dir === 'H') {
        const startCol = center - Math.floor(firstWord.word.length / 2);
        if (canPlace(firstWord.word, center, startCol, 'H')) {
            placeWord(firstWord.word, center, startCol, 'H');
            placed.push({...firstWord, row: center, col: startCol});
        }
    } else {
        const startRow = center - Math.floor(firstWord.word.length / 2);
        if (canPlace(firstWord.word, startRow, center, 'V')) {
            placeWord(firstWord.word, startRow, center, 'V');
            placed.push({...firstWord, row: startRow, col: center});
        }
    }

    // Función para encontrar cruces posibles
    function findCrossingPositions(newWord, existingWord) {
        const positions = [];

        // Solo buscar cruces entre palabras de direcciones diferentes
        if (newWord.dir === existingWord.dir) return positions;

        for (let i = 0; i < existingWord.word.length; i++) {
            for (let j = 0; j < newWord.word.length; j++) {
                if (existingWord.word[i] === newWord.word[j]) {
                    let startRow, startCol;

                    if (existingWord.dir === 'H' && newWord.dir === 'V') {
                        startRow = existingWord.row - j;
                        startCol = existingWord.col + i;

                        if (canPlace(newWord.word, startRow, startCol, 'V')) {
                            positions.push({row: startRow, col: startCol});
                        }
                    } else if (existingWord.dir === 'V' && newWord.dir === 'H') {
                        startRow = existingWord.row + i;
                        startCol = existingWord.col - j;

                        if (canPlace(newWord.word, startRow, startCol, 'H')) {
                            positions.push({row: startRow, col: startCol});
                        }
                    }
                }
            }
        }
        return positions;
    }

    // Colocar el resto de palabras
    let attempts = 0;
    const maxAttempts = 100;

    while (allWords.length > 0 && attempts < maxAttempts) {
        attempts++;
        let placedThisRound = false;

        for (let i = 0; i < allWords.length; i++) {
            const currentWord = allWords[i];
            let bestPosition = null;

            // Buscar cruces con palabras ya colocadas
            for (const placedWord of placed) {
                const positions = findCrossingPositions(currentWord, placedWord);
                if (positions.length > 0) {
                    bestPosition = positions[0];
                    break;
                }
            }

            if (bestPosition) {
                placeWord(currentWord.word, bestPosition.row, bestPosition.col, currentWord.dir);
                placed.push({
                    ...currentWord,
                    row: bestPosition.row,
                    col: bestPosition.col
                });
                allWords.splice(i, 1);
                placedThisRound = true;
                break;
            }
        }

        // Si no se pudo colocar por cruce, intentar colocación libre cerca del centro
        if (!placedThisRound && allWords.length > 0) {
            const currentWord = allWords[0];
            const searchRadius = 8;
            let foundSpot = false;

            for (let dr = -searchRadius; dr <= searchRadius && !foundSpot; dr++) {
                for (let dc = -searchRadius; dc <= searchRadius && !foundSpot; dc++) {
                    const r = center + dr;
                    const c = center + dc;

                    if (r >= 0 && c >= 0 && canPlace(currentWord.word, r, c, currentWord.dir)) {
                        placeWord(currentWord.word, r, c, currentWord.dir);
                        placed.push({
                            ...currentWord,
                            row: r,
                            col: c
                        });
                        allWords.shift();
                        foundSpot = true;
                        break;
                    }
                }
            }

            if (!foundSpot) {
                console.warn(`No se pudo colocar: ${currentWord.word} (${currentWord.num})`);
                allWords.shift();
            }
        }
    }

    if (allWords.length > 0) {
        console.warn(`Quedaron ${allWords.length} palabras sin colocar después de ${maxAttempts} intentos`);
    }

    return placed;
}

/* -----------------------
   EJECUCIÓN Y RENDERIZADO
   ----------------------- */
let wordsPlaced = {};

function initializeGame() {
    // Ocultar loader y mostrar contenido
    document.getElementById('loader').style.display = 'none';
    document.getElementById('content').classList.remove('hidden');

    // Generar crucigrama
    placed = generateCrossword();

    // Mapear palabras colocadas
    wordsPlaced = {};
    placed.forEach(p => {
        const wnorm = norm(p.word);
        const h = wordList.horizontal.find(x => norm(x.word) === wnorm);
        const v = wordList.vertical.find(x => norm(x.word) === wnorm);
        const ref = h || v;
        if (ref) {
            wordsPlaced[ref.num] = {
                word: ref.word,
                dir: p.dir,
                row: p.row,
                col: p.col,
                completed: false
            };
        }
    });

    // Calcular bounding box
    const bbox = getBoundingBoxFromGrid(grid);
    renderBoard(bbox);
    setupCluesInteractivity();
}

function getBoundingBoxFromGrid(grid) {
    const R = grid.length, C = grid[0].length;
    let minR = R, maxR = -1, minC = C, maxC = -1;
    for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
            if (grid[r][c] !== null) {
                minR = Math.min(minR, r);
                maxR = Math.max(maxR, r);
                minC = Math.min(minC, c);
                maxC = Math.max(maxC, c);
            }
        }
    }
    if (maxR === -1) return {minR: 0, maxR: R-1, minC: 0, maxC: C-1};
    return {minR, minC, maxR, maxC};
}

function renderBoard(bbox) {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    const rows = bbox.maxR - bbox.minR + 1;
    const cols = bbox.maxC - bbox.minC + 1;

    // Aplicar grid layout
    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 35px)`;
    boardEl.style.gridTemplateRows = `repeat(${rows}, 35px)`;
    boardEl.style.gap = '2px';
    boardEl.style.justifyContent = 'center';

    // Crear lookup para números
    const numberLookup = {};
    for (const num in wordsPlaced) {
        const w = wordsPlaced[num];
        numberLookup[`${w.row},${w.col}`] = num;
    }

    // Renderizar celdas
    for (let r = bbox.minR; r <= bbox.maxR; r++) {
        for (let c = bbox.minC; c <= bbox.maxC; c++) {
            const wrap = document.createElement('div');
            wrap.className = 'cw-wrapper';
            wrap.style.position = 'relative';
            wrap.style.width = '35px';
            wrap.style.height = '35px';

            const key = `${r},${c}`;
            if (grid[r][c] !== null) {
                const cell = document.createElement('div');
                cell.className = 'cw-cell';
                cell.style.cssText = `
                    width: 35px; height: 35px; background: #e8eaf6; 
                    border: 1px solid #5c6bc0; display: flex; align-items: center; 
                    justify-content: center; font-size: 16px; font-weight: bold; 
                    text-transform: uppercase; cursor: text; box-sizing: border-box;
                    transition: all 0.2s ease;
                `;
                cell.contentEditable = true;
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('input', onCellInput);
                cell.addEventListener('keydown', onKeyDown);
                cell.addEventListener('focus', onCellFocus);

                wrap.appendChild(cell);

                if (numberLookup[key]) {
                    const n = document.createElement('div');
                    n.className = 'cw-num';
                    n.style.cssText = `
                        position: absolute; top: -2px; left: 1px; 
                        font-size: 10px; font-weight: 700; color: #283593; z-index: 2;
                    `;
                    n.textContent = numberLookup[key];
                    wrap.appendChild(n);
                }
            } else {
                const space = document.createElement('div');
                space.className = 'cw-space';
                space.style.cssText = 'width: 35px; height: 35px; background: transparent;';
                wrap.appendChild(space);
            }

            boardEl.appendChild(wrap);
        }
    }
}

function setupCluesInteractivity() {
    // Agregar clases a las pistas para poder marcarlas como completadas
    const clues = document.querySelectorAll('.clues-section li');
    clues.forEach(clue => {
        const clueText = clue.innerHTML;
        const match = clueText.match(/<strong>(\d+)\.<\/strong>/);
        if (match) {
            const num = parseInt(match[1]);
            clue.id = `clue-${num}`;
        }
    });
}

/* -----------------------
   VALIDACIÓN Y LÓGICA DEL JUEGO
   ----------------------- */
function getCellsFor(num) {
    const w = wordsPlaced[num];
    if (!w) return [];
    const len = w.word.length;
    const arr = [];
    if (w.dir === 'H') {
        for (let i = 0; i < len; i++) {
            const cell = document.querySelector(`.cw-cell[data-row='${w.row}'][data-col='${w.col + i}']`);
            if (!cell) return [];
            arr.push(cell);
        }
    } else {
        for (let i = 0; i < len; i++) {
            const cell = document.querySelector(`.cw-cell[data-row='${w.row + i}'][data-col='${w.col}']`);
            if (!cell) return [];
            arr.push(cell);
        }
    }
    return arr;
}

function evaluateCells(cells, answer) {
    // Limpiar clases anteriores
    cells.forEach(c => {
        c.classList.remove('correct', 'maybe', 'wrong', 'shake');
        c.contentEditable = true;
    });

    // Leer texto actual
    const text = cells.map(c => (c.innerText || '').trim().toUpperCase().slice(0, 1)).join('');
    if (text.length === 0) return false;

    // Verificar si es correcto
    if (text === answer) {
        cells.forEach(c => {
            c.classList.add('correct');
            c.contentEditable = false;
        });
        return true;
    }

    // Contar coincidencias
    let matches = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === answer[i]) matches++;
    }

    if (matches >= Math.ceil(answer.length / 2)) {
        cells.forEach(c => c.classList.add('maybe'));
    } else {
        cells.forEach(c => {
            c.classList.add('wrong');
            c.classList.add('shake');
            setTimeout(() => c.classList.remove('shake'), 400);
        });
    }

    return false;
}

function onCellInput(e) {
    const cell = e.target;
    let v = (cell.innerText || '').toUpperCase().trim().slice(0, 1);
    if (!/^[A-ZÁÉÍÓÚÜÑ]$/.test(v)) v = '';
    cell.innerText = v;

    const r = +cell.dataset.row;
    const c = +cell.dataset.col;

    // Validar todas las palabras que incluyen esta celda
    let anyCompleted = false;
    for (const num in wordsPlaced) {
        const w = wordsPlaced[num];
        if (!w) continue;

        let shouldValidate = false;
        if (w.dir === 'H') {
            if (r === w.row && c >= w.col && c < w.col + w.word.length) {
                shouldValidate = true;
            }
        } else {
            if (c === w.col && r >= w.row && r < w.row + w.word.length) {
                shouldValidate = true;
            }
        }

        if (shouldValidate) {
            const cells = getCellsFor(Number(num));
            const completed = evaluateCells(cells, w.word);
            if (completed) {
                wordsPlaced[num].completed = true;
                // Marcar pista como completada
                const clueElement = document.getElementById(`clue-${num}`);
                if (clueElement) {
                    clueElement.style.textDecoration = 'line-through';
                    clueElement.style.color = '#2e7d32';
                    clueElement.style.fontWeight = 'bold';
                }
            }
            anyCompleted = anyCompleted || completed;
        }
    }

    if (anyCompleted) {
        checkVictory();
    }

    // Mover automáticamente al siguiente campo
    setTimeout(() => moveToNextCell(cell), 10);
}

function onCellFocus(e) {
    // Seleccionar el texto para facilitar la escritura
    const cell = e.target;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(cell);
    selection.removeAllRanges();
    selection.addRange(range);
}

function moveToNextCell(currentCell) {
    const r = +currentCell.dataset.row;
    const c = +currentCell.dataset.col;

    // Intentar mover a la derecha, luego abajo
    let nextCell = getCellAt(r, c + 1);
    if (!nextCell) nextCell = getCellAt(r + 1, 0);
    if (nextCell) nextCell.focus();
}

function onKeyDown(e) {
    const cell = e.target;
    const r = +cell.dataset.row;
    const c = +cell.dataset.col;

    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            moveFocus(r, c + 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            moveFocus(r, c - 1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveFocus(r + 1, c);
            break;
        case 'ArrowUp':
            e.preventDefault();
            moveFocus(r - 1, c);
            break;
        case 'Backspace':
            if (cell.innerText === '') {
                e.preventDefault();
                // Mover a la izquierda y borrar
                moveFocus(r, c - 1);
            }
            break;
    }
}

function moveFocus(r, c) {
    const cell = getCellAt(r, c);
    if (cell) cell.focus();
}

function getCellAt(r, c) {
    return document.querySelector(`.cw-cell[data-row='${r}'][data-col='${c}']`);
}

function checkVictory() {
    const allCompleted = Object.values(wordsPlaced).every(w => w.completed);

    if (allCompleted) {
        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                background: rgba(0,0,0,0.8); display: flex; align-items: center; 
                justify-content: center; z-index: 1000;
            `;
            overlay.innerHTML = `
                <div style="background: white; padding: 40px; border-radius: 15px; text-align: center; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <h2 style="color: #283593; font-size: 2.5em; margin-bottom: 20px;">🎉 ¡Felicidades!</h2>
                    <p style="font-size: 1.2em; margin-bottom: 25px; color: #555;">Has completado correctamente el crucigrama de seguridad informática.</p>
                    <p style="font-size: 1.1em; margin-bottom: 25px; color: #555;">Todas las ${Object.keys(wordsPlaced).length} palabras han sido resueltas.</p>
                    <button onclick="this.closest('div').style.display='none'" style="background: #283593; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 1.1em; cursor: pointer;">Continuar</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }, 500);
    }
}

// Inyectar estilos CSS
function injectStyles() {
    const styles = `
        .cw-cell:focus {
            outline: none;
            background: #bbdefb;
            border-color: #283593;
        }
        .correct {
            background: #c8e6c9 !important;
            border-color: #2e7d32 !important;
            color: #1b5e20;
        }
        .maybe {
            background: #fff9c4 !important;
            border-color: #f9a825 !important;
            color: #5d4037;
        }
        .wrong {
            background: #ffcdd2 !important;
            border-color: #c62828 !important;
            color: #b71c1c;
        }
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
            75% { transform: translateX(-3px); }
            100% { transform: translateX(0); }
        }
        .shake {
            animation: shake 0.4s ease;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

/* -----------------------
   INICIALIZACIÓN
   ----------------------- */
document.addEventListener('DOMContentLoaded', function() {
    injectStyles();

    // Simular carga (puedes ajustar el tiempo según necesites)
    setTimeout(() => {
        initializeGame();
    }, 1500);
});

// Función para reiniciar el juego
window.restartGame = function() {
    if (confirm('¿Reiniciar el crucigrama?')) {
        document.getElementById('loader').style.display = 'flex';
        document.getElementById('content').classList.add('hidden');

        // Resetear estilos de pistas
        const clues = document.querySelectorAll('.clues-section li');
        clues.forEach(clue => {
            clue.style.textDecoration = '';
            clue.style.color = '';
            clue.style.fontWeight = '';
        });

        setTimeout(() => {
            initializeGame();
        }, 500);
    }
};