var Eb_locationConfig = function (data) {
	this.counter = 0;
	this.keycounter = 0;
	this.data = data;
	this.Init = function () {
		$('#createconfig').on('click', (this.CreateConf.bind(this)));
		$('#addkey').on('click', (this.AddEmptyRow));

		$(data).each(function (i, item) {
			this.AddKey(item);
		}.bind(this));
		this.AddKey();
	};

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
		this.AddKey();
	}.bind(this);

	this.AddKey = function (item) {
		item = item || { Name: "", Isrequired: "", KeyId: "" };
		$('#textspace').append(`
				<div class="form-group keypair">
					<label class="control-label col-sm-2 index" >Key ${++this.keycounter}:</label>
					<div class="col-sm-5">
						<input type="text" class="form-control keyname" placeholder="Enter key name" name="keyname" value="${item.Name}">
					</div>
					<div class="col-sm-2">
						<label class="control-label ">Is Required: <input type="checkbox" class="isreq" id="check${++this.counter}"></label>
						<input type="hidden" value="${item.KeyId}" class="keyid" id="keyid${item.KeyId}"/>
					</div>  
							 <i class="fa fa-trash delete"  id="delete${this.counter}"></i> 
				</div>
            `);
		$(`#delete${this.counter}`).on('click', (this.DeleteKey.bind(this)));
		$(`#check${this.counter}`).prop("checked", item.Isrequired === "true");

	}.bind(this);

	this.DeleteKey = function (e) {
		$(e.target).parent().remove();
		this.UpdateIndexOnDelete();
		this.keycounter--;
	};

	this.UpdateIndexOnDelete = function () {
		$('.keypair .index').each(function (i, item) {
			item.textContent = "key " + parseInt(i + 1) + ":";
		});
	};

	this.Init();
}

var Eb_locationMeta = function (data, meta,locid) {
	this.l_counter = 0;
	this.l_data = data;
	this.l_meta = meta;
	this.l_id = locid;
	this.init = function () {
		this.Addmeta();
		$('#createloc').on('click', this._CreateLocation.bind(this));

	};

	this.Addmeta = function () {
		$(this.l_data).each(function (i, l_item) {

			$('#locspace').append(`
					<div class="form-group">
                        <label class="control-label col-sm-2">${l_item.Name} :</label>
                        <div class="col-sm-5">
                            <input type="text" class="form-control keyname" placeholder="Enter ${l_item.Name} " id=l_key${i} kname="${l_item.Name}" value="${(/*typeof (this.l_meta[l_item.Name]) === "undefined" ||*/ this.l_meta===null ) ? "" : (this.l_meta[l_item.Name])}">
                        </div>
                    </div>
					`);
		}.bind(this));
	}.bind(this);

	this._CreateLocation = function () {
		var m = new Object();
		$(data).each(function (i, item) {
			var n = item.Name;
			m[item.Name] = $(`#l_key${i}`).val();
		});
		$.post("../TenantUser/CreateLocation", { locid: this.l_id,lname: $('#lname').val(), sname: $('#sname').val(), img: "", meta: JSON.stringify(m) });
	}.bind(this);

	this.init();
};