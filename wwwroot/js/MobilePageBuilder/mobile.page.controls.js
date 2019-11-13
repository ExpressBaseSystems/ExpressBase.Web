function MobileControls(root) {
    this.Root = root;

    this.InitVis = function (o) {
        let id = "Tab" + this.Root.Conf.TabNum + "_TableLayout" + CtrlCounters["MobileTableLayoutCounter"]++;
        var obj = new EbObjects.EbMobileTableLayout(id);
        this.Root.Procs[id] = obj;
        $(`#${o.EbSid} .eb_mob_layout_inner`).append(obj.$Control.outerHTML());
        $(`#${obj.EbSid} .eb_mob_tablelayout_inner`).append(this.getTableHtml(obj));
    }

    this.getListHtml = function () {
        let html = [];
        html.push(`<div class='eb_mob_listwraper'>
                        <div class='eb_mob_listinner'>
                            
                        </div>
                </div >`);
        return html.join("");
    }

    this.InitTableLayout = function (o) {
        $(`#${o.EbSid} .eb_mob_tablelayout_inner`).append(this.getTableHtml(o));
    };

    this.getTableHtml = function (o) {
        let html = [];
        html.push(`<table class='eb_tablelayout_table'>`);
        for (let i = 0; i < o.RowCount; i++) {
            html.push(`<tr class='eb_tablelayout_tr'>`);
            for (let k = 0; k < o.ColumCount; k++) {
                html.push('<td class="eb_tablelayout_td"></td>');
            }
            html.push(`</tr>`);
        }
        html.push(`</table>`);
        return html.join("");
    }

    this.drawDsColTree = function (colList) {
        var type = "EbMobileDataColumn", icon = "";
        $.each(colList, function (i, columnCollection) {
            $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[class='ds_cols']`).append(" <li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                if (obj.type === 16) {
                    icon = "fa-font";
                }
                else if (obj.type === 7 || obj.type === 8 || obj.type === 10 || obj.type === 11 || obj.type === 12 || obj.type === 21) {
                    icon = "fa-sort-numeric-asc";
                }
                else if (obj.type === 3) {
                    icon ="";
                }
                else if (obj.type === 5 || obj.type === 6 || obj.type === 17 || obj.type === 26) {
                    icon = "fa-calendar";
                }
                $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[id='t${i}']`).append(`<li class='styl'><span eb-type='${type}' DbType='${obj.type}' class='coloums draggable textval'><i class='fa ${icon}'></i> ${obj.columnName}</span></li>`);
            }.bind(this));
        }.bind(this));
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).killTree();
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).treed();
    }
};