﻿//page to external bot/bot plugin/bot div /iframe for bot
// written in pure js

(function () {
    var d = document;
    console.log("ext_js loaded");
    //PUSHED_JS_STATEMENTS

    this.eb_get_path = function (ebmod) {
        if (ebmod === 'Production')
            return "https://" + window.EXPRESSbase_cid + ".expressbase.com/";
        else if (ebmod === 'Staging')
            return "https://" + window.EXPRESSbase_cid + ".eb-test.fyi/";
        else
            return "https://" + window.EXPRESSbase_cid + ".localhost:41502/";
    };
   
    //appIdColl??
    var pageurl = btoa(window.location.href);
    var AppId;
    var themeColor;
    var html;
    var dpurl;
    var subtxt;
    var headerLogo = `images/logo/${window.EXPRESSbase_cid}.png`;
    if (d.appIdColl) {
        AppId = d.appIdColl[d.appIdCount];

        if (d.appIdColl ? d.botPropColl[d.appIdCount].Use_Sol_logo : d.botProp.Use_Sol_logo) {
            dpurl = headerLogo;
        }
        else {
            dpurl = (/^\d+$/.test(d.botdpURLColl[d.appIdCount])) ? (`botExt/images/original/${d.botdpURLColl[d.appIdCount]}.png`) : (d.botdpURLColl[d.appIdCount] || '../images/demobotdp4.png');
        }
        
        themeColor = d.ebbotThemeColorColl[d.appIdCount] || '#055c9b';
        subtxt = d.ebbotSubtextColl[d.appIdCount] || '';
        html = d.getElementsByTagName('html')[0];
        html.style.setProperty("--ebbotThemeColor", themeColor);
    }
    else {
        AppId = window.EXPRESSbase_APP_ID;
        if (d.appIdColl ? d.botPropColl[d.appIdCount].Use_Sol_logo : d.botProp.Use_Sol_logo) {
            dpurl = headerLogo;
        }
        else {
            dpurl = (/^\d+$/.test(d.botdpURL)) ? `botExt/images/original/${d.botdpURL}.png` : (d.botdpURL || '../images/demobotdp4.png');
        }
        themeColor = d.ebbotThemeColor;
        subtxt = d.botsubtext || '';
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
    ss.href = this.eb_get_path(d.ebmod) + `Bote/Css?id=${AppId}&mode=s"`;
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
    chatHead.className = "eb-chat-head eb__-bot___-eb-chat-head" + AppId;
    chatHead.style.visibility = 'hidden';
    if (d.appIdColl ? d.botPropColl[d.appIdCount].HeaderIcon : d.botProp.HeaderIcon) {
        var headericonCont = d.createElement("div");
        headericonCont.className = "headericonCont eb__-bot___-headericonCont" + AppId;
        var headerIcon = d.createElement("img");
        headerIcon.className = "headerIcon eb__-bot___-headerIcon" + AppId;
        headerIcon.id = "headerIcon" + AppId;
        headerIcon.src = this.eb_get_path(d.ebmod) + dpurl;
        headericonCont.appendChild(headerIcon);
        chatHead.appendChild(headericonCont);
    }


    //creata a div for chatbot heading and append in chathead div ie, division for header part of chat bot
    var botHeadDiv = d.createElement("div");
    botHeadDiv.className = "bot-head eb__-bot___-bot-head" + AppId;
    botHeadDiv.innerHTML = (d.ebbotName || d.ebbotNameColl[d.appIdCount]);
    chatHead.appendChild(botHeadDiv);
    //var html = d.getElementsByTagName('html')[0];
    //html.style.setProperty("--ebbotThemeColor", themeColor);

    //var botdp = d.createElement("div");
    //botdp.className = "bot-icon";

    //chatHead.appendChild(botdp);



    if (d.appIdColl ? d.botPropColl[d.appIdCount].HeaderSubtxt : d.botProp.HeaderSubtxt) {
        var headersubtext = d.createElement("div");
        headersubtext.className = "headersubtext eb__-bot___-headersubtext" + AppId;
        headersubtext.innerHTML = subtxt;
        botHeadDiv.appendChild(headersubtext);
    }


    //creatting a division/container to place iframe and hearer part ie complete bot....(1)
    var iframecont = d.createElement("div");
    iframecont.id = "eb_iframecont" + AppId;
    iframecont.setAttribute("appid", AppId);
    iframecont.className = "eb_iframecont eb__-bot___-eb_iframecont" + AppId;

    //create a iframe and place in iframecont contrainer........(4)
    var iframe = d.createElement("iframe");
    iframe.id = "ebbot_iframe" + AppId;
    iframe.className = "ebbot_iframe eb__-bot___-ebbot_iframe" + AppId;
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "geolocation");


    iframecont.appendChild(chatHead);//need to place above near container creation

    //iframe placed in loaderd div........(3)
    var loaderDiv = d.createElement("div");
    loaderDiv.id = "loderdiv" + AppId;
    loaderDiv.className = "loderdiv eb__-bot___-loderdiv" + AppId;

    loaderDiv.appendChild(iframe);
    iframecont.appendChild(loaderDiv);
    if (d.appIdColl) {
        d.getElementsByClassName("usecase-bots-cont")[0].appendChild(iframecont);
    }
    else {
        d.body.appendChild(iframecont);
    }

    //??????????
    var chatbtn = d.createElement("div");
    chatbtn.id = "chatbtn" + AppId;
    chatbtn.className = "chatbtn eb__-bot___-chatbtn" + AppId;
    //var chatIcon = d.getElementsByClassName('boticon')[0];
    var chatIcon = d.createElement("img");
    chatIcon.className = "boticon eb__-bot___-boticon" + AppId;
    chatIcon.id = "boticon" + AppId;
    chatIcon.src = this.eb_get_path(d.ebmod) + dpurl;

    //creata a maximize btn and append in chathead div ie, division for header part of chat bot
    var maximizeDiv = d.createElement("div");
    maximizeDiv.className = "chatmaximize eb__-bot___-chatmaximize" + AppId;
    maximizeDiv.id = "maximizediv" + AppId;
    maximizeDiv.innerHTML = '&#128470;';
    chatHead.appendChild(maximizeDiv);

    //creata a close btn and append in chathead div ie, division for header part of chat bot
    var closeDiv = d.createElement("div");
    closeDiv.className = "chatclose eb__-bot___-chatclose" + AppId;
    closeDiv.id = "closediv" + AppId;
    closeDiv.innerHTML = '&#10006;';
    chatHead.appendChild(closeDiv);

    ss.onload = function () {
        chatHead.style.visibility = 'visible';
    }
    //???
    iframe.onload = function (e) {
        console.log("iframe:" + (window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount]));
        iframe.style.visibility = 'visible';
        loaderDiv.style.background = 'none';
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
        var iframe_cont = document.getElementById("eb_iframecont" + AppId);
        var ebbot_iframe = document.getElementById("ebbot_iframe" + AppId);

        if (!ebbot_iframe.getAttribute("src")) {
            ebbot_iframe.setAttribute("src", `${eb_get_path(d.ebmod)}bote/bot?appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&pgur=${pageurl}`);
            //ebbot_iframe.setAttribute("src", `${eb_get_path(d.ebmod)}bote/bot?tid=${window.EXPRESSbase_SOLUTION_ID}&appid=${(window.EXPRESSbase_APP_ID || window.EXPRESSbase_APP_IDS[d.appIdCount])}&themeColor=${(themeColor).replace('#', 'HEX')}&botdpURL=${window.btoa((d.botdpURL || d.botdpURLColl[d.appIdCount]))}&msg=${(d.botWelcomeMsg || d.botWelcomeMsgColl[d.appIdCount])}`);
        }
        if (iframe_cont.style.display !== "flex") {
            this.style.display = "none";
            iframe_cont.style.display = "flex";
        } else {
            this.className = "";
            iframe_cont.style.display = "none";
        }
    };


    if (!d.appIdColl) {
        d.body.appendChild(chatbtn);
        var iconCont = d.createElement("div");
        iconCont.className = "iconCont eb__-bot___-iconCont" + AppId;
        iconCont.appendChild(chatIcon);
        chatbtn.appendChild(iconCont);
        // chatbtn.appendChild(chatIcon);
        // chatbtn.click();//////////////////////////////// for showing chatarea on load
    }
    else {      
       // d.getElementsByClassName("usecase-bots-cont")[0].appendChild(iframecont);       
        chatbtn.click();
    }

    //var dpicon = chatIcon.cloneNode(true);
    //dpicon.style.width = "40px";
    //dpicon.style.height = "40px";
    //botdp.appendChild(dpicon);

})();


