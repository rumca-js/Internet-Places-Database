importScripts('https://unpkg.com/sql.js@1.6.0/dist/sql-wasm.js')
importScripts('https://cdn.jsdelivr.net/npm/jszip/dist/jszip.min.js')
importScripts('./config.js?i=51');
importScripts('./library.js?i=' + getFileVersion());
importScripts('./database.js?i=' + getFileVersion());


let file_name = null;


async function requestFileChunksFromListLog(worker, parts) {
    let chunks = [];
    
    for (let part of parts) {
        worker.postMessage({ success: true, message_type: "message", result: "fetching file " + part + "..." });
        let chunk = await requestFileChunks(part);
        chunks.push(chunk);
    }
    
    return new Blob(chunks);
}


async function createDatabase(worker, dbFileName) {
    if (dbFileName.indexOf(".zip") !== -1) {
       console.log("createDatabase - zip");

       worker.postMessage({ success: true, message_type: "message", result: "fetching file list..."});

       let chunks = await getFilePartsList(file_name);
       if (chunks.length == 0)
       {
           worker.postMessage({ success: true, message_type: "message", result: "Cannot find files..."});
           return false;
       }

       let blob = await requestFileChunksFromListLog(worker, chunks);
       if (!blob)
       {
           worker.postMessage({ success: true, message_type: "message", result: "Cannot find file contents..."});
           return false;
       }

       worker.postMessage({ success: true, message_type: "message", result: "unpacking files..."});

       const zip = await JSZip.loadAsync(blob);

       worker.postMessage({ success: true, message_type: "message", result: "reading links from files..."});

       let data = await unPackFile(zip, blob);
       if (!data) {
           return false;
       }

       worker.postMessage({ success: true, message_type: "message", result: "creating database structure..."});

       return await createDatabaseData(data);
    }
    else if (dbFileName.indexOf(".db") !== -1) {
       console.log("createDatabase - db");

       let data = await requestFileChunksUintArray(dbFileName);
       if (!data) {
           console.log("Cannot obtain file data: " + dbFileName);
           worker.postMessage({ success: true, message_type: "message", result: "File does not exist: " + dbFileName });
           return false;
       }

       return await createDatabaseData(data);
    }
}


self.onmessage = async function (e) {
    const {fileName, query } = e.data;

    if (fileName)
    {
        file_name = fileName;
        console.log("Worker - set up file name " + file_name);

        if (!db) {
           postMessage({ success: true, message_type: "message", result: "Creating database"});

           console.log("Worker - creating DB: " + file_name);
           if (await createDatabase(self, file_name)) {
              console.log("Worker - creating DB DONE");

              postMessage({ success: true, message_type: "message", result: "Creating database DONE"});
	   }
        }
    }
    else if (query)
    {
        if (!file_name)
        {
            console.log("Worker - file name has not yet been set up");
            return;
        }

        try {
            if (!db) {
                console.log("Worker - db is not ready");
                postMessage({ success: true, message_type: "message", result: "Database is not ready"});
                return;
            }

            postMessage({ success: true, message_type: "message", result: "Executing query"});

            // Execute the query
            const result = db.exec(query);

            postMessage({ success: true, message_type: "message", result: "Unpacking results"});
            console.log("Worker - Unpacking");

            let object_list_data = { entries: [] };
            object_list_data.entries = unpackQueryResults(result);

            console.log("Worker - Sending respone");

            // Send the result back to the main thread
            postMessage({ success: true, message_type: "entries", result: object_list_data});

            postMessage({ success: true, message_type: "message", result: "Checking tables length"});

            let total_rows = await getQueryTotalRows(query);
            console.log("Worker - query total rows " + total_rows);
            postMessage({ success: true, message_type: "pagination", result: total_rows});
            console.log("Worker - DONE");

        } catch (error) {
            postMessage({ success: false, error: error.message });
        }
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
