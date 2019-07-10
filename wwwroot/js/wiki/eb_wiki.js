
let addwiki = function () {

    let historyId = [];

    this.printresult = function () {
        let abc = $('#text').val();
        $('#render').html(abc);
        $('#new1').append('');

    };

    this.show_home = function () {
        $('#wiki_data_div').hide();
        $('.front_page_wiki').show();
    };


    let start;
    let end;
    let id;

    this.appendVal = function (e) {
        document.getElementById('text');
        let abc = window.getSelection().toString();
       var ele = document.getElementById('text');
        var text = ele.value;
        start = ele.selectionStart;
        end = ele.selectionEnd;
        text = text.slice(0, start) + text.slice(end);
        ele.value = text;

        id = e.target.getAttribute('val');
        if (id == `img` ||  id == `iframe`) {
            let insertVal = `<${id} src=" "> </${id}>`
            let txt = 'text';
            if (abc == "") {
                this.insertAtCaret(txt, insertVal);
            }
            else {
                let insertVal = `<${id} src=''> ${abc} </${id}>`
                this.insertAtCaret(txt, insertVal);
            }
        }
        else if (id == `a`) {
            let insertVal = `<${id} data-id=" " class="wikilist"> </${id}>`
            let txt = 'text';
            if (abc == "") {
                this.insertAtCaret(txt, insertVal);
            }
            else {
                let insertVal = `<${id} src=''> ${abc} </${id}>`
                this.insertAtCaret(txt, insertVal);
            }
        }
        else {
            let insertVal = `<${id}> </${id}>`
            let txt = 'text';
            if (abc == "") {
                this.insertAtCaret(txt, insertVal);
            }
            else {
                let insertVal = `<${id}> ${abc} </${id}>`
                this.insertAtCaret(txt, insertVal);
            }
        }
      
    }

    this.SelectInternalLink = function () {
        $.contextMenu({
            selector: '.InternalLinks',
            trigger: 'left',
            items: {
                "edit": {
                    name: "edit", icon: "edit", callback: this.editWiki.bind(this)
                },
                "publish": {
                    name: "publish", icon: "cut", callback: this.PublishWiki.bind(this)
                },

            }
        });
    }

    this.FetchWikiList = function (e) {
        let id = e.target.getAttribute('data-id');
        window.history.pushState('obj', 'PageTitle', `/docs/${id}`);
        $(".wikilist").removeClass("CurrentSelection");
        $(`#${id}`).addClass("CurrentSelection");
        this.AjaxCalFetchWikiList(id);
    }

    this.AjaxCalFetchWikiList = function (id) {
        $.ajax({
            type: 'POST',
            url: "/PublicWiki/GetWiki",
            data: {
                wiki_id: id
            },
            success: this.FetchWikiListSuccess.bind(this, id)
        });
    }

    this.FetchWikiListSuccess = function (id,ob) {

        $('#wiki_data_div').show();
        $("#wiki_data_div").scrollTop(0);
        $('.edit').attr('href', '../wiki/add/' + ob.id);
        $('.edit').attr('id', ob.id);
        
        var url = window.location.href + "/" + id;
        $(".facebook").removeAttr("href").attr("href", "https://www.facebook.com/share.php?u=" + url + "&title=" + ob.title);
        $(".twitter").removeAttr("href").attr("href", "https://twitter.com/intent/tweet?status=" + url);
        $(".linkedin").removeAttr("href").attr("href", `https://www.linkedin.com/shareArticle?mini=true&url= ${url}&title= ${ob.title}&summary=YourarticleSummary&source=www.expressbase.com`);
        $(".whatsapp").removeAttr("href").attr("href", "https://wa.me/?text=" + url);

        //let $tagDiv = $(`<div class="row"></div>`);
        $('#wiki_data_div').html(ob.html).slideUp(10).slideDown(200).fadeIn(100);
        var res = ob.tags.split(",");
        for (var i = 0; i < res.length; i++) {
            //$tagDiv.append(` <button class="SearchWithTag" tag-val="${res[i]}"> ${res[i]}</button>`);
            $('#wiki_data_div').append(`<button class="SearchWithTag" val="${res[i]}"> ${res[i]}</button>`);
        }
        $('.front_page_wiki').hide();
        $WasItHelpFul = `<div class="row"> <div class="col-sm-12"> 
                    <h4>Questions?</h4>
            <p>We're always happy to help with code or other questions you might have. Search our documentation,
            contact support, or connect with our sales team. You can also chat live with other developers in #stripe on freenode.<p>
            <div id="Help" show><p> Was This Page Helpfull?? <button val="yes" class="WasItHelp">yes</button><button val="no" class="WasItHelp">No</button></p></div> 
            <div id="EbHelp" hidden> <p>Thank you for helping improve ExpressBase's documentation. If you need help or have any questions, <a>cick Here</a></p></div>
        </div></div>`;
        $('#wiki_data_div').append($WasItHelpFul);
    }

    this.WikiSearch = function () {
        let key = $('#search_wiki').val();
        if (key.length == 0) {
            let url = window.location.href;
            //alert(url);
            let urlSplit = url.split("/");
            let id = urlSplit[urlSplit.length - 1];
            if ($.isNumeric(id)) {
                this.AjaxCalFetchWikiList(id);
            }
            else {
                this.show_home();
            }
        }
        else if (key.length < 3) {
            $("#wiki_data_div").empty();
            $("#wiki_data_div").show();
            $("#wiki_data_div").append("Type minimum 3 letters")
            $('.front_page_wiki').hide();
        }
        else {
            $.ajax({
                type: 'POST',
                url: "/PublicWiki/GetWikiBySearch",
                data: {
                    search_wiki: key
                },
                success: function (ob) {

                    if (!ob.length && key.length != 0) {
                        $("#wiki_data_div").empty();
                        $("#wiki_data_div").show(300);
                        $('.front_page_wiki').hide();
                        $("#wiki_data_div").append("<div style='height:40px;'> <h1>Result not Found</h1> </div>");
                    }
                    else
                        $("#wiki_data_div").empty();
                    for (let i = 0; i < ob.length; i++) {
                        $("#wiki_data_div").show(500);
                        $('.front_page_wiki').hide(100);
                        let $Report = $(`<div class="searchDiv"></div>`);
                        $Report.append(`<a class="searchshow" data-id="${ob[i].id}"> ${ob[i].title} </a>`);
                        $Report.append(` ${ob[i].html}`);
                        let $Tags = $(`<h3>${ob[i].tags}</h3>`);
                        $("#wiki_data_div").append($Report);          
                        //$("#wiki_data_div").append($Tags);          
                        $('#' + ob[i].id).attr('title', ob[i].category);
                    };
                }
            });
        }
    }


    this.insertAtCaret = function (areaId, text) {
        var txtarea = document.getElementById(areaId);
        if (!txtarea) {
            return;
        }

        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((start || end == '0') ?
            "ff" : (document.selection ? "ie" : false));
        if (br == "ie") {
            txtarea.focus();
            var range = document.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            strPos = range.text.length;
        } else if (br == "ff") {
            strPos = start;
        }

        var front = (txtarea.value).substring(0, strPos);
        var back = (txtarea.value).substring(strPos, txtarea.value.length);
        txtarea.value = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            var ieRange = document.selection.createRange();
            ieRange.moveStart('character', -txtarea.value.length);
            ieRange.moveStart('character', strPos);
            ieRange.moveEnd('character', 0);
            ieRange.select();
        } else if (br == "ff") {
            txtarea.selectionStart = strPos;
            txtarea.selectionEnd = strPos;
            txtarea.focus();
        }

        txtarea.scrollTop = scrollPos;
    }

    //this.insertAtCaret = function (areaId, text) {
    //    let txtarea = document.getElementById(areaId);
    //    if (!txtarea) {
    //        return;
    //    }
    //    let scrollPos = txtarea.scrollTop;
    //    let strPos = 0;
    //    let br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
    //        "ff" : (document.selection ? "ie" : false));
    //    if (br == "ie") {
    //        txtarea.focus();
    //        let range = document.selection.createRange();
    //        range.moveStart('character', -txtarea.value.length);
    //        strPos = range.text.length;
    //    } else if (br == "ff") {
    //        strPos = txtarea.selectionStart;
    //    }

    //    let front = (txtarea.value).substring(0, strPos);
    //    let back = (txtarea.value).substring(strPos, txtarea.value.length);
    //    txtarea.value = front + text + back;
    //    strPos = strPos + text.length;
    //    if (br == "ie") {
    //        txtarea.focus();
    //        let ieRange = document.selection.createRange();
    //        ieRange.moveStart('character', -txtarea.value.length);
    //        ieRange.moveStart('character', strPos);
    //        ieRange.moveEnd('character', 0);
    //        ieRange.select();
    //    } else if (br == "ff") {
    //        txtarea.selectionStart = strPos;
    //        txtarea.selectionEnd = strPos;
    //        txtarea.focus();
    //    }

    //    txtarea.scrollTop = scrollPos;
    //    let data = this.format($("#text").val());
    //    $('#text').val(data);
    //};


    //this.format = function (str) {
    //    str = str.replace(/\n/g, "");
    //    let div = document.createElement('div');
    //    div.innerHTML = str.trim();

    //    return this.formatHelper(div, 0).innerHTML;
    //}

    //this.formatHelper = function (node, level) {
    //    let indentBefore = new Array(level++ + 1).join('        '),
    //        indentAfter = new Array(level - 1).join('  '),
    //        textNode;

    //    for (let i = 0; i < node.children.length; i++) {
    //        textNode = document.createTextNode('\n' + indentBefore);
    //        node.insertBefore(textNode, node.children[i]);

    //        this.formatHelper(node.children[i], level);

    //        if (node.lastElementChild == node.children[i]) {
    //            textNode = document.createTextNode('\n' + indentAfter);
    //            node.appendChild(textNode);
    //        }
    //    }

    //    return node;
    //}


    this.add_tag = function (e) {
        let tag = $('#list_tag').val();
        alert(tag);
        $("#view-tags").append("<label>" + tag + "</label>")
    }

    this.WikiListToggle = function (e) {
        let id = $(e.target).closest(".wraper-link").attr('val');
        $("#" + id).toggle(200);
    }

    this.render_page_toggle = function (e) {
        let val = e.target.getAttribute("val");

        if (val == "show") {
            $("#render_field").hide();
            $("#render_page_toggle").removeAttr("val").attr("val", "hide");
            $("#render_page_toggle").removeAttr("value").attr("value", "show page view");
            $("#edit_field").removeClass("col-sm-6").addClass("col-sm-12");
        }
        else {
            $("#render_field").show();
            $("#render_page_toggle").removeAttr("val").attr("val", "show");
            $("#edit_field").removeClass("col-sm-12").addClass("col-sm-6");
            $("#render_page_toggle").removeAttr("value").attr("value", "hide page view");
        }
    }

    //wiki admin page
    this.show_draft_items = function (e) {
        let key = e.target.getAttribute('val');

        if (key == 'draft') {
            $(".publish").hide();
            $(".unpublish").hide();
            $(".draft").show(200);
        }
        else if (key == 'publish') {
            $(".publish").show(200);
            $(".unpublish").hide();
            $(".draft").hide();
        }
        else if (key == 'unpublish') {
            $(".publish").hide();
            $(".unpublish").show(200);
            $(".draft").hide();
        }

    }

    this.Admin_Wiki_List = function (e) {
        let status = e.target.getAttribute('data-val');
        
        if (status == "PublicView") {
            this.PublicView();
        }
        else
            $.ajax({
                type: 'POST',
                url: "/Wiki/Admin_Wiki_List",
                data: {
                    status: status
                },
                success: this.ajaxAdminWikiFetch.bind(this)
            });
    }

    this.ajaxAdminWikiFetch = function (ob) {
        $("#public").empty();
        if (ob.length == 0) {
            $("#public").append(`
                        <h1 style="margin-left:50px"> You haven’t  any wikies yet.</h1>
                        `)
        }
        else {


            $("#public").empty();

            $("#public").append(`<div class="WikiMenu" val="Form">  Form <div>`);
            let $Form = $(`<div data-val="Form"></div>`);
            for (let i = 0; i < ob.length; i++) {
                if (ob[i].category == "Form") {
                    $Form.append(`
                                <div class="WikiList">
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>   </div>
                        `);
                }
            }
            $("#public").append($Form);

            $("#public").append(`<div class="WikiMenu" val="Report">  Report <div>`);
            let $Report = $(`<div data-val="Report"></div>`);
            for (let i = 0; i < ob.length; i++) {
                if (ob[i].category == "Report") {
                    $Report.append(`
                                <div class="WikiList">
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>   </div>
                        `);
                }
            }
            $("#public").append($Report);


            $("#public").append(`<div class="WikiMenu" val="API">  API <div>`);
            let $API = $(`<div data-val="API"></div>`);
            for (let i = 0; i < ob.length; i++) {
                if (ob[i].category == "API") {
                    $API.append(`
                                <div class="WikiList">
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>   
                                </div>
                        `);
                }
            }
            $("#public").append($API);

            $("#public").append(`<div class="WikiMenu" val="Chatbots">  Chatbots <div>`);
            let $Chatbots = $(`<div data-val="Chatbots"></div>`);
            for (let i = 0; i < ob.length; i++) {
                if (ob[i].category == "Chatbots") {
                    $Chatbots.append(`
                                <div class="WikiList">
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>   
                                </div>
                        `);
                }
            }
            $("#public").append($Chatbots);


            $("#public").append(`<div class="WikiMenu" val="Security">  Security <div>`);
            let $Security = $(`<div data-val="Security"></div>`);
            for (let i = 0; i < ob.length; i++) {
                if (ob[i].category == "Security") {
                    $Security.append(`
                                <div class="WikiList">
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>
                                      </div>
                        `);
                }
            }
            $("#public").append($Security);

            $("#public").append(`<div class="WikiMenu" val="AppStore">  App Store <div>`);
            let $AppStore = $(`<div data-val="AppStore" ></div>`);
            for (let i = 0; i < ob.length; i++) {
                if (ob[i].category == "AppStore") {
                    $AppStore.append(`
                                <div class="WikiList">
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>  
                                   <div>
                        `);
                }
            }
            $("#public").append($AppStore);

           
        }

     

        this.Draftcontextmenu();

        this.Publishcontextmenu();

        this.Unpublishcontextmenu();
        $("#eb_common_loader").EbLoader("hide");

    }

    this.PublicView = function () {
        $.ajax({
            type: 'POST',
            url: "/Wiki/PublicView",
            data: {
                status: status
            },
            success: this.ajaxPublicViewSuccess.bind(this)
        });
    }

    this.ajaxPublicViewSuccess = function (ob) {
        $("#public").empty();
        $("#public").append(`<div class="WikiMenu" val="Form">  Form <div>`);
        let $Form = $(`<ul data-val="Form" class="dragable_wiki_list" show></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Form") {
                $Form.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title}  </li>`);
            }
        }
        $("#public").append($Form);

        $("#public").append(`<div class="WikiMenu" val="Report">  Report <div>`);
        let $Report = $(`<ul data-val="Report" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Report") {
                $Report.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title}  </li>`);
            }
        }
        $("#public").append($Report);


        $("#public").append(`<div class="WikiMenu" val="API">  API <div>`);
        let $API = $(`<ul data-val="API" class="dragable_wiki_list"  ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "API") {
                $API.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title}  </li>`);
            }
        }
        $("#public").append($API);

        $("#public").append(`<div class="WikiMenu" val="Chatbots">  Chatbots <div>`);
        let $Chatbots = $(`<ul data-val="Chatbots" class="dragable_wiki_list"></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Chatbots") {
                $Chatbots.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title} </li>`);
            }
        }
        $("#public").append($Chatbots);

        $("#public").append(`<div class="WikiMenu" val="Security">  Security <div>`);
        let $Security = $(`<ul data-val="Security" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Security") {
                $Security.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title} </li>`);
            }
        }
        $("#public").append($Security);

        $("#public").append(`<div class="WikiMenu" update-val="AppStore">  App Store <div>`);
        let $AppStore = $(`<ul data-val="AppStore" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "AppStore") {
                $AppStore.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title} </li>`);
            }
        }
        $("#public").append($AppStore);

        $("#public").append(`<button class="UpdateOrder" update-val="AppStore"> update </button>`);
    this.draggableForm();
    this.draggableReport();
    this.draggableAPI();
    this.draggableChatbots();
    this.draggableSecurity();
    this.draggableAppStore();
    $("#eb_common_loader").EbLoader("hide");
}




    this.draggableForm = function () {
        $("[data-val=Form]").sortable();
        $("[data-val=Form]").disableSelection();
    }

    this.draggableReport = function () {
        $("[data-val=Report]").sortable();
        $("[data-val=Report]").disableSelection();
    }

    this.draggableAPI = function () {
        $("[data-val=API]").sortable();
        $("[data-val=API]").disableSelection();
    }

    this.draggableChatbots = function () {
        $("[data-val=Chatbots]").sortable();
        $("[data-val=Chatbots]").disableSelection();
    }

    this.draggableSecurity = function () {
        $("[data-val=Security]").sortable();
        $("[data-val=Security]").disableSelection();
    }

    this.draggableAppStore = function () {
        $("[data-val=AppStore]").sortable();
        $("[data-val=AppStore]").disableSelection();
    }

    //Context menu Wiki
    this.Draftcontextmenu = function() {
        $.contextMenu({
            selector: '.Draft',
            trigger: 'left',
            items: {
                "edit": {
                    name: "edit", icon: "edit", callback: this.editWiki.bind(this)
                },
                "publish": {
                    name: "publish", icon: "cut", callback: this.PublishWiki.bind(this)   
                },
               
            }
        });
    }

    this.Publishcontextmenu = function () {
        $.contextMenu({
            selector: '.Publish',
            trigger: 'left',
            items: {
                "edit": {
                    name: "edit", icon: "edit", callback: this.editWiki.bind(this)
                },
                "Unpublish": {
                    name: "Unpublish", icon: "delete", callback: this.UnpublishWiki.bind(this)

                },
                
            }
        });
    }

    this.Unpublishcontextmenu = function () {
        $.contextMenu({
            selector: '.Unpublish',
            trigger: 'left',
            items: {
                "edit": {
                    name: "edit", icon: "edit", callback: this.editWiki.bind(this)
                },
                "publish": {
                    name: "publish", icon: "cut", callback: this.PublishWiki.bind(this)

                },
               
            }
        });
    }

    this.editWiki = function (key, options) {
        let id = $(options.$trigger).attr("data-id");
        window.open('http://myaccount.localhost:41500/wiki/add/' + id, '_blank');
    };

    this.PublishWiki = function (key, options) {
        let id = $(options.$trigger).attr("data-id");
        let status = $(options.$trigger).attr("val");

        $.ajax({
            type: 'POST',
            url: "/Wiki/Publish_wiki",
            data: {
                wiki_id: id,
                wiki_status: status

            },
            success: function (ob) {
                if (ob.id != null) {
                    alert("Success")

                    if (status == "Draft") {
                        $("[style-val=Draft]").click();
                    }
                    else {
                        $("[style-val=Unpublish]").click();
                    }
                   
                }
            }
        });
    };

    this.UnpublishWiki = function (key, options) {
        let id = $(options.$trigger).attr("data-id");
        let status = $(options.$trigger).attr("val");
        $.ajax({
            type: 'POST',
            url: "/Wiki/Publish_wiki",
            data: {
                wiki_id: id,
                wiki_status: status
            },
            success: function (ob) {
                if (ob.id != null) {
                    alert("Success");
                        $("[style-val=Publish]").click();                 
                }
            }
        });
    };

    this.WikiMenuToggle = function (e) {
        let val = e.target.getAttribute('val');
        $(`[data-val=${val}]`).toggle(300);
    }
    this.UpdateOrder = function (e) {
        $("#eb_common_loader").EbLoader("show");
        var myList = [];
        $(".ui-state-default").each(function () {
            //alert($(this).attr("wiki-id"))
            myList.push($(this).attr("wiki-id"));
        });

        $.ajax(
            {
                url: '/Wiki/UpdateOrder',
                type: 'POST',
                data: { myList: JSON.stringify(myList) },
                success: function (data) {
                    if (data == true) {
                        alert("Success")
                        $("#eb_common_loader").EbLoader("hide");
                    }
                    else {
                        alert("Un fSuccess")
                        $("#eb_common_loader").EbLoader("hide");
                    }

                }
            });
    }

    this.selectedHighlight = function (e) {
        $("#eb_common_loader").EbLoader("show");
        let style_val = e.target.getAttribute("style-val");
        $(".selected").removeClass("menu_border");
        $(`[style-val="${style_val}"]`).addClass("menu_border");

        if (style_val == "PublicView") {
            this.PublicView();
        }
        else
            this.selectedHighlightAjax(style_val);
    }
    this.selectedHighlightAjax = function (style_val) {
        $.ajax({
            type: 'POST',
            url: "/Wiki/Admin_Wiki_List",
            data: {
                status: style_val
            },
            success: this.ajaxAdminWikiFetch.bind(this)

        });
    }

    this.SearchWithTagFun = function (e) {
        let val = e.target.getAttribute('val');
        $("#search_wiki").val(val);
        $("#search_wiki").focus();
        $("#search_wiki").click();
    }

    this.WasItHelp = function (e) {
        let answer = e.target.getAttribute("val");
        $("#Help").hide();
        $("#EbHelp").show();
        $.ajax({
            type: 'POST',
            url: "/Wiki/UserReviewRate",
            data: {
                answer: answer
            },
            success: this.ajaxUserReviewRateSuccess.bind(this)
        });
    }
    this.ajaxUserReviewRateSuccess = function () {

    }

    this.init = function () {

        $(".props").on("click", this.appendVal.bind(this));
        $(".wikilist").on("click", this.FetchWikiList.bind(this)); 
        $("#wiki_data_div").on("click", ".searchshow", this.FetchWikiList.bind(this));
        $("#text").on("keyup", this.printresult.bind(this));
        $("#text").on("click", this.printresult.bind(this));
        $("#home").on("click", this.show_home.bind(this));
        $("#search_wiki").on("keyup change", this.WikiSearch.bind(this));
        $(".wraper-link").on("click", this.WikiListToggle.bind(this));
        $("#render_page_toggle").on("click", this.render_page_toggle.bind(this));
        $(".wiki_data").on("click", ".SearchWithTag ", this.SearchWithTagFun.bind(this));
        $(".wiki_data").on("click", ".wikilist ", this.FetchWikiList.bind(this));

        //wiki admin
        $(".wikies_list").on("click", this.Admin_Wiki_List.bind(this));
        $("#public").on("click",".WikiMenu", this.WikiMenuToggle.bind(this));
        $("#public").on("click", ".UpdateOrder", this.UpdateOrder.bind(this));
        $(".selected").on("click", this.selectedHighlight.bind(this));
        $("#wiki_data_div").on("click", ".WasItHelp", this.WasItHelp.bind(this));
     
    };

    this.init();
}
