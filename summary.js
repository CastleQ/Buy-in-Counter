document.addEventListener('DOMContentLoaded', () => {
    // ## 1. 데이터 불러오기
    
    // 홈페이지에서 임시저장소(sessionStorage)에 저장해 둔 '선택된 게임 ID 목록'을 가져옵니다.
    const selectedGameIds = JSON.parse(sessionStorage.getItem('selectedGameIds'));
    
    // '나만의 비밀 일기장(localStorage)'에서 모든 게임 기록을 가져옵니다.
    const allGames = JSON.parse(localStorage.getItem('holdemGames')) || [];
    
    // 최종 결과를 표시할 표의 tbody 부분을 찾아 별명을 붙입니다.
    const finalSummaryTableBody = document.querySelector('#final-summary-table tbody');

    // 만약 선택된 게임이 없다면, 안내 메시지를 표시하고 종료합니다.
    if (!selectedGameIds || selectedGameIds.length === 0) {
        finalSummaryTableBody.innerHTML = '<tr><td colspan="2">홈페이지에서 정산할 게임을 선택해주세요.</td></tr>';
        return;
    }

    // ## 2. 데이터 계산하기

    // 전체 게임 기록 중에서, 우리가 선택한 게임들만 골라냅니다.
    const selectedGames = allGames.filter(game => selectedGameIds.includes(String(game.id)));

    // 플레이어별 최종 프라이즈를 합산할 통장(객체)을 만듭니다.
    const finalTally = {};

    // 선택된 게임들을 하나씩 돌면서 계산을 시작합니다.
    selectedGames.forEach(game => {
        // 각 게임에 참여한 플레이어들을 또 한 명씩 돌면서 계산합니다.
        game.players.forEach(player => {
            // 만약 통장에 해당 플레이어의 이름이 없다면, 새로 만들어 0원으로 시작합니다.
            if (!finalTally[player.name]) {
                finalTally[player.name] = 0;
            }
            // 기존 금액에 이번 게임의 프라이즈를 더합니다.
            finalTally[player.name] += player.prize;
        });
    });

    // ## 3. 계산 결과 화면에 그리기

    finalSummaryTableBody.innerHTML = ''; // 표를 깨끗이 비웁니다.

    // 최종 합산된 통장(finalTally)의 모든 플레이어 정보를 하나씩 표에 추가합니다.
    for (const playerName in finalTally) {
        const totalPrize = finalTally[playerName];
        const prizeClass = totalPrize > 0 ? 'prize-plus' : (totalPrize < 0 ? 'prize-minus' : '');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${playerName}</td>
            <td class="${prizeClass}">₩${totalPrize.toLocaleString()}</td>
        `;
        finalSummaryTableBody.appendChild(row);
    }

    // 사용이 끝난 임시저장소는 깨끗이 비웁니다.
    sessionStorage.removeItem('selectedGameIds');
});