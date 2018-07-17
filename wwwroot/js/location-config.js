var Eb_locationMeta = function (Config, locations) {
    this.Locations = locations;
    this.data = Config;
    this.counter = 0;
    this.trCount = 2;
    this.Configaration = {};
    this.init = function () {
        this.Addmeta();
        $('#locspace').off("submit").on('submit', this._CreateLocation.bind(this));

        $(this.data).each(function (i, item) {
            this.AddKey(item);
        }.bind(this));
        $(".solution_container").off("click").on("click", this.locationEdit.bind(this));
        $('#createconfig').on('click', this.CreateConf.bind(this));
        $('#add_key_btn').on('click', this.AddEmptyRow.bind(this));
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

    this.Addmeta = function () {
        $(this.data).each(function (i, l_item) {
            $('#locspace').append(`
					<div class="form-group">
                        <label class="control-label col-sm-3">${l_item.Name} </label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control keyname" placeholder="Enter ${l_item.Name} " id=l_key${i} name="${l_item.Name}" value="">
                        </div>
                    </div>
					`);
        }.bind(this));
    }.bind(this);

    this._CreateLocation = function (e) {
        e.preventDefault();
        let m = {};
        $(this.data).each(function (i, item) {
            m[item.Name] = $(`input[name='${item.Name}']`).val();
        });
        $.post("../TenantUser/CreateLocation", {
            locid: $("input[name='LocId']").val(),
            lname: $("input[name='longname']").val(),
            sname: $("input[name='shortname']").val(),
            img: " ",
            meta: JSON.stringify(m)
        }, function (result) {
            if (result)
                $('#create_loc_mod').modal("toggle");
        }.bind(this));
    }.bind(this);

    this.CreateConf = function () {
        var values = [];
        var items = $('.keypair');
        items.each(function (i, item) {
            var o = new Object();
            o.name = $(item).children().find(".keyname").val();
            o.isrequired = ($(item).children().find(".isreq").is(":checked")) ? "T" : "F";
            o.KeyId = $(item).children().find(".keyid").val();
            values.push(o);
        });
        $.post("../TenantUser/CreateConfig", { keys: values });
    };

    this.AddEmptyRow = function () {
        var o = new Object();
        o.Name = $("input[name='KeyName']").val();
        o.Isrequired = $("input[name='IsRequired']").is(":checked");
        o.Type = $("select[name='KeyType']").val();
        this.AddKey(o);
    }.bind(this);

    this.AddKey = function (item) {
        let icon = "";
        let count = this.trCount++;
        item = item || { Name: "", Isrequired: false, KeyId: "" };
        if (eval(item.Isrequired))
            icon = `<i class="fa fa-check fa-green"></i>`;
        $('#textspace tbody').append(`<tr count="${count}">
                                    <td>${item.Name}</td>
                                    <td class="text-center">${icon}</td>
                                    <td class="text-center">${item.Type}</td>
                                    <td class="text-center"><i class="fa fa-trash delete_field"></i></td>
                                </tr>`);
        this.Configaration[count] = item;
        $(`.delete_field`).on('click', this.DeleteKey.bind(this));
        $(`#check${this.counter}`).prop("checked", item.Isrequired === "true");

    }.bind(this);

    this.DeleteKey = function (e) {
        var key = $(e.target).closest("tr").attr("count");
        delete this.Configaration[key];
    };

    this.init();
};