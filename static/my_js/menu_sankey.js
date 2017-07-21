/**
 * Created by Roberto on 10/29/2016.
 */
update_menu_bar();
load_all_variables();

// Global variables
var selected_category = 'A',
    sankey_categories = {},
    category_list = ['A', 'A_3', 'A_4', 'A_6'],
    zoneBuilding = {'A': 'V005_vent01_CO2',
                    'B': 'V022_vent02_CO2'},
    category_name,
    day_type = {'working_day': 'Working day',
                'weekend': 'Weekend',
                'holiday': 'Holiday'},
    season = {  'winter': 'Winter',
                't_period_1': 'Coldest Transition',
                't_period_2': 'Hottest Transition',
                'summer': 'Summer'},
    selected_season = {'winter':true},
    tag_alias = {
                'V005_vent01_CO2': 'CO2 Ventilation NE',
                'V022_vent02_CO2': 'CO2 Ventilation SW'
    },
    selected_day = {'working_day':true},
    tag_list = {},
    package_to_send= {};
var color_button = "rgba(125,0,255,0.2)";
var init = true,
    season_n = 0,
    day_n = 0;
var start_time;
var end_time;


///////////////////////////////////////////////////////////////////////

function create_buttons(){
    if(isEmpty(sankey_categories)){
        // Get data from the server:
        var data_url = "/category_data_vector" + "?selected_category=" + selected_category +
            "&category_list=R_category_list";
        queue()
            .defer(d3.json, data_url)
            .await(create_category_buttons);
    }
    else{
        var error = null;
        create_category_buttons(error,sankey_categories);
    }
}

function build_package(){

    var season_list = [];
    for(var se in selected_season){
        if(selected_season[se]){
            season_list.push(se);
        }
    }
    var day_type_list = [];
    for(se in selected_day){
        if(selected_day[se]){
            day_type_list.push(se);
        }
    }
    package_to_send = {
        'selected_category': selected_category,
        'categories': category_list,
        'tag_list': tag_list,
        'start_time': start_time,
        'end_time': end_time,
        'season': season_list,
        'day_type': day_type_list
    };
    save_all_variables();
}



//------------------------------------------------------------------------------------------------------------
//- FUNCTIONS:
function create_category_buttons(error, json_categories) {
   // var categories = ['Outdoor','Room Temperature','Room Comfort','CO2','Blinds Height','Blinds Angle','Heating','Cooling'];
    if(error != null){console.log(error);}
    saveData(json_categories,'_sankey_categories');
    sankey_categories = json_categories;
    category_list = sankey_categories['category_list'];
    category_name = sankey_categories['category_name'];
    var j_tag_list = sankey_categories['tag_list'];

    for( var alias in sankey_categories['tag_alias']){
        tag_alias[alias] = sankey_categories['tag_alias'][alias];
    }

    if(init){
        // building Zone Button, only at the beginning:
        s = "";
        for(idx in zoneBuilding){
            var tag = zoneBuilding[idx],
            s = s +
                '<input name="zoneButton'+ idx +'" ' +
                'id="zoneButton('+ idx +')" ' +
                'class="btn btn-default btn-xs" ' +
                'type="button" value="'+ tag_alias[tag] +'" ' +
                'onclick="onButtonClick_Zone(\''  + tag + '\',\'' + idx + '\')"/>';
        }
        document.getElementById("variable_category_buttons_0").innerHTML = s;

        s = "";
        for(idx in season){
            s = s +
                '<input name="Button'+ idx+'" ' +
                'id="Button('+ idx +')" ' +
                'class="btn btn-default btn-xs" ' +
                'type="button" value="'+ season[idx] +'" ' +
                'onclick="onButtonClick_Season(\''  + idx + '\')"/>';
        }
        document.getElementById("season_selection").innerHTML = s;


        s = "";
        for(var idx in day_type){
            s = s +
                '<input name="Button'+ idx+'" ' +
                'id="Button('+ idx +')" ' +
                'class="btn btn-default btn-xs" ' +
                'type="button" value="'+ day_type[idx] +'" ' +
                'onclick="onButtonClick_Day(\''  + idx + '\')"/>';
        }
        document.getElementById("day_selection").innerHTML = s;

        tag = zoneBuilding[selected_category];
        tag_list[selected_category] = tag;
        onButtonClick_Zone(tag, selected_category);
        onButtonClick_Season('winter');
        onButtonClick_Day('working_day');
        update_date();
        init = false;
    }

    for(idx=1; idx < category_list.length;idx++ ){

        var cat = category_list[idx],
            tags = j_tag_list[cat];

        s = "";
	    for (var i = 0;i<tags.length;i++) {
            s = s +
            '<input name="tagButton'+i+'" ' +
            'id="tagButton('+tags[i]+')" ' +
            'class="btn btn-default btn-xs" ' +
            'type="button" value="'+ tag_alias[tags[i]] +'" ' +
            'onclick="onButtonClick_tag(\''  + tags[i] + '\',\'' + cat + '\')"/>';
	    }
	    document.getElementById("variable_category_buttons_" + idx).innerHTML = s;
        //only for the beginning:
        tag_list[cat] = tags[0];
        onButtonClick_tag(tags[0], cat);
    }

}


function onButtonClick_Zone(tag, zone){

    var last_id = 'zoneButton(' + selected_category +')';
        dissipate_button(last_id);
    var id_button = 'zoneButton(' + zone +')';
        highlight_button(id_button);

    selected_category = zone;
    tag_list[zone] = tag;

    if(!init){
        var data_url = "/category_data_vector" + "?selected_category=" + selected_category +
            "&category_list=R_category_list";
        queue()
            .defer(d3.json, data_url)
            .await(create_category_buttons);
    }
    build_package();
}


function onButtonClick_tag(tag, cat){
    var id_button = 'tagButton('+tag+')';
    var element = document.getElementById(id_button);
    if( element.checked == false){
        // Button is selected

        var last_id = 'tagButton(' + tag_list[cat] +')';
        dissipate_button(last_id);
        highlight_button(id_button);

        tag_list[cat] = tag;
    }
    build_package();
}

function onButtonClick_Day(idx){
    var id_button = 'Button('+idx+')';
    var element = document.getElementById(id_button);
    if( element.checked == false){
        // Button is selected
        highlight_button(id_button);
        selected_day[idx] = true;
        day_n ++;
    }
    else if(day_n > 1)
    {
        dissipate_button(id_button);
        selected_day[idx] = false;
        day_n --;
    }
    build_package();
}

function onButtonClick_Season(idx){
    var id_button = 'Button('+idx+')';
    var element = document.getElementById(id_button);
    if( element.checked == false){
        // Button is selected
        highlight_button(id_button);
        selected_season[idx] = true;
        season_n ++;
    }else if(season_n > 1)
    {
        dissipate_button(id_button);
        selected_season[idx] = false;
        season_n --;
    }
    build_package();
}


function save_all_variables() {
    saveData(tag_list,'_tag_list');
    saveData(selected_category,'_selected_category');
    saveData(tag_alias,'_tag_alias');
    saveData(sankey_categories,'_sankey_categories');
    saveData(selected_day, '_selected_day');
    saveData(selected_season, '_selected_season');
    saveData(start_time,'_start_time');
    saveData(end_time,'_end_time');
}

function load_all_variables() {

    //This is general information to use in the Menu ////////////////////
    // if they were already used, they are saved in the local User
    // so we need only to recollect this data from the local machine
    var new_tag_list = loadData('_tag_list'),
        new_selected_category = loadData('_selected_category'),
        new_tag_alias = loadData('_tag_alias'),
        new_sankey_categories = loadData('_sankey_categories'),
        new_selected_day = loadData('_selected_day');
        new_start_time = loadData('_start_time');
        new_end_time = loadData('_end_time');

    if(new_tag_list != null && new_tag_list != 'undefined'){
        if(new_tag_list!= null) tag_list =  new_tag_list;
        if(new_selected_category!=null) selected_category = new_selected_category;
        if(new_tag_alias!=null) tag_alias = new_tag_alias;
        if(new_sankey_categories!=null) sankey_categories = new_sankey_categories;
        if(new_selected_day!=null) selected_day = new_selected_day;
        if(new_start_time!=null) start_time = new Date(new_start_time);
        if(new_end_time!=null) end_time= new Date(new_end_time);
    }
}


function update_menu_bar() {
    var s =[],
     link =[],
    current_title = document.title,
    previous_url = document.referrer;

    s[0] = '<div class="container-fluid">' +
        '<div class="navbar-header">' +
        '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
            '<span class="sr-only">Toggle navigation</span>' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
        '</button>' +
            '<a class="navbar-brand" href="'+previous_url +'">' +
            '<span class="glyphicon glyphicon-chevron-left"></span>' +
                '</a>' +
            '<a class="navbar-brand" href="/menu" >' + current_title + ' </a>'+
        '</div>' +
        '<div class="navbar-collapse collapse">' +
            '<ul class="nav navbar-nav navbar-left">';
    //list of links:
    link[0] = '<li> <a href = "/menu">' + 'Menu' + '</a> </li>';
    link[1] = '<li> <a href = "/quality">' + 'Data quality screening' + '</a> </li>';
    link[2] = '<li> <a href = "/correlation">' + 'Correlation Matrix' + '</a> </li>';
    link[3] = '<li> <a href = "/par_coord" >'+ 'Parallel Coordinates' + '</a></li>';
    link[4] = '<li> <a href = "/record">' + 'Records' + '</a> </li>';
    
    var links=[];
    for(var l in link){
        links = links + link[l];
    }
    s[1] = '</ul>'+ '</div>'+ '</div>';

    document.getElementById("menu_bar").innerHTML =
        s[0] + links + s[1];
}

// This function gets the parameter values from the URL
function getQueryVariable(variable) {
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0; i < vars.length; i++) {
       var pair = vars[i].split("=");
       if(pair[0] == variable) {
           return pair[1];
       }
   }
   return null;
}
///////////////////////////////////////////////////////

function ready_button_icon(id){
    var element = document.getElementById(id);
    element.innerHTML =
        '<span class="glyphicon glyphicon-ok"></span>' +
        ' Success! Click here to apply new changes ';
    element.blur()
}

function loading_button_icon(id){
    var element = document.getElementById(id);
    element.innerHTML = '<span class="glyphicon glyphicon-download-alt"></span>' +
        ' Loading data... wait please.';
    element.blur()
}

function highlight_button(id) {
    if(id != null) {
        var element = document.getElementById(id);
        element.style.background = color_button;
        element.checked = true;
        //element.style.background = (isClicked  == false) ? "rgba(0,0,0,0)" : "rgba(255,0,0,0.2)";
    }
}
function dissipate_button(id) {
    if(id !=null) {
        var element = document.getElementById(id);
        element.style.background = "rgba(0,0,0,0)";
        element.checked = false;
    }
}

function update_title_chart(id,new_title){
    var element = document.getElementById(id);
    element.innerHTML = '<strong>' + new_title + '</strong>';
}

///////////////////////////////////////////////////
function saveData(variable,storage_name) {
  /* var variable = {
     User: user,
     Pass: pass
   };*/
   //converts to JSON string the Object
   variable = JSON.stringify(variable);
   //creates a base-64 encoded ASCII string
   variable = btoa(variable);
   //save the encoded accout to web storage
   localStorage.setItem(storage_name, variable);
}

function loadData(storage_name) {
   var variable = localStorage.getItem(storage_name);
   if (!variable ) return null;
   localStorage.removeItem(storage_name);
   //decodes a string data encoded using base-64
   variable = atob(variable);
    if(variable=='undefined') return null;
   //parses to Object the JSON string
    variable = JSON.parse(variable);
   //do what you need with the Object
   //fillFields(account.User, account.Pass);
   return variable;
}


function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

$('#sandbox-container .input-daterange').datepicker({
    weekStart: 1,
    startView: 1,
    autoclose: true,
    format: "yyyy-mm-dd",
    startDate: "2012-06-23",
    endDate: "2015-06-08"
});

//##########################################################################################
function apply_change_date(){
    var element_start_time =  document.getElementById("start_time").value,
        element_aux_end_time =  document.getElementById("end_time").value + 'T23:59:00.000Z';

    var aux_start_time = new Date(element_start_time),
        aux_end_time = new Date(element_aux_end_time);

    var alert_el = document.getElementById("alert_time");
    if(aux_start_time == 'Invalid Date' || aux_end_time == 'Invalid Date'
        || aux_start_time == undefined || aux_end_time == undefined){
        alert_el.innerHTML = '<div class="btn alert-warning btn-xs">' +
            '<strong> Warning </strong> Invalid date' +
            '</div>';
        window.alert("+> Warning: \n\nInvalid date, \n\nObserve the Date container");
        return null;
    }else{
        start_time = aux_start_time;
        end_time = aux_end_time;
        alert_el.innerHTML = '<div class="alert alert-info btn-xs">' +
            '<strong> Success: </strong>' + " from "+ start_time.toDateString() +
            ' to ' + end_time.toDateString() +
            '</div>';
        build_package();

        d3.select("#" + chart_place).select("svg").remove();

        var to_send = JSON.stringify(package_to_send),
            data_url = '/sankey_data?package=' + to_send;
        queue()
            .defer(d3.json, data_url)
            .await(make_sankey_diagram);
    }
}

function update_date() {
    var element_start_time =  document.getElementById("start_time"),
        element_aux_end_time =  document.getElementById("end_time");
    if(start_time!=null && start_time!='Invalid Date' && start_time!= undefined ){
        var aux = start_time.toISOString();
        aux = aux.split('T');
        element_start_time.value = aux[0];
    }
    if(end_time!=null && end_time!='Invalid Date' && end_time != undefined){
        aux = end_time.toISOString();
        aux = aux.split('T');
        element_aux_end_time.value = aux[0];
    }
}


