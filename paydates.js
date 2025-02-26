// Generate paydates for 2025 and 2026, starting from the specified pattern (06/03/2025)
const paydates = [];
let currentDate = new Date('2025-03-06T00:00:00'); // Start from the Pay Day of 06/03/2025 (a Thursday), explicit time for consistency

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

// Function to ensure a date is a Monday
function ensureMonday(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = (1 - dayOfWeek + 7) % 7; // Calculate days to next Monday
    if (daysToMonday !== 0) {
        date.setDate(date.getDate() + daysToMonday);
    }
    return date;
}

// Function to ensure a date is a Sunday
function ensureSunday(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToSunday = (0 - dayOfWeek + 7) % 7; // Calculate days to next Sunday
    if (daysToSunday !== 0) {
        date.setDate(date.getDate() + daysToSunday);
    }
    return date;
}

// Generate paydates for 2025 and 2026, every 14 days starting from 06/03/2025
const endDate = new Date('2027-01-01T00:00:00'); // Extend to cover all of 2026 (approximately 52 paydates)

while (currentDate < endDate) {
    try {
        // Pay Day is a Thursday (ensured by ensureThursday)
        ensureThursday(currentDate);

        // Week Ending is a Sunday, 2 weeks (14 days) before Pay Day
        const weekEnding = new Date(currentDate);
        weekEnding.setDate(currentDate.getDate() - 14);
        ensureSunday(weekEnding);

        // Week Starting is a Monday, 4 weeks (28 days) before Pay Day
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - 28);
        ensureMonday(weekStart);

        paydates.push({
            weekStart: formatDate(weekStart),
            weekEnding: formatDate(weekEnding),
            payDay: formatDate(currentDate)
        });

        // Move to the next Pay Day (14 days later), ensuring no day offset
        currentDate.setDate(currentDate.getDate() + 14);
    } catch (error) {
        console.error('Error generating paydate:', error, { currentDate, weekStart, weekEnding });
        throw error;
    }
}

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
        console.log(`Displayed ${tab} paydates for page ${currentPage[tab]}, total pages: ${totalPages}, total items: ${totalItems}:`, paginatedPaydates);
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
        console.log(`Changed page for ${tab} to ${currentPage[tab]}`);
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
