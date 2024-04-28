let board = new fabric.Canvas('board');

// Configurazione stecchette
// Indica alcuni parametri per la creazione delle stecchette in modo da poterli motificare velcoemente
const stecchetteConf = {
    width: 15,
    height: 100,
    radius: 10,
    margin: {
        width: 40,
        height: 15,
    },
    rows: 5,
    colors: {
        players: ['#4b7fff', '#ffc56c'],
        default: '#777'
    }
}

const stecchetteList = []; // lista di stecchette
let isPlayer1 = false; // indica il giocatore corrente
let playerColor = ""; // colore del giocatore corrente
let nStecchette = 0;

// Imposta il canvas per disegnare
board.isDrawingMode = true;
board.freeDrawingBrush.width = 5;

// Scambia i due giocatori, cambiando la booleana isPlayer1 e il colore del giocatore
function switchPlayer() {
    let root = document.documentElement;
    let otherPlayerColor;
    isPlayer1 = !isPlayer1;
    if (isPlayer1) {
        playerColor = stecchetteConf.colors.players[0];
        otherPlayerColor = stecchetteConf.colors.players[1];
    } else {
        playerColor = stecchetteConf.colors.players[1];
        otherPlayerColor = stecchetteConf.colors.players[0];
    }
    board.freeDrawingBrush.color = pSBC(0.25, playerColor);
    root.style.setProperty('--playercolor', pSBC(-0.4, playerColor));
    root.style.setProperty('--altcolor', pSBC(-0.4, otherPlayerColor));
}


// Ridimensiona il canvas e sposta le stecchette per adattarsi alla finestra
// TODO: Su Chrome Mobile le stecchette non sono del tutto centrate, questo però impatta poco il gioco
function resize() {
    let visibleWidth = window.visualViewport.width;
    let visibleHeight = window.visualViewport.height;
    let currentLine = Math.floor(stecchetteConf.rows / 2) * -1;

    board.setWidth(visibleWidth);
    board.setHeight(visibleHeight);

    // Cicla per tutte le stecchette e le riposiziona
    stecchetteList.forEach(function (line) {
        let spaceTop = ((visibleHeight - stecchetteConf.height + stecchetteConf.margin.height) / 2) + (stecchetteConf.height + stecchetteConf.margin.height) * currentLine;
        for (let i = 0; i < line.length; i++) {
            line[i].left = ((visibleWidth - stecchetteConf.width - stecchetteConf.margin.width) / 2) + (stecchetteConf.width + stecchetteConf.margin.width) * (i - line.length / 2) + stecchetteConf.margin.width;
            line[i].top = spaceTop;
            line[i].setCoords();
        }
        currentLine++;
    })
}

// Resetta il gioco
function reset() {
    // Ricarica il numero di stecchette
    nStecchette = 0;
    stecchetteList.forEach(function (row) {
        row.forEach(function (stecchetta) {
            stecchetta.set('fill', stecchetteConf.colors.default);
            stecchetta.del = false;
            nStecchette++;
        });
    });
    // Forza il giocatore 1 e cambia i colori
    isPlayer1 = false;
    switchPlayer();
    board.renderAll();
}

// Genera stecchetteConf.quantity stecchette e associa una riga, colonna e booleana per indicare la rimozione
for (let i = 0; i < stecchetteConf.rows; i++) {
    let steccs = [];
    for (let j = 0; j < i + 1; j++) {
        steccs.push(new fabric.Rect({
            fill: stecchetteConf.colors.default,
            width: stecchetteConf.width,
            height: stecchetteConf.height,
            ry: stecchetteConf.radius,
            rx: stecchetteConf.radius,
            row: i,
            col: j,
            del: false,
        }));
    }
    stecchetteList.push(steccs);
}

// Itera per ogni elemento di stecchetteList e le aggiunge al canvas
// La posizione viene gestita poi dalla funzione resize
stecchetteList.forEach(function (line) {
    line.forEach(function (stecchetta) {
        board.add(stecchetta);
        nStecchette++;
    });
});

// Funzione resize usata per completare il primo setup è usata anche come evento di resize per riadattare il canvas alla finestra
resize();
window.addEventListener("resize", resize);

// "scambia" il giocatore, in modo da iniziare con il giocatore 1 e i colori corretti
switchPlayer();

// Evento per gestire oggetti aggiunti (quindi quando viene disegnata una linea)
board.on('object:added', function (options) {
    let elemList = [];
    let nSteccTeo = nStecchette;
    let valid = true;

    // Aggiunge le stecchette coinvolte ad una lista e controlla se la mossa è valida
    board.forEachObject(function (obj) {
        if (obj === options.target || !valid) return;
        if (options.target.intersectsWithObject(obj)) {
            elemList.push(obj)
            nSteccTeo--;
            valid = !(elemList.length !== 0 && (elemList[0].row !== obj.row || obj.del || nSteccTeo<1));
        }
    });

    // Se la mossa è valida, colora le stecchette e controlla se il giocatore ha vinto
    if (valid && elemList.length > 0) {
        nStecchette = nSteccTeo;
        elemList.forEach(function (elem) {
            elem.set('fill', playerColor);
            elem.del = true;
        });
        if (nStecchette === 1) {
            alert("Ha vinto il giocatore " + (isPlayer1 ? "1" : "2"));
        } else {
            switchPlayer();
        }
    } else {
        // Se la mossa non è valida, anima una vignetta rossa per indicare errore
        let root = document.documentElement;
        let oldColor = root.style.getPropertyValue("--shadowcolor");
        root.style.setProperty("--shadowcolor", "#c00a");
        setTimeout(function () {
            root.style.setProperty("--shadowcolor", oldColor);
        }, 400);
    }
    board.remove(options.target);
});
