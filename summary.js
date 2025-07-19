document.addEventListener('DOMContentLoaded', () => {
    const selectedGameIds = JSON.parse(sessionStorage.getItem('selectedGameIds'));
    const allGames = JSON.parse(localStorage.getItem('holdemGames')) || [];
    const finalSummaryTableBody = document.querySelector('#final-summary-table tbody');

    if (!selectedGameIds || selectedGameIds.length === 0) {
        finalSummaryTableBody.innerHTML = '<tr><td colspan="2">홈페이지에서 정산할 게임을 선택해주세요.</td></tr>';
        return;
    }

    const selectedGames = allGames.filter(game => selectedGameIds.includes(String(game.id)));
    const finalTally = {};

    selectedGames.forEach(game => {
        game.players.forEach(player => {
            if (!finalTally[player.name]) {
                finalTally[player.name] = 0;
            }
            finalTally[player.name] += player.prize;
        });
    });

    finalSummaryTableBody.innerHTML = '';
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

    sessionStorage.removeItem('selectedGameIds');
});
