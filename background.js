// CONSTANTS
const DOC_REGEX = /https:\/\/docs\.google\.com\/document\/d\/(.*)\/edit/
const USER_DATA = "USER_DATA";
const PREF_STATUS = "prefStatus";
const DOC_INFO = "docInfo";
const WORD_COUNT = "wordCount";
const PAR_COUNT = "paragraphCount";
const TIME_EDITING = "timeEditingInSec";
const NEW_DOC_INFO = {
    "prefStatus": {},
    "docInfo": {
        "wordCount": 0,
        "paragraphCount": 0,
        "timeEditingInSec": 0
    }
};
const msToS = 1000;

// GLOBAL VARIABLES
let openTabs = {};
let activeDocID = null;
// FUNCTIONS

// Return True if input string url matches active Google Doc url structure
// Return False otherwise
function checkUrl(url) {
    if ((url.match(DOC_REGEX) != null) &&
        (url.match(DOC_REGEX) != undefined) &&
        (url.match(DOC_REGEX)[0] == url)) {
        return true;
    }
    return false;
}

// Checks if wordCount is the same as wordTarget. Returns true if count is same, false otherwise. 
function wordCheck(wordCount, wordTarget) {
    if (wordCount == wordTarget) {
        return true;
    } else {
        return false;
    }
}
// Check if doc_id has already been saved. If yes, then update appropriate fields
// in USER_DATA, otherwise, create an entry
function initialize(tab) {
    console.log(tab.url);
    let matchObj = tab.url.match(DOC_REGEX);

    chrome.storage.local.get([USER_DATA], (rv) => {
        if (rv.USER_DATA[matchObj[1]] == undefined) {

            // If key is not found, create new key
            let USER_DATA_COPY = Object.assign({}, rv.USER_DATA);
            USER_DATA_COPY[matchObj[1]] = Object.assign({}, NEW_DOC_INFO);
            chrome.storage.local.set({
                    USER_DATA: USER_DATA_COPY
                },
                (result) => {
                    console.log("USER_DATA: " + result);
                });
function initializeDocument(docID, tab, callback, args) {
    chrome.storage.local.get(USER_DATA, (data) => {
        data = data[USER_DATA];
        if (data[docID] == undefined) { // docID not present
            data[docID] = {
                docInfo: {
                    wordCount: 0,
                    paragraphCount: 0,
                    timeEditingInSec: 0
                },
                prefStatus: {}
            };
            chrome.storage.local.set({USER_DATA:data});
            focusOnDocument(docID, tab, ()=>{}, []);
            // focusOnDocument(docID, null, null);
        }
        else {
            console.log(`${docID} already initialized`);
        }
        callback(...args);
    });
}

function focusOnDocument(docID, tab, callback, args) {
    chrome.storage.local.get(USER_DATA, (items) => {
        items = items[USER_DATA];
        if (items[docID] == undefined) {
            console.error(`document with docID: ${docID} not found`);
        }
        else {
            window.documentClock = window.setInterval(() => {
                chrome.storage.local.get(USER_DATA, (data) => {
                    data = data[USER_DATA];
                    if (data[docID] == undefined) {
                        console.error(`document with docID: ${docID} not found`);
                    }
                    else {
                        // let docInfoCopy = Object.assign({}, data[docID]);
                        if (activeDocID != null && activeDocID.docID === docID) {
                            data[docID].docInfo.timeEditingInSec++;
                            console.log("added second, ", data[docID].docInfo.timeEditingInSec);
                            activeDocID = {
                                tabID: tab.id,
                                docID: docID};
                            // let currentElapsedTime = items[docID].docInfo.timeEditingInSec;
                            chrome.storage.local.set({USER_DATA: data});
                        }
                    }
                });
            }, 1000);
        }
    });
    //callback(...args);
}

function defocusDocument(docID, callback, args) {
    if (docID != null) {
        chrome.storage.local.get(USER_DATA, (items) => {
            items = items[USER_DATA];
            if (items[docID] == undefined) {
                console.error(`document with docID: ${docID} not found`);
            }
            else {
                window.clearInterval(window.documentClock);
                activeDocID = null;
            }
        });
    }

    //callback(...args);
}

// Intended for Google Docs. Counts and returns the number of words on the current document
function countWords() {
    let page = document.getElementsByClassName("kix-zoomdocumentplugin-outer")[0];
    if (page == null) {
        alert("Element does not exist on the document.")
    }
    const pageText = page.innerText;
    const words = pageText.split(" ");
    
    return words.length; 
}

// Intended for Google Docs. Counts and returns the number of lines on the current document
function countLines() {
    let page = document.getElementsByClassName("kix-zoomdocumentplugin-outer")[0];
    if (page == null) {
        alert("Element does not exist on the document.")
    }
    let lineCount = 0;
    const pageText = page.innerText;

    for (let i = 0; i < pageText.length; i++) {
        if (pageText.charAt(i) == '\n') {
            lineCount++;
        }
    }
    return lineCount;
}

// Intended for Google Docs. Counts and returns the number of paragraphs on the current document. 
// Paragraphs are defined as two consecutive new line characters after character text.
function countParagraphs() {
    const NEWLINE = 10;
    const SPACE1 = 160;
    const SPACE2 = 8204;
    const TABSPACE = 9;

    let page = document.getElementsByClassName("kix-zoomdocumentplugin-outer")[0];
    if (page == null) {
        alert("Element does not exist on the document.")
    }
    let paragraphCount = 0;
    let isConsecutive = false;
    let isCounted = false;
    const pageText = page.innerText;

    // Loops through any blank space at the start.
    let startIndex;
    for (startIndex = 0; startIndex < pageText.length; startIndex++) {
        const VALUE = pageText.charCodeAt(startIndex);
        if (VALUE != NEWLINE && VALUE != SPACE1 && VALUE != SPACE2 && VALUE != TABSPACE) {
            break;
        }
    }

    // Loops through the remaining text to find paragraphs
    for (; startIndex < pageText.length; startIndex++) {
        const VALUE = pageText.charCodeAt(startIndex);

        if (VALUE == NEWLINE) {
            if (isConsecutive && !isCounted) {
                paragraphCount++;
                isCounted = true;
            }
            isConsecutive = true;
        }
        else if (!isConsecutive || (VALUE != SPACE1) && (VALUE != SPACE2)) {
            isConsecutive = false;
            isCounted = false;
        }
    }
    
    return paragraphCount;
}

// Call function to set update() on a timed loop

// NEED A BETTER WAY TO RUN THE UPDATE() CONTINUOUSLY - SHOULD BE ON/OFF
// SHOULD BE CALLED WHEN EXTENSION IS TURNED ON BY THE DOCUMENT
function runUpdates() {
    let checkOn = chrome.storage.local.get(["isOn"], function(result) {
        console.log(result.isOn)});
    
    while (checkOn.isOn == 1) {
        setTimeout(update, 200);
        checkOn = chrome.storage.local.get(["isOn"], function(result) {
            console.log(result.isOn)});
    }
}

// Counts paragraphs and words on the document and updates values in storage.local if
// any values have changed.
function update() {
    let pCount = countParagraphs();
    let wCount = countWords();

    // need to determine how to read in this data correctly.
    // const addValues = (pCount, wCount) => {
    //     chrome.storage.local.get(['paragraphCount'], function(result) {
    //         if (result.paragraphCount === undefined) {
    //             chrome.storage.local.set({"paragraphCount" : pCount});
    //         }
    //         else if (result.paragraphCount !== pCount){
    //             chrome.storage.local.set({"paragraphCount" : pCount});
    //         }
    //     });

    //     chrome.storage.local.get(['wordCount'], function(result) {
    //         if (result.wordCount === undefined) {
    //             chrome.storage.local.set({"wordCount" : wCount});
    //         }
    //         else if (result.wordCount !== wCount){
    //             chrome.storage.local.set({"wordCount" : wCount});
    
    //         }
    //     });
    // };

    const addValues = (pCount, wCount) => {chrome.storage.local.get(USER_DATA, (data) => {
            data = data[USERDATA];
            
            if (data.paragraphCount !== pCount) {
                data.paragraphCount = pCount;
                chrome.storage.local.set({USER_DATA : data});
            }

            if (data.wordCount !== wCount) {
                data.wordCount = wCount;
                chrome.storage.local.set({USER_DATA: data});
            }
        });
    }

    addValues(pCount, wCount);
}

function updateTimeElapsedInSec(tabId, callback) {
    console.log(openTabs);
    if (openTabs[tabId] != undefined) {
        chrome.storage.local.get([USER_DATA], (rv) => {
            let docId = openTabs[tabId].docId;
            if (rv.USER_DATA[docId] != undefined) {
                let USER_DATA_COPY = Object.assign({}, rv.USER_DATA);
                USER_DATA_COPY[docId].docInfo.timeEditingInSec += (new Date() - openTabs[tabId].startTime) / msToS;
                // console.log(USER_DATA_COPY);
                chrome.storage.local.set({
                    "USER_DATA": USER_DATA_COPY
                }, (result) => {
                    console.log("USER_DATA: " + result);
                });
            }
        });
    }
}
// ON INSTALL OPERATIONS
chrome.runtime.onInstalled.addListener(() => {
    // Initialize USER_DATA field with intended structure:
    // {
    //   <doc_id> : {
    //      prefStatus : {},
    //      docInfo: {}
    //    }
    // }
    chrome.storage.local.set({
        USER_DATA: {} //User settings
    }, (result) => {
        console.log("Initialized USER_DATA: " + result);
    });

    // gives an indicator variable for whether the google extension ought to be running or not on the document.
    chrome.storage.local.set({"isOn": 0});

    alert("Installed!");
    // Take user to options/about page
});

// No idea what this does tbh
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
});

// When new tab is created run script if its url matches regex for open Google doc
chrome.tabs.onCreated.addListener((tab) => {
    console.log("created");
    if (checkUrl(tab.url)) {
        defocusDocument(activeDocID)
        initializeDocument(docID, tab, focusOnDocument, [docID, null, null]);
    //     console.log("onCreate");
    //     // Create tab_open_time
    //     initialize(tab);
    } 
});

// When tab is updated run script if its url matches regex for open Google doc
// FIXME: DOES NOT UPDATE TIME ELAPSED FOR ORIGINAL
// DOCUMENT WHEN THE SAME TAB IS NAVIGATED TO A NEW
// URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // let currentUrl = tab.url;
    console.log("update");

    if (checkUrl(tab.url) && (changeInfo.url != undefined)) {
        // console.log("onUpdate");
        if (openTabs[tabId] != undefined) {
            updateTimeElapsedInSec(tabId);
            openTabs[tabId] = {
                docId: tab.url.match(DOC_REGEX)[1],
                startTime: new Date()
            };
        }
        else {
            openTabs[tabId] = {
                docId: tab.url.match(DOC_REGEX)[1],
                startTime: new Date()
            };

        } //else if (checkUrl())


            // If we navigate away from the previous document, update time spent and 
            // create new tab_open_time for this document
        initialize(tab);
    }

    else if (checkUrl(tab.url) && changeInfo.url == undefined) {
        let prevDocId = openTabs[tabId].docId;
        let newDocId = tab.url.match(DOC_REGEX)[1];
    // if the url matches the regular expression and the url has been changed
    // (Accounts for new window)
    if (checkUrl(tab.url) && (changeInfo.url != undefined)) {
        console.log("valid");
        let docID = tab.url.match(DOC_REGEX)[1];

        initializeDocument(docID, tab, focusOnDocument, [docID]);
        // Start timer
    }
    else if (!checkUrl(tab.url)) {
        console.log("valid");
        defocusDocument(activeDocID, ()=>{}, []);
    }

});

// chrome.tabs.onActiveChanged

chrome.tabs.onRemoved.addListener((tabId, _) => {
    updateTimeElapsedInSec(tabId, () => {
        delete openTabs[tabId];
    });
     
    if (activeDocID != null) {
        if (tabId == activeDocID.tabID) {
            defocusDocument(activeDocID.docID, ()=>{}, []);
        }
    }
});