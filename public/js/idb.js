let db;

const request = indexedDB.open('budget', 1);
// upgrade needed
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true});
};
// success
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};
// error
request.onerror = function (event) {
    console.log('Error has occured!' + event.target.errorcode);
};

// saveRecord
function saveRecord(record) {
    const transaction = db.transaction("pending", "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}
// checkDatabase
function checkDatabase() {
     const transaction = db.transaction('pending', 'readwrite');

    const store = transaction.objectStore('pending');
    const getAll = store.getAll();
    // getAll success
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction("pending", "readwrite");
                    const store = transaction.objectStore("pending");

                    store.clear();
                });
        }
    };
}

window.addEventListener('online', checkDatabase);