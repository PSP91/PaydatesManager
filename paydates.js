// Global variables (using window to ensure global scope)
window.paydates = [];
window.currentDate = new Date('2025-03-06T00:00:00'); // Start from the Pay Day of 06/03/2025 (a Thursday), explicit time for consistency
window.filteredPaydates = { upcoming: [], previous: [] }; // Ensure filteredPaydates is defined globally
window.visibleItems = { upcoming: 10, previous: 10 }; // Initial 10 items visible for each tab

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
const endDate = new Date('2027-01-01T00:00:00'); // Extend to cover all of 2026 (approximately 48 paydates)

while (window.currentDate < endDate) {
    try {
        // Pay Day is a Thursday (ensured by ensureThursday)
        ensureThursday(window.currentDate);

        // Week Ending is a Sunday, 2 weeks (14 days) before Pay Day
        const weekEnding = new Date(window.currentDate);
        weekEnding.setDate(window.currentDate.getDate() - 14);
        ensureSunday(weekEnding);

        // Week Starting is a Monday, 4 weeks (28 days) before Pay Day
        const weekStart = new Date(window.currentDate);
        weekStart.setDate(window.currentDate.getDate() - 28);
        ensureMonday(weekStart);

        window.paydates.push({
            weekStart: formatDate(weekStart),
            weekEnding: formatDate(weekEnding),
            payDay: formatDate(window.currentDate)
        });

        // Move to the next Pay Day (14 days later), ensuring no day offset
        window.currentDate.setDate(window.currentDate.getDate() + 14);
    } catch (error) {
        console.error('Error generating paydate:', error, { currentDate: window.currentDate, weekStart, weekEnding });
        throw error;
    }
}

console.log('Paydates generated (total):', window.paydates.length, window.paydates);

// Use the current date as February 25, 2025, for consistency with your context
const currentDateObj = new Date('2025-02-25T00:00:00');

function formatDateForComparison(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0); // Explicitly set time to midnight for consistency
}

// Show More settings
const itemsPerLoad = 10;

// Initialize filtered paydates
function initializeFilteredPaydates() {
    try {
        console.log('Initializing filtered paydates...');
        window.filteredPaydates.upcoming = window.paydates.filter(paydate => {
            const payDate = formatDateForComparison(paydate.payDay);
            return payDate > currentDateObj;
        }).sort((a, b) => {
            const dateA = formatDateForComparison(a.payDay);
            const dateB = formatDateForComparison(b.payDay);
            return dateA - dateB; // Ascending order (next paydate at top, then chronological)
        });

        window.filteredPaydates.previous = window.paydates.filter(paydate => {
            const payDate = formatDateForComparison(paydate.payDay);
            return payDate <= currentDateObj;
        }).sort((a, b) => {
            const dateA = formatDateForComparison(a.payDay);
            const dateB = formatDateForComparison(b.payDay);
            return dateB - dateA; // Descending order (most recent first)
        });
        console.log('Filtered paydates initialized (upcoming, previous):', { upcoming: window.filteredPaydates.upcoming.length, previous: window.filteredPaydates.previous.length });
        displayPaydates('upcoming'); // Display initial paydates after initialization
        displayPaydates('previous');
    } catch (error) {
        console.error('Error initializing filtered paydates:', error);
        throw error;
    }
}

// Display paydates with "Show More" functionality
function displayPaydates(tab) {
    try {
        console.log(`Attempting to display ${tab} paydates: window.visibleItems[${tab}] = ${window.visibleItems[tab]}, window.filteredPaydates[${tab}].length = ${window.filteredPaydates[tab]?.length || 'undefined'}`);
        const content = document.getElementById(`${tab}Paydates`);
        const showMoreButton = document.querySelector(`#${tab}ShowMore.show-more-button`); // Use querySelector to ensure matching class
        const errorElement = document.getElementById(`${tab}Error`);

        if (!content || !showMoreButton || !errorElement) {
            console.error(`DOM elements not found for ${tab}: content=${content}, showMoreButton=${showMoreButton}, errorElement=${errorElement}`);
            throw new Error(`DOM elements for ${tab} are missing`);
        }

        const totalItems = window.filteredPaydates[tab]?.length || 0;
        if (totalItems === 0) {
            console.warn(`No paydates available for ${tab} in filteredPaydates`);
        }
        const end = Math.min(window.visibleItems[tab] || 10, totalItems); // Default to 10 if window.visibleItems[tab] is undefined
        const paginatedPaydates = window.filteredPaydates[tab]?.slice(0, end) || [];

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

        // Update "Show More" button state
        showMoreButton.disabled = end >= totalItems;
        console.log(`Displayed ${tab} paydates, showing ${end} of ${totalItems} items:`, paginatedPaydates);
    } catch (error) {
        console.error(`Error displaying ${tab} paydates:`, error);
        const errorElement = document.getElementById(`${tab}Error`);
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error loading ${tab} paydates. Check console for details: ${error.message}`;
        }
    }
}

function showMore(tab) {
    try {
        console.log(`Attempting to show more for ${tab}: window.visibleItems[${tab}] = ${window.visibleItems[tab]}, window.filteredPaydates[${tab}].length = ${window.filteredPaydates[tab]?.length || 'undefined'}`);
        if (!window.filteredPaydates[tab] || window.filteredPaydates[tab].length === 0) {
            console.error(`No paydates available for ${tab} in filteredPaydates`);
            throw new Error(`No paydates available for ${tab}`);
        }
        if (!window.visibleItems[tab] || isNaN(window.visibleItems[tab])) {
            window.visibleItems[tab] = 10; // Reset to default if undefined or NaN
            console.warn(`window.visibleItems[${tab}] was invalid (${window.visibleItems[tab]}), reset to 10`);
        }
        window.visibleItems[tab] = (window.visibleItems[tab] || 10) + itemsPerLoad; // Force update and ensure increment
        console.log(`Before displayPaydates: window.visibleItems[${tab}] = ${window.visibleItems[tab]}`);
        displayPaydates(tab);
        filterPaydates(tab); // Reapply filters after showing more
        console.log(`After displayPaydates: window.visibleItems[${tab}] = ${window.visibleItems[tab]}, Show More clicked for ${tab}, now showing ${window.visibleItems[tab]} items`);
    } catch (error) {
        console.error(`Error showing more for ${tab}:`, error);
    }
}

// Search and filter paydates
function filterPaydates(tab) {
    try {
        console.log(`Filtering ${tab} paydates: searchInput, yearFilter, monthFilter`);
        const searchInput = document.getElementById(`${tab}Search`)?.value.toLowerCase() || '';
        const yearFilter = document.getElementById(`${tab}YearFilter`)?.value || '';
        const monthFilter = document.getElementById(`${tab}MonthFilter`)?.value || '';

        window.filteredPaydates[tab] = window.paydates.filter(paydate => {
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

        window.visibleItems[tab] = Math.min(10, window.filteredPaydates[tab].length || 0); // Reset to show first 10 items after filtering, handle undefined
        displayPaydates(tab);
        console.log(`Filtered ${tab} paydates (count):`, window.filteredPaydates[tab].length);
    } catch (error) {
        console.error(`Error filtering ${tab} paydates:`, error);
    }
}

function openTab(tabName) {
    try {
        console.log(`Opening tab: ${tabName}`);
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
        console.log('DOM loaded, initializing paydates and testing "Show More" button...');
        initializeFilteredPaydates();
        displayPaydates('upcoming');
        displayPaydates('previous');
        openTab('upcoming'); // Default to Upcoming tab

        // Test and ensure "Show More" button event listeners
        const upcomingShowMore = document.getElementById('upcomingShowMore');
        const previousShowMore = document.getElementById('previousShowMore');
        if (upcomingShowMore) {
            console.log('Found upcomingShowMore button, attaching event listener...');
            upcomingShowMore.addEventListener('click', () => {
                console.log('Upcoming Show More clicked via addEventListener');
                showMore('upcoming');
            });
            // Verify the onclick attribute works
            upcomingShowMore.onclick = () => {
                console.log('Upcoming Show More clicked via onclick attribute');
                showMore('upcoming');
            };
        } else {
            console.error('upcomingShowMore button not found in DOM');
        }
        if (previousShowMore) {
            console.log('Found previousShowMore button, attaching event listener...');
            previousShowMore.addEventListener('click', () => {
                console.log('Previous Show More clicked via addEventListener');
                showMore('previous');
            });
            previousShowMore.onclick = () => {
                console.log('Previous Show More clicked via onclick attribute');
                showMore('previous');
            };
        } else {
            console.error('previousShowMore button not found in DOM');
        }

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
