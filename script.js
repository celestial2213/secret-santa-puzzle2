// secret santa puzzle 2 - Wordle-like (6 letters: NUTMEG)
(() => {
  const ANSWER = "NUTMEG"; // must be uppercase
  const WORD_LENGTH = ANSWER.length;
  const MAX_ROWS = 6;

  const boardEl = document.getElementById("board");
  const keyboardEl = document.getElementById("keyboard");
  const restartBtn = document.getElementById("restart");
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modalClose");
  const modalRestart = document.getElementById("modalRestart");
  const copyBtn = document.getElementById("copyBtn");
  const shareInput = document.getElementById("shareLink");

  let currentRow = 0;
  let currentCol = 0;
  let board = Array.from({length: MAX_ROWS}, () => Array(WORD_LENGTH).fill(""));

  // Build board grid based on WORD_LENGTH
  function buildBoard(){
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateRows = `repeat(${MAX_ROWS}, auto)`;
    for(let r=0;r<MAX_ROWS;r++){
      const row = document.createElement("div");
      row.className = "tile-row";
      row.dataset.row = r;
      for(let c=0;c<WORD_LENGTH;c++){
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.id = `tile-${r}-${c}`;
        tile.setAttribute("aria-label","empty");
        row.appendChild(tile);
      }
      boardEl.appendChild(row);
    }
  }

  function setTile(r,c,letter){
    const el = document.getElementById(`tile-${r}-${c}`);
    if(!el) return;
    el.textContent = letter;
    el.setAttribute("aria-label", letter || "empty");
  }

  function pressKey(key){
    if(modal.classList.contains("hidden")===false) return; // disable input when modal open
    if(key === "Enter"){
      submitGuess();
    } else if(key === "Backspace"){
      deleteLetter();
    } else if(/^[A-Z]$/.test(key)){
      addLetter(key);
    }
  }

  function addLetter(letter){
    if(currentCol >= WORD_LENGTH) return;
    board[currentRow][currentCol] = letter;
    setTile(currentRow, currentCol, letter);
    currentCol++;
  }

  function deleteLetter(){
    if(currentCol <= 0) return;
    currentCol--;
    board[currentRow][currentCol] = "";
    setTile(currentRow, currentCol, "");
  }

  function submitGuess(){
    const guess = board[currentRow].join("");
    if(guess.length !== WORD_LENGTH || guess.includes("")){
      flashMessage("Not enough letters");
      return;
    }

    // Evaluate guess with correct duplicate behaviour
    const answerArr = ANSWER.split("");
    const guessArr = guess.split("");
    const result = Array(WORD_LENGTH).fill("absent");
    const letterCounts = {};

    // count letters in ANSWER
    for(const ch of answerArr){
      letterCounts[ch] = (letterCounts[ch] || 0) + 1;
    }

    // first pass: correct
    for(let i=0;i<WORD_LENGTH;i++){
      if(guessArr[i] === answerArr[i]){
        result[i] = "correct";
        letterCounts[guessArr[i]]--;
      }
    }
    // second pass: present
    for(let i=0;i<WORD_LENGTH;i++){
      if(result[i] === "correct") continue;
      const g = guessArr[i];
      if(letterCounts[g] && letterCounts[g] > 0){
        result[i] = "present";
        letterCounts[g]--;
      } else {
        result[i] = "absent";
      }
    }

    // animate flip and set classes
    for(let i=0;i<WORD_LENGTH;i++){
      const tile = document.getElementById(`tile-${currentRow}-${i}`);
      tile.classList.add("flip");
      // closure for timeout
      ((tile, cls) => {
        setTimeout(() => {
          tile.classList.remove("flip");
          tile.classList.add(cls);
        }, i * 250); // stagger
      })(tile, result[i]);

      // update keyboard after flip
      setTimeout(() => {
        const keyButtons = [...keyboardEl.querySelectorAll(`[data-key="${guessArr[i]}"]`)];
        keyButtons.forEach(kb => updateKeyState(kb, result[i]));
      }, i * 250 + 300);
    }

    // check win/lose
    if(guess === ANSWER){
      setTimeout(() => showSuccess(), WORD_LENGTH * 250 + 350);
      return;
    }

    currentRow++;
    currentCol = 0;

    if(currentRow >= MAX_ROWS){
      setTimeout(() => showFailure(), 600);
    }
  }

  function updateKeyState(keyEl, newState){
    if(!keyEl) return;
    // priority: correct > present > absent
    if(keyEl.classList.contains("correct")) return;
    if(newState === "correct"){
      keyEl.classList.remove("present","absent");
      keyEl.classList.add("correct");
    } else if(newState === "present"){
      if(!keyEl.classList.contains("correct")){
        keyEl.classList.remove("absent");
        keyEl.classList.add("present");
      }
    } else if(newState === "absent"){
      if(!keyEl.classList.contains("correct") && !keyEl.classList.contains("present")){
        keyEl.classList.add("absent");
      }
    }
  }

  function flashMessage(msg){
    // small ephemeral toast-like effect using header
    const orig = document.querySelector(".header h1").textContent;
    const h = document.querySelector(".header h1");
    h.textContent = msg;
    setTimeout(()=> h.textContent = orig , 1100);
  }

  function showSuccess(){
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
    shareInput.value = "link";
  }

  function showFailure(){
    flashMessage(`Game over — ${ANSWER}`);
  }

  function restart(){
    // clear board state
    board = Array.from({length: MAX_ROWS}, () => Array(WORD_LENGTH).fill(""));
    currentRow = 0;
    currentCol = 0;
    // rebuild board & reset keyboard state
    buildBoard();
    const keys = [...keyboardEl.querySelectorAll(".key")];
    keys.forEach(k => k.classList.remove("absent","present","correct"));
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
  }

  // build keyboard listeners
  function bindKeyboard(){
    keyboardEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-key]");
      if(!btn) return;
      const key = btn.dataset.key;
      pressKey(key);
    });

    window.addEventListener("keydown", (e) => {
      if(e.key === "Enter") { pressKey("Enter"); e.preventDefault(); }
      else if(e.key === "Backspace") { pressKey("Backspace"); e.preventDefault(); }
      else {
        const k = e.key.toUpperCase();
        if(k.length === 1 && k >= "A" && k <= "Z"){
          pressKey(k);
        }
      }
    });

    restartBtn.addEventListener("click", restart);
    modalClose.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden","true");
    });
    modalRestart.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden","true");
      restart();
    });

    copyBtn.addEventListener("click", () => {
      const text = shareInput.value || "link";
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(()=> copyBtn.textContent = "Copy", 1200);
        }).catch(()=>{
          copyBtn.textContent = "Copied!";
        });
      } else {
        // fallback
        shareInput.select();
        document.execCommand("copy");
        copyBtn.textContent = "Copied!";
        setTimeout(()=> copyBtn.textContent = "Copy", 1200);
      }
    });
  }

  // initialize
  buildBoard();
  bindKeyboard();

  // make sure tiles are sized relative to WORD_LENGTH for mobile widths
  function adjustTileWidth(){
    const tileEls = document.querySelectorAll(".tile");
    if(!tileEls.length) return;
    // allow CSS to handle responsive sizes; nothing required here but kept for extensibility
  }
  adjustTileWidth();

  // Expose restart to console for debugging
  window._ssRestart = restart;

})();