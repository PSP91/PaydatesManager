// Generate paydates for 2025, 2026, and 2027, starting from the specified pattern (06/03/2025)
const paydates = [];

// Manually define the initial paydates based on your specification from the document
const initialPaydates = [
    { payDay: '06/03/2025', weekStart: '10/02/2025', weekEnding: '23/02/2025' },
    { payDay: '20/03/2025', weekStart: '24/02/2025', weekEnding: '09/03/2025' },
    { payDay: '03/04/2025', weekStart: '10/03/2025', weekEnding: '23/03/2025' },
    { payDay: '17/04/2025', weekStart: '24/03/2025', weekEnding: '07/04/2025' },
    { payDay: '01/05/2025', weekStart: '07/04/2025', weekEnding: '21/04/2025' },
    { payDay: '15/05/2025', weekStart: '21/04/2025', weekEnding: '05/05/2025' },
    { payDay: '29/05/2025', weekStart: '05/05/2025', weekEnding: '19/05/2025' },
    { payDay: '12/06/2025', weekStart: '19/05/2025', weekEnding: '02/06/2025' },
    { payDay: '26/06/2025', weekStart: '02/06/2025', weekEnding: '16/06/2025' }
    // Continue with the pattern if you have more dates in the document, ensuring every 14 days and Thursdays
];

// Function to format date as DD/MM/YYYY
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Function to parse date from DD/MM/YYYY string
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0); // Explicitly set time to midnight for consistency
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

// Generate subsequent paydates every 14 days, starting from the last initial paydate (26/06/2025)
let lastPayDate = parseDate('26/06/2025');
const endDate = new Date('2028-03-06T00:00:00'); // Extend to cover 2027 fully (approximately 78 paydates)

while (lastPayDate < endDate) {
    try {
        // Move to the next Pay Day (14 days later)
        lastPayDate.setDate(lastPayDate.getDate() + 14);
        ensureThursday(lastPayDate); // Ensure Pay Day is a Thursday

        // Week Ending is 9 days before Pay Day
        const weekEnding = new Date(lastPayDate);
        weekEnding.setDate(lastPayDate.getDate() - 9);

        // Week Starting is 14 days before Week Ending
        const weekStart = new Date(weekEnding);
        weekStart.setDate(weekEnding.getDate() - 14);

        paydates.push({
            weekStart: formatDate(weekStart),
            weekEnding: formatDate(weekEnding),
            payDay: formatDate(lastPayDate)
        });
    } catch (error) {
        console.error('Error generating paydate:', error, { lastPayDate, weekStart, weekEnding });
        throw error;
    }
}

// Combine initial paydates with generated paydates
paydates.unshift(...initialPaydates);

console.log('Paydates generated:', paydates);

// Use the current date as February 25, 2025, for consistency with your context
const currentDateObj = new Date('2025-02-25T00:00:00');

function formatDateForComparison(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0); // Explicitly set time to midnight for consistency
}

// Pagination settings
const itemsPerPage = 10;
let currentPage = { upcoming: 1, previous: 1 };
let filteredPaydates = { upcoming: [], previous: [] };

// Initialize filtered paydates
function initializeFilteredPaydates() {
    try {
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
        console.log('Filtered paydates initialized:', { upcoming: filteredPaydates.upcoming, previous: filteredPaydates.previous });
    } catch (error) {
        console.error('Error initializing filtered paydates:', error);
        throw error;
    }
}

// Display paydates with pagination
function displayPaydates(tab) {
    try {
        const content = document.getElementById(`${tab}Paydates`);
        const pagination = document.getElementById(`${tab}Pagination`);
        const errorElement = document.getElementById(`${tab}Error`);
        const totalItems = filteredPaydates[tab].length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const start = (currentPage[tab] - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedPaydates = filteredPaydates[tab].slice(start, end);

        content.innerHTML = '';
        errorElement.style.display = 'none';
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
        console.log(`Displayed ${tab} paydates for page ${currentPage[tab]}:`, paginatedPaydates);
    } catch (error) {
        console.error(`Error displaying ${tab} paydates:`, error);
        const errorElement = document.getElementById(`${tab}Error`);
        errorElement.style.display = 'block';
    }
}

function changePage(tab, direction) {
    try {
        currentPage[tab] += direction;
        displayPaydates(tab);
        filterPaydates(tab); // Reapply filters after pagination
    } catch (error) {
        console.error(`Error changing page for ${tab}:`, error);
    }
}

// Search and filter paydates
function filterPaydates(tab) {
    try {
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
        console.log(`Filtered ${tab} paydates:`, filteredPaydates[tab]);
    } catch (error) {
        console.error(`Error filtering ${tab} paydates:`, error);
    }
}

function openTab(tabName) {
    try {
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
        console.log(`Opened tab: ${tabName}`);
    } catch (error) {
        console.error('Error opening tab:', error);
    }
}

function toggleTheme() {
    try {
        const body = document.body;
        console.log('Toggling theme, current theme:', body.getAttribute('data-theme'));
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            console.log('Switched to light theme');
        } else {
            body.setAttribute('data-theme', 'dark');
            console.log('Switched to dark theme');
        }
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

// Initial display and periodic refresh
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, initializing paydates...');
        initializeFilteredPaydates();
        displayPaydates('upcoming');
        displayPaydates('previous');
        openTab('upcoming'); // Default to Upcoming tab
        setInterval(() => {
            console.log('Refreshing paydates...');
            initializeFilteredPaydates();
            displayPaydates('upcoming');
            displayPaydates('previous');
        }, 60000); // Refresh every minute
    } catch (error) {
        console.error('Error on page load:', error);
    }
});
