
let addwiki = function () {

    this.printresult = function () {
        let abc = $('#text').val();
        $('#render').html(abc);
        $('#new1').append('');

    };

    this.show_home = function () {
        $('#wiki_data_div').hide();
        $('.front_page_wiki').show();
    };

    this.printval = function (e) {
        let id = e.target.getAttribute('val');
        let txt = 'text';
        this.insertAtCaret(txt, id);
    }

    this.fetchwikilist = function (e) {
        let id = e.target.getAttribute('id');

        $.ajax({
            type: 'POST',
            url: "/PublicWiki/GetWiki",
            data: {
                wiki_id: id
            },
            success: function (ob) {
                $('#wiki_data_div').show();
                $("#wiki_data_div").scrollTop(0);
                $('.edit').attr('href', '../wiki/add/' + ob.id);
                $('.edit').attr('id', ob.id);
                $(".facebook").removeAttr("href").attr("href", "https://www.facebook.com/share.php?u=http://myaccount.localhost:41500/publicwiki/view/" + id + "&title=" + ob.title);
                $(".twitter").removeAttr("href").attr("href", "https://twitter.com/intent/tweet?status=" + ob.title + "http://myaccount.localhost:41500/publicwiki/view/" + id);
                $(".linkedin").removeAttr("href").attr("href", "https://www.linkedin.com/shareArticle?mini=true&url=http://www.expressbase.com&title=LinkedIn%20Developer%20Network&summary=My%20favorite%20developer%20program&source=LinkedIn");
                $(".whatsapp").removeAttr("href").attr("href", "https://wa.me/?text=http://myaccount.localhost:41500/publicwiki/view/" + id);
                $(".pintrest").removeAttr("href").attr("href", "https://plus.google.com/share?url=http://myaccount.localhost:41500/publicwiki/view/" + id);
                $('#wiki_data_div').html(ob.html).slideUp(10).slideDown(200).fadeIn(100);
                //$('.edit').css('visibility', 'visible'); 
                $('.front_page_wiki').hide();
            }
        });
    }

    this.fetchwikisearch = function (e) {
        let id = e.target.getAttribute('val');
        $.ajax({
            type: 'POST',
            url: "/PublicWiki/GetWiki",
            data: {
                wiki_id: id
            },
            success: function (ob) {
                $('#wiki_data_div').show();
                $('.edit').attr('href', '../wiki/add/' + ob.id);
                $('.edit').attr('id', ob.id);
                $('#wiki_data_div').html(ob.html);
                //$('.edit').css('visibility', 'visible'); 
                $('.front_page_wiki').hide();
            }
        });
    }

    this.search_wiki = function () {
        let key = $('#search_wiki').val();
        if (key.length == 0) {

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

                        //$("#html").append("<a style='text-decoration: none;' class='searchshow' href='#' id='" + ob[i].id + "'>" + "<div class='ex2' >" + ob[i].html + " </div></a>");
                        $("#wiki_data_div").append("<a class='searchshow' id='" + ob[i].id + "'>" + ob[i].title + "");
                        $("#wiki_data_div").append("<div class='ex2'>" + ob[i].html + "</div></a></br>");
                        // $("#search_id").append("<a href='/publicwiki/view/" + ob[i].id + "'>More</a>");
                        $('#' + ob[i].id).attr('title', ob[i].category);
                    };
                }
            });
        }
    }


    this.insertAtCaret = function (areaId, text) {
        let txtarea = document.getElementById(areaId);
        if (!txtarea) {
            return;
        }

        let scrollPos = txtarea.scrollTop;
        let strPos = 0;
        let br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
            "ff" : (document.selection ? "ie" : false));
        if (br == "ie") {
            txtarea.focus();
            let range = document.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            strPos = range.text.length;
        } else if (br == "ff") {
            strPos = txtarea.selectionStart;
        }

        let front = (txtarea.value).substring(0, strPos);
        let back = (txtarea.value).substring(strPos, txtarea.value.length);
        txtarea.value = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            let ieRange = document.selection.createRange();
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
        let data = this.format($("#text").val());
        $('#text').val(data);


    };


    this.format = function (str) {
        str = str.replace(/\n/g, "");
        let div = document.createElement('div');
        div.innerHTML = str.trim();

        return this.formatHelper(div, 0).innerHTML;
    }

    this.formatHelper = function (node, level) {
        let indentBefore = new Array(level++ + 1).join('        '),
            indentAfter = new Array(level - 1).join('  '),
            textNode;

        for (let i = 0; i < node.children.length; i++) {
            textNode = document.createTextNode('\n' + indentBefore);
            node.insertBefore(textNode, node.children[i]);

            this.formatHelper(node.children[i], level);

            if (node.lastElementChild == node.children[i]) {
                textNode = document.createTextNode('\n' + indentAfter);
                node.appendChild(textNode);
            }
        }

        return node;
    }


    this.add_tag = function (e) {
        let tag = $('#list_tag').val();
        alert(tag);
        $("#view-tags").append("<label>" + tag + "</label>")
    }

    this.display = function (e) {
        let id = e.target.getAttribute('val');
        let temp = $("#" + id).val();
        if (temp == "show") {
            $("#" + id).val("hide");
            $("#" + id).hide(200);
        }
        else {
            $("#" + id).val("show")
            $("#" + id).show(300);
        }

    }

    this.Render_page_hide = function () {
        $("#render_wiki").hide();
        $("#Render_page_open").show();
        $("#editor_wiki").removeClass('col-sm-6').addClass('col-sm-10');
    }
    this.Render_page_open = function () {
        $("#render_wiki").show(300);
        $("#Render_page_open").hide();
        $("#editor_wiki").removeClass('col-sm-10').addClass('col-sm-6');
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
                        <h1> Empty List</h1>

                        `)
        }
        else
            for (let i = 0; i < ob.length; i++) {
                $("#public").append(`
                                <h1>  ${ob[i].title}  </h1>
                                <div class='col admin_wiki_list'> ${ ob[i].html}</div>
                                  <div class="row">
                                  <div class="col-sm-3" style="width: 320px;padding-right:0px;">
                                    Created On  ${ ob[i].createdAt}
                                   </div>
                                  <i class="${ ob[i].status} fa fa-pencil-square-o" data-id= ${ob[i].id} val=${ob[i].status}></i>      
                                `);
                $("#public").append("</div>");
                $("#public").append("<div style='width:100%;border-bottom:solid 1px grey;'></div>")
            };

        this.Draftcontextmenu();

        this.Publishcontextmenu();

        this.Unpublishcontextmenu();

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
        let $Form = $(`<ul data-val="Form" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Form") {
                $Form.append(`<li class="ui-state-default"> ${ob.wikiList[i].title}  </li>`);
            }
            }
        $("#public").append($Form);

        $("#public").append(`<div class="WikiMenu" val="Report">  Report <div>`);
        let $Report = $(`<ul data-val="Report" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Report") {
                $Report.append(`<li class="ui-state-default"> ${ob.wikiList[i].title}  </li>`);
            }
        }
        $("#public").append($Report);


        $("#public").append(`<div class="WikiMenu" val="API">  API <div>`);
        let $API = $(`<ul data-val="API" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "API") {
                $API.append(`<li class="ui-state-default"> ${ob.wikiList[i].title}  </li>`);
            }
        }
        $("#public").append($API);

        $("#public").append(`<div class="WikiMenu" val="Chatbots">  Chatbots <div>`);
        let $Chatbots = $(`<ul data-val="Chatbots" class="dragable_wiki_list"></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Chatbots") {
                $Chatbots.append(`<li class="ui-state-default"> ${ob.wikiList[i].title} </li>`);
            }
        }
        $("#public").append($Chatbots);

        $("#public").append(`<div class="WikiMenu" val="Security">  Security <div>`);
        let $Security = $(`<ul data-val="Security" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "Security") {
                $Security.append(`<li class="ui-state-default"> ${ob.wikiList[i].title} </li>`);
            }
        }
        $("#public").append($Security);

        $("#public").append(`<div class="WikiMenu" val="AppStore">  App Store <div>`);
        let $AppStore = $(`<ul data-val="AppStore" class="dragable_wiki_list" ></ul>`);
        for (let i = 0; i < ob.wikiList.length; i++) {
            if (ob.wikiList[i].category == "AppStore") {
                $AppStore.append(`<li class="ui-state-default"> ${ob.wikiList[i].title} <span class="ui-icon ui-icon-arrowthick-2-n-s"></span> </li>`);
            }
        }
        $("#public").append($AppStore);

    this.draggableForm();
    this.draggableReport();
    this.draggableAPI();
    this.draggableChatbots();
    this.draggableSecurity();
    this.draggableAppStore();
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
        $("[data-val=Security]").sortable();
        $("[data-val=Security]").disableSelection();
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
                        $("[data-val=Draft]").click();
                    }
                    else {
                        $("[data-val=Unpublish]").click();
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
                        $("[data-val=Publish]").click();                 
                }
            }
        });
    };

    this.init = function () {

        $(".props").on("click", this.printval.bind(this));
        $(".wikilist").on("click", this.fetchwikilist.bind(this));
        $("#wiki_data_div").on("click", ".searchshow" , this.fetchwikilist.bind(this));
        $(".wikisearch").on("click", this.fetchwikisearch.bind(this));
        $("#text").on("keyup", this.printresult.bind(this));
        $("#home").on("click", this.show_home.bind(this));
        $("#search_wiki").on("keyup", this.search_wiki.bind(this));
        $("#search_wiki").on("change", this.search_wiki.bind(this));
        $("#search_wiki").on("click", this.search_wiki.bind(this));
        $("#add_tag").on("click", this.add_tag.bind(this));
        $(".menu").on("click", this.display.bind(this));
        $("#Render_page_close").on("click", this.Render_page_hide.bind(this));
        $("#Render_page_open").on("click", this.Render_page_open.bind(this));
        //wiki admin
        $(".wikies_list").on("click", this.Admin_Wiki_List.bind(this));
    
        
    };

    this.init();
}