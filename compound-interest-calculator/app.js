// Store the account data
let accounts = [];
let accountId = 0;  // Used for unique identification of each account form

// Function to add a new account input form
function addAccountForm() {
    // Create a new account form with a unique ID
    const accountForm = document.createElement('div');
    accountForm.classList.add('account-form');
    accountForm.setAttribute('data-id', accountId);
    
    accountForm.innerHTML = `
        <div class="account-header">
            <h3 id="account-header-${accountId}">Account ${accountId + 1}</h3>
        </div>
        <div class="input-row">
            <div class="input-container">
                <input type="text" id="account-name-${accountId}" placeholder="Account Name" required>
                <input type="text" id="principal-${accountId}" placeholder="Principal ($)" required>
                <input type="text" id="monthly-contribution-${accountId}" placeholder="Monthly Contribution ($)" required>
                <input type="text" id="interest-rate-${accountId}" placeholder="Interest Rate (%)" required>
                <input type="number" id="time-period-${accountId}" placeholder="Time Period (years)" required>
            </div>
            <span class="remove-account" onclick="removeAccountForm(${accountId})">×</span> <!-- Simple "X" for removal -->
        </div>
    `;

    // Append the new form to the account list
    document.getElementById('account-list').appendChild(accountForm);

    // Add event listener to update account name header dynamically
    const accountNameInput = document.getElementById(`account-name-${accountId}`);
    accountNameInput.addEventListener('input', updateAccountHeader);

    // Add formatting to the inputs
    formatInputs(accountId);

    // Increment accountId for the next form
    accountId++;

    // Update the local storage with the new account list
    saveAccountsToLocalStorage();
}

// Format inputs with proper currency or percentage formatting
function formatInputs(accountId) {
    const principalInput = document.getElementById(`principal-${accountId}`);
    const monthlyContributionInput = document.getElementById(`monthly-contribution-${accountId}`);
    const interestRateInput = document.getElementById(`interest-rate-${accountId}`);

    // Format the principal and monthly contribution inputs as currency
    principalInput.addEventListener('blur', function() {
        principalInput.value = formatCurrency(principalInput.value);
    });
    monthlyContributionInput.addEventListener('blur', function() {
        monthlyContributionInput.value = formatCurrency(monthlyContributionInput.value);
    });

    // Format the interest rate as percentage
    interestRateInput.addEventListener('blur', function() {
        interestRateInput.value = formatPercentage(interestRateInput.value);
    });

    // Add focus events to remove formatting and allow user input
    principalInput.addEventListener('focus', function() {
        principalInput.value = removeCurrencyFormatting(principalInput.value);
    });
    monthlyContributionInput.addEventListener('focus', function() {
        monthlyContributionInput.value = removeCurrencyFormatting(monthlyContributionInput.value);
    });
    interestRateInput.addEventListener('focus', function() {
        interestRateInput.value = removePercentageFormatting(interestRateInput.value);
    });
}

// Format currency
function formatCurrency(value) {
    if (isNaN(value) || value === "") return "";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// Remove currency formatting and convert to plain number
function removeCurrencyFormatting(value) {
    return value.replace(/[^\d.-]/g, '');
}

// Format percentage
function formatPercentage(value) {
    if (isNaN(value) || value === "") return "";
    return `${parseFloat(value).toFixed(2)}%`;
}

// Remove percentage formatting and convert to plain number
function removePercentageFormatting(value) {
    return value.replace('%', '').trim();
}

// Function to update the account name header dynamically
function updateAccountHeader(event) {
    const accountId = event.target.id.split('-').pop(); // Get the account ID from the input's ID
    const accountHeader = document.getElementById(`account-header-${accountId}`);
    const accountName = event.target.value.trim();

    // Update the account header with the entered account name or keep default
    accountHeader.textContent = accountName ? accountName : `Account ${parseInt(accountId) + 1}`;
}

// Function to remove an account form
function removeAccountForm(id) {
    const formToRemove = document.querySelector(`.account-form[data-id="${id}"]`);
    formToRemove.remove();
    
    // Update the local storage after removing an account
    saveAccountsToLocalStorage();
}

// Function to calculate compound interest for all accounts
function calculateInterest() {
    let resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results
    let graphData = []; // Data for the graph

    // Loop through each account, calculate compound interest and prepare the results
    accounts.forEach(account => {
        let totalAmount = calculateCompoundAmount(account);
        displayResult(account, totalAmount);

        // Prepare graph data for this account
        graphData.push(generateGraphData(account));
    });

    // Display the graph
    displayGraph(graphData);

    // Save the account data to local storage after calculation
    saveAccountsToLocalStorage();
}

// Function to calculate compound interest for a single account
function calculateCompoundAmount(account) {
    // Time periods in years
    let timePeriods = account.timePeriod;
    let annualInterestRate = account.interestRate;

    // Case 1: No monthly contributions (annual compounding)
    if (account.monthlyContribution === 0) {
        // Use annual compounding for principal
        return (account.principal * Math.pow(1 + annualInterestRate, timePeriods)).toFixed(2);
    }

    // Case 2: Monthly contributions (annual compounding)
    let principalGrowth = account.principal * Math.pow(1 + annualInterestRate, timePeriods);

    // Calculate the growth for monthly contributions
    let contributionGrowth = 0;

    // For each month of the total time period
    for (let month = 1; month <= timePeriods * 12; month++) {
        // Calculate the number of years left for compounding for this particular contribution
        let yearsRemaining = timePeriods - (month / 12);

        // Compound this month's contribution for the remaining years
        contributionGrowth += account.monthlyContribution * Math.pow(1 + annualInterestRate, yearsRemaining);
    }

    // Total amount: compounded principal + compounded contributions
    let totalAmount = principalGrowth + contributionGrowth;

    return totalAmount.toFixed(2); // Return as fixed decimal
}

// Function to display the total amount for each account
function displayResult(account, totalAmount) {
    let resultsContainer = document.getElementById('results');
    
    let resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.innerHTML = `
        <h3>${account.accountName}</h3>
        <p>Total after ${account.timePeriod} years: ${formatCurrency(totalAmount)}</p>
    `;
    
    resultsContainer.appendChild(resultItem);
}

// Function to collect data from all the forms and store it in the accounts array
function collectAccountsData() {
    accounts = []; // Reset the accounts array

    // Loop through each form to collect data
    document.querySelectorAll('.account-form').forEach(form => {
        const accountName = document.getElementById(`account-name-${form.dataset.id}`).value;
        const principal = parseFloat(removeCurrencyFormatting(document.getElementById(`principal-${form.dataset.id}`).value));
        const monthlyContribution = parseFloat(removeCurrencyFormatting(document.getElementById(`monthly-contribution-${form.dataset.id}`).value));
        const interestRate = parseFloat(removePercentageFormatting(document.getElementById(`interest-rate-${form.dataset.id}`).value)) / 100;
        const timePeriod = parseInt(document.getElementById(`time-period-${form.dataset.id}`).value);

        // Create an account object and push it to the accounts array
        accounts.push({
            accountName,
            principal,
            monthlyContribution,
            interestRate,
            timePeriod,
        });
    });
}

// Function to save account data to localStorage
function saveAccountsToLocalStorage() {
    // Collect data and store it in localStorage as a string
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

// Function to load account data from localStorage
function loadAccountsFromLocalStorage() {
    // Retrieve the accounts from localStorage
    const storedAccounts = localStorage.getItem('accounts');
    
    if (storedAccounts) {
        // Parse the string into an object and restore the account data
        accounts = JSON.parse(storedAccounts);
        accountId = accounts.length; // Set the correct accountId based on the loaded data
        
        // Rebuild the forms on the page
        accounts.forEach(account => {
            addAccountForm();
            document.getElementById(`account-name-${accountId - 1}`).value = account.accountName;
            document.getElementById(`principal-${accountId - 1}`).value = formatCurrency(account.principal);
            document.getElementById(`monthly-contribution-${accountId - 1}`).value = formatCurrency(account.monthlyContribution);
            document.getElementById(`interest-rate-${accountId - 1}`).value = formatPercentage(account.interestRate * 100); // Convert back to percentage
            document.getElementById(`time-period-${accountId - 1}`).value = account.timePeriod;

            // Update the header with the saved account name
            updateAccountHeader({ target: document.getElementById(`account-name-${accountId - 1}`) });
        });
    }
}

// Function to generate the graph data for each account
function generateGraphData(account) {
    let timePeriods = account.timePeriod * 12; // Convert years to months
    let monthlyInterestRate = account.interestRate / 12;
    let labels = [];
    let data = [];
    
    // Get the current date as the starting point
    let currentDate = new Date();

    // Generate data for each month and label with date
    for (let i = 0; i <= timePeriods; i++) {
        let dateLabel = new Date(currentDate);
        dateLabel.setMonth(dateLabel.getMonth() + i); // Add i months to the current date

        // Format the date as 'MMM YYYY' (e.g., 'Jan 2024')
        let formattedDate = dateLabel.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        labels.push(formattedDate);

        let totalAmount = account.principal * Math.pow(1 + monthlyInterestRate, i) +
                          account.monthlyContribution * ((Math.pow(1 + monthlyInterestRate, i) - 1) / monthlyInterestRate);
        data.push(totalAmount.toFixed(2));
    }

    return {
        label: account.accountName,
        data: data,
        borderColor: getRandomColor(),
        fill: false,
        labels: labels // Ensure we include labels here
    };
}

// Function to generate a random color for each account line
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to display the graph using Chart.js
function displayGraph(graphData) {
    const ctx = document.getElementById('growth-chart').getContext('2d');

    // Destroy any previous chart
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Create a new chart with responsive options
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: graphData[0].labels, // Use the labels from the first dataset
            datasets: graphData
        },
        options: {
            responsive: true, // Enable responsiveness
            maintainAspectRatio: false, // Allow the chart to stretch in both directions
            plugins: {
                title: {
                    display: true,
                    text: 'Account Growth Over Time'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'category',  // Use category scale for date labels
                    labels: graphData[0].labels, // Labels will be actual dates
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Load accounts from localStorage when the page loads
window.onload = function() {
    loadAccountsFromLocalStorage();
};

// Event listener to trigger the calculation
document.querySelector('button[onclick="calculateInterest()"]').addEventListener('click', () => {
    collectAccountsData();  // Collect data from all forms before calculation
    calculateInterest();    // Calculate and display the results
});
