var profile; //arrays for citizen search, stops sql queries on every button click. 
var fine;    //after the first sql query for each button, these are populated. 
var warrant; //and then used until a new citizen search is made or the cad is closed. 
var reports;
var convictions;
var officerName;

//ON DOCUMENT READY
$(document).ready(function () {

    $("body").on("keyup", function (key) { //allow escape to be used to close the cad. 
        if (key.which == 27) {
            exit();
        }
    });

});

//EVENT LISTENER FOR SENDING NUI MESSAGES

$(function () {
    window.addEventListener('message', function (event) {

        switch (event.data.type) {
            case "opencad":
                if (typeof officerName == "undefined") {
                    this.window.officerName = event.data.name;
                }
                openCad();
                break;
            case "closecad":
                $(".showToggle").css("display", "none");
                break;
            case "citizenResult":
                updateCitizen(event.data.info);
                break;
            case "fineResult":
                updateFine(event.data.info);
                break;
            case "warrantResult":
                updateWarrants(event.data.info);
                break;
            case "reportResult":
                if (event.data.success == true) {
                    $(".reportSuccess").css("display", "block");
                } else if (event.data.success == "notFound") {
                    $(".notFound").css("display", "block");
                } else if (event.data.success == false) {
                    $(".reportFailed").css("display", "block");
                }
                break;
            case "updateReport":
                showReports(event.data.info)
                break;
            case "citizenReports":
                updateIncidents(event.data.info);
                break;
            case "citizenConvictions":
                updateConvictions(event.data.info)
                break;
            case "fineDeleted":
                if (event.data.info == true) {
                    emptyArrays('fines'); //empty the fine array after fine delete
                    showFines(); //ping server for update list of fines. 
                } else {
                    //something broke
                }
                break;
            case "warrantDeleted":
                if (event.data.info == true) {
                    emptyArrays('warrants'); //empty the warrant array after warrant delete
                    viewReport(); //ping server for update list of fines. 
                } else {
                    //something broke
                }
                break;
            case "reportDeleted":
                if (event.data.info == true) {
                    emptyArrays('reports'); //empty the report array after report delete
                    $.post('http://crumblecad/getReports') //go get new reports. 
                } else {
                    //report didn't delete, some shit broke
                }
                break;
            case "vehicleResult":
                if (event.data.info !== false) {
                    vehicleResults(event.data.info, event.data.model, event.data.primaryColor)
                } else {
                    this.document.getElementById('vehicleStolen').style.display = "block";
                }
                break;
            default:
                this.console.log('some shit broke in the switch.')
                break;
        }
    });
});

//close function

function exit() {
    $.post("http://crumblecad/closeCad", JSON.stringify({}));
}

//functions for citizen searching
function citizenSearch() { //search page that triggers post to get citizen data
    document.getElementById("citizenError").style.display = "none";
    document.getElementById('citizenNotfound').style.display = 'none';

    if (document.getElementById("firstname").value == "" || document.getElementById("surname").value == "") {

        $(".showToggle").css("display", "block");
        document.getElementById("citizenError").style.display = "block";

    } else {

        var input = document.getElementById('dateOfBirth').value;
        var date = convertDate(input);

        $.post('http://crumblecad/citizenSearch', JSON.stringify({
            firstname: document.getElementById("firstname").value,
            surname: document.getElementById("surname").value,
            dob: date,
        }));
    }
}

function updateCitizen(info) {

    emptyArrays('all'); //Empty the arrays incase of new citizen search, this is required otherwise it will print the old info
    //on top of the new info. 

    if (info !== null && info !== "" && typeof info !== 'undefined') { //only entered if we got data back from the lua. 

        citizenElements();

        $("#profileTable .profileTableBody").empty();

        window.profile = info;

        document.getElementById('name').innerHTML = this.profile.name;
        document.getElementById('dob').innerHTML = this.profile.dob;

        if (this.profile.profile.gender == "M") {
            document.getElementById('gender').innerHTML = "Male";
        } else {
            document.getElementById('gender').innerHTML = "Female";
        }

        document.getElementById('height').innerHTML = this.profile.profile.height;

        if (this.profile.profile.carL == "y") {
            document.getElementById('cLicense').innerHTML = "Yes";
        } else {
            document.getElementById('cLicense').innerHTML = "No";
        }

        if (this.profile.profile.bikeL == "y") {
            document.getElementById('bLicense').innerHTML = "Yes";
        } else {
            document.getElementById('bLicense').innerHTML = "No";
        }

        if (this.profile.profile.commercialL == "y") {
            document.getElementById('coLicense').innerHTML = "Yes";
        } else {
            document.getElementById('coLicense').innerHTML = "No";
        }

    } else { //triggers the "Citizen not found" if no data was received back from lua. 
        document.getElementById('citizenNotfound').style.display = 'block';
    }
}

//fine stuff
function showFines() { //triggered by "Show fines" button click. Will go and get fine data from db if array is empty. 
    if (typeof this.fine !== "undefined") {

        if (this.fine.length == 0) {
            $.post('http://crumblecad/getFines', JSON.stringify({
                identifier: this.profile.identifier,
                name: this.profile.name,
            }));
        } else {
            updateFine();
        }

    } else {

        $.post('http://crumblecad/getFines', JSON.stringify({
            identifier: this.profile.identifier,
            name: this.profile.name,
        }));

    }
}

function updateFine(info) { //Updates the fine table after we receive the nui message. 

    hideNotfound(); //this hides any not found messages

    if (info !== null && info !== "" && typeof info !== 'undefined') { //this is entered if a fresh call

        fineElements();

        window.fine = info;

        var arrayLength = info.length;

        $("#fineBody").empty();

        for (i = 0; arrayLength; i++) {

            if (typeof info[i] !== "undefined") {

                var paid;

                if (info[i].paid == "n") {
                    paid = "No";
                } else {
                    paid = "Yes"
                }

                var fineBlock

                if (info[i].officer === this.officerName) {
                    fineBlock = '<tr><th scope="row" class="fineOfficer">' + info[i].officer + '</th> \
                    <th class="fineReason" >'+ info[i].reason + '</th><td class="fineAmount">' + info[i].amount + '</td> \
                    <td class="fineDate">'+ info[i].date + '</td><th class="fineSettled">' + paid + '</th> \
                    <th class="deleteFine"><button type="submit" class="btn btn-primary" onclick="deleteFine(\'' + info[i].officer + '\',\'' + info[i].reason.replace(/'/g, "\\'") + '\',\'' + info[i].date + '\')"><span>Delete Fine.</span></button></th></tr>'
                } else {
                    fineBlock = '<tr><th scope="row" class="fineOfficer">' + info[i].officer + '</th> \
                    <th class="fineReason" >'+ info[i].reason + '</th><td class="fineAmount">' + info[i].amount + '</td> \
                    <td class="fineDate">'+ info[i].date + '</td><th class="fineSettled">' + paid + '</th><th></th></tr>'
                }

                $('#fineTable').append(fineBlock)
            } else {
                break;
            }
        }

    } else if (typeof this.fine !== "undefined") { //this is entered if not a fresh call and pulled from arrays. 

        if (typeof this.fine[0] !== "undefined") {

            fineElements();

            var arrayLength = this.fine.length

            $("#fineBody").empty();

            for (i = 0; arrayLength; i++) {

                if (typeof this.fine[i] !== "undefined") {
                    var paid;

                    if (this.fine[i].paid == "n") {
                        paid = "No";
                    } else {
                        paid = "Yes"
                    }

                    var fineBlock;

                    if (this.fine[i].officer === this.officerName) {
                        fineBlock = '<tr><th scope="row" class="fineOfficer">' + this.fine[i].officer + '</th> \
                        <th class ="fineReason" >'+ this.fine[i].reason + '</th><td class="fineAmount">' + this.fine[i].amount + '</td> \
                        <td class="fineDate">'+ this.fine[i].date + '</td><th class="fineSettled">' + paid + '</th> \
                        <th class="deleteFine"><button type="submit" class="btn btn-primary" onclick="deleteFine(\'' + this.fine[i].officer + '\',\'' + this.fine[i].reason.replace(/'/g, "\\'") + '\',\'' + this.fine[i].date + '\')"><span>Delete Fine.</span></button></th></tr>'
                    } else {
                        fineBlock = '<tr><th scope="row" class="fineOfficer">' + this.fine[i].officer + '</th> \
                        <th class ="fineReason" >'+ this.fine[i].reason + '</th><td class="fineAmount">' + this.fine[i].amount + '</td> \
                        <td class="fineDate">'+ this.fine[i].date + '</td><th class="fineSettled">' + paid + '</th><th></th></tr>'
                    }

                    $('#fineTable').append(fineBlock)
                } else {
                    break;
                }
            }
        } else {
            $(".noFines").css("display", "block");
            var style = document.getElementById('fineResults').style.display //check if we are on fine page, due to deleting fines. 
            if (style == "block") {
                document.getElementById("fineResults").style.display = "none";
                document.getElementById("citizenResults").style.display = "block";
                $(".noFines").css("display", "none");
            }
        }
    } else {
        $(".noFines").css("display", "block");
    }
}

function deleteFine(officer, reason, date) {
    $.post('http://crumblecad/deleteFine', JSON.stringify({
        _officer: officer,
        _reason: reason,
        _date: date
    }));
}

//warrant stuff
function showWarrants() {

    if (typeof this.warrant !== "undefined") { //can't put the "if warrant lentgh == 0" here as will throw an error if array is undefined. 

        if (this.warrant.length == 0) {
            $.post('http://crumblecad/getWarrants', JSON.stringify({
                identifier: this.profile.identifier,
                name: this.profile.name,
            }));
        } else {
            updateWarrants();
        }

    } else {

        $.post('http://crumblecad/getWarrants', JSON.stringify({
            identifier: this.profile.identifier,
            name: this.profile.name,
        }));

    }
}

function updateWarrants(info) {

    hideNotfound(); //this hides any not found messages

    if (info !== null && info !== "" && typeof info !== 'undefined') { //this is entered if a fresh call

        warrantElements();

        window.warrant = info;

        var arrayLength = warrant.length;

        $("#warrantBody").empty();

        for (i = 0; arrayLength; i++) {

            if (typeof info[i] !== "undefined") {

                var served;

                if (info[i].warrant_active == "n") {
                    served = "No";
                } else {
                    served = "Yes"
                }

                var warrantBlock;
                if (info[i].officer === officerName) {
                    warrantBlock = '<tr><th scope="row" id="warrantOfficer">' + info[i].officer + '</th> \
                    <th id ="warrantReason" >'+ info[i].reason + '</th><td id="warrantDate">' + info[i].date_issued + ' \
                    </td><th id="warrantServed">' + served + '</th> <th id="deleteWarrant"><button type="submit" class="btn btn-primary" \
                    onclick="deleteWarrant(\'' + info[i].officer + '\',\'' + info[i].reason.replace(/'/g, "\\'") + '\',\'' + info[i].date_issued + '\')"><span>Delete Warrant.</span></button></th></tr>'
                } else {
                    warrantBlock = '<tr><th scope="row" id="warrantOfficer">' + info[i].officer + '</th> \
                    <th id ="warrantReason" >'+ info[i].reason + '</th><td id="warrantDate">' + info[i].date_issued + ' \
                    </td><th id="warrantServed">' + served + '</th><th></th></tr>'
                }


                $('#warrantTable').append(warrantBlock)
            } else {
                break;
            }
        }

    } else if (typeof this.warrant !== "undefined") { //This is entered if not a fresh call, and pulled from array. 

        if (typeof this.warrant[0] !== "undefined") {

            warrantElements();

            var arrayLength = this.warrant.length

            $("#warrantBody").empty();

            for (i = 0; arrayLength; i++) {

                if (typeof this.warrant[i] !== "undefined") {
                    var served;

                    if (this.warrant[i].warrant_active == "n") {
                        served = "No";
                    } else {
                        served = "Yes"
                    }

                    var warrantBlock;
                    if (this.warrant[i].officer === officerName) {
                        warrantBlock = '<tr><th scope="row" id="warrantOfficer">' + this.warrant[i].officer + '</th> \
                    <th id ="warrantReason" >'+ this.warrant[i].reason + '</th><td id="warrantDate">' + this.warrant[i].date_issued + ' \
                    </td><th id="warrantServed">' + served + '</th> <th id="deleteWarrant"><button type="submit" class="btn btn-primary" \
                    onclick="deleteWarrant(\'' + this.warrant[i].officer + '\',\'' + this.warrant[i].reason.replace(/'/g, "\\'") + '\',\'' + this.warrant[i].date_issued + '\')"><span>Delete Warrant.</span></button></th></tr>'
                    } else {
                        warrantBlock = '<tr><th scope="row" id="warrantOfficer">' + this.warrant[i].officer + '</th> \
                    <th id ="warrantReason" >'+ this.warrant[i].reason + '</th><td id="warrantDate">' + this.warrant[i].date_issued + ' \
                    </td><th id="warrantServed">' + served + '</th> <th></th></tr>'
                    }

                    $('#warrantTable').append(warrantBlock)

                } else {
                    break;
                }
            }
        } else {
            $(".noWarrants").css("display", "block");
            var style = document.getElementById('warrantResults').style.display //check if we are on fine page, due to deleting fines. 
            if (style == "block") {
                document.getElementById("warrantResults").style.display = "none";
                document.getElementById("citizenResults").style.display = "block";
                $(".noWarrants").css("display", "none");
            }
        }
    } else {
        $(".noWarrants").css("display", "block");
    }
}

function deleteWarrant(officer, reason, date) {
    $.post('http://crumblecad/deleteWarrant', JSON.stringify({
        _officer: officer,
        _reason: reason,
        _date: date
    }));
}

//show reports for citizen search

function showIncidents() {
    $.post('http://crumblecad/citizenIncidents', JSON.stringify({
        identifier: profile.identifier,
        name: profile.name
    }));
}

function updateIncidents(_reports) {

    hideNotfound(); //this hides any not found messages

    if (_reports !== null && _reports !== "" && typeof _reports !== 'undefined') { //this is entered from a fresh call

        incidentElements();

        window.reports = _reports;

        var arrayLength = _reports.length;

        $("#citizenReportBody").empty();

        for (i = 0; arrayLength; i++) {

            if (typeof _reports[i] !== "undefined") {

                var name;
                if (typeof _reports[i].suspects_name == "undefined") {
                    name = "Unknown";
                } else {
                    name = _reports[i].suspects_name;
                }

                var reportBlock = '<tr><th scope="row" id="reportOfficer">' + _reports[i].officer + '</th> \
                <th id ="reportSuspect" >'+ name + '</th><td id="report">' + _reports[i].report + '</td> \
                <td id="reportDate">'+ _reports[i].date + '</td></tr>'

                $('#citizenReportTable').append(reportBlock)
            } else {
                break;
            }
        }

    } else if (typeof this.reports !== "undefined") { //this is entered if not a fresh call and pulled from array

        if (typeof this.reports[0] !== "undefined") {

            incidentElements();

            var arrayLength = this.reports.length

            $("#citizenReportBody").empty();

            for (i = 0; arrayLength; i++) {

                if (typeof this.reports[i] !== "undefined") {

                    var name;
                    if (typeof reports[i].suspects_name == "undefined") {
                        name = "Unknown";
                    } else {
                        name = reports[i].suspects_name;
                    }

                    var reportBlock = '<tr><th scope="row" id="reportOfficer">' + this.reports[i].officer + '</th> \
                    <th id ="reportSuspect" >'+ name + '</th><td id="report">' + this.reports[i].report + '</td> \
                    <td id="reportDate">'+ this.reports[i].date + '</td></tr>'

                    $('#citizenReportTable').append(reportBlock)
                } else {
                    break;
                }
            }
        } else {
            $(".noReports").css("display", "block");
        }
    } else {
        $(".noReports").css("display", "block");
    }
    // this.console.log(event.data.info[1].report)
}

//show convictions. 
function getConvictions() {
    $.post('http://crumblecad/getConvictions', JSON.stringify({
        identifier: profile.identifier,
        name: profile.name
    }));
}

function updateConvictions(info) {

    hideNotfound(); //this hides any not found messages

    if (info !== null && info !== "" && typeof info !== 'undefined') { //this is entered from a fresh call

        convictionElements();

        window.convictions = info;

        var arrayLength = info.length;

        $("#convictionBody").empty();

        for (i = 0; arrayLength; i++) {
            if (typeof info[i] !== "undefined") {

                var fineBlock = '<tr><th scope="row" id="convictionOfficer">' + info[i].officer + '</th> \
                <th id ="convictionPOI" >'+ info[i].suspect_name + '</th><th id="convictionReason">' + info[i].reason + '</th> \
                <th id="convictionTimeServed">'+ info[i].time_served + '</th><th id="convictionDate">' + info[i].date + '</th></tr>'

                $('#convictionTable').append(fineBlock)
            } else {
                break;
            }
        }

    } else if (typeof this.convictions !== "undefined") { //this is entered if not a fresh call and pulled from array. 

        if (typeof this.convictions[0] !== "undefined") {
            convictionElements();

            var arrayLength = this.convictions.length

            $("#convictionBody").empty();

            for (i = 0; arrayLength; i++) {

                if (typeof this.convictions[i] !== "undefined") {

                    var fineBlock = '<tr><th scope="row" id="convictionOfficer">' + this.convictions[i].officer + '</th> \
                    <th id ="convictionPOI" >'+ this.convictions[i].suspect_name + '</th><th id="convictionReason">' + this.convictions[i].reason + '</th> \
                    <th id="convictionTimeServed">'+ this.convictions[i].time_served + '</th><th id="convictionDate">' + this.convictions[i].date + '</th></tr>'

                    $('#convictionTable').append(fineBlock)

                } else {
                    break;
                }
            }
        } else {
            $(".noConvictions").css("display", "block");
        }
    } else {
        $(".noConvictions").css("display", "block");
    }
}
//end of citizen stuff

//Write report stuff
function submitReport() {
    $(".reportFailed").css("display", "none"); //set notifications to none incase new report submitted
    $(".notFound").css("display", "none");
    $(".reportSuccess").css("display", "none");

    var name = document.getElementById("incidentName").value;

    var input = document.getElementById('reportDob').value;
    var dob = convertDate(input);

    if (name == "") {
        name = null;
        dob = null;
    }

    var report = document.getElementById("incidentReport").value;
    if (report == "") {

    } else {
        $.post('http://crumblecad/submitReport', JSON.stringify({
            name,
            report,
            dob
        }));
    }
}

//show repots page for non citizen
function showReports(_reports) {

    if (_reports !== null && _reports !== "" && typeof _reports !== 'undefined') { //this is entered from a fresh call

        window.reports = _reports;

        var arrayLength = _reports.length;

        $("#reportBody").empty();

        for (i = 0; arrayLength; i++) {

            if (typeof _reports[i] !== "undefined") {

                var name;

                if (typeof _reports[i].suspects_name == "undefined") {
                    name = "Unknown";
                } else {
                    name = _reports[i].suspects_name;
                }

                var reportBlock;

                if (_reports[i].officer == officerName) {
                    reportBlock = '<tr><th scope="row" id="reportOfficer">' + _reports[i].officer + '</th> \
                    <th id ="reportSuspect" >'+ name + '</th><td id="report">' + _reports[i].report + '</td> \
                    <td id="reportDate">'+ _reports[i].date + '</td><th id="editReport">\
                    <button type="submit" class="btn btn-primary btn-sm" onclick="editReport(\'' + _reports[i].officer + '\',\'' + _reports[i].report.replace(/'/g, "\\'") + '\',\'' + _reports[i].date + '\')"><span>Edit Report.</span></button></th> \
                    <th id="deleteReport"><button type="submit" class="btn btn-primary btn-sm" onclick="deleteReport(\'' + _reports[i].officer + '\',\'' + _reports[i].report.replace(/'/g, "\\'") + '\',\'' + _reports[i].date + '\')"><span>Delete Report.</span>\
                    </button></th></tr>'
                } else {
                    reportBlock = '<tr><th scope="row" id="reportOfficer">' + _reports[i].officer + '</th> \
                    <th id ="reportSuspect" >'+ name + '</th><td id="report">' + _reports[i].report + '</td> \
                    <td id="reportDate">'+ _reports[i].date + '</td><th></th><th></th></tr>'
                }

                $('#reportBody').append(reportBlock)

            } else {
                break;
            }
        }

    } else if (typeof this.reports !== "undefined") { //this is entered if not a fresh call and pulled from array. 

        if (typeof this.reports[0] !== "undefined") {

            var arrayLength = this.reports.length

            $("#incidentBody").empty();

            for (i = 0; arrayLength; i++) {

                if (typeof this.reports[i] !== "undefined") {

                    var name;

                    if (typeof reports[i].suspects_name == "undefined") {
                        name = "Unknown";
                    } else {
                        name = reports[i].suspects_name;
                    }

                    var reportBlock;

                    if (this.reports[i].officer == officerName) {

                        reportBlock = '<tr><th scope="row" id="reportOfficer">' + this.reports[i].officer + '</th> \
                        <th id ="reportSuspect" >'+ name + '</th><td id="report">' + this.reports[i].report + '</td> \
                        <td id="reportDate">'+ this.reports[i].date + '</td><th id="editReport">\
                        <button type="submit" class="btn btn-primary btn-sm" onclick="editReport(\'' + this.reports[i].officer + '\',\'' + this.reports[i].report.replace(/'/g, "\\'") + '\',\'' + this.reports[i].date + '\')"><span>Edit Report.</span></button></th> \
                        <th id="deleteReport"><button type="submit" class="btn btn-primary btn-sm" onclick="deleteReport(\'' + this.reports[i].officer + '\',\'' + this.reports[i].report.replace(/'/g, "\\'") + '\',\'' + this.reports[i].date + '\')"><span>Delete Report.</span>\
                        </button></th></tr>'
                    } else {
                        reportBlock = '<tr><th scope="row" id="reportOfficer">' + this.reports[i].officer + '</th> \
                        <th id ="reportSuspect" >'+ name + '</th><td id="report">' + this.reports[i].report + '</td> \
                        <td id="reportDate">'+ this.reports[i].date + '</td><th></th><th></th></tr>'
                    }

                    $('#reportTable').append(reportBlock)
                } else {
                    break;
                }
            }
        } else {
            $(".noReportsNormal").css("display", "block");
        }
    } else {
        $(".noReportsNormal").css("display", "block");
    }
    // this.console.log(event.data.info[1].report)
}

function editReport(officer, report, date) {
    console.log('edit ' + officer + " " + report + " " + date)
}

function deleteReport(officer, report, date) {
    $.post('http://crumblecad/deleteReport', JSON.stringify({

        officer: officer,
        report: report,
        date: date,

    }));
}

//End of incendent reports

//start of vehicle search
function vehicleSearch() {
    this.document.getElementById('vehicleStolen').style.display = "none"; //set stolen result to display none on button click.
    var plate = document.getElementById("licensePlate").value;
    if (typeof plate !== "undefined") {
        $.post('http://crumblecad/checkPlate', JSON.stringify({
            plate: plate
        }));
    }
}

function vehicleResults(data, model, color){
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("vehicleResults").style.display = "block";
   
    var vehicleDetails = '<tr><th scope="row" id="vehicleOwner">' + data.ownerName + '</th> \
    <th id ="vehiclePlate" >'+ data.plate + '</th><td id="vehicleModel">' + model + '</td> \
    <td id="vehicleColor">'+ color + '</td><th></th><th></th></tr>'

    $('#vehicleTable').append(vehicleDetails)
}
//Functions for element shit

function homepageBack() {
    document.getElementById("homepage").style.display = "block";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("citizenResults").style.display = "none";
    document.getElementById("issueReport").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
    document.getElementById("warrantResults").style.display = "none";
    document.getElementById("fineResults").style.display = "none";
    document.getElementById("reportResults").style.display = "none";
    document.getElementById("citizenReportResults").style.display = "none";
    document.getElementById("convictionResults").style.display = "none";
}

function showPoi() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("citizenResults").style.display = "block";
    document.getElementById("fineResults").style.display = "none";
    document.getElementById("warrantResults").style.display = "none";
    document.getElementById("citizenReportResults").style.display = "none";
    document.getElementById("convictionResults").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
}

function checkCitizen() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "block";
    document.getElementById("vehicleCheck").style.display = "none";
}

function checkVehicle() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "block";
    document.getElementById('vehicleStolen').style.display = "none";
    document.getElementById("vehicleResults").style.display = "none"; //just incase we triggered on a vehicle back click. 
}

function issueReport() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("issueReport").style.display = "block";
}

function viewReport() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("issueReport").style.display = "none";
    document.getElementById("reportResults").style.display = "block";

    //due to the way reports works, we trigger the client from here.. 
    $.post('http://crumblecad/getReports')
}

function openCad() {
    $(".showToggle").css("display", "block");
    document.getElementById("homepage").style.display = "block";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("citizenResults").style.display = "none";
    document.getElementById("fineResults").style.display = "none";
    document.getElementById("issueReport").style.display = "none";
    document.getElementById("convictionResults").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".reportFailed").css("display", "none");
    $(".notFound").css("display", "none");
    $(".reportSuccess").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
}

function citizenElements() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("fineResults").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
    document.getElementById("citizenResults").style.display = "Block";
    document.getElementById("warrantResults").style.display = "none";
    document.getElementById("convictionResults").style.display = "none";
}

function convictionElements() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("fineResults").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
    document.getElementById("citizenResults").style.display = "none";
    document.getElementById("warrantResults").style.display = "none";
    document.getElementById("citizenReportResults").style.display = "none";
    document.getElementById("convictionResults").style.display = "block";
}

function incidentElements() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("fineResults").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
    document.getElementById("citizenResults").style.display = "none";
    document.getElementById("warrantResults").style.display = "none";
    document.getElementById("citizenReportResults").style.display = "block";
    document.getElementById("convictionResults").style.display = "none";
}

function warrantElements() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("fineResults").style.display = "none";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
    document.getElementById("citizenResults").style.display = "none";
    document.getElementById("warrantResults").style.display = "block";
    document.getElementById("citizenReportResults").style.display = "none";
    document.getElementById("convictionResults").style.display = "none";
}

function fineElements() {
    document.getElementById("homepage").style.display = "none";
    document.getElementById("citizenCheck").style.display = "none";
    document.getElementById("vehicleCheck").style.display = "none";
    document.getElementById("fineResults").style.display = "block";
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
    document.getElementById("citizenResults").style.display = "none";
    document.getElementById("warrantResults").style.display = "none";
    document.getElementById("citizenReportResults").style.display = "none";
    document.getElementById("convictionResults").style.display = "none";
}

function hideNotfound() {
    $(".noFines").css("display", "none");
    $(".noWarrants").css("display", "none");
    $(".noConvictions").css("display", "none");
    $(".noReports").css("display", "none");
}


//funtion to empty the arrays
function emptyArrays(type) {

    if (type == "fines") {
        if (typeof this.fine !== "undefined") {
            for (var i = 0; i < this.fine.length; i++) {
                this.fine[i] = undefined;
            }
            this.fine.length = 0;
        }
    } else if (type == "warrants") {
        if (typeof this.warrant !== "undefined") {
            for (var i = 0; i < this.warrant.length; i++) {
                this.warrant[i] = undefined;
            }
            this.warrant.length = 0;
        }
    } else if (type == "reports") {
        if (typeof this.reports !== "undefined") {

            for (var i = 0; i < this.reports.length; i++) {
                this.reports[i] = undefined;
            }
            this.reports.length = 0;
        }
    } else if (type == "convictions") {
        if (typeof this.convictions !== "undefined") {

            for (var i = 0; i < this.convictions.length; i++) {
                this.convictions[i] = undefined;
            }
            this.convictions.length = 0;
        }
    } else if (type == "all") {
        if (typeof this.convictions !== "undefined") {

            for (var i = 0; i < this.convictions.length; i++) {
                this.convictions[i] = undefined;
            }
            this.convictions.length = 0;
        }
        if (typeof this.reports !== "undefined") {

            for (var i = 0; i < this.reports.length; i++) {
                this.reports[i] = undefined;
            }
            this.reports.length = 0;
        }
        if (typeof this.warrant !== "undefined") {
            for (var i = 0; i < this.warrant.length; i++) {
                this.warrant[i] = undefined;
            }
            this.warrant.length = 0;
        }
        if (typeof this.fine !== "undefined") {
            for (var i = 0; i < this.fine.length; i++) {
                this.fine[i] = undefined;
            }
            this.fine.length = 0;
        }
    }
}

//funciton to convert dates
function convertDate(date) {

    var _date = new Date(date);
    var day = _date.getDate();

    if (day < 10) {
        day = "0" + day;
    }

    var month = _date.getMonth() + 1;

    if (month < 10) {
        month = '0' + month;
    }

    var year = _date.getFullYear();
    return day + "/" + month + "/" + year;
}