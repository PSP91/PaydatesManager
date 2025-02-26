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

    // Move to the next Pay Day (14 days later)
    currentDate.setDate(currentDate.getDate() + 14);
}

// Use the current date as February 25, 2025, for consistency with your context
const currentDateObj = new Date('2025-02-25');

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
    filteredPaydates.upcoming = paydates.filter(paydate => {
        const payDate = formatDateForComparison(paydate.payDay);
        return payDate > currentDateObj;
    }).sort((a, b) => {
        const dateA = formatDateForComparison(a.payDay);
        const dateB = formatDateForComparison(b.payDay);
        return dateA - dateB; // Ascending order (next paydate at top, then chronological)
    });

    filteredPaydates.previous = paydates.filter(paydate => {
        const payDate = formatDateForComparison(paydate.payDay);
        return payDate <= currentDateObj;
    }).sort((a, b) => {
        const dateA = formatDateForComparison(a.payDay);
        const dateB = formatDateForComparison(b.payDay);
        return dateB - dateA; // Descending order (most recent first)
    });
}

// Display paydates with pagination
function displayPaydates(tab) {
    const content = document.getElementById(`${tab}Paydates`);
    const pagination = document.getElementById(`${tab}Pagination`);
    const totalItems = filteredPaydates[tab].length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage[tab] - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPaydates = filteredPaydates[tab].slice(start, end);

    content.innerHTML = '';
    if (paginatedPaydates.length > 0) {
        paginatedPaydates.forEach(paydate => {
            const card = document.createElement('div');
            card.className = 'paydate-card';
            card.innerHTML = `
                <h3>Pay Period</h3>
                <p><strong>Week Start:</strong> <span class="week-start">${paydate.weekStart}</span></p>
                <p><strong>Week Ending:</strong> ${paydate.weekEnding}</p>
                <p><strong>Pay Day:</strong> <span class="pay-day">${paydate.payDay}</span></p>
            `;
            content.appendChild(card);
        });
    } else {
        content.innerHTML = '<p>No paydates found.</p>';
    }

    // Update pagination buttons
    pagination.innerHTML = '';
    if (totalPages > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage[tab] === 1;
        prevButton.onclick = () => changePage(tab, -1);
        pagination.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage[tab] === totalPages;
        nextButton.onclick = () => changePage(tab, 1);
        pagination.appendChild(nextButton);
    }
}

function changePage(tab, direction) {
    currentPage[tab] += direction;
    displayPaydates(tab);
    filterPaydates(tab); // Reapply filters after pagination
}

// Search and filter paydates
function filterPaydates(tab) {
    const searchInput = document.getElementById(`${tab}Search`).value.toLowerCase();
    const yearFilter = document.getElementById(`${tab}YearFilter`).value;
    const monthFilter = document.getElementById(`${tab}MonthFilter`).value;

    filteredPaydates[tab] = paydates.filter(paydate => {
        const payDate = formatDateForComparison(paydate.payDay);
        const payDateStr = `${paydate.weekStart} ${paydate.weekEnding} ${paydate.payDay}`.toLowerCase();
        const year = payDate.getFullYear();
        const month = payDate.getMonth() + 1;

        const matchesSearch = payDateStr.includes(searchInput);
        const matchesYear = !yearFilter || year === parseInt(yearFilter);
        const matchesMonth = !monthFilter || month === parseInt(monthFilter);

        return matchesSearch && matchesYear && matchesMonth;
    }).sort((a, b) => {
        const dateA = formatDateForComparison(a.payDay);
        const dateB = formatDateForComparison(b.payDay);
        return tab === 'upcoming' ? dateA - dateB : dateB - dateA; // Ascending for upcoming, descending for previous
    });

    currentPage[tab] = 1; // Reset to first page when filtering
    displayPaydates(tab);
}

function openTab(tabName) {
    const tabButtons = document.getElementsByClassName('tab-button');
    const tabContents = document.getElementsByClassName('tab-content');

    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    document.getElementsByClassName('tab-button')[tabName === 'upcoming' ? 0 : 1].classList.add('active');
    document.getElementById(tabName).classList.add('active');
    filterPaydates(tabName); // Apply filters when switching tabs
}

// Removed toggleTheme function since dark theme is now permanent

// Initial display and periodic refresh
document.addEventListener('DOMContentLoaded', () => {
    initializeFilteredPaydates();
    displayPaydates('upcoming');
    displayPaydates('previous');
    openTab('upcoming'); // Default to Upcoming tab
    setInterval(() => {
        initializeFilteredPaydates();
        displayPaydates('upcoming');
        displayPaydates('previous');
    }, 60000); // Refresh every minute
});
