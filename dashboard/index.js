var DASHBOARD_HEIGHT = 190;

function resizeDashboardBy(delta) {
  $(".dashboard .setup").animate({height: DASHBOARD_HEIGHT+=delta});
}

function toggleOutline(enable) {
  if(!$("#outline").length && enable) {
    let textarea = $(mod_textarea);
    textarea.css('height', 0);
    $(".dashboard .setup").append(textarea);
    textarea.animate({height: 150});
    resizeDashboardBy(130);
  } else if($("#outline").length > 0 && !enable) {
    $("#outline").animate({height: 0},{
      complete: () => {$("#outline").parent().remove();}
    });
    resizeDashboardBy(-130);
  }
}

function animateByType(goal, input, select, isSecondary) {
  switch(goal) {
    case "paragraphs":
      input.show();
      input.animate({"width": "40px"}, 100);
      input.children().val("");
      input.children().attr("placeholder", 5);
      select.animate({"width": "135px"}, 100);
      if(!isSecondary) toggleOutline(0);
      break;
    case "words":
      input.show();
      input.animate({"width": "70px"}, 100);
      input.children().val("");
      input.children().attr("placeholder", 1000);
      select.animate({"width": "75px"}, 100);
      if(!isSecondary) toggleOutline(0);
      break;
    case "outline":
      input.hide();
      input.css("width", "0px");
      select.animate({"width": "145px"}, 100);
      if(!isSecondary) toggleOutline(1);
      break;
  }
}

function setupOptions() {
    $('select').formSelect();
    $(".dashboard .goals").on('change', function(e) {
      let goal = e.target.value;
      let grandparent = $(this).parent().parent();
      let input = grandparent.parent().find(".goal_count");
      animateByType(goal, input, grandparent);
    });
}

function resetupOptions() {
  $(".remove-button").click(function() {
    $('.add-button').show();
    $(".add-button i").animate({width: "20px"}, {
      duration: 300
    });
    $(".remove-button i").animate({width: "0px"}, 300);
    resizeDashboardBy(-40);
    $(this).parent().fadeOut({
      complete: function() {
        $(this).remove();}
    });
  });
  $(".dashboard .secondary .goals").on('change', function(e) {
    let goal = e.target.value;
    let grandparent = $(this).parent().parent();
    let input = grandparent.parent().find(".goal_count");
    animateByType(goal, input, grandparent, true);
    
  });
  $('.secondary select').formSelect();
}

$(document).ready(function() {
  setupOptions();
  $(".add-button").click(() => {
      if($(".remove-button").length)
        return;

      $(".add-button i").animate({width: "0px"}, {
        duration: 300,
        complete:function() {$(this).hide();}
      });
      resizeDashboardBy(40);
      let newGoal = $(mod_options);
      newGoal.hide();
      $(".setup-text").append(newGoal);
      newGoal.fadeIn();
      resetupOptions();
  });
});