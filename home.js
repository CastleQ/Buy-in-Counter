document.addEventListener('DOMContentLoaded', () => {
    const gameListDiv = document.getElementById('game-list');
    const calculateButton = document.getElementById('calculate-button');

    let allGames = JSON.parse(localStorage.getItem('holdemGames')) || [];

    function renderGameList() {
        if (allGames.length === 0) {
            gameListDiv.innerHTML = '<p>아직 기록된 게임이 없습니다.</p>';
            calculateButton.style.display = 'none';
            return;
        }

        allGames.sort((a, b) => b.id - a.id);
        gameListDiv.innerHTML = '';
        allGames.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            const gameDate = new Date(game.id).toLocaleString();
            gameItem.innerHTML = `
                <input type="checkbox" class="game-checkbox" data-game-id="${game.id}">
                <div class="game-info">
                    <strong>${game.name}</strong>
                    <div class="game-date">${gameDate}</div>
                </div>
                <button class="view-button" data-game-id="${game.id}">보기</button>
                <button class="delete-button" data-game-id="${game.id}">삭제</button>
            `;
            gameListDiv.appendChild(gameItem);
        });
    }

    gameListDiv.addEventListener('click', (e) => {
        const gameId = e.target.dataset.gameId;
        if (!gameId) return;

        // 보기 버튼 눌렀을 때
        if (e.target.classList.contains('view-button')) {
            const gameToView = allGames.find(game => String(game.id) === gameId);
            if (gameToView) {
                sessionStorage.setItem('gameToView', JSON.stringify(gameToView));
                window.location.href = 'game.html';
            }
        }

        // 삭제 버튼을 눌렀을 때
        if (e.target.classList.contains('delete-button')) {
            if (confirm('정말로 이 게임 기록을 삭제하시겠습니까? 되돌릴 수 없습니다.')) {
                allGames = allGames.filter(game => String(game.id) !== gameId);
                localStorage.setItem('holdemGames', JSON.stringify(allGames));
                renderGameList();
            }
        }
    });

    gameListDiv.addEventListener('change', (e) => {
        if (e.target.classList.contains('game-checkbox')) {
            const gameItem = e.target.closest('.game-item');
            if (e.target.checked) {
                gameItem.classList.add('is-checked');
            } else {
                gameItem.classList.remove('is-checked');
            }
        }
    });

    calculateButton.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('#game-list input[type="checkbox"]:checked');
        if (selectedCheckboxes.length === 0) {
            alert('정산할 게임을 하나 이상 선택해주세요.');
            return;
        }
        const selectedGameIds = [];
        selectedCheckboxes.forEach(checkbox => {
            selectedGameIds.push(checkbox.dataset.gameId);
        });
        sessionStorage.setItem('selectedGameIds', JSON.stringify(selectedGameIds));
        window.location.href = 'summary.html';
    });

    renderGameList();
});