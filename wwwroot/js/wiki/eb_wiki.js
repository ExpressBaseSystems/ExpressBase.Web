
let addwiki = function () {

    
    this.printresult = function () {
        let abc = $('#text').val();
        $('#render').html(abc);
        $('#new1').append('');

    };

    this.pri = function (e) {
        let id = e.target.getAttribute('val');
        let txt = 'text';
        this.insertAtCaret(txt, id);
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

    this.init = function () {

        $(".props").on("click", this.pri.bind(this));
        $("#text").on("keyup", this.printresult.bind(this));
    };

    this.init();
}
