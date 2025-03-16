//importScripts('https://code.jquery.com/jquery-3.7.1.min.js')
importScripts('https://unpkg.com/sql.js@1.6.0/dist/sql-wasm.js')
importScripts('https://cdn.jsdelivr.net/npm/jszip/dist/jszip.min.js')
importScripts('/scripts/library.js?i=41');
importScripts('/scripts/database.js?i=' + getFileVersion());


let db = null;


self.onmessage = async function (e) {
    const { query } = e.data;

    try {
        // If the database isn't already loaded, load it from binary data
        if (!db) {
	   console.log("Worker - creating DB");
           await createDatabase("internet.db");
	   console.log("Worker - creating DB DONE");
        }

        // Execute the query
        const result = db.exec(query);

	console.log("Worker - Unpacking");

        let object_list_data = { entries: [] };
        object_list_data.entries = unpackQueryResults(result);

	console.log("Worker - Sending respone");

        // Send the result back to the main thread
        postMessage({ success: true, result: object_list_data});
    } catch (error) {
        postMessage({ success: false, error: error.message });
    }
};
