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
