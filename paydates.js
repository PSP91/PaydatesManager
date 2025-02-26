// Generate paydates for 2025, 2026, and 2027, starting from the specified pattern (06/03/2025)
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

// Generate paydates for 3 years (2025, 2026, 2027), every 14 days starting from 06/03/2025
const endDate = new Date('2028-03-06'); // Extend to cover 2027 fully (approximately 78 paydates every 14 days over 3 years)
while (currentDate < endDate) {
    // Pay Day is a Thursday (ensured by ensureThursday)
    ensureThursday(currentDate);

    // Week Ending is 9 days before Pay Day
    const weekEnding = new Date(currentDate);
    weekEnding.setDate(currentDate.getDate() - 9);

    // Week Starting is 14 days before Week Ending
    const weekStart = new Date(weekEnding);
    weekStart.setDate(weekEnding.getDate() - 14);

    // Verify the pattern matches your specification
    if (formatDate(currentDate) === '06/03/2025') {
        // Ensure the first paydate matches exactly: Pay Day 06/03/2025, Week Ending 23/02/2025, Week Starting 10/02/2025
        paydates.push({
            weekStart: '10/02/2025',
            weekEnding: '23/02/2025',
            payDay: '06/03/2025'
        });
    } else {
        paydates.push({
            weekStart: formatDate(weekStart),
            weekEnding: formatDate(weekEnding),
            payDay: formatDate(currentDate)
        });
    }

    // Move to the next Pay Day
