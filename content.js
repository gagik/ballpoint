// creates a button object to be clicked on by someone to start the chrome extension
function startButton() {
    let button = document.createElement("button");
    button.addEventListener("click", function() {
        console.log();
    });

    let target=document.getElementsByClassName("docs-title-outer docs-title-inline-rename");
    target[0].appendChild(button);
}

startButton();

// FUNCTION NEEDS TO BE ADDRESSED, HOW TO DETERMINE WHEN TO STOP.
function runUpdates() {
    let checkOn;
    
    chrome.storage.local.get(USER_DATA, (data) => {
        data = data[USERDATA];
        checkOn = data.isOn;
    });

        setInterval(()=>{
            update();
            chrome.storage.local.get(USER_DATA, (data) => {
                data = data[USERDATA];
                checkOn = data.isOn;
            });
        }, 200);
}

// Counts paragraphs and words on the document and updates values in storage.local if
// any values have changed.
function update() {
    let pCount = countParagraphs();
    let wCount = countWords();

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