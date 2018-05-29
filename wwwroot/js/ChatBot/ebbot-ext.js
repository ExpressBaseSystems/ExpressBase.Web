(function () {
    var d = document;
    var AppId;
    if (d.appIdColl) {
        AppId = d.appIdColl[d.appIdCount];
    }
    else {
        AppId = window.EXPRESSbase_SOLUTION_ID
        var themeColor = d.ebbotThemeColor;
        var html = d.getElementsByTagName('html')[0];
        html.style.setProperty("--ebbotThemeColor", themeColor);
    }

    var ss = d.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    //ss.href = "../css/ChatBot/bot-ext.css";
    ss.href = "https://eb-test.info/css/ChatBot/bot-ext.css";
    d.getElementsByTagName("head")[0].appendChild(ss);

    var chatHead = d.createElement("div");
    chatHead.className = "eb-chat-head";

    var botHeadDiv = d.createElement("div");
    botHeadDiv.className = "bot-head";
    botHeadDiv.innerHTML = "&nbsp; " + (d.ebbotName || d.ebbotNameColl[d.appIdCount]);

    //var html = d.getElementsByTagName('html')[0];
    //html.style.setProperty("--ebbotThemeColor", themeColor);

    //var botdp = d.createElement("div");
    //botdp.className = "bot-icon";

    //chatHead.appendChild(botdp);

    chatHead.appendChild(botHeadDiv);

    var iframecont = d.createElement("div");
    iframecont.id = "eb_iframecont" + AppId;
    iframecont.setAttribute("appid", AppId);
    iframecont.className = "eb_iframecont";

    var iframe = d.createElement("iframe");
    iframe.id = "ebbot_iframe" + AppId;
    iframe.className = "ebbot_iframe";
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "geolocation");
    iframecont.appendChild(chatHead);

    var loaderDiv = d.createElement("div");
    loaderDiv.id = "loderdiv" + AppId;
    loaderDiv.className = "loderdiv";

    loaderDiv.appendChild(iframe);
    iframecont.appendChild(loaderDiv);
    d.body.appendChild(iframecont);

    var chatbtn = d.createElement("div");
    chatbtn.id = "chatbtn" + AppId;
    chatbtn.className = "chatbtn";
    //var chatIcon = d.getElementsByClassName('boticon')[0];
    var chatIcon = d.createElement("img");
    chatIcon.className = "boticon"
    chatIcon.id = "boticon" + AppId;
    chatIcon.src = (d.botdpURL || d.botdpURLColl[d.appIdCount]);


    var closeDiv = d.createElement("div");
    closeDiv.className = "chatclose"
    closeDiv.id = "closediv" + AppId;
    closeDiv.innerHTML = '&#10006;';

    chatHead.appendChild(closeDiv);

    var maximizeDiv = d.createElement("div");
    maximizeDiv.className = "chatmaximize"
    maximizeDiv.id = "maximizediv" + AppId;
    maximizeDiv.innerHTML = '&#128470;';
    chatHead.appendChild(maximizeDiv);

    iframe.onload = function (e) {
        iframe.style.visibility = 'visible';
    };

    closeDiv.onclick = function () {
        document.getElementById("eb_iframecont" + AppId).style.display = "none";
        document.getElementById("chatbtn" + AppId).style.display = "block";
    }

    maximizeDiv.onclick = function () {
        console.log(AppId);
        if (document.getElementById("eb_iframecont" + AppId).style.width === "") {
            document.getElementById("eb_iframecont" + AppId).style.width = "50%";
            maximizeDiv.innerHTML = '&#128471;';
        }
        else {
            document.getElementById("eb_iframecont" + AppId).style.width = "";
            maximizeDiv.innerHTML = '&#128470;';
        }
    }

    chatbtn.onclick = function () {
        var iframecont = document.getElementById("eb_iframecont" + AppId);
        var ebbot_iframe = document.getElementById("ebbot_iframe" + AppId);

        if (!ebbot_iframe.getAttribute("src")) {
            //            ebbot_iframe.setAttribute("src", "https://expressbase.com/bote/bot?tid=" + `${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&themeColor=${((d.ebbotThemeColor || d.ebbotThemeColorColl[d.appIdCount])).replace('#', 'HEX')}&botdpURL=${window.btoa((d.botdpURL || d.botdpURLColl[d.appIdCount]))}`);
                        ebbot_iframe.setAttribute("src", "https://eb-test.info/bote/bot?tid=" + `${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&themeColor=${((d.ebbotThemeColor || d.ebbotThemeColorColl[d.appIdCount])).replace('#', 'HEX')}&botdpURL=${window.btoa((d.botdpURL || d.botdpURLColl[d.appIdCount]))}`);
            //ebbot_iframe.setAttribute("src", `//${window.EXPRESSbase_SOLUTION_ID}.localhost:41500/bote/bot?tid=${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&themeColor=${((d.ebbotThemeColor || d.ebbotThemeColorColl[d.appIdCount])).replace('#', 'HEX')}&botdpURL=${window.btoa((d.botdpURL || d.botdpURLColl[d.appIdCount]))}`);
        }
        if (iframecont.style.display !== "flex") {
            this.style.display = "none";
            iframecont.style.display = "flex";
        } else {
            this.className = ""
            iframecont.style.display = "none";
        }
    }


    if (!d.appIdColl) {
        chatIcon.setAttribute("width", "100%");
        chatIcon.setAttribute("height", "100%");
        d.body.appendChild(chatbtn);
        var iconCont = d.createElement("div");
        iconCont.style.width = "30px";
        iconCont.style.height = "30px";
        iconCont.appendChild(chatIcon);
        chatbtn.appendChild(iconCont);
        chatbtn.click();////////////////////////////////
    }
    else {
        iframecont.style.minWidth = "inherit";
        d.getElementsByClassName("usecase-bots-cont")[0].appendChild(iframecont);
        d.getElementById("closediv" + AppId).style.display = "none";
        d.getElementById("maximizediv" + AppId).style.display = "none";
        chatbtn.click();
    }

    //var dpicon = chatIcon.cloneNode(true);
    //dpicon.style.width = "40px";
    //dpicon.style.height = "40px";
    //botdp.appendChild(dpicon);

})();