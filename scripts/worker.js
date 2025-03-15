importScripts('https://unpkg.com/sql.js@1.6.0/dist/sql-wasm.js')
importScripts('https://cdn.jsdelivr.net/npm/jszip/dist/jszip.min.js')
importScripts('scripts/database.js');
importScripts('scripts/library.js');


self.onmessage = async function (e) {
    const { query } = e.data;

    try {
        // If the database isn't already loaded, load it from binary data
        if (!db) {
           createDatabase("internet.db");
        }

        // Execute the query
        const result = db.exec(query);

        // Send the result back to the main thread
        postMessage({ success: true, result });
    } catch (error) {
        postMessage({ success: false, error: error.message });
    }
};



/*
let worker;

async function initWorker() {
    worker = new Worker('worker.js');

    worker.onmessage = function (e) {
        const { success, result, error } = e.data;
        if (success) {
            console.log('Query result:', result);
        } else {
            console.error('Worker error:', error);
        }
    };
}

async function loadDatabaseAndQuery() {
    const query = "SELECT * FROM my_table";  // Your SQL query

    // Send the database binary to the worker for the first time to load it
    worker.postMessage({ query });

    // After the first load, you only need to send the query
    worker.onmessage = function (e) {
        // The worker will process the query and send the result
        const { success, result } = e.data;
        if (success) {
            console.log('Query result:', result);
        }
    };
}

// Initialize the worker and load the database
initWorker().then(() => {
    loadDatabaseAndQuery();
});
 */
