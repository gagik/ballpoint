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

// ON INSTALL OPERATIONS
chrome.runtime.onInstalled.addListener(()=>{
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
