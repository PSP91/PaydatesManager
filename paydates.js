// Generate paydates for 2025, 2026, and 2027, starting from the last date in your table (06/03/2025)
const paydates = [];
let currentDate = new Date('2025-03-06'); // Start from the Pay Day of 06/03/2025 (a Thursday)

// Function to format date as DD/MM/YYYY
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Function to ensure a date is a Thursday
function ensureThursday(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday
    const daysToThursday = (4 - dayOfWeek + 7) % 7; // Calculate days to next Thursday
    if (daysToThursday !== 0) {
        date.setDate(date.getDate() + daysToThursday);
    }
    return date;
}

// Generate paydates for 3 years (2025, 2026, 2027)
for (let i = 0; i < 156; i++) { // 52 weeks/year * 3 years = 156 weeks
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - 13); // Go back 13 days to Wednesday (Week Start)
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 4) % 7); // Ensure Wednesday

    const weekEnding = new Date(weekStart);
    weekEnding.setDate(weekStart.getDate() + 6); // Add 6 days to get Tuesday (Week Ending)

    const payDay = new Date(weekEnding);
    payDay.setDate(payDay.getDate() + 14); // Add 14 days (initially, may not be Thursday)
    ensureThursday(payDay); // Ensure Pay Day is a Thursday

    paydates.push({
        weekStart: formatDate(weekStart),
        weekEnding: formatDate(weekEnding),
        payDay: formatDate(payDay)
    });

    currentDate = new Date(payDay); // Move to the next Pay Day (a Thursday)
    currentDate.setDate(currentDate.getDate() + 7); // Add 7 days for the next week
}

// Use the actual current date dynamically
const currentDateObj = new Date();

function formatDateForComparison(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

function displayPaydates() {
    const upcomingContent = document.getElementById('upcoming');
    const previousContent = document.getElementById('previous');

    upcomingContent.innerHTML = '';
    previousContent.innerHTML = '';

    // Sort upcoming paydates in descending order (most current at the top)
    const upcomingPaydates = paydates.filter(paydate => {
        const payDate = formatDateForComparison(paydate.payDay);
        return payDate > currentDateObj;
    }).sort((a, b) => {
        const dateA = formatDateForComparison(a.payDay);
        const dateB = formatDateForComparison(b.payDay);
        return dateB - dateA; // Descending order (most recent first)
    });

    // Sort previous paydates in descending order (most recent at the top)
    const previousPaydates = paydates.filter(paydate => {
        const payDate = formatDateForComparison(paydate.payDay);
        return payDate <= currentDateObj;
    }).sort((a, b) => {
        const dateA = formatDateForComparison(a.payDay);
        const dateB = formatDateForComparison(b.payDay);
        return dateB - dateA; // Descending order (most recent first)
    });

    // Display upcoming paydates
    if (upcomingPaydates.length > 0) {
        upcomingPaydates.forEach(paydate => {
            const card = document.createElement('div');
            card.className = 'paydate-card';
            card.innerHTML = `
                <h3>Pay Period</h3>
                <p><strong>Week Start:</strong> <span class="week-start">${paydate.weekStart}</span></p>
                <p><strong>Week Ending:</strong> ${paydate.weekEnding}</p>
                <p><strong>Pay Day:</strong> <span class="pay-day">${paydate.payDay}</span></p>
            `;
            upcomingContent.appendChild(card);
        });
    } else {
        upcomingContent.innerHTML = '<p>No upcoming paydates.</p>';
    }

    // Display previous paydates
    if (previousPaydates.length >
