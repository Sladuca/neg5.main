var nextPlayerNum = 5;

$(document).ready(function() {

    $(".collapsable").click(function(e) {
        e.stopImmediatePropagation();
        $(this).next().toggle(300);
    });

    $("#add-team-button").click(function(e) {
        sendTeamToServer();
    });

    $("#team_name_input").keyup(function(e) {
        var teamname = $("#team_name_input").val().trim();
        $("#player_team_dynamic").val(teamname);
    });

    $("#newlineplayer").click(function(e) {
        createPlayerInputField();
    });

    $(".teamselect").change(function(e) {
        if ($(this).attr("id") == "leftchoice") {
            findPlayersByTeamnameAndTournament("LEFT");
        } else {
            findPlayersByTeamnameAndTournament("RIGHT");
        }
    })

    $("#entergamebutton").click(function(e) {
        console.log($("#gamedataform").serialize());
    });
});

function sendTeamToServer() {
    $.ajax({
        url : "/home/tournaments/createteam",
        type : "POST",
        data : $("#teamform").serialize(),
        success : function(databack, status, xhr) {
            document.getElementById("teamform").reset();
        }
    });
}

function sendPlayersToServer() {
    $.ajax({
        url : "/home/tournaments/createplayers",
        type : "POST",
        data : $("#playersform").serialize(),
        success : function(databack, status, xhr) {

        }
    });
}

function findPlayersByTeamnameAndTournament(side) {
    if (side == "LEFT") {
        $.ajax({
            url : "/home/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#leftchoice").val()},
            success : function(databack, status, xhr) {
                showPlayerRows(databack, "LEFT");
            }
        });
    } else {
        $.ajax({
            url : "/home/tournaments/getplayers",
            type : "GET",
            data : {tournamentid : $("#tournament_id_change").val(),
                    teamname : $("#rightchoice").val()},
            success : function(databack, status, xhr) {
                showPlayerRows(databack, "RIGHT");
            }
        });
    }
}

function createPlayerInputField() {
    var newInput = "<input type='text'/>";
    var classes = "form-control input-medium center-text no-border-radius";
    var name = "player" + nextPlayerNum + "_name";
    var placeholder = "Player " + nextPlayerNum;
    var autocomplete = "off";
    $(newInput).attr("class", classes).attr("name", name).attr("placeholder", placeholder)
        .attr("autocomplete", autocomplete).appendTo("#player-dynamic");
    nextPlayerNum++;
}

function showPlayerRows(players, side) {
    var choice = side == "LEFT" ? "#left-text" : "#right-text";
    $(choice).empty();
    var html = "<table class='table table-striped table-bordered table-hover'><thead><tr>";
    html += "<th class='table-head'>Name</th>";
    html += "<th class='table-head'>GP</th>";
    html += "<th class='table-head'>10</th>";
    html += "<th class='table-head'>15</th>";
    html += "<th class='table-head'>-5</th>";
    html += "<th class='table-head'>Points</th>";
    html += "</tr></thead><tbody>";
    var playerNum = 1;
    var sideText = side == "LEFT" ? "_left" : "_right";
    for (var i = 0; i < players.length; i++) {
        html += "<tr>";
        html += "<input type='hidden' value='" + players[i]._id +  "' " + "name='" + "player" + playerNum + sideText + "id'" + "/>";
        html += "<td>" + players[i].player_name + "</td>";
        html += "<td> <input class='form-control' type='number' placeholder='GP'" + "value='0' name='" + "player" + playerNum + sideText + "gp'" + "/> </td>";
        for (key in players[i].pointValues) {
            var keyNameStr = "name='player" + playerNum + sideText + "_" + key + "val'";
            html += "<td><input class='form-control' type='number' placeholder='" + key + "'" + keyNameStr + "/></td>";
        }
        html += "<td> <input class='form-control' type='input' placeholder='0' disabled /> </td>";
        html += "</tr>";
        playerNum++;
    }
    html += "</tbody><tfoot><tr></tr></tfoot></table>";
    $(choice).append(html);

}
