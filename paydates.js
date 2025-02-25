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

// Generate paydates for 3 years (2025, 2026, 2027), every 14 days starting from 06/03/2025
const endDate = new Date('2028-03-06'); // Extend to cover 2027 fully
while (currentDate < endDate) {
    // Pay Day is a Thursday (ensured by ensureThursday)
    ensureThursday(currentDate);

    // Week Ending is 9 days before Pay Day
    const weekEnding = new Date(currentDate);
    weekEnding.setDate(currentDate.getDate() - 9);

    // Week Starting is 14 days before Week Ending
    const weekStart = new Date(weekEnding);
    weekStart.setDate(weekEnding.getDate() - 14);

    paydates.push({
        weekStart: formatDate(weekStart),
        weekEnding: formatDate(weekEnding),
        payDay: formatDate(currentDate)
    });

    // Move to the next Pay Day (14 days later)
    currentDate.setDate(currentDate.getDate() + 14);
}

// Use the actual current date dynamically
const currentDateObj = new Date();

function formatDateForComparison(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Pagination settings
const itemsPerPage = 10;
let currentPage = { upcoming: 1, previous: 1 };
let filteredPaydates = { upcoming: [], previous: [] };

// Initialize filtered paydates
function initializeFilteredPaydates() {
    filtered
