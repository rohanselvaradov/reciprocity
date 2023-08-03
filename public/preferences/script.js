document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('checkboxForm');
    const checkboxContainer = document.getElementById('checkboxContainer');

    try {
        // Fetch the checkbox data from the server-side endpoint
        const response = await fetch('/api/users');
        const data = await response.json();

        // Generate checkboxes based on the data received from the server
        data.forEach(item => {
            const checkboxLabel = document.createElement('label');
            checkboxLabel.innerHTML = `
                <input type="checkbox" name="item" value="${item}"> ${item}
            `;
            checkboxContainer.appendChild(checkboxLabel);
        });
    } catch (error) {
        console.error('Error fetching checkbox data:', error);
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        let selectedItems = [];

        formData.getAll('item').forEach(item => {
            selectedItems.push(item);
        });

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
