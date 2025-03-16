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
           const dbExists = await checkIfDatabaseExists("/internet.db");

           if (!dbExists) {
               postMessage({ success: false, error: "Database 'internet.db' not found." });
               return;
           }

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
        postMessage({ success: true, message_type: "entries", result: object_list_data});

        let total_rows = await getQueryTotalRows(query);
        console.log("Worker - query total rows " + total_rows);
        postMessage({ success: true, message_type: "pagination", result: total_rows});
        console.log("Worker - DONE");

    } catch (error) {
        postMessage({ success: false, error: error.message });
    }
};



async function checkIfDatabaseExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error checking if database exists:", error);
        return false;
    }
}
