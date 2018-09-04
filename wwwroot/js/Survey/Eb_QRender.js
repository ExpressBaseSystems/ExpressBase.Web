class QRender {
    constructor(option) {
        this.Survey = JSON.parse(option.Survey);
        this.$QC = $("#ques_container");
        this.Rtoken = option.Rtoken;
        this.Btoken = option.Btoken;
        this.MasterId = option.MasterId || 1;
        this.QuesCount = 0;
        this.CheckCount = 0;
        this.render();
        this.Resp = {};
    }

    render() {
        if (!$.isEmptyObject(this.Survey)) {
            this.setSurveyInfo();
            this.setQuery();
            this.ajaxSetup();
        }
    }

    setSurveyInfo() {
        let d = new Date();
        $('[jstag="SurveyName"]').text(this.Survey.SurveyInfo.Name);
        //$('[jstag="TotalQues"]').text("Total Question: " + Object.keys(this.Survey.Queries).length);
        //$('[jstag="CurrentTime"]').text(`${d.getDay()}-${d.getMonth()}-${d.getFullYear()}: ${d.getHours()}.${d.getMinutes()}`);
        $('[jstag="CurrentQues"]').text(`Question ${this.QuesCount+1}/${Object.keys(this.Survey.Queries).length}`);
    }

    setQuery() {
        let q = this.Survey.Queries;
        let key = Object.keys(q)[this.QuesCount];

        this.$QC.append(`<div class="q_box" q_id=${key} q_container="ques_c_${this.QuesCount}">
                            <div class="qstxtc_t pd-1015 float-l">
                                ${q[key].Question}?
                            </div>
                            <div class="qschoice_mid w-100 pd-1015 float-l">
                                ${this.getChoice(q[key])}
                            </div>
                            <div class="qscfooter_sub w-100 pd-1015 float-l">
                                <a class="ebbtn eb_btn-sm eb_btngreen pull-right" qid="${q[key].QuesId}" job="next${key}">Next</a>
                            </div>
                        </div>`);
        $(`a[job='next${key}']`).off("click").on("click", this.setNext.bind(this));
        $("span[job='star_control']").off("click").on("click", this.starClick.bind(this));
        $('[jstag="CurrentQues"]').text(`Question ${this.QuesCount + 1}/${Object.keys(this.Survey.Queries).length}`);
    }

    getChoice(o) {
        let html = new Array();
        for (let i = 0; i < o.Choices.length; i++) {
            html.push(this.getChoiceHtml(o.QuesType, o.Choices[i]));
        }
        this.CheckCount = 0;
        return html.join("");
    }

    getChoiceHtml(t, choice) {
        if (t === 1) {
            return `<div class="col-md-6 pd-l-0 ssel_container display-flex" cid="${choice.ChoiceId}">
                    <span class="mr-r-10px"><input type="radio" chid_resp="${choice.ChoiceId}" name="Radio_${choice.ChoiceId}" /></span>
                    <span>${choice.Choice}</span>
                    </div>`;
        }
        else if (t === 2) {
            return `<div class="col-md-6 pd-l-0 ssel_container display-flex" cid="${choice.ChoiceId}">
                    <span class="mr-r-10px"><input type="checkbox" chid_resp="${choice.ChoiceId}" name="Check_${choice.ChoiceId}_${this.CheckCount}" /></span>
                    <span>${choice.Choice}</span>
                    </div>`;
            this.CheckCount += 1;
        }
        else if (t === 3) {
            return `<div class="col-md-12 rating_container display-flex">
                        <div class="star_container">
                            ${this.getStarHtml(choice)}
                        </div>
                    </div>`;
        }
        else if (t === 4) {
            return ` <div class="col-md-12 pd-0 user_in_container display-flex">
                        ${this.getUserInHtml(choice)}
                    </div>`;
        }
    }

    getStarHtml(choice) {
        let html = new Array();
        for (let i = 0; i < eval(choice.Choice); i++) {
            html.push(`<span class="fa fa-star" job="star_control"></span>`);
        }
        return html.join("");
    }

    setNext(e) {
        $(`[q_container='ques_c_${this.QuesCount}']`).hide();
        this.QuesCount += 1;
        this.getRespInfo($(e.target));

        if (this.QuesCount != Object.keys(this.Survey.Queries).length)
            this.setQuery();
        else
            this.surveyComplete();
    }

    starClick(e) {
        $(e.target).addClass("star_checked").prevAll().addClass("star_checked");
        $(e.target).nextAll().removeClass("star_checked");
    }

    getUserInHtml(choice) {
        if (choice.Choice === "Text")
            return `<div class="col-md-4 pd-0">
                    <input type="text" name="" placeholder="Enter your answer" class="form-control" /></div>`;
        else if (choice.Choice === "MultiText")
            return `<div class="col-md-12 pd-0">
                    <textarea name="" placeholder="Enter your answer" class="form-control"></textarea></div>`;
        else if (choice.Choice === "Date")
            return `<div class="col-md-4 pd-0">
                    <input type="date" placeholder="Choose date" class="form-control"/></div>`;
    }

    surveyComplete() {
        EbMessage("show", { Message: "Survey Completed.",AutoHide:false });
    }

    ajaxSetup() {
        $.ajaxSetup({
            beforeSend: function (xhr) { xhr.setRequestHeader('bToken', this.Btoken); xhr.setRequestHeader('rToken', this.Rtoken); }.bind(this),
            complete: function (resp) { this.Btoken = resp.getResponseHeader("btoken"); }.bind(this)
        });
    }

    getRespInfo($nextbtn) {
        let $quesdiv = $nextbtn.closest(".q_box");
        let q = this.Survey.Queries[$quesdiv.attr("q_id")];
        let o = {};
        o.QuesId = q.QuesId;
        o.MasterId = this.MasterId;
        o.QuesType = q.QuesType;

        if (q.QuesType == 1) {
            o.ChoiceIds = $quesdiv.find("input[type='radio']:checked").attr("chid_resp");
            o.Answer = null;
        }
        else if (q.QuesType == 2) {
            o.ChoiceIds = this.joinChecked($quesdiv);
            o.Answer =null;
        }
        else if (q.QuesType == 3) {
            o.ChoiceIds = q.Choices[0].ChoiceId;
            o.Answer = this.getRatingValue($quesdiv);
        }
        else if (q.QuesType == 4) {
            o.ChoiceIds = q.Choices[0].ChoiceId;
            o.Answer = this.getUiValues($quesdiv,q);
        }

        this.postResp(o);
    }

    joinChecked($div) {
        let ids = [];
        $div.find("input[type='checkbox']:checked").each(function (k, checkbox) {
            ids.push($(checkbox).attr("chid_resp"));
        });
        return ids.join();
    }

    getRatingValue($div) {
        return $div.find(".star_checked").length;
    }

    getUiValues($div, q) {
        if (q.Choices[0].Choice === "Text") {
            return $div.find("input[type='text']").val();
        }
        else if (q.Choices[0].Choice === "MultiText") {
            return $div.find("textarea").val();
        }
        else if (q.Choices[0].Choice === "Date") {
            return $div.find("input[type='date']").val();
        }
        else if (q.Choices[0].Choice === "Time") {

        }
    }

    postResp(o) {
        if (o.ChoiceIds) {
            $.ajax({
                type: "POST",
                url: "../Boti/SendSurveyResponse",
                data: { json: JSON.stringify(o) },

                success: function (data) {

                }.bind(this)
            });
        }
    }
};
