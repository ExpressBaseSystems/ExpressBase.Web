var Eb_locationMeta = function (Config, locations, tid, types_count) {
    this.Locations = locations;
    this.data = Config;
    this.LocationObj = {};
    this.Cropies = {};
    this.Tid = tid || null;
    this.init = function () {
        $(this.data).each(function (i, item) {
            this.AddKey(item);
        }.bind(this));

        this.Addmeta(this.data);
        $('#add_key_btn').on('click', this.AddNewKey.bind(this));//new key
        $('#createloc').off("click").on('click', this._CreateLocation.bind(this));//createloc
        $('#add_location').off("click").on('click', this.AddLocation.bind(this));//createloc


        this.AddmetaHierarchial(this.data);
        $('#add_type_btn').off('click').on('click', this.AddNewLocationType.bind(this));
        $('.delete-loc-type').off('click').on('click', this.DeleteLocationType.bind(this));
        $('.edit-loc-type').off('click').on('click', this.EditLocationType.bind(this));
        $('#add_location_type').off('click').on('click', function () {
            $("#add_type_btn").text("Add");
            $("#type_id").val("");
        });

        $(".loc_tile").off("click").on("click", this.locationEdit.bind(this));
        this.imageUploader("Logo_container", "#Logo_toggle_btn", "#Logo_prev", { Name: "Logo", FileName: "" }, false);
        $(`body`).off("click").on("click", ".delete_field", this.deleteConfig.bind(this));
        $("#locspace input[name='longname']").on("change", this.setLocNameToImg.bind(this));

        this.AppendLocTree();
    };

    this.setLocNameToImg = function (e) {
        $(".disablebtn").prop("disabled", false);
        this.Cropies['Logo'].Options.ExtraData.FileName = $(e.target).val() + this.Cropies['Logo'].Options.ExtraData.Name;
        $(this.data).each(function (i, item) {
            if (item.Type === "Image") {
                this.Cropies[item.Name].Options.ExtraData.FileName = $(e.target).val() + this.Cropies[item.Name].Options.ExtraData.Name;
            }
        }.bind(this));
    };

    this.AddKey = function (item, ispush) {
        let icon = ""; let btn = `<i class="fa fa-trash delete_field"></i>`;
        item = item || { Name: "", IsRequired: false, Id: "" };
        if (item.IsRequired)
            icon = `<i class="fa fa-check fa-green"></i>`;
        if (item.Name === "Name" || item.Name === "ShortName" || item.Name === "Logo")
            btn = "";
        $('#textspace tbody').append(`<tr key="${item.Name}">
                                    <td>${item.DisplayName || item.Name}</td>
                                    <td class="text-center">${icon}</td>
                                    <td class="text-center">${item.Type}</td>
                                    <td class="text-center">${btn}</td>
                                </tr>`);
        if (ispush)
            this.data.push(item);
    };

    this.AddNewKey = function () {
        var o = new Object();
        o.DisplayName = $("input[name='KeyName']").val();
        o.Name = o.DisplayName.replace(/\s+/g, '');
        o.IsRequired = $("input[name='IsRequired']").is(":checked") ? true : false;
        o.Type = $("select[name='KeyType']").val();
        if (this.uniqCheckCF(o)) {
            $.post("../TenantUser/CreateConfig", { conf: o }, function (result) {
                if (result > 1) {
                    o.Id = result;
                    this.AddKey(o, true);
                    this.Addmeta([o]);
                    this.data.push(o);
                    $("#add_new_key").modal("toggle");
                    this.clearInputs($("#add_new_key"));
                }
            }.bind(this));
        }
        else
            alert("key exist");
    };

    this.Addmeta = function (objectColl) {
        $(objectColl).each(function (i, l_item) {
            if (l_item.Type === "Text") {
                $('#locspace').append(`
					<div class="form-group" locKey="${l_item.Name}">
                        <label class="col-sm-3">${l_item.DisplayName || l_item.Name} </label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control keyname" placeholder="Enter ${l_item.Name} " id=l_key${i} name="${l_item.Name}" value="">
                        </div>
                    </div>
					`);
            }
            else if (l_item.Type === "Image") {
                $('#locspace').append(`<div class="form-group" locKey="${l_item.Name}">
                        <label class="col-sm-3">${l_item.DisplayName || l_item.Name}</label>
                        <div class="col-sm-3">
                            <input type="hidden" value="" name="${l_item.Name}"/>
                            <button key="${l_item.Name}" id="${l_item.Name}_toggle" class="btn btn-default disablebtn" disabled>Choose file <i class="fa fa-cloud-upload" aria-hidden="true"></i></button>
                        </div>
                        <div class="col-md-6 logo_img_cont">
                            <img src="" class="img-responsive pull-right" id="${l_item.Name}_prev" />
                        </div>
                    </div>
					`);
                this.imageUploader(l_item.Name + "container", "#" + l_item.Name + "_toggle", "#" + l_item.Name + "_prev", { Name: l_item.Name, FileName: "" }, true);
            }
        }.bind(this));
    };

    this.imageUploader = function (container, toggle, prev, extra, viwportresize) {
        let resize = viwportresize ? true : false;

        this.Cropies[extra.Name] = new EbFileUpload({
            Type: "image",
            Toggle: toggle,
            TenantId: this.Tid,
            SolutionId: "",
            Container: container,
            Multiple: false,
            ServerEventUrl: 'https://se.eb-test.cloud',
            EnableTag: false,
            EnableCrop: true,
            ExtraData: extra,//extra data for location optional for other
            Context: "location",//if single and crop
            ResizeViewPort: resize //if single and crop
        });

        this.Cropies[extra.Name].uploadSuccess = function (fileid) {
            EbMessage("show", { Message: "Uploaded Successfully" });
            $(`input[name='${extra.Name}']`).val(o.objectId);
        };
        this.Cropies[extra.Name].windowClose = function () {
            //EbMessage("show", { Message: "window closed", Background: "red" });
        };
    };

    this._CreateLocation = function (e) {
        e.preventDefault();
        let m = {};
        $(this.data).each(function (i, item) {
            m[item.Name] = $(`input[name='${item.Name}']`).val();
        }.bind(this));

        if (this.validateNewLoc()) {
            $.post("../TenantUser/CreateLocation", {
                locid: $("input[name='LocId']").val(),
                lname: $("input[name='longname']").val(),
                sname: $("input[name='shortname']").val(),
                img: $(`input[name='Logo']`).val(),
                meta: JSON.stringify(m)
            }, function (result) {
                if (result >= 1) {
                    $('#create_loc_mod').modal("toggle");
                    let locid = parseInt($("input[name='LocId']").val());
                    if (locid > 0) {
                        $(`div[locid='${locid}']`).find(".head4").text($("input[name='longname']").val());
                        $(`div[locid='${locid}']`).find(".shortname").text($("input[name='shortname']").val());
                    }
                    else {
                        this.addLocationTile({
                            LocId: result,
                            LongName: $("input[name='longname']").val(),
                            ShortName: $("input[name='shortname']").val()
                        });
                    }
                    this.clearInputs($('#create_loc_mod'));
                }
            }.bind(this));
        }
        else
            alert("name exist");
    };

    this.locationEdit = function (e) {
        var locid = $(e.target).closest(".loc_tile").attr("locid");
        var obj = this.Locations[parseInt(locid)];
        $('#create_loc_mod').modal("toggle");
        $("#create_loc_mod input[name='LocId']").val(obj.LocId);
        $("#create_loc_mod input[name='longname']").val(obj.LongName);
        $("#create_loc_mod input[name='shortname']").val(obj.ShortName);
        for (var item in obj.Meta) {
            $(`#create_loc_mod input[name='${item}']`).val(obj.Meta[item]);
        }
    };

    this.uniqCheckCF = function (o) {
        let f = true;
        if (o.Name !== "Name" || o.Name !== "ShortName" || o.Name !== "Logo") {
            $(this.data).each(function (k, item) {
                if (item.Name === o.Name)
                    f = false;
            }.bind(this));
        }
        else
            f = false;
        return f;
    };

    this.validateNewLoc = function () {
        let f = true;
        if ($("input[name='longname']").val() === "" || $("input[name='shortname']").val() === "")
            f = false;
        $(this.data).each(function (k, item) {
            if (item.IsRequired) {
                if ($(`input[name='${item.Name}']`).val() === "")
                    f = false;
            }
        }.bind(this));
        return f;
    };

    this.addLocationTile = function (o) {
        $(`#locations_tab`).append(`<div class="solution_container" locid="${o.LocId}">
                            <div class="solution_container_pd hoveron_block">
                                <div class='col-md-1 pd-0'>

                                </div>
                                <div class="col-md-11">
                                    <h4 class='head4'>${o.LongName}</h4>
                                    <p class='text-justify shortname'>${o.ShortName}</p>
                                </div>
                            </div>
                        </div>`);
    };

    this.deleteConfig = function (e) {
        let name = $(e.target).closest("tr").attr("key");
        $.post("../TenantUser/DeletelocConf", { id: this.getKeyId(name) }, function (result) {
            if (result) {
                $(e.target).closest("tr").remove();
                $(`#locspace div[lockey='${name}']`).remove();
                this.DeleteKey(name);
            }
        }.bind(this));
    };

    this.getKeyId = function (keyname) {
        let r = "";
        $(this.data).each(function (l, item) {
            if (item.Name === keyname)
                r = item.Id;
        }.bind(this));
        return r;
    };

    this.DeleteKey = function (name) {
        $(this.data).each(function (i, o) {
            if (o.Name === name)
                this.data.splice(i, 1);
        }.bind(this));
    };

    this.clearInputs = function ($jq) {
        $jq.find("input").val("");
    };

    //Location Type --------------------------

    this.AddNewLocationType = function () {
        var o = new Object();
        o.Type = $("input[name='TypeName']").val();
        o.Id = $("#type_id").val();
        $.post("../TenantUser/CreateLocationType", { loctype: o }, function (result) {
            if (result.id > 0) {
                $("#location_type_modal").modal("hide");
                alert("Success");
                if (o.Id > 0) {
                    $("tr[key = '" + o.Id + "']").children("._type").text(o.Type);
                    $("tr[key = '" + o.Id + "']").children("._type").attr("key", o.Type);
                }
                else {
                    o.Id = result.id;
                    this.AddTypeInUiTable(o, true);
                }
                $("input[name='TypeName']").val("");
            }
        }.bind(this));
    };

    this.AddTypeInUiTable = function (item) {
        item = item || { Name: "", Id: 0 };
        let del_btn = `<i id="del_${item.Id}" class="fa fa-trash delete-loc-type"></i>`;
        let edit_btn = `<i id="edit_${item.Id}" class="fa fa-pencil edit-loc-type" ></i>`;

        $('#types-space tbody').append(`<tr key="${item.Id}">
                                    <td class="text-center">${++types_count}</td> 
                                    <td class="text-center">${item.Id}</td> 
                                    <td class="text-center _type" key="${item.Type}">${item.Type}</td> 
                                    <td class="text-center" id = "${item.Id}">${del_btn} ${edit_btn}</td>
                                </tr>`);
        $('.delete-loc-type').off('click').on('click', this.DeleteLocationType.bind(this));
        $('.edit-loc-type').off('click').on('click', this.EditLocationType.bind(this));
    };

    this.EditLocationType = function (e) {
        let _type = $(e.target).parent().siblings("td._type").attr("key");
        let _id = e.target.parentElement.id;
        $("#location_type_modal").modal("show");
        $("input[name='TypeName']").val(_type);
        $("#type_id").val(_id);
        $("#add_type_btn").text("Edit");
    };

    this.DeleteLocationType = function (e) {
        let name = $(e.target);
        let id = e.target.parentElement.id;
        $.post("../TenantUser/DeleteLocationType", { id: id }, function (result) {
            if (result.status) {
                $(e.target).closest("tr").remove();
            }
        }.bind(this));
    };

    //-----------------------------------------
    this.AddLocation = function (e) {
        e.preventDefault();
        let m = {};
        $(this.data).each(function (i, item) {
            m[item.Name] = $(`input[name='n${item.Name}']`).val();
        }.bind(this));

        $('#add_location_modal').modal("hide");
        $("#eb_common_loader").EbLoader("show");
        let o = new Object();
        o.LocId = $("input[name='_LocId']").val();
        o.LongName = $("input[name='_longname']").val();
        o.ShortName = $("input[name='_shortname']").val();
        o.Logo = $(`input[name='_Logo']`).val();
        o.TypeId = $("#loc_type").val();
        o.IsGroup = true;
        o.ParentId = $("#_parentId").val();
        o.Meta = m;
        $.post("../TenantUser/CreateLocationH", {
            loc: o
        }, function (result) {
                if (result >= 1) {
                    {
                        $("#eb_common_loader").EbLoader("hide");
                        $('#btnGotbl').trigger('click');
                    }
            }
        }.bind(this));
    };

    this.AppendLocTree = function () {
        $.post("../TenantUser/GetLocationTree", function (result) {
            $("#loc_tree_container").empty();
            $("#loc_tree_container").append(`<div id="content_tbl" class="wrapper-cont"><table id="tbl" class="table display table-bordered compact"></table></div>`);
            var o = new Object();
            o.tableId = "tbl";
            o.showCheckboxColumn = false;
            o.showFilterRow = false;
            o.IsPaging = false;
            o.dvObject = JSON.parse(result);
            o.Source = "locationTree";
            var data = new EbCommonDataTable(o);
        });

    };

    //---------------------------------------------------

    this.AddmetaHierarchial = function (objectColl) {
        $(objectColl).each(function (i, l_item) {
            if (l_item.Type === "Text") {
                $('#add_location_bdy').append(`
					<div class="form-group" locKey="${l_item.Name}">
                        <label class="col-sm-3">${l_item.DisplayName || l_item.Name} </label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control keyname" placeholder="Enter ${l_item.DisplayName} " id=l_key${i} name="n${l_item.Name}" value="">
                        </div>
                    </div>
					`);
            }
            else if (l_item.Type === "Image") {
                $('#add_location_bdy').append(`<div class="form-group" locKey="${l_item.Name}">
                        <label class="col-sm-3">${l_item.DisplayName || l_item.Name}</label>
                        <div class="col-sm-3">
                            <input type="hidden" value="" name="n${l_item.Name}"/>
                            <button key="${l_item.Name}" id="${l_item.Name}_toggle" class="btn btn-default disablebtn" disabled>Choose file <i class="fa fa-cloud-upload" aria-hidden="true"></i></button>
                        </div>
                        <div class="col-md-6 logo_img_cont">
                            <img src="" class="img-responsive pull-right" id="${l_item.Name}_prev" />
                        </div>
                    </div>
					`);
                this.imageUploader(l_item.Name + "container", "#" + l_item.Name + "_toggle", "#" + l_item.Name + "_prev", { Name: l_item.Name, FileName: "" }, true);
            }
        }.bind(this));
    };

    this.init();
};