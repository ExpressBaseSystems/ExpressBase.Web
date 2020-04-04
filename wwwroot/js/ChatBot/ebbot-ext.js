//page to external bot/bot plugin/bot div /iframe for bot
// written in pure js

(function () {
    var d = document;

    //PUSHED_JS_STATEMENTS

    this.eb_get_path = function (ebmod) {
        if (ebmod === 'Production')
            return "https://" + window.EXPRESSbase_SOLUTION_ID + ".expressbase.com/";
        else if (ebmod === 'Staging')
            return "https://" + window.EXPRESSbase_SOLUTION_ID + ".eb-test.cloud/";
        else
            return "https://" + window.EXPRESSbase_SOLUTION_ID + ".localhost:41502/";
    };
    //appIdColl??
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

    //ss=stylesheet => create a link for including bot-ext.css and append into head of iframe
    var ss = d.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = this.eb_get_path(d.ebmod) + "css/ChatBot/bot-ext.css";
    d.getElementsByTagName("head")[0].appendChild(ss);

    //division for header part of chat bot ie for heading(d.ebbotName), close btn,maximize window (above iframe)......(2)
    var chatHead = d.createElement("div");
    chatHead.className = "eb-chat-head";

    //creata a div for chatbot heading and append in chathead div ie, division for header part of chat bot
    var botHeadDiv = d.createElement("div");
    botHeadDiv.className = "bot-head";
    botHeadDiv.innerHTML = "&nbsp; " + (d.ebbotName || d.ebbotNameColl[d.appIdCount]);

    //var html = d.getElementsByTagName('html')[0];
    //html.style.setProperty("--ebbotThemeColor", themeColor);

    //var botdp = d.createElement("div");
    //botdp.className = "bot-icon";

    //chatHead.appendChild(botdp);

    chatHead.appendChild(botHeadDiv);

    //creatting a division/container to place iframe and hearer part ie complete bot....(1)
    var iframecont = d.createElement("div");
    iframecont.id = "eb_iframecont" + AppId;
    iframecont.setAttribute("appid", AppId);
    iframecont.className = "eb_iframecont";

    //create a iframe and place in iframecont contrainer........(4)
    var iframe = d.createElement("iframe");
    iframe.id = "ebbot_iframe" + AppId;
    iframe.className = "ebbot_iframe";
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "geolocation");


    iframecont.appendChild(chatHead);//need to place above near container creation

    //iframe placed in loaderd div........(3)
    var loaderDiv = d.createElement("div");
    loaderDiv.id = "loderdiv" + AppId;
    loaderDiv.className = "loderdiv";

    loaderDiv.appendChild(iframe);
    iframecont.appendChild(loaderDiv);
    d.body.appendChild(iframecont);

    //??????????
    var chatbtn = d.createElement("div");
    chatbtn.id = "chatbtn" + AppId;
    chatbtn.className = "chatbtn";
    //var chatIcon = d.getElementsByClassName('boticon')[0];
    var chatIcon = d.createElement("img");
    chatIcon.className = "boticon";
    chatIcon.id = "boticon" + AppId;
    chatIcon.src = (d.botdpURL || d.botdpURLColl[d.appIdCount]);


    //place near chat head
    //creata a close btn and append in chathead div ie, division for header part of chat bot
    var closeDiv = d.createElement("div");
    closeDiv.className = "chatclose";
    closeDiv.id = "closediv" + AppId;
    closeDiv.innerHTML = '&#10006;';
    chatHead.appendChild(closeDiv);

    //creata a maximize btn and append in chathead div ie, division for header part of chat bot
    var maximizeDiv = d.createElement("div");
    maximizeDiv.className = "chatmaximize";
    maximizeDiv.id = "maximizediv" + AppId;
    maximizeDiv.innerHTML = '&#128470;';
    chatHead.appendChild(maximizeDiv);

    //???
    iframe.onload = function (e) {
        iframe.style.visibility = 'visible';
    };

    //to close chatbot
    closeDiv.onclick = function () {
        document.getElementById("eb_iframecont" + AppId).style.display = "none";
        if (!d.appIdColl)
            document.getElementById("chatbtn" + AppId).style.display = "block";
    }
    //to minimize chatbot
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

    //??????
    chatbtn.onclick = function () {
        var iframecont = document.getElementById("eb_iframecont" + AppId);
        var ebbot_iframe = document.getElementById("ebbot_iframe" + AppId);

        if (!ebbot_iframe.getAttribute("src")) {
            ebbot_iframe.setAttribute("src", `${eb_get_path(d.ebmod)}bote/bot?tid=${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&themeColor=${((d.ebbotThemeColor || d.ebbotThemeColorColl[d.appIdCount])).replace('#', 'HEX')}&botdpURL=${window.btoa((d.botdpURL || d.botdpURLColl[d.appIdCount]))}&msg=${(d.botWelcomeMsg || d.botWelcomeMsgColl[d.appIdCount])}`);
        }
        if (iframecont.style.display !== "flex") {
            this.style.display = "none";
            iframecont.style.display = "flex";
        } else {
            this.className = "";
            iframecont.style.display = "none";
        }
    };


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
        //d.getElementById("closediv" + AppId).style.display = "none";
        //d.getElementById("maximizediv" + AppId).style.display = "none";
        chatbtn.click();
    }

    //var dpicon = chatIcon.cloneNode(true);
    //dpicon.style.width = "40px";
    //dpicon.style.height = "40px";
    //botdp.appendChild(dpicon);

})();


