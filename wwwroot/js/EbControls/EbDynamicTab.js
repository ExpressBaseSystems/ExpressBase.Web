const EbDynamicTab = function (options) {
    this.options = $.extend({
        allTabCtrls: [],
        formModel: {},
        initControls: null
    }, options);

    this.tabPaneArr = [];
    this.dynamicTabPanes = {};

    this.init = function () {
        if (this.options.allTabCtrls.length === 0)
            return;
        this.identifyDynamicTabs();

    };

    this.identifyDynamicTabs = function () {
        for (let i = 0; i < this.options.allTabCtrls.length; i++) {
            let tabCtrl = this.options.allTabCtrls[i];
            for (let j = 0; j < tabCtrl.Controls.$values.length; j++) {
                if (tabCtrl.Controls.$values[j].IsDynamic) {
                    let paneObj = tabCtrl.Controls.$values.splice(j--, 1)[0];
                    this.tabPaneArr.push({
                        name: tabCtrl.Name + '_' + paneObj.Name,
                        tab: tabCtrl,
                        tabPane: paneObj,
                        liHtml: this.getLiHtml(tabCtrl.EbSid_CtxId, paneObj.EbSid_CtxId),
                        contentHtml: this.getContentHtml(tabCtrl.EbSid_CtxId, paneObj.EbSid_CtxId)
                    });
                }
            }
        }
    };

    this.getLiHtml = function (tabId, paneId) {
        let html = '';
        let $ctrl = $(`#cont_${tabId} li[ebsid='@${paneId}_ebsid@']`).remove();
        if ($ctrl.length === 0) {
            console.log(`Li not found. Selector : #cont_${tabId} li[ebsid='@${paneId}_ebsid@']`);
        }
        else {
            $ctrl.show();
            html = $ctrl.outerHTML();
        }
        return html;
    };

    this.getContentHtml = function (tabId, paneId) {
        let html = '';
        let $ctrl = $(`#cont_${tabId} div[ebsid='@${paneId}_ebsid@']`).remove();
        if ($ctrl.length === 0) {
            console.log(`Content not found. Selector : #cont_${tabId} div[ebsid='@${paneId}_ebsid@']`);
        }
        else {
            html = $ctrl.outerHTML();
        }
        return html;
    };

    DynamicTabPane = function (args) {
        //DynamicTabPane({target: 'tabcontrol1_pane1', title: 'Dynamic Tab 1', srcId: 'dyn1'});
        args = $.extend({
            target: 'tabcontrol1_pane1',
            title: 'Dynamic Tab 1',
            srcId: 'dyn1',
            params: { textbox1 : 'haha'}
        }, args);

        if (this.dynamicTabPanes.hasOwnProperty(args.srcId)) {
            console.log('dynamic tab pane already exists : ' + args.srcId);
            return;
        }
        let targetPaneO = getObjByval(this.tabPaneArr, 'name', args.target);
        if (!targetPaneO) {
            console.log('dynamic tab pane not identified : ' + args.target);
            return;
        }
        this.AppendTabPaneHtml(targetPaneO, args);
    }.bind(this);

    this.AppendTabPaneHtml = function (temp, args) {
        let $tab = $('#cont_' + temp.tab.EbSid_CtxId);
        let id = 'EbTab_' + Date.now().toString(36);
        let ahtml = temp.liHtml.replace(new RegExp(`@${temp.tabPane.EbSid_CtxId}_ebsid@`, 'g'), id);
        let bhtml = temp.contentHtml.replace(new RegExp(`@${temp.tabPane.EbSid_CtxId}_ebsid@`, 'g'), id);

        let paneCtrlNew = $.extend(true, {}, temp.tabPane);
        JsonToEbControls(paneCtrlNew);
        paneCtrlNew.EbSid = id;
        paneCtrlNew.EbSid_CtxId = id;
        paneCtrlNew.Title = args.title || args.srcId;
        paneCtrlNew.Name = paneCtrlNew.Name + '_' + args.srcId;
        let allFlatControls = getFlatControls(paneCtrlNew);
        let flatControls = getFlatCtrlObjs(paneCtrlNew);

        for (let i = 0; i < allFlatControls.length; i++) {
            let nwEbsid = allFlatControls[i].EbSid_CtxId + '_' + Date.now().toString(36);
            bhtml = bhtml.replace(new RegExp(`@${allFlatControls[i].EbSid_CtxId}_ebsid@`, 'g'), nwEbsid);
            allFlatControls[i].EbSid = nwEbsid;
            allFlatControls[i].EbSid_CtxId = nwEbsid;
        }
        $tab.find('.tab-btn-cont ul').append(ahtml);
        $tab.find('.tab-content').append(bhtml);
        
        this.dynamicTabPanes[args.srcId] = {
            ctrlObj: paneCtrlNew,
            allFlatControls: allFlatControls,
            flatControls: flatControls,
            DGs: getFlatObjOfType(paneCtrlNew, "DataGrid"),
            DGBuilderObjs: {},
            FRC: new FormRenderCommon({ FO: paneCtrlNew})
        };
        
        this.initializeControls(this.dynamicTabPanes[args.srcId]);
    };

    this.initializeControls = function (dObj) {
        this.setFormObject(dObj);
        this.updateCtrlsUI([dObj.ctrlObj, ...dObj.allFlatControls]);

        $.each(dObj.flatControls, function (k, Obj) {//initNCs  order 1
            this.options.initControls.init(Obj, {});
        }.bind(this));

        dObj.FRC.setDefaultvalsNC(dObj.flatControls);// order 2
        dObj.FRC.bindFnsToCtrls(dObj.flatControls);// order 3
        dObj.FRC.bindEbOnChange2Ctrls(dObj.flatControls);// order 4

        for (let i = 0; i < dObj.DGs.length; i++) {
            dObj.DGBuilderObjs[dObj.DGs[i].Name] = this.options.initControls.init(dObj.DGs[i], {
                Mode: this.options.mode,
                formObject: dObj.ctrlObj.formObject,
                userObject: this.options.userObject,
                FormDataExtdObj: this.options.formDataExtdObj,
                formObject_Full: this.options.formObject_Full,
                formRefId: this.options.formRefId,
                formRenderer: this.options.formRenderer
            });
            dObj.DGBuilderObjs[dObj.DGs[i].Name].MultipleTables = [];
            //dObj.DGBuilderObjs[dObj.DGs[i].Name].refreshDG([{Name: 'actype', Value: 'Dr'}],'actype');//test
        }

        dObj.FRC.fireInitOnchangeNC(dObj.flatControls);
        
    };
    
    this.updateCtrlsUI = function (allFlatControls) {
        $.each(allFlatControls, function (k, cObj) {
            $.each(cObj, function (prop, val) {
                let meta = getObjByval(AllMetas["Eb" + cObj.ObjType], "name", prop);
                if (meta) {
                    let NSS = meta.UIChangefn;
                    if (NSS) {
                        let NS1 = NSS.split(".")[0];
                        let NS2 = NSS.split(".")[1];
                        try {
                            EbOnChangeUIfns[NS1][NS2](cObj.EbSid_CtxId, cObj);
                        }
                        catch (e) {
                            console.warn(e.message);
                        }
                    }
                }
            });
        }.bind(this));
    };

    this.setFormObject = function (dObj) {
        dObj.ctrlObj.formObject = {};
        let allCtrlWithDg = dObj.flatControls.concat(dObj.DGs);
        $.each(allCtrlWithDg, function (i, ctrl) {
            dObj.ctrlObj.formObject[ctrl.Name] = ctrl;
        });
        dObj.FRC.setFormObjHelperfns();
        dObj.ctrlObj.Mode = this.options.mode;
        dObj.FRC.setUpdateDependentControlsFn();

        return dObj.ctrlObj.formObject;
    };

    this.getMultipleTables = function () {
        let mt = {};
        $.each(this.dynamicTabPanes, function (k, dObj) {
            for (let i = 0; i < dObj.DGs.length; i++) {
                if (!mt.hasOwnProperty(dObj.DGs[i].TableName))
                    mt[dObj.DGs[i].TableName] = [];
                mt[dObj.DGs[i].TableName] = mt[dObj.DGs[i].TableName].concat(dObj.DGBuilderObjs[dObj.DGs[i].Name].MultipleTables[dObj.DGs[i].TableName]);
            }
        }.bind(this));
        return mt;
    };

    this.switchToViewMode = function () {
        $.each(this.dynamicTabPanes, function (k, dObj) {
            for (let i = 0; i < dObj.flatControls.length; i++)
                dObj.flatControls[i].disable();
            for (let i = 0; i < dObj.DGs.length; i++) {
                dObj.DGBuilderObjs[dObj.DGs[i].Name].SwitchToViewMode();
            }
        }.bind(this));
    };

    this.switchToEditMode = function () {
        $.each(this.dynamicTabPanes, function (k, dObj) {
            for (let i = 0; i < dObj.flatControls.length; i++) {
                if (!dObj.flatControls[i].IsDisable)
                    dObj.flatControls[i].enable();
            }
            for (let i = 0; i < dObj.DGs.length; i++) {
                dObj.DGBuilderObjs[dObj.DGs[i].Name].SwitchToEditMode();
            }
        }.bind(this));
    };

    this.init();
};