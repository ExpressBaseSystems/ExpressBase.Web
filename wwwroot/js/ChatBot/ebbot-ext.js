//page to external bot/bot plugin/bot div /iframe for bot
// written in pure js

(function () {
    var d = document;
    console.log("ext_js loaded");
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
    var themeColor;
    var html;
    var dpurl;
    var subtxt;
    if (d.appIdColl) {
        AppId = d.appIdColl[d.appIdCount];
        dpurl = d.botdpURLColl[d.appIdCount] || '../images/demobotdp4.png';
        themeColor = d.ebbotThemeColorColl[d.appIdCount] || '#055c9b';
        subtxt = d.ebbotSubtextColl[d.appIdCount] || '';
        html = d.getElementsByTagName('html')[0];
        html.style.setProperty("--ebbotThemeColor", themeColor);
    }
    else {
        AppId = window.EXPRESSbase_APP_ID;
        dpurl = d.botdpURL || '../images/demobotdp4.png';
        themeColor = d.ebbotThemeColor;
        subtxt = d.botsubtext||'';
        html = d.getElementsByTagName('html')[0];
        html.style.setProperty("--ebbotThemeColor", themeColor);
    }

    ////ss=stylesheet => create a link for including bot-ext.css and append into head of iframe
    //var ss = d.createElement("link");
    //ss.type = "text/css";
    //ss.rel = "stylesheet";
    //ss.href = this.eb_get_path(d.ebmod) + "css/ChatBot/bot-ext.css";
    //ss.onload = function () { console.log('style has loaded'); };
    //d.getElementsByTagName("head")[0].appendChild(ss); 


    var ss = d.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = this.eb_get_path(d.ebmod) + `Bote/Css?id=${window.EXPRESSbase_SOLUTION_ID}-${AppId}&mode=s"`;
    d.getElementsByTagName("head")[0].appendChild(ss);



    //var ss1 = d.createElement("style");
    //ss1.type = "text/css";
    //ss1.innerHTML = atob(d.botCSS);
    ////if (ss1.styleSheet) ss1.styleSheet.cssText = atob(d.botCSS); // Support for IE
    ////else ss1.appendChild(document.createTextNode(atob(d.botCSS))); // Support for the rest
    //ss1.onload = function() {  console.log('style has loaded'); };
    //d.getElementsByTagName("head")[0].appendChild(ss1);




    //division for header part of chat bot ie for heading(d.ebbotName), close btn,maximize window (above iframe)......(2)
    var chatHead = d.createElement("div");
    chatHead.className = "eb-chat-head eb__-bot___-eb-chat-head";

    if (d.appIdColl ? d.botPropColl[d.appIdCount].HeaderIcon : d.botProp.HeaderIcon) {
        var headericonCont = d.createElement("div");
        headericonCont.className = "headericonCont eb__-bot___-headericonCont";
        var headerIcon = d.createElement("img");
        headerIcon.className = "headerIcon eb__-bot___-headerIcon";
        headerIcon.id = "headerIcon" + AppId;
        headerIcon.src = this.eb_get_path(d.ebmod) + dpurl;
        headericonCont.appendChild(headerIcon);
        chatHead.appendChild(headericonCont);
    }


    //creata a div for chatbot heading and append in chathead div ie, division for header part of chat bot
    var botHeadDiv = d.createElement("div");
    botHeadDiv.className = "bot-head eb__-bot___-bot-head";
    botHeadDiv.innerHTML = (d.ebbotName || d.ebbotNameColl[d.appIdCount]);
    chatHead.appendChild(botHeadDiv);
    //var html = d.getElementsByTagName('html')[0];
    //html.style.setProperty("--ebbotThemeColor", themeColor);

    //var botdp = d.createElement("div");
    //botdp.className = "bot-icon";

    //chatHead.appendChild(botdp);

   

    if (d.appIdColl ? d.botPropColl[d.appIdCount].HeaderSubtxt : d.botProp.HeaderSubtxt) {
        var headersubtext = d.createElement("div");
        headersubtext.className = "headersubtext eb__-bot___-headersubtext";
        headersubtext.innerHTML = subtxt;
        botHeadDiv.appendChild(headersubtext);
    }


    //creatting a division/container to place iframe and hearer part ie complete bot....(1)
    var iframecont = d.createElement("div");
    iframecont.id = "eb_iframecont" + AppId;
    iframecont.setAttribute("appid", AppId);
    iframecont.className = "eb_iframecont eb__-bot___-eb_iframecont";

    //create a iframe and place in iframecont contrainer........(4)
    var iframe = d.createElement("iframe");
    iframe.id = "ebbot_iframe" + AppId;
    iframe.className = "ebbot_iframe eb__-bot___-ebbot_iframe";
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "geolocation");


    iframecont.appendChild(chatHead);//need to place above near container creation

    //iframe placed in loaderd div........(3)
    var loaderDiv = d.createElement("div");
    loaderDiv.id = "loderdiv" + AppId;
    loaderDiv.className = "loderdiv eb__-bot___-loderdiv";

    loaderDiv.appendChild(iframe);
    iframecont.appendChild(loaderDiv);
    d.body.appendChild(iframecont);

    //??????????
    var chatbtn = d.createElement("div");
    chatbtn.id = "chatbtn" + AppId;
    chatbtn.className = "chatbtn eb__-bot___-chatbtn";
    //var chatIcon = d.getElementsByClassName('boticon')[0];
    var chatIcon = d.createElement("img");
    chatIcon.className = "boticon eb__-bot___-boticon";
    chatIcon.id = "boticon" + AppId;
    chatIcon.src = this.eb_get_path(d.ebmod) + dpurl;

    //creata a maximize btn and append in chathead div ie, division for header part of chat bot
    var maximizeDiv = d.createElement("div");
    maximizeDiv.className = "chatmaximize";
    maximizeDiv.id = "maximizediv" + AppId;
    maximizeDiv.innerHTML = '&#128470;';
    chatHead.appendChild(maximizeDiv);

    //creata a close btn and append in chathead div ie, division for header part of chat bot
    var closeDiv = d.createElement("div");
    closeDiv.className = "chatclose";
    closeDiv.id = "closediv" + AppId;
    closeDiv.innerHTML = '&#10006;';
    chatHead.appendChild(closeDiv);
    
    //???
    iframe.onload = function (e) {
        iframe.style.visibility = 'visible';
    };

    //to close chatbot
    closeDiv.onclick = function () {
        document.getElementById("eb_iframecont" + AppId).style.display = "none";
        if (!d.appIdColl)
            document.getElementById("chatbtn" + AppId).style.display = "block";
    };
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
    };

    //??????
    chatbtn.onclick = function () {
        var iframecont = document.getElementById("eb_iframecont" + AppId);
        var ebbot_iframe = document.getElementById("ebbot_iframe" + AppId);

        if (!ebbot_iframe.getAttribute("src")) {
            ebbot_iframe.setAttribute("src", `${eb_get_path(d.ebmod)}bote/bot?tid=${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}`);
            //ebbot_iframe.setAttribute("src", `${eb_get_path(d.ebmod)}bote/bot?tid=${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&themeColor=${(themeColor).replace('#', 'HEX')}&botdpURL=${window.btoa((d.botdpURL || d.botdpURLColl[d.appIdCount]))}&msg=${(d.botWelcomeMsg || d.botWelcomeMsgColl[d.appIdCount])}`);
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
        //chatIcon.setAttribute("width", "100%");
        //chatIcon.setAttribute("height", "100%");
        d.body.appendChild(chatbtn);
        var iconCont = d.createElement("div");
        iconCont.className = "iconCont eb__-bot___-iconCont";
        //iconCont.style.width = "30px";
        //iconCont.style.height = "30px";
        iconCont.appendChild(chatIcon);
        chatbtn.appendChild(iconCont);
        // chatbtn.appendChild(chatIcon);
        // chatbtn.click();//////////////////////////////// for showing chatarea on load
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


