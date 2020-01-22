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

    //calling from webform renderer
    this.initDynamicTabPane = function (args) {
        //DynamicTabPane({target: 'pane1', title: 'Dynamic Tab 1', params: {}, srcDgCtrl: {}, srcTabCtrl: {} });
        if (!args.srcDgCtrl || !args.srcTabCtrl) {
            console.log('Dynamic tab not supported. Initiator DG or Tab control missing.');
            return;
        }

        args.target = args.srcTabCtrl.Name + '_' + args.target;
        let srcRowId = args.srcDgCtrl.currentRow[args.srcDgCtrl.Controls.$values[0].Name].__rowid;
        let srcId = srcRowId + '_' + args.srcDgCtrl.TableName;
        let params = {};
        $.each(args.srcDgCtrl.currentRow, function (k, obj) {
            params[k] = obj.DataVals.Value;
        });
        if (args.params)
            args.params = $.extend(params, args.params);

        args = $.extend({
            target: 'pane1',
            title: 'Dynamic Tab 1',
            srcId: srcId,
            srcRowId: srcRowId,
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
        paneCtrlNew.Title = args.title || paneCtrlNew.Name;
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
            tabCtrl: temp.tab,
            srcRowId: args.srcRowId,
            allFlatControls: allFlatControls,
            flatControls: flatControls,
            DGs: getFlatObjOfType(paneCtrlNew, "DataGrid"),
            DGBuilderObjs: {},
            FRC: new FormRenderCommon({ FO: paneCtrlNew})
        };
        
        this.initializeControls(this.dynamicTabPanes[args.srcId]);

        //binding event + on edit data mngnt
        $tab.find(`a[href="#${id}"]`).attr('data-srcid', args.srcId);
        $tab.find(`a[href="#${id}"]`).on('shown.bs.tab', this.onTabSwitched.bind(this));
    };

    this.onTabSwitched = function (e) {
        let srcId = $(e.target).attr('data-srcid');
        if (!this.dynamicTabPanes.hasOwnProperty(srcId)) {
            console.log('Dynamic tab pane not found. Source Id : ' + srcId);
            return;
        }
        let dObj = this.dynamicTabPanes[srcId];

        if (dObj.srcRowId > 0 && !dObj._DataLoaded) {
            let targets = [];
            for (let i = 0; i < dObj.DGs.length; i++) {
                targets.push(dObj.DGs[i].TableName);
            }

            this.options.formRenderer.showLoader();
            $.ajax({
                type: "POST",
                url: "/WebForm/GetDynamicGridData",
                data: {
                    _refid: this.options.formRenderer.formRefId,
                    _rowid: this.options.formRenderer.rowId,
                    _srcid: srcId,
                    _target: targets
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                    this.options.formRenderer.hideLoader();
                    dObj._DataLoaded = false;
                }.bind(this),
                success: function (result) {
                    this.options.formRenderer.hideLoader();
                    dObj._DataLoaded = true;
                    this.setEditModeCtrls(dObj, result);
                    //console.log(result);
                }.bind(this)
            });


        }
    };

    this.setEditModeCtrls = function (dObj, jsonData) {
        let dataModel = JSON.parse(jsonData);
        if (dataModel.Status !== 200)
            console.log('Data not loaded : ' + dataModel.Message);
        for (let DGName in dObj.DGBuilderObjs) {
            let DGB = dObj.DGBuilderObjs[DGName];
            //if (!this.DataMODEL.hasOwnProperty(DGB.ctrl.TableName)) {
            //    this.DataMODEL[DGB.ctrl.TableName] = [];
            //    DGB.DataMODEL = this.DataMODEL[DGB.ctrl.TableName];
            //    continue;
            //}
            let DataMODEL = dataModel.FormData.MultipleTables[DGB.ctrl.TableName];
            DGB.setEditModeRows(DataMODEL);
        }
    };

    this.initializeControls = function (dObj) {
        this.setFormObject(dObj);
        this.updateCtrlsUI([dObj.ctrlObj, ...dObj.allFlatControls]);
        
        attachModalCellRef_form(dObj.ctrlObj, this.options.formRenderer.EditModeFormData);

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
                formRenderer: this.options.formRenderer,
                isDynamic: true
            });
            //dObj.DGBuilderObjs[dObj.DGs[i].Name].MultipleTables = [];

            //dObj.DGBuilderObjs[dObj.DGs[i].Name].refreshDG([{Name: 'actype', Value: 'Dr'}],'actype');//test
        }

        dObj.FRC.fireInitOnchangeNC(dObj.flatControls);

        for (let i = 0; i < dObj.DGs.length; i++) {
            let _DG = new ControlOps[dObj.DGs[i].ObjType](dObj.DGs[i]);
            if (_DG.OnChangeFn.Code === null)
                _DG.OnChangeFn.Code = "";
            dObj.FRC.bindOnChange(_DG);
        }
        
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

    this.getDataModels = function () {
        this.updateDataModel();
        let mt = {};
        $.each(this.dynamicTabPanes, function (k, dObj) {
            for (let i = 0; i < dObj.DGs.length; i++) {
                if (!mt.hasOwnProperty(dObj.DGs[i].TableName))
                    mt[dObj.DGs[i].TableName] = [];
                mt[dObj.DGs[i].TableName] = mt[dObj.DGs[i].TableName].concat(dObj.DGBuilderObjs[dObj.DGs[i].Name].DataMODEL);
            }
        }.bind(this));
        return mt;
    };

    this.switchToViewMode = function () {
        //$.each(this.dynamicTabPanes, function (k, dObj) {
        //    for (let i = 0; i < dObj.flatControls.length; i++)
        //        dObj.flatControls[i].disable();
        //    for (let i = 0; i < dObj.DGs.length; i++) {
        //        dObj.DGBuilderObjs[dObj.DGs[i].Name].SwitchToViewMode();
        //        dObj.DGBuilderObjs[dObj.DGs[i].Name].clearDG();
        //        dObj._DataLoaded = true;
        //    }
        //}.bind(this));
        this.disposeDynamicTab();
    };

    this.switchToEditMode = function () {
        $.each(this.dynamicTabPanes, function (k, dObj) {
            for (let i = 0; i < dObj.flatControls.length; i++) {
                if (!dObj.flatControls[i].IsDisable)
                    dObj.flatControls[i].enable();
            }
            for (let i = 0; i < dObj.DGs.length; i++) {
                dObj.DGBuilderObjs[dObj.DGs[i].Name].SwitchToEditMode();
                dObj.DGBuilderObjs[dObj.DGs[i].Name].clearDG();
                dObj._DataLoaded = true;
            }
        }.bind(this));
    };

    //update data model before save
    this.updateDataModel = function () {
        let Model = this.options.formRenderer.DataMODEL;
        $.each(this.dynamicTabPanes, function (k, dObj) {
            for (let i = 0; i < dObj.DGs.length; i++) {
                let DgModel = dObj.DGBuilderObjs[dObj.DGs[i].Name].DataMODEL;
                for (let j = 0; j < DgModel.length; j++) {
                    DgModel[j].pId = k;
                }
                Model[dObj.DGs[i].TableName] = Model[dObj.DGs[i].TableName].concat(DgModel);
            }
        }.bind(this));
    };

    this.disposeDynamicTab = function () {        
        //this.lastActiveTabPane = $tab.find(`li.active a`).attr('data-srcid');//note - must look for all
        for (let srcId in this.dynamicTabPanes) {
            let $tab = $('#cont_' + this.dynamicTabPanes[srcId].tabCtrl.EbSid_CtxId);
            let id = this.dynamicTabPanes[srcId].ctrlObj.EbSid_CtxId;
            $tab.find(`.tab-btn-cont ul li[ebsid="${id}"]`).remove();
            $tab.find(`.tab-content #${id}`).remove();
            $($tab.find(`a[data-toggle='tab']`)[0]).tab('show');
        }
        this.dynamicTabPanes = {};
    };

    this.init();
};