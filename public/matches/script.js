document.addEventListener('DOMContentLoaded', async function () {
    const table = document.getElementById('matchesTable');

    try {
        // Fetch the matches from the server-side endpoint
        const response = await fetch('/api/matches');
        const data = await response.json();

        for (const key in data) {
            // again, says you should do the if (jsonObject.hasOwnProperty(key)) check. NOTE work out if necessary
            const values = data[key];
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const valueCell = document.createElement('td');

            keyCell.textContent = key;
            valueCell.textContent = values;

            row.appendChild(keyCell);
            row.appendChild(valueCell);

            table.appendChild(row);
        }
    } catch (err) {
        console.error(err);
    }
});