var locationmeta = function (data) {
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

var location = function (data) {

	this.data = data;
	this.init = function () {
		this.Addmeta();
	};

	this.Addmeta = function(){
		$('#locspace').append(`
					<div class="form-group">
                        <label class="control-label col-sm-2">Short Name :</label>
                        <div class="col-sm-5">
                            <input type="text" class="form-control keyname" placeholder="" name="shortname" value="">
                        </div>
                    </div>
					`);
	};
	this.Init();
};