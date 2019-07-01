
function calculateAmt() {
    var users = document.getElementById('usr').value;
    var tot;
    if (users <= 5) {
        tot = 0;
        document.getElementById('continue-button').disabled = true;
        document.getElementById('continue-button').style.cursor = "not-allowed";
    }
    else {
        var tot = users * 5;
        document.getElementById('continue-button').disabled = false;
        document.getElementById('continue-button').style.cursor = "pointer";
    }
    var tott = "$" + tot;
    var tcontent = "(" + users + " users * $5/month)";
    var button = "Subscribe ( $" + tot + " / month)";
    document.getElementById('total-content').innerHTML = tcontent;
    document.getElementById('total').innerHTML = tott;
    document.getElementById('tot').value = tot;
    document.getElementById('usrno').value = users;
    document.getElementById("div-total").style.display = "flex";
    document.getElementById('pay').innerHTML = button;
}

function showpayment() {
    var users = document.getElementById('usr').value;
    if (users <= 5) {

    }
    else {
        document.getElementById("users-form").style.display = "block";
        document.getElementById("payment-form").style.display = "block";
        document.getElementById("subscription-req").style.display = "none";
        document.getElementById("div-continue-button").style.display = "none";
        document.getElementById("div-usr").style.display = "none";
    }
}

function showusr() {
    document.getElementById("subscription-req").style.display = "none";
    document.getElementById("users-form").style.display = "block";
    document.getElementById("payment-form").style.display = "none";
    calculateAmt();
}


function calculateAmount1() {
    var users = document.getElementById('usr1').value;
    var tot;
    if (users <= 5) {
        tot = 0;
        document.getElementById('pay1').disabled = true;
        document.getElementById('pay1').style.cursor = "not-allowed";
    }
    else {
        var tot = users * 5;
        document.getElementById('pay1').disabled = false;
        document.getElementById('pay1').style.cursor = "pointer";
    }
    var tott = "$" + tot;
    var tcontent = "(" + users + " users * $5/month)";
    var button = "Subscribe ( $" + tot + " / month)";
    document.getElementById('total-content1').innerHTML = tcontent;
    document.getElementById('total1').innerHTML = tott;
    document.getElementById('tot1').value = tot;
    document.getElementById('usrno1').value = users;
    document.getElementById("div-total1").style.display = "flex";
    document.getElementById('pay1').innerHTML = button;
}

function showpayment1() {
    var users = document.getElementById('usr1').value;
    if (users <= 5) {

    }
    else {
        document.getElementById("users-form1").style.display = "block";
        document.getElementById("payment-form1").style.display = "none";
        document.getElementById("subscription-update-req").style.display = "none";
        document.getElementById("div-continue-button1").style.display = "none";
        document.getElementById("div-usr1").style.display = "none";
    }
}

function showusr1() {
    document.getElementById("subscription-update-req").style.display = "none";
    document.getElementById("users-form1").style.display = "block";
    calculateAmt1();
}

