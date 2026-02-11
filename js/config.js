/**
 * Config for External Services
 * 
 * Instructions for User:
 * 1. Create a Google Sheet for your data (News, Jobs, Courses, etc.)
 * 2. File -> Share -> Publish to Web -> Comma-separated values (.csv)
 * 3. Copy the link and paste it below for each ID/URL.
 */

const CONFIG = {
    // Enable/Disable remote fetching
    useRemoteData: true,
    
    // Google Sheets "Publish to Web" CSV Links
    // Replace these with your actual published CSV links
    endpoints: {
        news: '', // e.g. https://docs.google.com/spreadsheets/d/.../pub?gid=0&single=true&output=csv
        jobs: '',
        courses: '',
        serviceLocations: ''
    },

    // Form Links
    forms: {
        contact: 'https://docs.google.com/forms/d/e/.../viewform',
        jobApply: 'https://docs.google.com/forms/d/e/.../viewform',
        courseRegister: 'https://docs.google.com/forms/d/e/.../viewform'
    }
};

window.CONFIG = CONFIG;
