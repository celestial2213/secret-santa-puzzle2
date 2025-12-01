// script.js - Simple Wordle Game

// The Christmas word to guess
const SECRET_WORD = "MERRY";
let currentGuess = "";
let guesses = 0;
const MAX_GUESSES = 6;

// Create the Wordle board
function createBoard() {
    const board = document.getElementById('wordle-board');
    board.innerHTML = '';
    
    for (let row = 0; row < MAX_GUESSES; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        rowDiv.id = 'row-' + row;
        
        for (let col = 0; col < 5; col++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            box.id = 'box-' + row + '-' + col;
            box.textContent = '';
            rowDiv.appendChild(box);
        }
        
        board.appendChild(rowDiv);
    }
}

// Create keyboard
function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const letters = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M','⌫','ENTER']
    ];
    
    keyboard.innerHTML = '';
    
    letters.forEach(rowLetters => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'key-row';
        
        rowLetters.forEach(letter => {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.onclick = function() { handleKey(letter); };
            rowDiv.appendChild(key);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

// Handle keyboard input
function handleKey(key) {
    if (key === '⌫') {
        // Backspace
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        }
    } else if (key === 'ENTER') {
        // Submit guess
        if (currentGuess.length === 5) {
            checkGuess();
        }
    } else if (currentGuess.length < 5) {
        // Add letter
        currentGuess += key;
        updateBoard();
    }
}

// Update board display
function updateBoard() {
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById('box-' + guesses + '-' + i);
        box.textContent = currentGuess[i] || '';
    }
}

// Check if guess is correct
function checkGuess() {
    const guess = currentGuess.toUpperCase();
    
    // Color the boxes
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById('box-' + guesses + '-' + i);
        
        if (guess[i] === SECRET_WORD[i]) {
            box.style.backgroundColor = '#2ecc71'; // Green - correct
        } else if (SECRET_WORD.includes(guess[i])) {
            box.style.backgroundColor = '#f39c12'; // Yellow - wrong position
        } else {
            box.style.backgroundColor = '#95a5a6'; // Gray - not in word
        }
    }
    
    // Check if won
    if (guess === SECRET_WORD) {
        document.getElementById('message').innerHTML = 
            '🎉 Correct! The word is MERRY! 🎉<br>Loading next puzzle...';
        
        // Show QR puzzle after 2 seconds
        setTimeout(function() {
            document.getElementById('wordle-section').style.display = 'none';
            document.getElementById('qr-section').style.display = 'block';
            loadQRPieces();
        }, 2000);
        
        return;
    }
    
    // Next guess
    guesses++;
    currentGuess = '';
    
    // Check if lost
    if (guesses >= MAX_GUESSES) {
        document.getElementById('message').innerHTML = 
            'Game Over! The word was: ' + SECRET_WORD;
    }
}

// Load QR pieces (you'll need to add actual images)
function loadQRPieces() {
    const qrContainer = document.getElementById('qr-pieces');
    qrContainer.innerHTML = '';
    
    // Create 8 QR piece placeholders
    for (let i = 1; i <= 8; i++) {
        const piece = document.createElement('img');
        piece.className = 'qr-piece';
        piece.src = 'qr-pieces/piece' + i + '.png'; // You need to create these images
        piece.alt = 'QR Piece ' + i;
        piece.draggable = true;
        piece.id = 'piece' + i;
        qrContainer.appendChild(piece);
    }
}

// Check if QR puzzle is solved (simplified)
function checkQRPuzzle() {
    document.getElementById('final-message').innerHTML = 
        '🎁 Congratulations! 🎁<br>' +
        'The QR code would reveal: https://bit.ly/SecretSantaGiftList<br>' +
        '(In the real version, this would be a working QR code!)';
    
    // Make button disappear
    document.querySelector('button').style.display = 'none';
}

// Start the game when page loads
window.onload = function() {
    createBoard();
    createKeyboard();
    
    // Add keyboard support
    document.addEventListener('keydown', function(event) {
        const key = event.key.toUpperCase();
        if (key.length === 1 && key >= 'A' && key <= 'Z') {
            handleKey(key);
        } else if (key === 'BACKSPACE') {
            handleKey('⌫');
        } else if (key === 'ENTER') {
            handleKey('ENTER');
        }
    });
};