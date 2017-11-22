var menujs = function (login) {
    this.login = login;

    this.init = function () {
        $('#submen').off("click").on("click", this.showModal.bind(this));
        $('#MyDropDownId li').click(function () { $('#dropbuttn').text($(this).text()); });
        $("#searchobj").off("keyup").on("keyup", this.searchObjects.bind(this));
    };

    this.showModal = function () {
        if (this.login == "dc" || this.login == "uc") {
            $("#ObjModal").modal('show');
            $.LoadingOverlay("show");
            $("#EbsideBar").empty();
            $.get("../TenantUser/getSidebarMenu", function (result) {
                $("#EbsideBar").append(result);
                $.LoadingOverlay("hide");
            });
        }
        else {
            $('#EbsideBar').animate({ width: 'toggle' });
        }
    };

    this.searchObjects = function () {
        if ($('#dropbuttn').text() === 'All') {
            var f = false;
            var srch = $(this).val().toLowerCase();
            alert(srch);
            $('[name=head4]').each(function () {
                $(this).parent().parent().hide();
                var head = $(this).text().toLowerCase();
                if (head.match(srch)) {
                    $(this).parent().parent().show();
                    f = true;
                }
            });
            if (!f)
                $("#notfound").text('Item not found.......');
            else
                $("#notfound").text('');
        }
        else {
            var searchBy = $('#dropbuttn').text();
            var f = false;
            var srch = $(this).val().toLowerCase();
            $('[name=' + searchBy + ']').each(function () {
                $(this).parent().parent().parent().parent().hide();
                var head = $(this).text().toLowerCase();
                if (head.match(srch)) {
                    $(this).parent().parent().parent().parent().show();
                    f = true;
                }
            });
            if (!f)
                $("#notfound").text('Item not found.......');
            else
                $("#notfound").text('');
        }
    };

    this.init();
}