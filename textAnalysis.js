// creates a button object to be clicked on by someone to start the chrome extension
const DOC_REGEX = /https:\/\/docs\.google\.com\/document\/d\/(.*)\/edit/;
const NEWLINE = 10;
const SPACE1 = 160;
const SPACE2 = 8204;
const TABSPACE = 9;

let updater;
function startButton() {
    let button = document.createElement("button");
    button.textContent = "hi";
    button.addEventListener("click", function() {
        console.log("Hello there");
    });

    let target=document.getElementsByClassName("docs-title-outer docs-title-inline-rename");
    target[0].appendChild(button);
}
startButton();

// TODO: FUNCTION NEEDS TO BE ADDRESSED, HOW TO DETERMINE WHEN TO STOP.
function runUpdates() {
    let checkOn;
    
    chrome.storage.local.get("USER_DATA", (data) => {
        data = data.USER_DATA;
        checkOn = data.isOn;
    });

    updater = setInterval(()=>{
        update();
        chrome.storage.local.get("USER_DATA", (data) => {
            data = data.USER_DATA;
            checkOn = data.isOn;
        });
    }, 200);
}

// Counts paragraphs and words on the document and updates values in storage.local if
// any values have changed.
function update() {
    let docID = window.location.href.match(DOC_REGEX)[1];
    let pCount = countParagraphs();
    let wCount = countWords();

    const addValues = (pCount, wCount) => {
        chrome.storage.local.get("USER_DATA", (data) => {
            data = data.USER_DATA;
            
            if (data[docID].paragraphCount !== pCount) {
                data[docID].paragraphCount = pCount;
                chrome.storage.local.set({USER_DATA : data});
            }

            if (data[docID].wordCount !== wCount) {
                data[docID].wordCount = wCount;
                chrome.storage.local.set({USER_DATA: data});
            }
        });
    }

    addValues(pCount, wCount);
}

// Intended for Google Docs. Counts and returns the number of words on the current document
function countWords() {
    let page = document.getElementsByClassName("kix-zoomdocumentplugin-outer")[0];
    if (page == null) {
        alert("Element does not exist on the document.")
    }
    const pageText = page.innerText;
    let words = pageText.split(/\s+/);
    words = words.filter((word) => (!((word.charCodeAt(0) == 8204) && (word.length == 1))));
    console.log(words[6].length, words[7].length);
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

runUpdates();