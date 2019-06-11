
let addwiki = function () {

    
    this.printresult = function () {
        let abc = $('#text').val();
        $('#render').html(abc);
        $('#new1').append('');

    };

    this.show_home = function () {
        $('#html').hide();
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
                $('#html').show();
                $('.edit').attr('href', '../wiki/add/' + ob.id);
                $('.edit').attr('id', ob.id);
                $('#html').html(ob.html);
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
                $('#html').show();
                $('.edit').attr('href', '../wiki/add/' + ob.id);
                $('.edit').attr('id', ob.id);
                $('#html').html(ob.html);
                //$('.edit').css('visibility', 'visible'); 
                $('.front_page_wiki').hide();
            }
        });
    }

    this.search_wiki = function () {
        let key = $('#search_wiki').val();
        if (key.length == 0) {
            $(".modal").css("display", "none");
        }
        $.ajax({
            type: 'POST',
            url: "/PublicWiki/GetWikiBySearch",
            data: {
                search_wiki: key   
            },
            success: function (ob) { 

                if (!ob.length && key.length !=0 ) {
                    $("#search_id").empty();
                    $(".modal").css("display", "block");
                    $("#search_id").append("<div style='height:40px;'> <h1>Result not Found</h1> </div>");
                }
                else
                $("#search_id").empty();
                for (let i = 0; i < ob.length; i++) {
                    $(".modal").css("display", "block");
                    $("#search_id").append("<a style='text-decoration: none;' href='/publicwiki/view/" + ob[i].id +  "'>" + "<div class='ex2' >" + ob[i].html + " </div></a>");
                   // $("#search_id").append("<a href='/publicwiki/view/" + ob[i].id + "'>More</a>");
                    $('#'+ob[i].id).attr('title', ob[i].category);
                };  
            }
        });
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

    this.formatHelper = function(node, level) {
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

    this.init = function () {

        $(".props").on("click", this.printval.bind(this));
        $(".wikilist").on("click", this.fetchwikilist.bind(this));
        $(".wikisearch").on("click", this.fetchwikisearch.bind(this));
        $("#text").on("keyup", this.printresult.bind(this));
        $("#home").on("click", this.show_home.bind(this));
        $("#search_wiki").on("keyup", this.search_wiki.bind(this));
        $("#search_wiki").on("click", this.search_wiki.bind(this));
        $("#add_tag").on("click", this.add_tag.bind(this));

    };

    this.init();
}

