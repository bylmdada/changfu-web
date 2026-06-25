/**
 * Config for External Services
 * 
 * Instructions for User:
 * 1. Create a Google Sheet for your data (News, Jobs, Courses, etc.)
 * 2. File -> Share -> Publish to Web -> Comma-separated values (.csv)
 * 3. Copy the link and paste it below for each ID/URL.
 */

const CONFIG = {
    // Enable/Disable remote fetching（endpoints 都填好再設 true，否則徒增請求與 console 警告）
    useRemoteData: false,
    
    // Google Sheets "Publish to Web" CSV Links
    // Replace these with your actual published CSV links
    endpoints: {
        news: '', // e.g. https://docs.google.com/spreadsheets/d/.../pub?gid=0&single=true&output=csv
        jobs: '',
        courses: '',
        serviceLocations: ''
    },

    // Form Links（留空則按鈕 fallback 到站內 contact.html；填了外部表單網址才會改連外部）
    forms: {
        contact: '',
        jobApply: '',
        courseRegister: ''
    }
};

window.CONFIG = CONFIG;
