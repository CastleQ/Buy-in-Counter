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
    const totalBuyInCountSpanA = document.getElementById('total-buy-in-count');
    const totalBuyInFeeSpanA = document.getElementById('total-buy-in-fee');
    const gameNameInput = document.getElementById('game-name');
    const buyInUpBtn = document.getElementById('buy-in-up');
    const buyInDownBtn = document.getElementById('buy-in-down');
    const backToAButton = document.getElementById('back-to-a-button');

    let players = [];
    let gameIdToUpdate = null;

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
        totalBuyInCountSpanA.textContent = totalCount;
        totalBuyInFeeSpanA.textContent = `₩${totalFee.toLocaleString()}`;
    }

    function initialRenderA() {
        playerListA.innerHTML = '';
        players.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="player-name" data-id="${index}" value="${player.name}"></td>
                <td><span class="buy-in-count" data-id="${index}">${player.buyInCount}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-minus" data-id="${index}">-1</button>
                        <button class="btn btn-plus" data-id="${index}">+1</button>
                        <button class="btn btn-reset" data-id="${index}">리셋</button>
                    </div>
                </td>
            `;
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
        if (nameInput) players[id].name = nameInput.value;
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
        const summaryTotalChips = document.getElementById('summary-total-chips');
        const summaryBuyInCount = document.getElementById('summary-buy-in-count');
        const summaryBuyInFee = document.getElementById('summary-buy-in-fee');
        const totalCheckText = document.getElementById('total-check-text');
        
        playerListB.innerHTML = '';
        let totalChips = 0;
        let totalBuyInForB = 0;
        const buyInAmount = Number(buyInAmountInput.value) || 0;

        players.forEach((player) => {
            if (!player.name) return;
            // 이전 데이터에 prize 값이 없을 수 있으므로 계산을 여기서 다시 수행
            player.prize = (player.chips / 10) - (player.buyInCount * buyInAmount);
            totalChips += player.chips;
            totalBuyInForB += player.buyInCount;

            const row = document.createElement('tr');
            const prizeClass = player.prize > 0 ? 'prize-plus' : (player.prize < 0 ? 'prize-minus' : '');
            row.innerHTML = `<td>${player.name}</td><td>${player.buyInCount}</td><td><input type="number" class="chip-input" data-id="${player.id}" value="${player.chips}"></td><td class="${prizeClass}">₩${player.prize.toLocaleString()}</td>`;
            playerListB.appendChild(row);
        });
        
        const totalFeeForB = totalBuyInForB * buyInAmount;
        summaryTotalChips.textContent = totalChips.toLocaleString();
        summaryBuyInCount.textContent = totalBuyInForB;
        summaryBuyInFee.textContent = `₩${totalFeeForB.toLocaleString()}`;

        const discrepancy = (totalFeeForB * 10) - totalChips;
        if (discrepancy !== 0) {
            totalCheckText.textContent = `칩 총합과 바인비 총합이 ${discrepancy.toLocaleString()} 만큼 맞지 않습니다!`;
            totalCheckText.style.display = 'block';
        } else {
            totalCheckText.style.display = 'none';
        }
    }

    playerListB.addEventListener('change', (e) => {
        if (e.target.classList.contains('chip-input')) {
            const id = e.target.dataset.id;
            const playerToUpdate = players.find(p => p.id == id);
            if(playerToUpdate) {
                playerToUpdate.chips = Number(e.target.value) || 0;
                renderB();
            }
        }
    });

    saveGameButton.addEventListener('click', () => {
        if (!gameNameInput.value) { alert('게임 이름을 입력해주세요.'); return; }
        let allGames = JSON.parse(localStorage.getItem('holdemGames')) || [];

        const currentPlayersData = players.filter(p => p.name).map(p => ({
            id: p.id,
            name: p.name,
            buyInCount: p.buyInCount,
            chips: p.chips,
            prize: p.prize
        }));

        if (gameIdToUpdate) {
            const gameIndex = allGames.findIndex(game => String(game.id) === String(gameIdToUpdate));
            if (gameIndex > -1) {
                allGames[gameIndex].name = gameNameInput.value;
                allGames[gameIndex].buyInAmount = Number(buyInAmountInput.value);
                allGames[gameIndex].players = currentPlayersData;
            }
        } else {
            const newGame = {
                id: Date.now(),
                name: gameNameInput.value,
                buyInAmount: Number(buyInAmountInput.value),
                players: currentPlayersData
            };
            allGames.push(newGame);
        }

        localStorage.setItem('holdemGames', JSON.stringify(allGames));
        alert('게임 결과가 저장되었습니다!');
        window.location.href = 'index.html';
    });

    // ## 4. 초기화 로직
    const gameToViewJSON = sessionStorage.getItem('gameToView');

    if (gameToViewJSON) {
        // '보기/수정 모드'일 때
        const gameData = JSON.parse(gameToViewJSON);
        gameIdToUpdate = gameData.id;
        gameNameInput.value = gameData.name;
        buyInAmountInput.value = gameData.buyInAmount || 5000; // 이전 데이터에 없을 경우 대비

        // 이전 데이터에 buyInCount, chips 등이 없을 경우를 대비해 기본값 설정
        const loadedPlayers = gameData.players.map((p, index) => ({
            id: index,
            name: p.name || '',
            buyInCount: p.buyInCount || 0,
            chips: p.chips || 0,
            prize: p.prize || 0
        }));
        players = loadedPlayers;

        const needed = 12 - players.length;
        for (let i = 0; i < needed; i++) {
            players.push({ id: players.length, name: '', buyInCount: 0, chips: 0, prize: 0 });
        }
        
        sessionStorage.removeItem('gameToView');
        
        // 보기 모드일 때 바로 B페이지를 보여주기
        pageA.style.display = 'none';
        pageB.style.display = 'block';
        renderB();

    } else {
        // '새 게임 모드'일 때
        for (let i = 0; i < 12; i++) {
            players.push({ id: i, name: '', buyInCount: 0, chips: 0, prize: 0 });
        }
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        gameNameInput.value = `${month}월${day}일 ${hours}:${minutes} 링게임`;

        updateStartingChips();
        initialRenderA();
        updateTotals();
    }
});
