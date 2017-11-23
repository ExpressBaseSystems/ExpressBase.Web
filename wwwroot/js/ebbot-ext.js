(function () {
    var iframe = document.createElement("iframe");
    iframe.id = "ebbot_iframe";
    iframe.width = "25%";
    iframe.height = "70%";
    iframe.className = "chatclose";
    iframe.height = "eb-chat-frame";
    iframe.style.position = "fixed";
    iframe.style.bottom = "65px!important";
    iframe.style.right = "24px!important";
    iframe.style.borderRadius = "3.5px";
    iframe.style.boxShadow = "0 12px 40px 0 rgba(0, 0, 0, .175)!important";
    iframe.style.minWidth = "300px";
    iframe.style.zIndex = "99999999999999!important";
    iframe.style.display = "none";
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    document.body.appendChild(iframe);
//    $("body").append($(`<iframe id="ebbot_iframe" width="25%" height="70%" class="eb-chat-frame"
//        style= "position: fixed;bottom: 65px!important; right: 24px!important; border-radius: 3.5px;
//        box- shadow: 0 12px 40px 0 rgba(0, 0, 0, .175)!important; min - width: 300px;
//z - index: 99999999999999!important; display: none;
//" frameborder= "0" allowfullscreen></iframe > `)[0]);

    $("body").append($(`<div id="chatbtn" style="position: fixed;right: 24px;bottom: 15px;font-size: 24px;background-color: #369;color: #fff;padding: 7px 12px;FLOAT: right;border-radius: 24px;box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.39);"><i class="fa fa-comment-o" aria-hidden="true"></i></div>`)[0]);

    $("body").append('<button name="chatclose" class="btn"><i class="fa fa-window-minimize pull-right" aria-hidden="true"></i></button>');

    $("#chatbtn").on("click", function () {
        var ebbot_iframe = document.getElementById("ebbot_iframe");
        if (!ebbot_iframe.getAttribute("src")) {
            ebbot_iframe.setAttribute("src", "//eb_roby_dev.localhost:5000/bote/bot?tid=" + window.EXPRESSbase_SOLUTION_ID);

            //ebbot_iframe.contentWindow.window.onmessage = function (e) {
            //    this.localStorage.setItem("EXPRESSbase_SOLUTION_ID", e.data);
            //    this.EXPRESSbase_SOLUTION_ID = e.data;
            //    //if (e.data === 'EXPRESSbase_SOLUTION_ID') {
            //        //alert('It works!');
            //    //}
            //};
            //ebbot_iframe.contentWindow.window.postMessage(window.EXPRESSbase_SOLUTION_ID, "http://eb_roby_dev.localhost:5000");
        }
        $(ebbot_iframe).toggle();
    });

    $("body").on("click", "[name=chatclose]", function () {
        $("#ebbot_iframe").hide(200);
    });
})();