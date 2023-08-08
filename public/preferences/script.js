document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('checkboxForm');
    const checkboxContainer = document.getElementById('checkboxContainer');

    try {
        // Fetch the names from the server-side endpoint
        const response = await fetch('/api/users');
        const data = await response.json();

        // Create a new row for the header
        const headerRow = document.createElement('tr');

        // Add a cell for the user name header
        const nameHeaderCell = document.createElement('th');
        nameHeaderCell.textContent = 'Name';
        headerRow.appendChild(nameHeaderCell);

        // Add three headers for the checkboxes
        for (let i = 1; i <= 3; i++) {
            const checkboxHeaderCell = document.createElement('th');
            checkboxHeaderCell.textContent = `Option ${i}`;
            headerRow.appendChild(checkboxHeaderCell);
        }

        // Add the header row to the table
        checkboxTable.appendChild(headerRow);

        // Generate checkboxes based on the data received from the server
        data.forEach(item => {
            // Create a new row for each user
            const row = document.createElement('tr');

            // Add a cell for the user name
            const nameCell = document.createElement('td');
            nameCell.textContent = item;
            row.appendChild(nameCell);

            // Add three checkboxes for each user
            for (let i = 1; i <= 3; i++) {
                const checkboxCell = document.createElement('td');
                const checkboxLabel = document.createElement('label');
                checkboxLabel.innerHTML = `
                <input type="checkbox" name="item-${item}-${i}" value="true">
                `; // TODO work out if `value="true"` is necessary (don't think it is, not using it later on. It gets submitted as value where key is the name of the checkbox)
                // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input/checkbox
                checkboxCell.appendChild(checkboxLabel);
                row.appendChild(checkboxCell);
            }

            // Add the row to the table
            checkboxTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching checkbox data:', error);
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        let selectedItems = {};

        for (const [key, value] of formData.entries()) {
            const [itemName, userName, checkboxNumber] = key.split('-');
            if (!selectedItems[userName]) {
                selectedItems[userName] = [];
            }
            selectedItems[userName].push(checkboxNumber);
        }

        try {
            // Send the selectedItems array to the server using an AJAX request with async/await
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedItems: selectedItems })
            });

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    });
});
