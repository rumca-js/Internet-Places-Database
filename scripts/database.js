/**
   _____  ____  _      _ _         _                                                    
  / ____|/ __ \| |    (_) |       (_)                                                   
 | (___ | |  | | |     _| |_ ___   _ ___    __ ___      _____  ___  ___  _ __ ___   ___ 
  \___ \| |  | | |    | | __/ _ \ | / __|  / _` \ \ /\ / / _ \/ __|/ _ \| '_ ` _ \ / _ \
  ____) | |__| | |____| | ||  __/ | \__ \ | (_| |\ V  V /  __/\__ \ (_) | | | | | |  __/
 |_____/ \___\_\______|_|\__\___| |_|___/  \__,_| \_/\_/ \___||___/\___/|_| |_| |_|\___|
*/

function getSelectColumns() {
    return "id, link, title, description, date_published, thumbnail, author, album, language, permanent, bookmarked, age, status_code, manual_status_code, page_rating, page_rating_votes, page_rating_contents";
}


function unpackQueryResults(res) {
    results = [];

    if (res.length > 0) {
       const rows = res[0].values;
       
       rows.forEach(row => {
         let tags = selectEntryTags(row[0]);

         const data = {
           id: row[0],
           link: row[1],
           title: row[2],
           description: row[3],
           date_published: row[4],
           thumbnail: row[5],
           author: row[6],
           album: row[7],
           language: row[8],
           permanent: row[9],
           bookmarked: row[10],
           age: row[11],
           status_code: row[12],
           manual_status_code: row[13],
           page_rating: row[14],
           page_rating_votes: row[15],
           page_rating_contents: row[16],
           tags : tags,
         };

         results.push(data);
       });
    }

    return results;
}


function getOrderStmt() {
   let sort_method = sort_function;
   let order_method = "ASC";

   if (sort_function.startsWith("-")) {
      sort_method = sort_function.slice(1);
      order_method = "DESC";
   }

   return `ORDER BY ${sort_method} ${order_method}`;
}


let PAGE_SIZE = 100;


function getSelectEntry(entry_id) {
   let text = "SELECT " + getSelectColumns();
   text = text + ' FROM linkdatamodel';
   text = text + ` WHERE id = ${entry_id}`;

   return text;

}


function getSelectDefault() {
   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getSelectDefaultUserInput(userInput) {
   console.log(userInput);
   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel WHERE title LIKE '%${userInput}%' OR link LIKE '%${userInput}%' OR description LIKE '%${userInput}%'`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getSelectCustomSQL(userInput) {

   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel WHERE ${userInput}`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();
   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function execQuery(text) {
   console.log(text);

   const res = db.exec(text);

   object_list_data.entries = unpackQueryResults(res);
}


function getQueryTotalRows(text) {
   const fromIndex = text.toUpperCase().indexOf('FROM');
   
   if (fromIndex === -1) {
       return 0;
   }
   
   const offsetIndex = text.toUpperCase().indexOf('OFFSET');
   
   if (offsetIndex !== -1) {
       text = text.slice(0, offsetIndex);
   }

   text = "SELECT COUNT(*) " + text.slice(fromIndex);

   console.log(text);

   const res = db.exec(text);

   if (res.length > 0) {
      const rows = res[0].values;

      if (rows.length > 0) {
          let size = rows[0][0];
          return size;
      }
   }

   return 0;
}


function getQueryTagsText() {
    /**
     * Known feature of SQLite. It does not provide DISTINCT keyword
     * meaning this can result duplicated records.
     */
    let text = `
   SELECT l.*
   FROM linkdatamodel l
   JOIN usertags u ON l.id = u.entry_id
   WHERE u.tag LIKE '%video game%'`

   let order_by = getOrderStmt();
   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
}


function getQueryText() {
   let userInput = $("#searchInput").val();

   /* let userInput = getQueryParam("search"); */

   let text = getSelectDefault(userInput);

   let entry_id = getQueryParam("entry_id");
   if (entry_id)
   {
      text = getSelectEntry(entry_id);
   }

   if (userInput && userInput != "") {
       if (userInput.indexOf("LIKE") !== -1) {
          text = getSelectCustomSQL(userInput);
       }
       else {
          text = getSelectDefaultUserInput(userInput);
       }
   }

   return text;
}


function queryDatabase() {

  if (!db) {
     console.log("queryDatabase - not initialized");
     return;
  }

  object_list_data = { entries: [] };

  try {
       let text = getQueryText();
       execQuery(text);
       databaseReady();

       let total_rows = getQueryTotalRows(text);
       let page_num = parseInt(getQueryParam("page")) || 1;
       let nav_text = GetPaginationNav(page_num, total_rows/PAGE_SIZE, total_rows)
       $('#pagination').html(nav_text);

  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:' + error;
  }
}


async function createDatabase(dbFileName) {
    if (dbFileName.indexOf(".db")) {
       let data = await requestFile(dbFileName);
       await createDatabaseData(data);
    }
    else if (dbFileName.indexOf(".zip")) {
       blob = requestFileChunks(dbFileName);
       let data = await unPackFile(blob);
       await createDatabaseData(data);
    }
}


async function createDatabaseData(dataArray) {
  if (db) {
     return;
  }

  console.log("createDatabase SQL");

  try {
    const config = {
      locateFile: filename => `https://cdn.jsdelivr.net/npm/sql.js@1.6.0/dist/${filename}`
    };

    // Initialize SQL.js with the correct .wasm path
    const SQL = await initSqlJs(config);

    // Load the database
    db = new SQL.Database(dataArray);
    console.log("createDatabase DONE");
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:'+ error;
  }
}
