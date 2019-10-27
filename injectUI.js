const DOC_REGEX = /https:\/\/docs\.google\.com\/document\/d\/(.*)\/edit/
let sidebar;
let currentDocId;
let reachGoal = {};
// localUserData from textAnalysis.js

function checkUrl(url) {
    if ((url.match(DOC_REGEX) != null) &&
        (url.match(DOC_REGEX) != undefined) &&
        (url.match(DOC_REGEX)[0] == url)) {
        return true;
    }
    return false;
}

function getSidebarText(one, outOf, type) {
    return "<b>" + one + "</b> of <b>" + outOf + "</b> <u>" + type + "</u><br>"; 
}

function getIcon(name) {
    return "<i class='material-icons'>" + name + "</i>";
}

function updateSidebar(sidebar) {
    let setup = 'Form a <a target="_blank" href="' + chrome.runtime.getURL("dashboard/index.html?docId=" + currentDocId)
         + '">goal</a> and get writing.<br><br>We\'ll do the rest for you.';
    if(!localUserData[currentDocId]) {
        sidebar.find('.bp-content').html(setup);
    }
    else if(!localUserData[currentDocId].options || !Object.getOwnPropertyNames(localUserData[currentDocId].options).length) {
        sidebar.find('.bp-content').html(setup);
    } else {
        let text = ""
        let options = localUserData[currentDocId].options;
        let docInfo = localUserData[currentDocId].docInfo;
        // let seconds = localUserData[currentDocId].timeEditingInSec;
        // let timeElapsed = new Date(seconds * 1000).toISOString().substr(11, 8);
        // text += "Time spent on this: " + timeElapsed;
        if(options["outline"] != undefined) {
            let outline = options["outline"];
            for(var i = 0; i < outline.length; i++) {
                let section = outline[i];
                text += '<div class="outline-goal">'
                if(i < docInfo.paragraphCount)  text += getIcon("check_box")
                else text += getIcon("check_box_outline_blank");
                text += section + "</div>";
            }
        }
        if(options["paragraphs"] != undefined) {
            text += getSidebarText(docInfo.paragraphCount, options["paragraphs"], "paragraphs");
        }
        if(options["words"] != undefined) {
            text += getSidebarText(docInfo.wordCount, options["words"], "words");
            if(docInfo.wordCount >= options["words"] && reachGoal["words"] != true) 
            {
                mdtoast('Congrats! You reached your word count goal for this session!', {type: "success"});
                reachGoal["words"] = true;
            } else if(docInfo.wordCount < options["words"] && reachGoal["words"] == true) {
                reachGoal["words"] = false;
            }
        }
        sidebar.find('.bp-content').html(text);
    }
}

function initiateSidebar() {
    let mod_sidebar = [
        '<div class="bp-sidebar">',
            '<div class="bp-header">',
            '<div class="bp-logo">; bp</div>',
            '</div>',
            '<div class="bp-content">',
            '</div>',
        '</div>'
    ].join("\n");
    let sidebar = $(mod_sidebar);
    $("body").append(sidebar);
    updateSidebar(sidebar);
    setInterval(() => {updateSidebar(sidebar)}, 200);
    return sidebar;
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

$(document).ready(function() {
    startButton();
    sidebar = initiateSidebar();
    $("body").append($('<link href="https://fonts.googleapis.com/css?family=Crimson+Text:800&display=swap" rel="stylesheet">'));
})