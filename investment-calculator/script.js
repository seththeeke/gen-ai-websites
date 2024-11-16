document.addEventListener('DOMContentLoaded', function () {
    let chart;

    // Currency formatter
    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    // Ensure elements are available before adding event listeners
    const calculateBtn = document.getElementById('calculateBtn');
    if (!calculateBtn) {
        console.error('Calculate button not found');
        return; // Exit if the button is not found
    }

    // Event listener for Calculate Button
    calculateBtn.addEventListener('click', function () {
        const homePrice = parseFloat(document.getElementById('homePrice').value);
        const downPayment = parseFloat(document.getElementById('downPaymentFixed').value);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const propertyTaxRate = parseFloat(document.getElementById('propertyTaxRate').value) / 100 || 0;
        const homeInsurance = parseFloat(document.getElementById('homeInsurance').value) || 0;
        const additionalFees = parseFloat(document.getElementById('additionalFees').value) || 0; // New field
        const rentEstimate = parseFloat(document.getElementById('rentEstimate').value);

        if (!homePrice || !downPayment || !annualInterestRate || !loanTerm || !rentEstimate) {
            alert('Please fill out all required fields!');
            return;
        }

        const loanAmount = homePrice - downPayment;
        const monthlyInterestRate = annualInterestRate / 12;
        const numberOfPayments = loanTerm * 12;

        const monthlyMortgage =
            (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
        const monthlyTax = (homePrice * propertyTaxRate) / 12;
        const monthlyPayment = monthlyMortgage + monthlyTax + homeInsurance + additionalFees; // Add additional fees

        const totalPaid = monthlyPayment * numberOfPayments + downPayment;
        const totalInterest = totalPaid - loanAmount;

        // Display Monthly Payment at the top of Breakdown
        document.getElementById('totalMonthlyPayment').textContent = `Total Monthly Payment: ${formatCurrency(monthlyPayment)}`;

        const breakdownHTML = `
            <li>Principal & Interest: ${formatCurrency(monthlyMortgage)}</li>
            <li>Property Taxes: ${formatCurrency(monthlyTax)}</li>
            <li>Home Insurance: ${formatCurrency(homeInsurance)}</li>
            <li>Additional Fees: ${formatCurrency(additionalFees)}</li> <!-- New entry -->
        `;
        document.getElementById('paymentBreakdown').innerHTML = breakdownHTML;

        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
        document.getElementById('totalAmount').textContent = formatCurrency(totalPaid);

        const labels = [];
        const cumulativePaidData = [downPayment]; // Start with the down payment
        const cumulativeRentData = [0];
        let cumulativeRent = 0;

        // Calculate cumulative paid and rent values including the down payment
        for (let i = 1; i <= numberOfPayments; i++) {
            cumulativeRent += rentEstimate;
            cumulativePaidData.push(downPayment + i * monthlyPayment); // Include down payment in cumulative paid
            cumulativeRentData.push(cumulativeRent);

            labels.push(`Month ${i}`);
        }

        // Calculate Breakeven point (Cumulative rent >= Cumulative total paid)
        const breakevenIndex = cumulativePaidData.findIndex(
            (totalPaid, index) => cumulativeRentData[index] >= totalPaid
        );

        const breakevenText = breakevenIndex === -1
            ? 'No breakeven point within the loan term.'
            : `Breakeven at Month ${breakevenIndex} (${Math.floor(breakevenIndex / 12)} years and ${breakevenIndex % 12} months)`;

        document.getElementById('breakevenPoint').textContent = breakevenText;

        // Destroy previous chart if it exists
        if (chart) chart.destroy();

        // Create a single graph showing both amortization and cumulative rent data
        const amortizationCtx = document.getElementById('amortizationChart').getContext('2d');
        chart = new Chart(amortizationCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Cumulative Rent Paid',
                        data: cumulativeRentData,
                        borderColor: 'orange',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        fill: true,
                    },
                    {
                        label: 'Cumulative Total Paid',
                        data: cumulativePaidData,
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        fill: true,
                    },
                ],
            },
        });

        // Breakeven time calculation function
        const breakevenTime = calculateBreakevenTime(cumulativePaidData, cumulativeRentData);
        document.getElementById('breakevenTime').textContent = `Breakeven Time: ${breakevenTime}`;
    });

    // Link Down Payment % and Amount inputs
    const downPaymentPercentInput = document.getElementById('downPaymentPercent');
    const downPaymentFixedInput = document.getElementById('downPaymentFixed');

    if (downPaymentPercentInput && downPaymentFixedInput) {
        downPaymentPercentInput.addEventListener('input', function () {
            const homePrice = parseFloat(document.getElementById('homePrice').value);
            const percent = parseFloat(this.value);
            const downPaymentFixed = (homePrice * percent) / 100;
            downPaymentFixedInput.value = downPaymentFixed.toFixed(2);
        });

        downPaymentFixedInput.addEventListener('input', function () {
            const homePrice = parseFloat(document.getElementById('homePrice').value);
            const fixedAmount = parseFloat(this.value);
            const percent = (fixedAmount / homePrice) * 100;
            downPaymentPercentInput.value = percent.toFixed(2);
        });
    }

    // Function to calculate Breakeven Time
    function calculateBreakevenTime(cumulativePaidData, cumulativeRentData) {
        const breakevenIndex = cumulativePaidData.findIndex(
            (totalPaid, index) => cumulativeRentData[index] >= totalPaid // Corrected condition to check rent vs. paid
        );
        if (breakevenIndex === -1) {
            return 'No breakeven within loan term';
        }
        return `${Math.floor(breakevenIndex / 12)} years and ${breakevenIndex % 12} months`;
    }
});
