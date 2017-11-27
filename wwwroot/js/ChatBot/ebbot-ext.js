﻿(function () {
    var iframe = document.createElement("iframe");
    iframe.id = "ebbot_iframe";
    iframe.width = "28%";
    iframe.height = "65%";
    iframe.style.position = "fixed";
    iframe.style.bottom = "85px";
    iframe.style.right = "24px";
    iframe.style.borderRadius = "3.5px";
    iframe.style.boxShadow = "0 12px 40px 0 rgba(0, 0, 0, .175)";
    iframe.style.minWidth = "300px";
    iframe.style.zIndex = "99999999999999";
    iframe.style.display = "none";
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    document.body.appendChild(iframe);

    var chatbtn = document.createElement("div");
    chatbtn.id = "chatbtn";
    chatbtn.style.position = "fixed";
    chatbtn.style.right = "24px";
    chatbtn.style.bottom = "15px";
    chatbtn.style.fontSize = "24px";
    chatbtn.style.backgroundColor = "#369";
    chatbtn.style.color = "#fff";
    chatbtn.style.padding = "   12px";
    chatbtn.style.cssFloat = "right";
    chatbtn.style.borderRadius = "30px";
    chatbtn.style.boxShadow = "2px 2px 5px 1px rgba(0, 0, 0, 0.39)";
    var chatIcon = document.getElementById('boticon');

    chatIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    chatIcon.setAttribute("x", "0px");
    chatIcon.setAttribute("y", "0px");
    chatIcon.setAttribute("width", "30px");
    chatIcon.setAttribute("height", "30px");
    chatIcon.setAttribute("viewBox", "0 0 50 50");
    chatIcon.style.fill = "#ffffff";

    var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute("d", "M 25 3 C 22.792969 3 21 4.792969 21 7 C 21 8.859375 22.28125 10.410156 24 10.859375 L 24 14 L 15.03125 14 C 10.601563 14 7 17.601563 7 22.03125 L 7 26 L 2 26 L 2 38 L 7 38 L 7 47 L 43 47 L 43 38 L 48 38 L 48 26 L 43 26 L 43 22.03125 C 43 17.601563 39.398438 14 34.96875 14 L 26 14 L 26 10.859375 C 27.722656 10.410156 29 8.859375 29 7 C 29 4.792969 27.207031 3 25 3 Z M 25 5 C 26.101563 5 27 5.898438 27 7 C 27 8.101563 26.101563 9 25 9 C 23.898438 9 23 8.101563 23 7 C 23 5.898438 23.898438 5 25 5 Z M 15.03125 16 L 34.96875 16 C 38.292969 16 41 18.707031 41 22.03125 L 41 45 L 35 45 L 35 37 L 15 37 L 15 45 L 9 45 L 9 22.03125 C 9 18.707031 11.707031 16 15.03125 16 Z M 18.5 22 C 16.019531 22 14 24.019531 14 26.5 C 14 28.980469 16.019531 31 18.5 31 C 20.980469 31 23 28.980469 23 26.5 C 23 24.019531 20.980469 22 18.5 22 Z M 31.5 22 C 29.019531 22 27 24.019531 27 26.5 C 27 28.980469 29.019531 31 31.5 31 C 33.980469 31 36 28.980469 36 26.5 C 36 24.019531 33.980469 22 31.5 22 Z M 18.5 24 C 19.878906 24 21 25.121094 21 26.5 C 21 27.878906 19.878906 29 18.5 29 C 17.121094 29 16 27.878906 16 26.5 C 16 25.121094 17.121094 24 18.5 24 Z M 31.5 24 C 32.878906 24 34 25.121094 34 26.5 C 34 27.878906 32.878906 29 31.5 29 C 30.121094 29 29 27.878906 29 26.5 C 29 25.121094 30.121094 24 31.5 24 Z M 4 28 L 7 28 L 7 36 L 4 36 Z M 43 28 L 46 28 L 46 36 L 43 36 Z M 17 39 L 21 39 L 21 45 L 17 45 Z M 23 39 L 27 39 L 27 45 L 23 45 Z M 29 39 L 33 39 L 33 45 L 29 45 Z "); //Set path's data
    chatIcon.appendChild(path);
    document.body.appendChild(chatbtn);

    var closeDiv = document.createElement("div");
    closeDiv.id = "closediv";
    closeDiv.style.padding= "0px 5px";
    closeDiv.style.display = "none";
    closeDiv.innerHTML = '&#10006;';


    var iconCont = document.createElement("div");
    iconCont.style.width = "30px";
    iconCont.style.height = "30px";
    iconCont.appendChild(closeDiv);
    iconCont.appendChild(chatIcon);
    chatbtn.appendChild(iconCont);

    chatbtn.onclick = function () {
        var ebbot_iframe = document.getElementById("ebbot_iframe");
        var closeDiv = document.getElementById("closediv");
        var chatIcon = document.getElementById('boticon');

        if (!ebbot_iframe.getAttribute("src")) {
            ebbot_iframe.setAttribute("src", "https://expressbase.azurewebsites.net//bote/bot?tid=" + window.EXPRESSbase_SOLUTION_ID);
            //ebbot_iframe.setAttribute("src", "//eb_roby_dev.localhost:5000/bote/bot?tid=" + window.EXPRESSbase_SOLUTION_ID);
        }
        if (ebbot_iframe.style.display === "none") {
            chatIcon.style.display = "none";
            closeDiv.style.display = "block";

            ebbot_iframe.style.display = "block";
        } else {
            chatIcon.style.display = "block";
            closeDiv.style.display = "none";

            ebbot_iframe.style.display = "none";
        }
    }
})();