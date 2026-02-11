/**
 * API Service for Changfu Web
 * Handles fetching data from Google Sheets (CSV) or falling back to local JSON.
 */

const API = {
    /**
     * Parse CSV string to Array of Objects
     * Assumes first row is header.
     */
    parseCSV: (csvText) => {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        return lines.slice(1).filter(line => line.trim()).map(line => {
            // Handle comma inside quotes: "Hello, World",123
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim().replace(/^"|"$/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim().replace(/^"|"$/g, '')); // Last value

            return headers.reduce((obj, header, index) => {
                obj[header] = values[index] !== undefined ? values[index] : '';
                return obj;
            }, {});
        });
    },

    /**
     * Fetch Data
     * @param {string} type - 'news', 'jobs', 'courses'
     */
    fetchData: async (type) => {
        // 1. Try Remote CSV if configured
        if (window.CONFIG && window.CONFIG.useRemoteData && window.CONFIG.endpoints[type]) {
            try {
                const response = await fetch(window.CONFIG.endpoints[type]);
                if (!response.ok) throw new Error(`Failed to fetch ${type} CSV`);
                const csvText = await response.text();
                const data = API.parseCSV(csvText);
                console.log(`Loaded ${type} from Google Sheets`, data);
                return data;
            } catch (error) {
                console.warn(`Error loading remote ${type}, falling back to local.`, error);
            }
        }

        // 2. Fallback to Local JSON
        // Since we load the whole site-data.json typically, we might just return that part
        // But here we might want to fetch the JSON file if it hasn't been loaded
        if (window.siteData && window.siteData[type]) {
            return window.siteData[type];
        }

        try {
            const response = await fetch('data/site-data.json');
            const fullData = await response.json();
            // Cache full data globally if not exists
            if (!window.siteData) window.siteData = fullData;
            return fullData[type] || [];
        } catch (error) {
            console.error('Critical: Failed to load local site data.', error);
            return [];
        }
    },

    /**
     * Load all initial data
     */
    init: async () => {
        // We can load specific dynamic parts here if needed
        // For now, main.js usually loads site-data.json globally.
        // We will modify main.js to use API.fetchData for specific sections if they are dynamic.
        console.log('API Service Initialized');
    }
};

window.API = API;
