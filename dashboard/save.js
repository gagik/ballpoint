function err() {
    M.toast({html: 'Please enter a valid value'});
}

function getGoal(goalNumber) {
    let newObj = {};

    const GOAL_CLASS = ".goal-" + goalNumber;
    if(!$("select" + GOAL_CLASS).length)
        return newObj;
    
    let content_val;
    let content_type = $("select" + GOAL_CLASS).val();


    if(content_type != "outline") {
        content_val = parseInt($("input" + GOAL_CLASS).val());
        if(!content_val || content_val < 1) {
            err();
            return newObj;
        }
    }
    else {
        content_val = $("#outline").val();
        if(!content_val || content_val.length < 10) {
            err();
            return newObj;
        }
        content_val = content_val.replace(/\t/g, '').split("\n");
        
    }
    newObj[content_type] = content_val;
    return newObj;
}

$(document).ready(function() {
    $("#begin").click(function() {
        let arr = [];
        let p1 = getGoal(1);
        let p2 = getGoal(2);
        if(p1 == {}) return;
    });
});