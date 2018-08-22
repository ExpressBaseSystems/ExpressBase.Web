var EbSurveyRender = function ($ctrl, bot) {
    this.$curCtrl = $ctrl;
    this.Bot = bot;

    this.$queryCont = $('<div class="survey-qry-cont"></div>');
    this.$optCont = $('<div class="survey-opt-cont"></div>');
    this.$btnCont = $('<div class="survey-btn-cont"></div>');

    this.curQryIndx = 0;

    this.init = function () {
        this.$curCtrl.append(`<div class="survey-final-btn" style="display:none;">
                                <button class='btn' idx='${this.Bot.curForm.controls.indexOf(this.Bot.curCtrl)}'>Hidden</button>
                              </div>`);
        $("body").off("click", ".survey-btn-cont .btn").on("click", ".survey-btn-cont .btn", this.onClickContinue.bind(this));

        this.renderQuery();
    }

    this.renderQuery = function () {
        if (this.Bot.curCtrl.queryList.length > this.curQryIndx) {
            let temp = this.Bot.curCtrl.queryList[this.curQryIndx];
            this.$curCtrl.append(this.$queryCont.clone().append((this.curQryIndx + 1) + ") " + temp.query));
            this.renderOptions();
            this.renderButton();
        }
    }

    this.renderOptions = function () {
        let curQry = this.Bot.curCtrl.queryList[this.curQryIndx];
        var optHtml = ``;
        for (let i = 0; i < curQry.optionsList.length; i++) {
            optHtml += `<label><input type="radio" name="${curQry.queryId}" value="${curQry.optionsList[i].option}"> ${curQry.optionsList[i].option}</label></br>`;
        }
        this.$curCtrl.append(this.$optCont.clone().append(optHtml));
    }

    this.renderButton = function () {
        this.$curCtrl.append(this.$btnCont.clone().append(`<button class='btn'>Continue</button>`));
    }

    this.onClickContinue = function (event) {        
        if ((this.Bot.curCtrl.queryList.length - 1) !== this.curQryIndx) {
            $(event.target).parent('.survey-btn-cont').hide();
            this.curQryIndx++;
            this.renderQuery();
        }
        else {
            this.setFinalObject();
            $(".survey-final-btn .btn").click();
        }
    }

    this.setFinalObject = function () {
        var curCtrl = this.Bot.curCtrl;
        var resObj = {};
        var displayValue = `<table>`;
        for (let i = 0; i < curCtrl.queryList.length; i++) {
            let val = $(`.survey-opt-cont input[name=${curCtrl.queryList[i].queryId}]:checked`).val() || "";

            let tempArray = new Array();
            tempArray.push(new Object({ Name: 'surveyid', Value: curCtrl.surveyId, Type: 8 }));//EbDbTypes.Double = 8
            tempArray.push(new Object({ Name: 'option', Value: val }));
            resObj[curCtrl.queryList[i].queryId] = tempArray;

            displayValue += `<tr><td style='width:65%;'>${curCtrl.queryList[i].query}</td><td style='width:35%;'>${val}</td></tr>`;
        }
        displayValue += `</table>`;
        curCtrl.resultantJson = JSON.stringify(resObj);
        this.Bot.curDispValue = displayValue;
    }

    this.init();
}