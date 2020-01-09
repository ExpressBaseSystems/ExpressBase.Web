
var Addwiki = function () {
    var htmlEditor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        mode: 'htmlmixed',
        // theme: 'default',
    });  
   
    this.AppendHTMLtag = function (e) {
        let id = e.target.getAttribute("value");
        var val = htmlEditor.getValue();
        var SelectedString = htmlEditor.getSelection();
        htmlEditor.replaceSelection(`<${id}>` + SelectedString + `<${id}/>`);

    };

    this.init = function () {
        $(".props").off("click").on("click", this.AppendHTMLtag.bind(this));
    };
    this.init();
}
//function insertStringInTemplate(str) {
//    var doc = editor_template.getDoc();
//    var cursor = doc.getCursor();

//    var pos = {
//        line: cursor.line,
//        ch: cursor.ch
//    }

//    doc.replaceRange(str, pos);
//}