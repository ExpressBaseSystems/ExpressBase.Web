var TenantAddSolution = function (EbSubsciptionPlans) {
    this.EbSubsciptionPlans = EbSubsciptionPlans;
    this.objSubscription = {};
    this.products = {
        1: "Forms",
        2: "Visualization",
        3: "Report",
        4: "ChatBot",
        5: "Documents"
    }
    this.plans = {
        1: "FREE",
        2: "STANDARD",
        3: "PRO",
        4: "ENTERPRISE",
    }
    this.editclientId = function () {
        $('#cid').removeAttr('readonly').val('');
        $("#cid").focus();
        $('#popover-clientid-edit').hide();
    };

    this.subscribeProd = function (e) {
        var selector = $(e.target).closest("button");
        selector.toggleClass('subscribed');

        if (selector.hasClass('subscribed')) {
            $('#is-edit-clientid').show();
            selector.text(' ').css({
                "background": "#69ea69",
                "border": "none"
            }).append('<i class="fa fa-check" aria-hidden="true" style="color:white;"></i>');
            $('[pritem=' + selector.parent().attr('pid') + ']').children('[plan=0]').toggleClass('price-selected');
            this.objSubscription[selector.parent().attr("prod-id")] = 0;
            this.addProductTorev(selector.parent());
        }
        else {
            selector.children('i').remove();
            selector.text('Add');
            selector.css({ "background": "white", "border": "1px solid #e1e0e0" });
            $('[pritem=' + selector.parent().attr('pid') + ']').find('.price-selected').removeClass("price-selected")
            delete this.objSubscription[selector.parent().attr("prod-id")];
        }
    };

    this.getSolutionName = function (e) {
        $('#sol-name-review').val($(e.target).val());
    };

    this.getClientId = function (e) {
        $('#cid-name-review').text($(e.target).val());
    };

    this.addProductTorev = function (prod) {
        $('#subscrib-info').append(`<div class="form-inline" revpid="${prod.attr('pid')}">
                    <label class="plan-label">${prod.attr('pid')}</label>
                    <div class="plan-details" id="plan">FREE $0</div>
                </div>`);
    };

    this.isPaidPack = function () {
        $(".add-accPricing-sec-table").children().find(".paid").each(function (i, obj) {
            if ($(obj).hasClass('price-selected')) {
                if ($('#isid').val() === $('#cid').val()) {
                    $('#popover-clientid-edit').show();
                }
                return false;
            }
            else {
                $('#cid').val($('#isid').val());
                $('#cid').attr('readonly', 'readonly');
            }
        });
    };

    this.getProdPlan = function (e) {
        var selector = $(e.target).closest("td");
        if (!selector.hasClass("price-selected")) {
            if ($('[pid=' + selector.parent().attr('pritem') + ']').children('.btn-upload').hasClass('subscribed')) {
                selector.toggleClass('price-selected');
                if (selector.hasClass('price-selected')) {
                    selector.siblings().each(function (i, obj) {
                        $(obj).removeClass('price-selected');
                    });
                    this.objSubscription[selector.attr("p-type")] = parseInt(selector.attr("plan"));
                    this.addPlanToRev($(e.target).closest("td"));
                }
                else
                    selector.children('i').hide();
            }
            else
                alert('product not selected!');
        }
        this.isPaidPack();
    };

    this.addPlanToRev = function (plan) {
        $("#subscrib-info").children('[revpid=' + plan.attr('product') + ']').children('.plan-details').text(this.plans[plan.attr('plan')] + '($' + plan.attr('price') + ')').attr("price", plan.attr('price'));
        this.calcAmount();
    };

    this.calcAmount = function () {
        var tot = 0;
        $('#subscrib-info').children().each(function (i, obj) {
            var total = parseInt($(obj).children('.sol-name-review').attr('price'));
            tot = tot + total;
            $('.total-count-cont').text('$' + tot);
        });
    };

    this.drawSubsciptionTable = function () {
        for (var item in this.EbSubsciptionPlans) {
            this.object = this.EbSubsciptionPlans[item];
            var tr = $("[pritem='" + this.products[Object.keys(this.EbSubsciptionPlans)[item - 1]] + "']");
            tr.children("[product='" + this.products[Object.keys(this.EbSubsciptionPlans)[item - 1]] + "']").each(this.addAmountTodiv.bind(this));
        }
    };
    this.addAmountTodiv = function (i, obj) {
        for (var obj2 in this.object) {
            if ($(obj).attr("plan") === this.object[obj2].Plan)
                if ($(obj).attr("plan") === "0") {
                    if ($(obj).parent("tr").attr("pritem") === "ChatBot")
                        $(obj).children().find(".T-add-amount").text(this.object[obj2].EvalDays + " days");
                    else
                        $(obj).children().find(".T-add-amount").text("FOREVER");
                }
                else
                    $(obj).children().find(".T-add-amount").text("$" + this.object[obj2].Amount);
        }
    };

    this.getSubscription = function () {
        return this.objSubscription;
    };

    this.scrollFirstDiv = function () {
        $('.card').animate({
            scrollLeft: $('#basic-info').width() + 120
        }, 500);
    };
    this.scrollToFirstDiv = function () {
        $('.card').animate({
            scrollLeft: 0
        }, 500);
    };
    this.scrollToLast = function () {
        $('.card').animate({
            scrollLeft: 2000
        }, 500);
    };

    this.init = function () {
        this.drawSubsciptionTable();
        this.upload = new EbImageCropper({
            preview: 'logo-prev',
            cropperContainer: 'eb-cropie-inner'
        });
        $('#edit-sid').on("click", this.editclientId.bind(this));
        $('.btn-upload').on('click', this.subscribeProd.bind(this));
        $('#solutionname').on("change", this.getSolutionName.bind(this));
        $('#cid').on("change", this.getClientId.bind(this));
        $(".add-accPricing-sec-table td").not('.compare').on('click', this.getProdPlan.bind(this));
        $("#s-info-skip").on('click', this.scrollFirstDiv.bind(this));
        $("#prod-prev").on('click', this.scrollToFirstDiv.bind(this));
        $("#prod-skip").on('click', this.scrollToLast.bind(this));
        $("#plan-prev").on('click', this.scrollFirstDiv.bind(this));
    };
    this.init();
};