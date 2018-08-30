var ManageSurveyObj = function (SurveyData, QuesList) {
    this.SurveyData = JSON.parse(SurveyData);
    this.QuestionList = JSON.parse(QuesList);
    this.menuBarObj = $("#layout_div").data("EbHeader");
    this.drake;
    this.Marked = [];

    this.$Name = $("#txtName");
    this.$Start = $("#txtStart");
    this.$End = $("#txtEnd");
    this.$State = $("#selState");
    this.$divAll = $("#divQuesAll");
    this.$divSelected = $("#divQuesSelected");

    this.$btnSave = $("#btnSave");

    this.init = function () {
        this.initForm();

        this.menuBarObj.insertButton(`<button id="btnSave" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`);
        this.drake = new dragula([document.getElementById("divQuesAll"), document.getElementById("divQuesSelected")], {
            accepts: function (el, target, source, sibling) {
                $(".selection_pane .selected_quest").addClass("hide_pseudo");
                var qid = parseInt($(el).attr('data-id'));
                if ($(source)[0].id === this.$divAll[0].id && $(target)[0].id === this.$divSelected[0].id) {
                    if (this.SurveyData.QuesIds.indexOf(qid) === -1) {
                        this.SurveyData.QuesIds.push(qid);
                    }
                    else {
                        return false;
                    }
                }
                else if ($(source)[0].id === this.$divSelected[0].id && $(target)[0].id === this.$divAll[0].id) {
                    if (this.SurveyData.QuesIds.indexOf(qid) > -1) {
                        this.SurveyData.QuesIds.splice(this.SurveyData.QuesIds.indexOf(qid), 1);
                    }
                }
                return true;// elements can be dropped in any of the `containers` by default
            }.bind(this)
        });
        this.$Start.datetimepicker({ timepicker: true, format: "d-m-Y H:i" });
        this.$End.datetimepicker({ timepicker: true, format: "d-m-Y H:i" });

        $("#btnSave").on("click", this.onClickSave.bind(this));

        $('#txtSrchList').on('keyup', this.searchQues.bind(this));

        $("#spanRemvList").on('click', function () {
            $('#txtSrchList').val("");
            $("#spanRemvList").hide();
            $("#spanSrchList").show();
            this.redrawAllQues("");
        }.bind(this));
        $("#addfromBank_ok").off("click").on("click", this.MarkAsSelected.bind(this));
    }

    this.rmMarked = function (e) {
        var $div = $(e.target).closest(".appcontainer");
        var dataid = $div.attr("data-id");
        this.$divAll.find("div[data-id='" + dataid + "']").find("input[type='checkbox']").prop("checked",false);
        $div.remove();
    };

    this.initForm = function () {
        if (this.SurveyData.Id > 0) {
            this.$Name.val(this.SurveyData.Name);
            this.$Start.val(this.SurveyData.Start);
            this.$End.val(this.SurveyData.End);
            this.$State.val(this.SurveyData.Status);

            if (this.SurveyData.QuesIds.length > 0)
                $(".selection_pane").addClass("hide_pseudo");

            $.each(this.SurveyData.QuesIds, function (i, did) {
                var result = this.QuestionList.filter(obj => {
                    return obj.Id === did
                });

                this.$divSelected.append(` <div class="col-md-12 col-lg-12 col-sm-12 appcontainer" data-id="${result[0].Id}" qname="${result[0].Question}">
                                        <a class="appcontainer_inner query_tile" queryid="${result[0].Id}">
                                            <div class="col-md-12 pd-0">
                                                <h5 class="txtdecor_none">${result[0].Question}</h5>
                                                <p class="small txtdecor_none">${this.getChoiceType(result[0])}</p>
                                            </div>
                                        </a>
                                    </div>`);

                this.$divAll.find(`div[data-id='${result[0].Id}']`).remove();
            }.bind(this));

            this.menuBarObj.setName("Manage Survey - " + this.SurveyData.Name);
            this.menuBarObj.insertButton(`<button id="btnNew" class='btn' title='New'><i class="fa fa-plus" aria-hidden="true"></i></button>`);
            $("#btnNew").on("click", function () {
                window.location.search = '';
            }.bind(this));
        }
        else {
            this.menuBarObj.setName("Manage Survey - Untitled");
            this.SurveyData.QuesIds = [];
        }
    }

    this.rmFallQues = function () {
        this.$divSelected.find(".appcontainer").each(function (i, o) {
            let id = $(o).attr("data-id");
            this.$divAll.find(`div['data-id=${id}']`).remove();
        }.bind(this))
    };

    this.searchQues = function (e) {
        this.$divAll.find(".appcontainer").each(function (i, o) {
            if ($(o).attr("qname").toLowerCase().indexOf(e.target.value.toLowerCase()) > -1)
                $(o).show();
            else
                $(o).hide();
        }.bind(this))
    }

    this.MarkAsSelected = function (e) {
        this.Marked.length = 0;
        this.$divAll.find(`input[name="MarkQues"]`).each(function (i, o) {
            if ($(o).is(":checked") && this.Marked.indexOf($(o).attr("quesid")) < 0) {
                this.Marked.push($(o).attr("quesid"));
            }
        }.bind(this));
        if (this.Marked.length > 0)
            this.appendMarked();
        $("#AddFromBank").modal("toggle");
    };

    this.appendMarked = function () {
        let o = new Object();
        for (let i = 0; i < this.Marked.length; i++) {
            o = this.getQuesObj(eval(this.Marked[i]));
            if (this.$divSelected.find(`div[data-id='${this.Marked[i]}']`).length === 0) {
                this.$divSelected.append(`<div class="col-md-4 col-lg-4 col-sm-4 appcontainer" data-id="${o.Id}" qname="${o.Question}">
                                        <a class="appcontainer_inner" queryid="${o.Id}">
                                            <div class="col-md-12 pd-0">
                                                <h5 class="txtdecor_none">${o.Question}</h5>
                                                <p class="small txtdecor_none">${this.getChoiceType(o)}</p>
                                            </div>
                                            <span class="fa fa-close cls_ques"></span>
                                        </a>
                                    </div>`);
            }
        }
        if (this.Marked.length > 0)
            $(".selection_pane").addClass("hide_pseudo");
        $(".cls_ques").off("click").on("click", this.rmMarked.bind(this));
    };

    this.getQuesObj = function (id) {
        let qobj = new Object();
        for (let i = 0; i < this.QuestionList.length; i++) {
            if (this.QuestionList[i].Id === parseInt(id))
                qobj = this.QuestionList[i];
        }
        return qobj;
    }

    this.getChoiceType = function (o) {
        let type = new String();
        if (o.ChoiceType === 1)
            type = "SingleSelect";
        else if (o.ChoiceType === 2)
            type = "MultiSelect";
        else if (o.ChoiceType === 3)
            type = "Rating";
        else if (o.ChoiceType === 4)
            type = "UserInput";
        return type;
    };

    this.onClickSave = function () {
        var selectedQids = [];
        $.each(this.$divSelected.children(".appcontainer"), function (i, divO) {
            selectedQids.push(parseInt($(divO).attr('data-id')));
        }.bind(this));
        var sObj = { Id: this.SurveyData.Id, Name: this.$Name.val(), Start: this.$Start.val(), End: this.$End.val(), Status: this.$State.val(), QuesIds: selectedQids };
        $.ajax({
            type: "POST",
            url: "../Survey/SaveSurvey",
            data: { SurveyInfo: JSON.stringify(sObj) },
            beforeSend: function () {
                $("#eb_common_loader").EbLoader("show");
            },
            success: function (result) {
                $("#eb_common_loader").EbLoader("hide");
                if (result) {
                    EbMessage("show", { Message: 'Saved Successfully', AutoHide: true, Backgorund: '#1ebf1e' });
                    if (this.SurveyData.Id === 0)
                        window.location.search = '?id=' + result;
                }
                else {
                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#bf1e1e' });
                }
            }.bind(this)
        });
    }

    this.init();
}