var Eb_locationMeta = function (Config, locations, tid) {
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

        $(".solution_container").off("click").on("click", this.locationEdit.bind(this));
        this.imageUploader("Logo_container", "#Logo_toggle_btn", "#Logo_prev", { Name: "Logo",FileName:"" },false);
        $(`body`).off("click").on("click", ".delete_field", this.deleteConfig.bind(this));
        $("#locspace input[name='longname']").on("change", this.setLocNameToImg.bind(this));
    };

    this.setLocNameToImg = function (e) {
        $(".disablebtn").prop("disabled", false);
        this.Cropies['Logo'].Extra.FileName = $(e.target).val() + this.Cropies['Logo'].Extra.Name;
        $(this.data).each(function (i, item) {
            if (item.Type === "Image") {
                this.Cropies[item.Name].Extra.FileName = $(e.target).val() + this.Cropies[item.Name].Extra.Name;
            }
        }.bind(this));
    };

    this.AddKey = function (item,ispush) {
            let icon = ""; let btn = `<i class="fa fa-trash delete_field"></i>`;
            item = item || { Name: "", IsRequired: false, Id: "" };
            if (item.IsRequired)
                icon = `<i class="fa fa-check fa-green"></i>`;
            if (item.Name === "Name" || item.Name === "ShortName" || item.Name === "Logo")
                btn = "";
            $('#textspace tbody').append(`<tr key="${item.Name}">
                                    <td>${item.Name}</td>
                                    <td class="text-center">${icon}</td>
                                    <td class="text-center">${item.Type}</td>
                                    <td class="text-center">${btn}</td>
                                </tr>`);
        if (ispush)
            this.data.push(item);
    };

    this.AddNewKey = function () {
        var o = new Object();
        o.Name = $("input[name='KeyName']").val();
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
                        <label class="col-sm-3">${l_item.Name} </label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control keyname" placeholder="Enter ${l_item.Name} " id=l_key${i} name="${l_item.Name}" value="">
                        </div>
                    </div>
					`);
            }
            else if (l_item.Type === "Image") {
                $('#locspace').append(`<div class="form-group" locKey="${l_item.Name}">
                        <label class="col-sm-3">${l_item.Name}</label>
                        <div class="col-sm-3">
                            <input type="hidden" value="" name="${l_item.Name}"/>
                            <button key="${l_item.Name}" id="${l_item.Name}_toggle" class="btn btn-default disablebtn" disabled>Choose file <i class="fa fa-cloud-upload" aria-hidden="true"></i></button>
                        </div>
                        <div class="col-md-6 logo_img_cont">
                            <img src="" class="img-responsive pull-right" id="${l_item.Name}_prev" />
                        </div>
                    </div>
					`);
                this.imageUploader(l_item.Name + "container", "#" + l_item.Name + "_toggle", "#" + l_item.Name + "_prev", { Name: l_item.Name, FileName: "" },true);
            }
        }.bind(this));
    };

    this.imageUploader = function (container, toggle, prev, extra, viwportresize) {
        let resize = viwportresize ? true : false;
        this.Cropies[extra.Name] = new cropfy({
            Container: container,
            Toggle: toggle,
            isUpload: true,
            enableSE: true,
            Browse: true,
            Result: 'base64',
            Type: 'location',
            Tid: this.Tid,
            Preview: prev,
            Extra: extra,
            ResizeViewPort: resize,
        });
        this.Cropies[extra.Name].getObjId = function (o) {
            $(`input[name='${extra.Name}']`).val(o.objectId);
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
        var locid = $(e.target).closest(".solution_container").attr("locid");
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
                    f=false;
            }
        }.bind(this));
        return f;
    }

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
        $(this.data).each(function (i,o) {
            if (o.Name === name)
                this.data.splice(i, 1);
        }.bind(this))
    };

    this.clearInputs = function ($jq) {
        $jq.find("input").val("");
    };

    this.init();
};