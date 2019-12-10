const EbDynamicTab = function (options) {
    this.options = $.extend({
        AllTabCtrls: [],
        FormModel: {}
    }, options);

    this.tabPaneArr = [];
    

    this.init = function () {
        if (this.options.AllTabCtrls.length === 0)
            return;
        this.identifyDynamicTabs();

    };

    this.identifyDynamicTabs = function () {
        for (let i = 0; i < this.options.AllTabCtrls.length; i++) {
            let tabCtrl = this.options.AllTabCtrls[i];
            for (let j = 0; j < tabCtrl.Controls.$values.length; j++) {
                if (tabCtrl.Controls.$values[j].IsDynamic) {
                    let pane = tabCtrl.Controls.$values.splice(j--, 1)[0];
                    this.tabPaneArr.push({
                        name: tabCtrl.Name + '_' + pane.Name,
                        tab: tabCtrl,
                        tabPane: pane,
                        liHtml: this.getLiHtml(tabCtrl.EbSid, pane.Name),
                        contentHtml: this.getContentHtml(tabCtrl.EbSid, pane.Name)
                    });
                }
            }
        }
    };

    this.getLiHtml = function (tabId, paneName) {
        let html = '';
        let $ctrl = $(`#cont_${tabId} li[ebsid='@${paneName}_ebsid@']`).remove();
        if ($ctrl.length === 0) {
            console.log(`Li not found. Selector : #cont_${tabId} li[ebsid='@${paneName}_ebsid@']`);
        }
        else {
            html = $ctrl.outerHTML();
        }
        return html;
    };

    this.getContentHtml = function (tabId, paneName) {
        let html = '';
        let $ctrl = $(`#cont_${tabId} div[ebsid='@${paneName}_ebsid@']`).remove();
        if ($ctrl.length === 0) {
            console.log(`Content not found. Selector : #cont_${tabId} div[ebsid='@${paneName}_ebsid@']`);
        }
        else {
            html = $ctrl.outerHTML();
        }
        return html;
    };

    DynamicTabPane = function (args) {
        args = {
            name: 'tabcontrol1_pane1',
            srcId: 'dyn1',
            params: { textbox1 : 'haha'}
        };



    }.bind(this);

    this.init();
};