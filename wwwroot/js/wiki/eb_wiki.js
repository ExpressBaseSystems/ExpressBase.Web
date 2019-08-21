let addwiki = function () {

    this.AppendHtml = function () {
        let SelectedString = $('#text').val();
        $('#render').html(SelectedString);
        $('#new1').append('');
    };

    this.show_home = function () {
        $('#wiki_data_div').hide();
        $('.front_page_wiki').show();
        window.history.pushState('obj', 'PageTitle', `/Wiki`);
    };

    let start;
    let end;
    let id;

    this.appendVal = function (e) {
        var cursorPos = $("#text").prop('selectionStart');
        document.getElementById('text');
        let SelectedString = window.getSelection().toString();
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
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<${id} src=''> ${SelectedString} </${id}>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }
        else if (id == `a`) {
            let insertVal = `<${id} src="link"> </${id}>`
            let txt = 'text';
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<${id} src=''>   ${SelectedString}   </${id}>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }
        else if (id == `right`) {
            let insertVal = `<p style="text-align: right;"> </p>`
            let txt = 'text';
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<p style="text-align: left;"> ${SelectedString} </p>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }
        else if (id == `left`) {
            let insertVal = `<p style="text-align: left;"> </p>`
            let txt = 'text';
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<p style="text-align: left;">   ${SelectedString}   </p>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }
       
        else if (id == `code`) {
            let insertVal = `<pre class="prettyprint"> </pre>`
            let txt = 'text';
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<pre class="prettyprint"> ${SelectedString} </pre>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }
        else if (id == `br`) {
            let insertVal = `<br/>`
            let txt = 'text';
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<br/>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }
        else {
            let insertVal = `<${id}> </${id}>`
            let txt = 'text';
            if (SelectedString == "") {
                this.insertAtCaret(insertVal, cursorPos);
            }
            else {
                let insertVal = `<${id}> ${SelectedString} </${id}>`
                this.insertAtCaret(insertVal, cursorPos);
            }
        }    }

    this.insertAtCaret = function (text ,cur){
        var cursorPos = cur;
        var v = $("#text").val();
        var textBefore = v.substring(0, cursorPos);
        var textAfter = v.substring(cursorPos, v.length);
        $("#text").focus(); 
        $("#text").val(textBefore + text + textAfter);
        var cur = textBefore.length + text.length; 
       
        this.clickfun(cur);
        this.handleInput();
    }

    this.clickfun = function (curpos) {
        var v = $("#text").val();
      
        var str = v.substring(0, curpos);
        var regex = /\<([a-z1-9A-Z\/]+\>)/gi, result, indices = [];
        while ((result = regex.exec(str))) {
            indices.push(result.index);
        }
        var cursorPosition = $("#text").prop("selectionStart");
        $("#text").prop('selectionEnd');
        var closestPosition = this.closest(cursorPosition, indices);
        $("#text").prop('selectionEnd', closestPosition);
        var cursorPos = $("#text").prop('selectionStart');
 
    }

    this.closest = function (num, arr) {
        var curr = arr[0];

        var diff = Math.abs(num - curr);
        for (var val = 0; val < arr.length; val++) {
            var newdiff = Math.abs(num - arr[val]);
            if (newdiff < diff) {
                diff = newdiff;
                curr = arr[val];
            }
        }
        return curr;
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
        let wname = $(`[data-id="${id}"]`).text().trim();
        let con = $(`[data-id="${id}"]`).parent().parent().parent().attr("id");
        $(`[data-id="${id}"]`).attr("val" ,wname);
        wiki_name = wname.replace(/ /g, '-');
        //let orderId = $(`[data-id="${id}"]`).parent().attr("order-id");
        $(".wikilist").removeClass("CurrentSelection");
        $(`[data-id='${id}']`).addClass("CurrentSelection");
        $(".commonLoader").EbLoader("show");
        this.AjaxCalFetchWikiList(id);
        //let title = $(".wiki_data h1").text();
        window.history.pushState('obj', 'PageTitle', `/Wiki/${con}/${wiki_name}`);
    }

    this.AjaxCalFetchWikiList = function (id) {
        let orderId = $(`[data-id="${id}"]`).parent().attr("order-id");
        $.ajax({
            type: 'POST',
            url: "/PublicWiki/GetWiki",
            data: {
                wiki_id: id
            },
            success: this.FetchWikiListSuccess.bind(this, id, orderId)
        });
    }

    this.FetchWikiListSuccess = function (id, orderId, ob) {
        $('#wiki_data_div').show();
        $("#wiki_data_div").scrollTop(0);
        $('.edit').attr('href', '../wiki/add/' + ob.id);
        $('.edit').attr('id', ob.id);
        document.title = ob.title;
        $("#ebwiki_panebrd").html(`${ob.category} / ${ob.title}`)
        urlTitle = ob.title.replace(/\s+/g, '-').toLowerCase();
        //var url = window.location.origin + "/Wiki/View/" + id + "/" + urlTitle;
        var url = window.location.origin + `/Wiki/${ob.category}/${urlTitle}`;
        let fbUrl = "https://www.facebook.com/share.php?u=" + url + "&title=" + ob.title;
        let twUrl = "https://twitter.com/intent/tweet?status=" + url;
        let lnUrl = "https://www.linkedin.com/shareArticle?mini=true&url=" +url +"&title="+ ob.title + "&summary=YourarticleSummary&source=expressbase.com";
        let whUrl = "https://wa.me/?text=" + url;
        //let $tagDiv = $(`<div class="row"></div>`);
        $('#wiki_data_div').html(ob.html).slideUp(10).slideDown(200).fadeIn(100);
        var res = ob.tags.split(",");
        let $Tags = $(`<div style="display:flex"></div>`);
        for (var i = 0; i < res.length; i++) {
            if (res[i] != "") {
                $Tags.append(`<button class="SearchWithTag" val="${res[i]}"> ${res[i]}</button>`);
            }
        }
        $('#wiki_data_div').append($Tags);
        var $author = $("<div id='author'></div>");
        $author.append("<div style='display:flex'><div class='authorimg'><img src='/images/users/dp/" + ob.createdBy + ".jbg'/></div><p>"+ob.authorName+"</p><div/>");
        $('#wiki_data_div').append($author);
        $('.front_page_wiki').hide();
     
        let next = $(`[order-id="${orderId}"]`).next().attr("order-id");
        let Pre = $(`[order-id="${orderId}"]`).prev().attr("order-id");
        let $nextPre = $(`<div></div>`);
        if (next) {
            $nextPre.append(`<span Next-id="${next}" class="NextPreWiki" style="float:right;">Next</span>`);
        }
        if (Pre) {
            $nextPre.append(`<span Next-id="${Pre}" class="NextPreWiki" style="float:left;"> Previous</span>`);
        }

        $('#wiki_data_div').append($nextPre);
        $WasItHelpFul = `<div class="row"> 
        <div class="col-sm-12" id="Help"> 
        <h4>Questions?</h4>
        <span>
        Please mail <span style="color:blue"> support@expressbase.com</span> , we are always happy to help.
        <span style="float: right;">
        <a href=${fbUrl} class="facebook icon-bar" target="_blank" ><i class="fa fa-facebook"></i></a>
        <a href=${twUrl} class="twitter icon-bar" target="_blank"><i class="fa fa-twitter" ></i></a>
        <a href=${lnUrl} class="linkedin icon-bar " target="_blank"><i class="fa fa-linkedin"></i></a>
        <a href=${whUrl} class="whatsapp icon-bar" target="_blank"><i class="fa fa-whatsapp"></i></a> 
             </span></span></div> </div>`;
        $('#wiki_data_div').append($WasItHelpFul);

        let title = $(".wiki_data h1").text();
        let desc = $(".wiki_data p").text().substring(0, $(".wiki_data p").text().indexOf("."));
        $(`meta[property="og:title"]`).attr("content", `${title}`);
        $(`meta[property="og:description"]`).attr("content", `${desc}`);
        $(`meta[property="og:image"]`).attr("content", ``);
        $(`meta[property="og:url"]`).attr("content", `${url}`);
        $(`meta[name="twitter:card"]`).attr("content", "large image");
   
        //this.AddMetaTags();
        if (PR)
            PR.prettyPrint();
        $(".commonLoader").EbLoader("hide");
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
                let url = window.location.href;
                //alert(url);
                let urlSplit = url.split("/");
                let wiki_name = urlSplit[urlSplit.length - 1];
                let wname = wiki_name.replace(/\-/g, ' ');
                let id = $(`[val="${wname}"]`).attr("data-id");
                $(".wikilist").removeClass("CurrentSelection");
                $(`[data-id='${id}']`).addClass("CurrentSelection");
                if ($.isNumeric(id)) {
                    obj.AjaxCalFetchWikiList(id);
                }
                else {
                    obj.show_home();
                }
            }
        }
        else if (key.length < 3) {
            $("#wiki_data_div").empty();
            $("#wiki_data_div").show();
            $("#wiki_data_div").append("Type minimum 3 letters")
            $('.front_page_wiki').hide();
        }
        else {
            $("#ebwiki_panebrd").text("").text("Wiki Search Result");
            $(".commonLoader").EbLoader("show");
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
                    $(".commonLoader").EbLoader("hide");
                }
            });
        }
    }


    //this.insertAtCaret = function (areaId, text) {
    //    var txtarea = document.getElementById(areaId);
    //    if (!txtarea) {
    //        return;
    //    }

    //    var scrollPos = txtarea.scrollTop;
    //    var strPos = 0;
    //    var br = ((start || end == '0') ?
    //        "ff" : (document.selection ? "ie" : false));
    //    if (br == "ie") {
    //        txtarea.focus();
    //        var range = document.selection.createRange();
    //        range.moveStart('character', -txtarea.value.length);
    //        strPos = range.text.length;
    //    } else if (br == "ff") {
    //        strPos = start;
    //    }

    //    var front = (txtarea.value).substring(0, strPos);
    //    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    //    txtarea.value = front + text + back;
    //    strPos = strPos + text.length;
    //    if (br == "ie") {
    //        txtarea.focus();
    //        var ieRange = document.selection.createRange();
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
    //}

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
        $(".wikilist").removeClass("CurrentSelection");
        let id = $(e.target).closest(".wraper-link").attr('val');
        if (id == "home") {
            $("#ebwiki_panebrd").html("Getting started");
            $('#wiki_data_div').hide();
            $('.front_page_wiki').show();
            window.history.pushState('obj', 'PageTitle', `/Wiki`);
        }
        else {
            $("#" + id).toggle(200);
            $("#ebwiki_panebrd").html(`${id}`);
            window.history.pushState('obj', 'PageTitle', `/Wiki/${id}`);
        }
    }

    //this.render_page_toggle = function (e) {
    //    let val = e.target.getAttribute("val");
    //    if (val == "show") {
    //        $("#render_page_toggle").removeAttr("val").attr("val", "hide");
    //        $("#render_page_toggle").removeClass("fa-arrows-alt").addClass("fa-compress");
    //        $("#render_page_toggle").removeAttr("value").attr("value", "Normal Screen");
    //        $("#edit_field").removeClass("col-sm-6").addClass("col-sm-12");
    //        $("#text").css("height", "100%");
    //        //$("#text").attr("rows", "23");
    //    }
    //    else {
    //        $("#render_page_toggle").removeAttr("val").attr("val", "show");
    //        $("#edit_field").removeClass("col-sm-12").addClass("col-sm-6");
    //        $("#render_page_toggle").removeAttr("value").attr("value", "Full Screen");
    //        //$("#text").attr("rows", "21");
    //        $("#render_page_toggle").removeClass("fa-compress").addClass("fa-arrows-alt");
    //    }
    //}

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

            for (let j = 0; j < ob.wikiCat.length; j++) {
                let temp = 0;
                let $divObj = $(`<div class="BoxView"></div>`);
                $divObj.append(`<div class="WikiMenu" val="${ob.wikiCat[j].wikiCategory}" toggleval="show">  ${ob.wikiCat[j].wikiCategory} 
                       <i class="fa fa-chevron-circle-down" aria-hidden="true"></i>
                <div>`);
                let $Form = $(`<div data-val="${ob.wikiCat[j].wikiCategory}"></div>`);
                for (let i = 0; i < ob.wikiList.length; i++) {
                    if (ob.wikiList[i].category == `${ob.wikiCat[j].wikiCategory}`) {
                       // var date = new Date(ob.wikiList[i].createdAt);
                        var date = ob.wikiList[i].createdAt.split("T");
                       
                        $Form.append(`
                                <div class="WikiList ${ ob.wikiList[i].status}" data-id= ${ob.wikiList[i].id} val=${ob.wikiList[i].status}>
                                <h1>  ${ob.wikiList[i].title}  </h1>
                                   <p> Created On  ${date[0]}</p>
                                   </div>
                        `);
                        temp++;
                    }
                }
                if (temp == 0) {
                    $Form.append(`<h6 style="padding-left:100px;"> Empty List</h6> `);
                }

                $divObj.append($Form);
                $("#public").append($divObj);
            }
           
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

        for (let j = 0; j < ob.wikiCat.length; j++) {
            let temp = 0;
            let $divObj = $(`<div class="BoxView"></div>`);
            $divObj.append(`<div class="WikiMenu" val="${ob.wikiCat[j].wikiCategory}" toggleval="show">  ${ob.wikiCat[j].wikiCategory} 
                 <i class="fa fa-chevron-circle-down" aria-hidden="true"></i>
            <div>`);
            let $Form = $(`<ul data-val="${ob.wikiCat[j].wikiCategory}" class="dragable_wiki_list" show></ul>`);
            for (let i = 0; i < ob.wikiList.length; i++) {
                if (ob.wikiList[i].category == `${ob.wikiCat[j].wikiCategory}`) {
                    $Form.append(`<li class="ui-state-default"  wiki-id=${ob.wikiList[i].id}> ${ob.wikiList[i].title}  </li>`);
                    temp++;
                }
            }
           
            if (temp == 0) {
                $Form.append(`<h6 style="padding-left:100px;"> Empty List</h6> `);
            }

            $divObj.append($Form);
            $("#public").append($divObj);
            let dataVal = ob.wikiCat[j].wikiCategory;
            this.draggableFun(dataVal);
        }

        $("#public").append(`<button class="UpdateOrder" update-val="AppStore"> update </button>`);
   
    
    $("#eb_common_loader").EbLoader("hide");
}

    this.draggableFun = function (dataVal) {
        $(`[data-val="${dataVal}"]`).sortable();
        $(`[data-val="${dataVal}"]`).disableSelection();
    }

    //Context menu Wiki
    this.Draftcontextmenu = function() {
        $.contextMenu({
            selector: '.Draft',
            trigger: 'right',
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
            trigger: 'right',
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
            trigger: 'right',
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
        let url = window.location.origin +"/wiki/add/" +id
        window.open(window.location.origin + "/wiki/add/" + id, '_blank');
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
                   
                        $("[style-val=Publish]").click();                 
                }
            }
        });
    };

    this.WikiMenuToggle = function (e) {
        let togVal = e.target.getAttribute("toggleval");
        let val = e.target.getAttribute('val');
        if (togVal == "show") {
            $(`[val="${val}"]`).removeAttr("toggleval").attr("toggleval", "hide");
            $(`[val="${val}"] i`).removeClass("fa-chevron-circle-down").addClass("fa-chevron-circle-right");
        }
        else {
            $(`[val="${val}"]`).removeAttr("toggleval").attr("toggleval", "show");
            $(`[val="${val}"] i`).removeClass("fa-chevron-circle-right").addClass("fa-chevron-circle-down");
           
        }
       
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
                        EbPopBox("show", {
                            Message: "Success...",
                            ButtonStyle: {
                                Text: "Ok",
                                Color: "white",
                                Background: "#508bf9",
                                Callback: function () {
                                }
                            }});
                        $("#eb_common_loader").EbLoader("hide");
                    }
                    else {
                        EbPopBox("show", {
                            Message: "Failed to update the order...",
                            ButtonStyle: {
                                Text: "Ok",
                                Color: "white",
                                Background: "#508bf9",
                                Callback: function () {
                                }
                            }
                        });
                       
                        $("#eb_common_loader").EbLoader("hide");
                    }

                }
            });
    }

    this.WikiAdminMenuBarHighlight = function (e) {
        $("#eb_common_loader").EbLoader("show");
        let style_val = e.target.getAttribute("style-val");
        if (style_val == "PublicView") {
            this.PublicView();
        }
        else
            this.WikiAdminMenuBarHighlightAjax(style_val);
    }

    this.WikiAdminMenuBarHighlightAjax = function (style_val) {
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

    this.GetStartToWikiDocs = function (e) {
        let value = $(e.target).closest(".GettingStarted").attr("val");
        $(`#${value}>ul>li:first>a`).click();
    }

    this.NextAndPreWiki = function (e) {
        let OrderId = e.target.getAttribute("Next-id");
        let dataId= $(`[order-id="${OrderId}"]`).children().attr("data-id");
        $(`[data-id="${dataId}"]`).click();
    }

    this.gallerytab = function () {
        $("#gallery").click();
    }

    this.WikiPreviewTab = function () {
        $("#preview").click();
    }

    this.EbloaderTrigger = function () {
        $(".eb_common_loader").EbLoader("show");
    }

    this.SaveWiki = function () {
        $("#eb_common_loader").EbLoader("show");
        var wiki = {};
        wiki["category"] = $("#category option:selected").text();
        wiki["CatId"] = $("#category").val();
        wiki["title"]= $("#title").val();
        wiki["status"] = $("#status option:selected").text();
        wiki["html"] = $("#text").val();
        wiki["tags"] = $("#tagbox").val();
        wiki["Id"] = $("#wiki-id").val();

        $.ajax(
            {
                url: '/Wiki/Save',
                type: 'POST',
                data: { wiki: wiki },
                success: function (data) {
                    if (data !== null) {
                        EbPopBox("show", {
                            Message: "Success...",
                            ButtonStyle: {
                                Text: "Ok",
                                Color: "white",
                                Background: "#508bf9",
                                Callback: function () {
                                    let url = window.location.origin + "/Wiki/View/" + data.id + "/" + data.title ;
                                    window.open(url, '_blank');
                                }
                            }
                        });
                        $("#eb_common_loader").EbLoader("hide");
                    }
                    else {
                        EbPopBox("show", {
                            Message: "Failed to update the order...",
                            ButtonStyle: {
                                Text: "Ok",
                                Color: "white",
                                Background: "#508bf9",
                                Callback: function () {
                                }
                            }
                        });

                        $("#eb_common_loader").EbLoader("hide");
                    }

                }
            });
    }

    this.tbl_size_select = function (e) {
        var cursorPos = $("#text").prop('selectionStart');
        let rows = $("#tbl-row").val();
        let cols = $("#tbl-col").val();
        let $tbl = $(`<table class="table table-bordered">&#13;&#10; </table> &#13;&#10;`);
        for (i = 0; i < rows; i++) {
            let $tblRow = $("<tr> &#13;&#10; </tr> &#13;&#10;");
            if (i == 0) {
                for (j = 0; j < cols; j++) {
                    $tblRow.append("<th> </th> &#13;&#10;");
                }
                $tbl.append($tblRow);
            }
            else {
                for (j = 0; j < cols; j++) {
                    $tblRow.append("<td> </td> &#13;&#10;");
                }
                $tbl.append($tblRow);
            }
            
        }
        let insertVal = $tbl.outerHTML();
        this.insertAtCaret(insertVal, cursorPos);

    }

    this.ul_type_select = function () {
        var cursorPos = $("#text").prop('selectionStart');
        let ul_row = $("#ul-row").val();
        let type = $("#ul-style-sel option:selected").text();
        let $ul = $(`<ul style="list-style-type:${type};"> &#13;&#10;</ul>`);
        for (i = 0; i < ul_row; i++) {
            $ul.append("<li> </li> &#13;&#10;");
        }
        let insertVal = $ul.outerHTML();
        this.insertAtCaret(insertVal, cursorPos);
    }

    this.ol_type_select = function () {
        var cursorPos = $("#text").prop('selectionStart');
        let ul_row = $("#ol-row").val();
        let type = $("#ol-style-sel option:selected").text();
        let $ul = $(`<ol ${type}> &#13;&#10;</ol>`);
        for (i = 0; i < ul_row; i++) {
            $ul.append("<li> </li> &#13;&#10;");
        }
        let insertVal = $ul.outerHTML();
        this.insertAtCaret(insertVal, cursorPos);
    }

    this.InternalLinksFun = function(){
        $.ajax({
            type: 'POST',
            url: "/Wiki/Admin_Wiki_List",
            data: {
                status: 'Publish'
            },
            success: this.AjaxInternalLinksFun.bind(this)
        });
    }
    this.AjaxInternalLinksFun = function (ob) {
        $("#internal-links-view").empty();
        if (ob.length == 0) {
            $("#internal-links-view").append(`
                        <h1 style="margin-left:50px"> You haven’t  any wikies yet.</h1>
                        `)
        }
        else {


            $("#internal-links-view").empty();

            for (let j = 0; j < ob.wikiCat.length; j++) {
                let temp = 0;
                let $divObj = $(`<div class="BoxView"></div>`);
                $divObj.append(`<div class="WikiMenu" val="${ob.wikiCat[j].wikiCategory}" toggleval="show">  ${ob.wikiCat[j].wikiCategory} 
                       <i class="fa fa-chevron-circle-down" aria-hidden="true"></i>
                <div>`);
                let $Form = $(`<div data-val="${ob.wikiCat[j].wikiCategory}"></div>`);
                for (let i = 0; i < ob.wikiList.length; i++) {
                    if (ob.wikiList[i].category == `${ob.wikiCat[j].wikiCategory}`) {
                        // var date = new Date(ob.wikiList[i].createdAt);
                        var date = ob.wikiList[i].createdAt.split("T");

                        $Form.append(`
                                <div class="WikiList ${ ob.wikiList[i].status}" data-id= ${ob.wikiList[i].id} val="${ob.wikiList[i].title}">
                                <h1>  ${ob.wikiList[i].title}  </h1>
                                   </div>
                        `);
                        temp++;
                    }
                }
                if (temp == 0) {
                    $Form.append(`<h6 style="padding-left:100px;"> Empty List</h6> `);
                }

                $divObj.append($Form);
                $("#internal-links-view").append($divObj);
            }
        }
        this.InternalLinkContextMenu();
        $("#eb_common_loader").EbLoader("hide");

    }
    this.InternalLinkContextMenu = function () {
        $.contextMenu({
            selector: '.Publish',
            trigger: 'right',
            items: {
                "edit": {
                    name: "Copy", icon: "copy", callback: this.CopyInternalLink.bind(this)
                },
            }
        });
    }
    this.CopyInternalLink = function (key, options) {
        let id = $(options.$trigger).attr("data-id");
        let title = $(options.$trigger).attr("val");
        let link = `<a data-id="${id}" class="wikilist CurrentSelection" val="${title}"> ${title} </a>`
        copyStringToClipboard(link);
    };
    
this.copyStringToClipboard = function(str)  {
    var el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}


    var $highlights = $('.highlights');
    var $textarea = $('#text');

    // yeah, browser sniffing sucks, but there are browser-specific quirks to handle that are not a matter of feature detection
    var ua = window.navigator.userAgent.toLowerCase();
    var isIE = !!ua.match(/msie|trident\/7|edge/);
    var isWinPhone = ua.indexOf('windows phone') !== -1;
    var isIOS = !isWinPhone && !!ua.match(/ipad|iphone|ipod/);

    this.applyHighlights = function(text) {
        text = text
            .replace(/\n$/g, '\n\n')
            .replace(/&lt[^&gt]*&gt/g, '<mark>$&</mark>')
            .replace(/&lt\s*[a-z].*?&gt/g, '<mark>$&</mark>')
            .replace(/&lt\s*\/\s*\w\s*.*?&gt|&lt\s*br\s*&gt/g, '<mark>$&</mark>');

        if (isIE) {
            // IE wraps whitespace differently in a div vs textarea, this fixes it
            text = text.replace(/ /g, ' <wbr>');
        }

        return text;
    }

    this.handleInput = function() {
        var text = $textarea.val();
        var text = text.replace(/\>/g, '&gt');
        var text = text.replace(/\</g, '&lt');
        var highlightedText = applyHighlights(text);
        $highlights.html(highlightedText);
    }

    this.init = function () {

        $(".props").on("click", this.appendVal.bind(this));
        $(".wikilist").on("click", this.FetchWikiList.bind(this)); 
        $("#wiki_data_div").on("click", ".searchshow", this.FetchWikiList.bind(this));
        $("#text").on("keyup", this.AppendHtml.bind(this));
        $("#text").on("click", this.AppendHtml.bind(this));
        $("#search_wiki").on("keyup change", this.WikiSearch.bind(this));
        $(".wraper-link").on("click", this.WikiListToggle.bind(this));
        //$("#render_page_toggle").on("click", this.render_page_toggle.bind(this));
        $(".wiki_data").on("click", ".SearchWithTag ", this.SearchWithTagFun.bind(this));
       // $(".wiki_data").on("click", ".wikilist", this.SearchWithTagFun.bind(this));
        $(".wiki_data").on("click", ".NextPreWiki", this.NextAndPreWiki.bind(this));
        $(".GettingStarted").on("click", this.GetStartToWikiDocs.bind(this));

        //wiki admin
        $("#wikisave").on("click", this.SaveWiki.bind(this));
        $(".wikies_list").on("click", this.Admin_Wiki_List.bind(this));
        $("#public").on("click",".WikiMenu", this.WikiMenuToggle.bind(this));
        $("#public").on("click", ".UpdateOrder", this.UpdateOrder.bind(this));
        $(".WikiAdminMenuBar").on("click", this.WikiAdminMenuBarHighlight.bind(this));
        $("#gallery-tab1").on("click", this.gallerytab.bind(this));
        $("#wiki-preview-tab").on("click", this.WikiPreviewTab.bind(this));
        $("#tbl-size-select").on("click", this.tbl_size_select.bind(this));
        $("#ul-type-select").on("click", this.ul_type_select.bind(this));
        $("#ol-type-select").on("click", this.ol_type_select.bind(this));
        $("#internal-a").on("click", this.InternalLinksFun.bind(this));
        $("#wiki_data_div").on("click", ".wikilist", this.FetchWikiList.bind(this));
    };

    this.init();
}
