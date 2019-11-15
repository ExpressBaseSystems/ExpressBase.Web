$.fn.extend({
    treed: function (o) {
        var openedClass = 'fa-minus-square-o';
        var closedClass = 'fa-plus-square-o';
        var ic = o || 'fa-plus-square-o';

        if (typeof o !== 'undefined') {
            if (typeof o.openedClass !== 'undefined') {
                //openedClass = o.openedClass;
            }
            if (typeof o.closedClass !== 'undefined') {
                //closedClass = o.closedClass;
            }
        }
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.prepend("<i class='indicator fa " + ic + "'></i>");
            branch.addClass('branch');
            branch.off("click").on('click', function (e) {
                if (this === e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            });
            branch.children().children().toggle();
        });
        tree.find('.branch .indicator').each(function () {
            $(this).off("click").on('click', function (e) {
                $(this).closest('li').click();
            });
        });
        tree.find('.branch>a').each(function () {
            $(this).off("click").on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
        tree.find('.branch>button').each(function () {
            $(this).off("off").on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
    }
});
$.fn.extend({
    killTree: function (o) {
        var tree = $(this);
        tree.removeClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.children().children().show();
            branch.children("i").remove();
            branch.removeClass('branch');
            branch.off("click");
        });
    }
});