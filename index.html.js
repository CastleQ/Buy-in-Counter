document.addEventListener('DOMContentLoaded', () => {
    const gameListDiv = document.getElementById('game-list');
    const calculateButton = document.getElementById('calculate-button');

    // let으로 변경하여 데이터 수정이 가능하게 함
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

            // 3번 수정: 삭제 버튼 추가
            gameItem.innerHTML = `
                <input type="checkbox" class="game-checkbox" data-game-id="${game.id}">
                <div class="game-info">
                    <strong>${game.name}</strong>
                    <div class="game-date">${gameDate}</div>
                </div>
                <button class="delete-button" data-game-id="${game.id}">삭제</button>
            `;
            gameListDiv.appendChild(gameItem);
        });
    }

    // 3번 수정: 삭제 기능 및 체크박스 선택 이벤트 처리
    gameListDiv.addEventListener('click', (e) => {
        // 삭제 버튼을 눌렀을 때
        if (e.target.classList.contains('delete-button')) {
            const gameIdToDelete = e.target.dataset.gameId;
            if (confirm('정말로 이 게임 기록을 삭제하시겠습니까? 되돌릴 수 없습니다.')) {
                // allGames 배열에서 해당 id를 가진 게임을 제외하고 새로 배열을 만듦
                allGames = allGames.filter(game => String(game.id) !== gameIdToDelete);
                // '비밀 일기장'에 새로운 배열로 덮어쓰기
                localStorage.setItem('holdemGames', JSON.stringify(allGames));
                // 화면 다시 그리기
                renderGameList();
            }
        }
    });

    gameListDiv.addEventListener('change', (e) => {
        // 체크박스를 눌렀을 때
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