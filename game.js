document.addEventListener('DOMContentLoaded', () => {
    // ## 1. HTML 요소 별명 붙이기
    const pageA = document.getElementById('page-a');
    const pageB = document.getElementById('page-b');
    const goToBButton = document.getElementById('go-to-b-button');
    const saveGameButton = document.getElementById('save-game-button');
    const buyInAmountInput = document.getElementById('buy-in-amount');
    const startingChipsDisplay = document.getElementById('starting-chips-display');
    const playerListA = document.getElementById('player-list-a');
    const playerListB = document.getElementById('player-list-b');
    const totalBuyInCountSpan = document.getElementById('total-buy-in-count');
    const totalBuyInFeeSpan = document.getElementById('total-buy-in-fee');
    const gameNameInput = document.getElementById('game-name');
    const buyInUpBtn = document.getElementById('buy-in-up');
    const buyInDownBtn = document.getElementById('buy-in-down');
    const backToAButton = document.getElementById('back-to-a-button');

    let players = [];

    // ## 2. 기능 함수들
    function updateStartingChips() {
        const buyInAmount = Number(buyInAmountInput.value) || 0;
        startingChipsDisplay.textContent = (buyInAmount * 10).toLocaleString();
    }

    function updateTotals() {
        let totalCount = 0;
        players.forEach(player => {
            totalCount += player.buyInCount;
        });
        const totalFee = totalCount * (Number(buyInAmountInput.value) || 0);
        totalBuyInCountSpan.textContent = totalCount;
        totalBuyInFeeSpan.textContent = `₩${totalFee.toLocaleString()}`;
    }

    function initialRenderA() {
        playerListA.innerHTML = '';
        players.forEach((player, index) => {
            const row = document.createElement('tr');
            const cellNum = document.createElement('td');
            cellNum.textContent = index + 1;
            row.appendChild(cellNum);

            const cellName = document.createElement('td');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'player-name';
            nameInput.dataset.id = index;
            cellName.appendChild(nameInput);
            row.appendChild(cellName);

            const cellCount = document.createElement('td');
            const countSpan = document.createElement('span');
            countSpan.className = 'buy-in-count';
            countSpan.dataset.id = index;
            countSpan.textContent = player.buyInCount;
            cellCount.appendChild(countSpan);
            row.appendChild(cellCount);

            const cellActions = document.createElement('td');
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'action-buttons';
            
            const minusBtn = document.createElement('button');
            minusBtn.className = 'btn btn-minus';
            minusBtn.dataset.id = index;
            minusBtn.textContent = '-1';
            
            const plusBtn = document.createElement('button');
            plusBtn.className = 'btn btn-plus';
            plusBtn.dataset.id = index;
            plusBtn.textContent = '+1';

            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn btn-reset';
            resetBtn.dataset.id = index;
            resetBtn.textContent = '리셋';

            buttonsDiv.appendChild(minusBtn);
            buttonsDiv.appendChild(plusBtn);
            buttonsDiv.appendChild(resetBtn);
            cellActions.appendChild(buttonsDiv);
            row.appendChild(cellActions);

            playerListA.appendChild(row);
        });
    }

    // ## 3. 이벤트 처리
    buyInUpBtn.addEventListener('click', () => {
        buyInAmountInput.stepUp();
        buyInAmountInput.dispatchEvent(new Event('input'));
    });
    buyInDownBtn.addEventListener('click', () => {
        buyInAmountInput.stepDown();
        buyInAmountInput.dispatchEvent(new Event('input'));
    });
    buyInAmountInput.addEventListener('input', () => {
        updateStartingChips();
        updateTotals();
    });

    playerListA.addEventListener('change', (e) => {
        if (e.target.classList.contains('player-name')) {
            const id = e.target.dataset.id;
            const name = e.target.value;
            players[id].name = name;

            if (name && players[id].buyInCount === 0) {
                players[id].buyInCount = 1;
                const countSpan = document.querySelector(`.buy-in-count[data-id="${id}"]`);
                if (countSpan) countSpan.textContent = '1';
                updateTotals();
            }
        }
    });

    playerListA.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return; 

        const nameInput = document.querySelector(`.player-name[data-id="${id}"]`);
        if(nameInput) players[id].name = nameInput.value;
        
        const targetPlayer = players[id];
        if (!targetPlayer) return;

        let countChanged = false;

        if (e.target.classList.contains('btn-plus')) {
            targetPlayer.buyInCount++;
            countChanged = true;
            if (targetPlayer.buyInCount === 5) alert('너무 많이 박으시네요. 자제하세요!');
            if (targetPlayer.buyInCount === 10) alert(`${targetPlayer.name || '이 분'}을 말리세요!!`);
        } else if (e.target.classList.contains('btn-minus')) {
            if (targetPlayer.buyInCount > 0) {
                targetPlayer.buyInCount--;
                countChanged = true;
            }
        } else if (e.target.classList.contains('btn-reset')) {
            if (confirm('정말 0으로 초기화 하시겠습니까?')) {
                targetPlayer.buyInCount = 0;
                countChanged = true;
            }
        }

        if (countChanged) {
            const countSpan = document.querySelector(`.buy-in-count[data-id="${id}"]`);
            if (countSpan) countSpan.textContent = targetPlayer.buyInCount;
            updateTotals();
        }
    });

    // --- B페이지 및 저장 관련 로직 ---
    goToBButton.addEventListener('click', () => {
        const nameInputs = document.querySelectorAll('.player-name');
        nameInputs.forEach((input, index) => {
            players[index].name = input.value;
        });

        if (confirm('게임을 종료하고 칩 정산으로 넘어가시겠습니까?')) {
            pageA.style.display = 'none';
            pageB.style.display = 'block';
            renderB();
        }
    });

    backToAButton.addEventListener('click', () => {
        pageB.style.display = 'none';
        pageA.style.display = 'block';
    });

    function renderB() {
        const totalChipsSpan = document.getElementById('total-chips');
        const totalCheckText = document.getElementById('total-check-text');
        playerListB.innerHTML = '';
        let totalChips = 0;
        const buyInAmount = Number(buyInAmountInput.value) || 0;
        players.forEach((player) => {
            if (!player.name) return;
            player.prize = (player.chips / 10) - (player.buyInCount * buyInAmount);
            totalChips += player.chips;
            const row = document.createElement('tr');
            const prizeClass = player.prize > 0 ? 'prize-plus' : (player.prize < 0 ? 'prize-minus' : '');
            row.innerHTML = `<td>${player.name}</td><td>${player.buyInCount}</td><td><input type="number" class="chip-input" value="${player.chips}"></td><td class="${prizeClass}">${player.prize.toLocaleString()}</td>`;
            playerListB.appendChild(row);
        });
        totalChipsSpan.textContent = totalChips.toLocaleString();
        const totalFee = players.reduce((sum, p) => sum + p.buyInCount, 0) * buyInAmount;
        if (totalFee !== (totalChips / 10)) {
            totalCheckText.textContent = '칩 총합과 바인비 총합이 맞지 않습니다!';
            totalCheckText.style.color = '#dc3545';
        } else {
            totalCheckText.textContent = '정산이 정확합니다.';
            totalCheckText.style.color = '#28a745';
        }
    }

    playerListB.addEventListener('input', (e) => {
        if (e.target.classList.contains('chip-input')) {
            const playerRow = e.target.closest('tr');
            const playerName = playerRow.cells[0].textContent;
            const player = players.find(p => p.name === playerName);
            if(player) {
                player.chips = Number(e.target.value) || 0;
                renderB();
            }
        }
    });

    saveGameButton.addEventListener('click', () => {
        if (!gameNameInput.value) { alert('게임 이름을 입력해주세요.'); return; }
        const allGames = JSON.parse(localStorage.getItem('holdemGames')) || [];
        const newGame = {
            id: Date.now(), name: gameNameInput.value,
            players: players.filter(p => p.name).map(p => ({ name: p.name, prize: p.prize }))
        };
        allGames.push(newGame);
        localStorage.setItem('holdemGames', JSON.stringify(allGames));
        alert('게임 결과가 저장되었습니다!');
        // 여기가 바로 home.html을 부르는 이정표입니다.
        window.location.href = 'index.html';
    });
    
    // ## 4. 초기화
    for (let i = 0; i < 12; i++) {
        players.push({ id: i, name: '', buyInCount: 0, chips: 0, prize: 0 });
    }
    updateStartingChips();
    initialRenderA();
    updateTotals();
});