const DOC_REGEX = /https:\/\/docs\.google\.com\/document\/d\/(.*)\/edit/
var currentDocId;

function checkUrl(url) {
    if ((url.match(DOC_REGEX) != null) &&
        (url.match(DOC_REGEX) != undefined) &&
        (url.match(DOC_REGEX)[0] == url)) {
        return true;
    }
    return false;
}

function startButton() {
    let button = document.createElement("div");
    button.className = "setup_button";
    button.innerHTML = '<div class="content">Set Goal</div><div class="arrow">;</div>';
    button.addEventListener("click", function() {
        let url = chrome.runtime.getURL("dashboard/index.html?docId=" + currentDocId);
        window.open(url);
    });

    let target=document.getElementsByClassName("docs-titlebar-badges goog-inline-block");
    target[0].appendChild(button);
}

if(checkUrl(window.location.href)) {
    currentDocId = window.location.href.match(DOC_REGEX)[1];
}

startButton();