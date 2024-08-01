document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const keys = document.querySelectorAll('.key');
    const enterKey = document.getElementById('enter');
    const deleteKey = document.getElementById('delete');

    let words = []; // Array to store fetched words

    // Fetch words from local file
    async function fetchWords() {
        try {
            const response = await fetch('words.txt'); // Assuming words.txt is in the same directory
            if (!response.ok) {
                throw new Error('Failed to fetch words');
            }
            const text = await response.text();
            words = text.trim().split('\n'); // Split text into an array of words
            resetGame(); // Reset the game with fetched words
        } catch (error) {
            console.error('Error fetching words:', error);
            // Handle error (e.g., show an alert or log it)
        }
    }

    // Call fetchWords to start the game with fetched words
    fetchWords();

    const maxGuesses = 6;
    let targetWord = '';
    let currentGuess = '';
    let currentRow = 0;
    const usedLetters = new Set();

    function createBoard() {
        board.innerHTML = ''; // Clear the board
        for (let i = 0; i < maxGuesses; i++) {
            for (let j = 0; j < targetWord.length; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                board.appendChild(tile);
            }
        }
    }

    function updateBoard() {
        const tiles = document.querySelectorAll('.tile');
        const startIndex = currentRow * targetWord.length;
        for (let i = 0; i < currentGuess.length; i++) {
            tiles[startIndex + i].textContent = currentGuess[i];
        }
        for (let i = currentGuess.length; i < targetWord.length; i++) {
            tiles[startIndex + i].textContent = '';
        }
    }

    function checkGuess() {
        if (currentGuess.length !== targetWord.length) return;

        const tiles = document.querySelectorAll('.tile');
        const startIndex = currentRow * targetWord.length;
        let correctGuess = true;

        currentGuess.split('').forEach((letter, i) => {
            const tile = tiles[startIndex + i];
            setTimeout(() => {
                tile.classList.add('reveal');
                setTimeout(() => {
                    if (letter === targetWord[i]) {
                        tile.classList.add('correct');
                    } else if (targetWord.includes(letter)) {
                        tile.classList.add('present');
                        correctGuess = false;
                    } else {
                        tile.classList.add('absent');
                        hideLetter(letter);
                        correctGuess = false;
                    }
                    tile.classList.remove('reveal');
                }, 300); // Match half of the animation duration
            }, i * 450); // Delay each tile's reveal by 450ms
        });

        setTimeout(() => {
            if (correctGuess) {
                displayCelebrationMessage();
                showResetOption();
            } else {
                currentRow++;
                currentGuess = '';
                if (currentRow === maxGuesses) {
                    setTimeout(() => {
                        alert(`Oops, you have exhausted all the guesses! The word was ${targetWord}. Better luck next time`);
                        resetGame();
                    }, 2500); // Wait for all animations to finish before showing the alert
                }
            }
        }, targetWord.length * 450 + 300); // Ensure this happens after all tiles have revealed
    }

    function displayCelebrationMessage() {
        const celebrationMessage = document.createElement('div');
        celebrationMessage.classList.add('celebration-message');
        celebrationMessage.textContent = 'Great! You got it correct!';
        document.body.appendChild(celebrationMessage);
    }

    function showResetOption() {
        const resetPrompt = document.createElement('div');
        resetPrompt.classList.add('reset-prompt');
        resetPrompt.innerHTML = `
            <p>Do you want to reset the game?</p>
            <button id="resetButton">Reset</button>
            <button id="continueButton">Continue</button>
        `;
        document.body.appendChild(resetPrompt);

        const resetButton = document.getElementById('resetButton');
        resetButton.addEventListener('click', () => {
            resetGame();
            document.body.removeChild(resetPrompt);
        });

        const continueButton = document.getElementById('continueButton');
        continueButton.addEventListener('click', () => {
            // Do nothing, continue showing celebration message
            resetButton.style.display = 'none'; // Hide reset button
        });
    }

    function hideLetter(letter) {
        if (!usedLetters.has(letter)) {
            usedLetters.add(letter);
            const key = document.querySelector(`.key[data-key="${letter}"]`);
            if (key) {
                key.classList.add('hidden');
            }
        }
    }

    function handleKeyClick(event) {
        const letter = event.target.textContent.toUpperCase();
        if (letter === 'ENTER') {
            checkGuess();
        } else if (letter === 'DELETE') {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        } else if (currentGuess.length < targetWord.length && !usedLetters.has(letter)) {
            currentGuess += letter;
            updateBoard();
        }
    }

    function handleKeyPress(event) {
        const key = event.key.toUpperCase();
        if (/^[A-Z]$/.test(key) && !usedLetters.has(key)) {
            if (currentGuess.length < targetWord.length) {
                currentGuess += key;
                updateBoard();
            }
        } else if (key === 'ENTER') {
            checkGuess();
        } else if (key === 'BACKSPACE') {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        }
    }

    keys.forEach(key => {
        key.setAttribute('data-key', key.textContent.toUpperCase());
        key.addEventListener('click', handleKeyClick);
    });

    enterKey.addEventListener('click', () => {
        checkGuess();
    });

    deleteKey.addEventListener('click', () => {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
    });

    document.addEventListener('keydown', handleKeyPress);

    function resetGame() {
        targetWord = words[Math.floor(Math.random() * words.length)].trim().toUpperCase();
        currentRow = 0;
        currentGuess = '';
        usedLetters.clear();
        keys.forEach(key => {
            key.classList.remove('hidden');
            key.addEventListener('click', handleKeyClick); // Re-add the click event listener
        });
        createBoard();
        const celebrationMessage = document.querySelector('.celebration-message');
        if (celebrationMessage) {
            document.body.removeChild(celebrationMessage);
        }
        const resetPrompt = document.querySelector('.reset-prompt');
        if (resetPrompt) {
            document.body.removeChild(resetPrompt);
        }
    }

    createBoard();
});
