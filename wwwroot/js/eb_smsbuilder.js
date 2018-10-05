var SmsWrapper = function (refid, ver_num, type, dsobj, cur_status, tabNum) {
	this.Refid = refid;
	this.EbObject = dsobj;
	this.smspropG = new Eb_PropertyGrid({
		id: "PropertyG",
		wc: "uc",
		cid: this.cid,
		$extCont: $(".smspg")
	});

	this.ObjId = 0;
	this.ObjCollect = {};
	this.PosLeft;
	this.PosRight;

	this.Init = function () {

		if (this.EbObject === null) {
			this.EbObject = new EbObjects["EbSmsTemplate"]("Sms0");
			this.smspropG.setObject(this.EbObject, AllMetas["EbSmsTemplate"]);

		}
		else {
			this.smspropG.setObject(this.EbObject, AllMetas["EbSmsTemplate"]);
			$.each(this.EbObject.DsColumnsCollection.$values, function (i, value) {
				var id = "DataField" + this.ObjId++;
				var obj = new EbObjects["DsColumns"](id);
				obj.Title = value.Title;
				var oldhtml = $('#sms_body' + tabNum).val();
				var newhtml = oldhtml.replace(value.Title, obj.$Control.outerHTML());
				$('#sms_body' + tabNum).val(newhtml);
				this.RefreshControl(obj);
				this.ObjCollect[id] = obj;
				$('#' + id).attr('contenteditable', 'false');
				this.smspropG.addToDD(value);
			}.bind(this));
			$(".ebdscols").attr("tabindex", "1").off("focus").on("focus", this.elementOnFocus);

		}
		this.Name = this.EbObject.Name;
		this.DrawDsTree();
		$('#sms_body' + tabNum).droppable({ accept: ".coloums", drop: this.onDropFn.bind(this) });
		$("[contenteditable=true]").attr("tabindex", "1").off("focus").on("focus", this.elementOnFocus);
		$('#sms_body' + tabNum).off("keyup").on("keyup", this.delete_dscols.bind(this));
	};

	this.smspropG.DD_onChange = function (event) {
		var SelItem = $(event.target).find("option:selected").attr("data-name");
		if (SelItem === "Sms0")
			$("[contenteditable=true]").focus();
	};

	this.onDropFn = function (event, ui) {
		this.dropLoc = $(event.target);
		this.col = $(ui.draggable);
		var id = "DataField" + this.ObjId++;
		var obj = new EbObjects["DsColumns"](id);
		//this.pasteHtmlAtCaret(obj.$Control.outerHTML());
		$('#sms_body' + tabNum).append(obj.$Control.outerHTML());
		var tbl = $('#' + this.col.text()).data('mytbl');
		obj.Title = "{{" + tbl + this.col.text() + "}}";
		this.ObjCollect[id] = obj;
		this.RefreshControl(obj);
		if (this.EbObject.DsColumnsCollection.length>0)
			this.EbObject.DsColumnsCollection.$values.push(obj);
		else
			this.EbObject.DsColumnsCollection.push(obj);
		//this.EbObject.DsColumnsCollection.$values.push(obj);
		//this.placeCaretAtEnd(document.getElementById(id));
		//$('#' + id).attr('contenteditable', 'false');
	};

	this.delete_dscols = function (event) {
		var key = event.keyCode || event.charCode;
		var spanAfter = [];
		if (key === 8 || key === 46) {
			spanAfter = $('#sms_body' + tabNum).children('span');
			this.EbObject.DsColumnsCollection = $.grep(this.EbObject.DsColumnsCollection, function (obj, i) {
				return spanAfter[0].id !== obj.Name;
			});
			this.smspropG.setObject(this.EbObject, AllMetas["DsColumns"]);
		}
	};
	this.placeCaretAtEnd = function (el) {
		el.focus();
		if (typeof window.getSelection !== "undefined"
			&& typeof document.createRange !== "undefined") {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.body.createTextRange !== "undefined") {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(false);
			textRange.select();
		}
	};
	this.RefreshControl = function (obj) {
		var NewHtml = obj.$Control.outerHTML();
		var metas = AllMetas["DsColumns"];
		$.each(metas, function (i, meta) {
			var name = meta.name;
			if (meta.IsUIproperty) {
				NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
			}
		});
		$("#" + obj.EbSid).replaceWith(NewHtml);

		$("#" + obj.EbSid).attr("tabindex", "1").off("focus").on("focus", this.elementOnFocus);

	};//render after pgchange
	this.elementOnFocus = function (event) {
		event.stopPropagation();
		console.log("In element focus");
		var curControl = $(event.target);
		var id = curControl.attr("id");
		var curObject = this.ObjCollect[id];
		if (event.target.className === "panel form-control z-depth-1 ui-droppable")
			this.smspropG.setObject(this.EbObject, AllMetas["EbSmsTemplate"]);
		else
			this.smspropG.setObject(curObject, AllMetas["DsColumns"]);

	}.bind(this);
	this.smspropG.PropertyChanged = function (obj, Pname) {
		if (Pname === 'DataSourceRefId') {
			this.getDataSourceColoumns();
		}
	}.bind(this);


	this.getDataSourceColoumns = function () {
		$('#data-table-list').empty();
		$("#get-col-loader").show();
		$.ajax({
			url: "../RB/GetColumns",
			type: "POST",
			cache: false,
			data: { refID: this.EbObject.DataSourceRefId },
			success: this.AjaxSuccess.bind(this)
		});
	};

	this.AjaxSuccess = function (result) {
		$("#get-col-loader").hide();
		this.DrawColumnTree(result);
		$('.nav-tabs a[href="#data"]').tab('show');
	};

	this.DrawColumnTree = function (result) {
		var ctype;
		$.each(result.columns, function (i, columnCollection) {
			$('#data-table-list').append(" <li><a>Datatable" + ++i + "</a><ul id='t" + i + "'></ul></li>");
			$.each(columnCollection, function (j, obj) {
				$("#data-table-list ul[id='t" + i + "'").append("<li id = " + obj.columnName + " data-mytbl = 'Table" + i + ".'  class='coloums draggable'>" + obj.columnName + "</li>");
			});
		});
		$('#data-table-list').killTree();
		$('#data-table-list').treed();
		$('#sms_body' + tabNum).focus();
		$('.coloums').draggable({
			cancel: "a.ui-icon",
			revert: "invalid",
			helper: "clone",
			cursor: "move",
			appendTo: '#sms_body' + tabNum,
			stack: ".draggable",
			drag: function (event, ui) {
				$(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "200px" });
				$(ui.helper).children(".shape-text").remove();
				$(ui.helper).children().find('i').css({ "font-size": "50px", "background-color": "transparent" });
			}
		});
	};
	this.pasteHtmlAtCaret = function (html) {

		//var sel, range;
		//if (window.getSelection) {
		//	sel = window.getSelection();
		//	if (sel.getRangeAt && sel.rangeCount) {
		//		range = sel.getRangeAt(0);
		//		range.deleteContents();
		//		var el = document.createElement("div");
		//		el.innerHTML = html;
		//		var frag = document.createDocumentFragment(),
		//			node, lastNode;
		//		while ((node = el.firstChild)) {
		//			lastNode = frag.appendChild(node);
		//		}
		//		range.insertNode(frag);
		//		if (lastNode) {
		//			range = range.cloneRange();
		//			range.setStartAfter(lastNode);
		//			range.collapse(true);
		//			sel.removeAllRanges();
		//			sel.addRange(range);
		//		}
		//	}
		//} else if (document.selection && document.selection.type !== "Control") {
		//	document.selection.createRange().pasteHTML(html);
		//}
	};
	this.DrawDsTree = function () {
		$.fn.extend({
			treed: function (o) {
				var openedClass = 'fa-minus-square-o';
				var closedClass = 'fa-plus-square-o';
				var ic = o || 'fa-plus-square-o';

				if (typeof o !== 'undefined') {
					if (typeof o.openedClass !== 'undefined') {
						//openedClass = o.openedClass;
					}
					if (typeof o.closedClass !== 'undefined') {
						//closedClass = o.closedClass;
					}
				}
				var tree = $(this);
				tree.addClass("tree");
				tree.find('li').has("ul").each(function () {
					var branch = $(this);
					branch.prepend("<i class='indicator fa " + ic + "'></i>");
					branch.addClass('branch');
					branch.off("click").on('click', function (e) {
						if (this === e.target) {
							var icon = $(this).children('i:first');
							icon.toggleClass(openedClass + " " + closedClass);
							$(this).children().children().toggle();
						}
					});
					branch.children().children().toggle();
				});
				tree.find('.branch .indicator').each(function () {
					$(this).off("click").on('click', function (e) {
						$(this).closest('li').click();
					});
				});
				tree.find('.branch>a').each(function () {
					$(this).off("click").on('click', function (e) {
						$(this).closest('li').click();
						e.preventDefault();
					});
				});
				tree.find('.branch>button').each(function () {
					$(this).off("off").on('click', function (e) {
						$(this).closest('li').click();
						e.preventDefault();
					});
				});
			}
		});
		$.fn.extend({
			killTree: function (o) {
				var tree = $(this);
				tree.removeClass("tree");
				tree.find('li').has("ul").each(function () {
					var branch = $(this);
					branch.children().children().show();
					branch.children("i").remove();
					branch.removeClass('branch');
					branch.off("click");
				});
			}
		});
	};
	this.BeforeSave = function () {

		//$('.note-editable').children().find('span').each(function (i, obj) {
		//	var text = $(obj).text();
		//	$(obj).replaceWith(text);
		//});

		//$('.note-editable').children('span').each(function (i, obj) {
		//	var text = $(obj).text();
		//	$(obj).replaceWith(text);
		//});


		//console.log($('.note-editable').html());
		//alert($('.note-editable').html());

		this.EbObject.To = $("#sms_to" + tabNum).val();
		this.EbObject.Body = window.btoa($('#sms_body' + tabNum).text().trim());
		commonO.Current_obj = this.EbObject;
	};

	this.CreateRelationString = function () { };
	this.Init();
};