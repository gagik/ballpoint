// CONSTANTS
const DOC_REGEX = /https:\/\/docs\.google\.com\/document\/d(.*)\//;
const USER_DATA = "USER_DATA";
const PREF_STATUS = "prefStatus";
const DOC_INFO = "docInfo";
const WORD_COUNT = "wordCount";
const PAR_COUNT = "paragraphCount";
const TIME_EDITING = "timeEditingInSec";
const NEW_DOC_INFO = {
    PREF_STATUS: {},
    DOC_INFO   : {
        WORD_COUNT: 0,
        PAR_COUNT : 0,
        TIME_EDITING: 0
    }
};
// FUNCTIONS

// Return True if input string url matches active Google Doc url structure
// Return False otherwise
function checkUrl(url) {
    if (url.match(DOC_REGEX)) {
        return true;
    }
    return false;
}

// TBD
function initialize() {

}

// Intended for Google Docs. Counts and returns the number of lines on the current document
function countLines() {
    let page = document.getElementsByClassName("kix-zoomdocumentplugin-outer")[0];
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

// ON INSTALL OPERATIONS
chrome.runtime.onInstalled.addListener(()=>{
    // Initialize USER_DATA field with intended structure:
    // {
    //   <doc_id> : {
    //      prefStatus : {},
    //      docInfo: {}
    //    }
    // }
    chrome.storage.sync.set({
        USER_DATA: {}
    }, (result) => {
        console.log("Initialized USER_DATA: " + result);
    });

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
chrome.tabs.onCreated.addListener((tab)=> {
    if (checkUrl(tab.url)) {
        initialize();
    } 
});

// When tab is updated run script if its url matches regex for open Google doc
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (checkUrl(tab.url)) {
        initialize();
    }
});

chrome.tabs.onRemoved.addListener((tabId, _) => {

});


// Checks if wordCount is the same as wordTarget. Returns true if count is same, false otherwise. 
function wordCheck(wordCount, wordTarget){
    if(wordCount==wordTarget){
        return true;
    }else{
        return false; 
    }
}
