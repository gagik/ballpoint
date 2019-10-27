const mod_options =
[
'<h2 class="secondary user-preference">',
    'and <div style="width:60px" class="goal_count input-field">',
            '<input class="goal-2" placeholder="1000" type="text">',
    '</div>',
    '<div style="width:75px" class="select input-field">',
        '<select class="goal-2 goals">',
            '<option value="paragraphs">paragraphs</option>',
            '<option value="words" selected>words</option>',
        '</select>',
    '</div>',
    '<a class="remove-button"><i class="material-icons black white-text">remove</i></a>',
'</h2>'
].join('\n');

const mod_textarea =
[
'<div class="input-field textarea">',
    '<textarea id="outline" placeholder="Introduction\n\tTalk about the author 1\n\tElaborate more\nConclusion" class="materialize-textarea"></textarea>',
'</div>',
].join('\n');