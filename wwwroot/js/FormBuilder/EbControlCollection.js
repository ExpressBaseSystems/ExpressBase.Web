const EbControlCollection = function (obj) {
    this.$type = obj.$type || "System.Collections.Generic.List`1[[ExpressBase.Common.Objects.EbControl, ExpressBase.Common]], System.Private.CoreLib";
    this.$values = obj.$values || [];

    this.ToArray = function () {
        return this.$values;
    };

    this.getParentId = function (ebsid) {
        return $(`#cont_${ebsid}.Eb-ctrlContainer`).parents('.ebcont-ctrl:first').attr("ebsid");
    };

    this.PopByName = function (_name) {
        let parentId = this.getParentId(_name);
        let ele = this.GetByName(_name);
        console.log("parentId" + parentId);
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form")) {
            let idx = this.$values.indexOf(ele);
            if (idx === -1) {
                console.error("element not found in collection");
                return;
            }
            return this.$values.splice(idx, 1)[0];
        }

        let parent = this.GetByName(parentId);
        return parent.Controls.PopByIndex(parent.Controls.$values.indexOf(ele));
    };

    this.Append = function (newObject) {
        let parentId = this.getParentId(newObject.EbSid);
        if (!$(`[ebsid ="${parentId}"]`).attr("eb-form")) {
            let parent = this.GetByName(parentId);
            parent.Controls.$values.push(newObject);
        }
        else //parentId is root form id
            this.$values.push(newObject);
    };

    this.PopByindex = function () {

    };

    this.InsertAt = function (index, newObject) {
        let parentId = this.getParentId(newObject.EbSid);
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form")) {
            this.$values.splice(index, 0, newObject);
            return this.$values.length;
        }
        let parent = this.GetByName(parentId);
        parent.Controls.$values.splice(index, 0, newObject);
        return parent.Controls.$values.length;
    };

    this.InsertBefore = function (beforeObj, newObject) {
        this.$values.splice(this.$values.indexOf(beforeObj), 0, newObject);
    };

    this.GetByIndex = function (_index) {
        return this.$values[_index];
    };

    this.PopByIndex = function (idx) {
        return this.$values.splice(idx, 1)[0];
    };

    this.Pop = function (_name) {
        this.$values.pop();
    };

    this.GetByName = function (_name) {
        let retObject = new Object();
        this.GetByNameInner(_name, this.$values, retObject);
        return (retObject.Value) ? retObject.Value : null;
    };

    this.GetByNameInner = function (_name, _collection, retObject) {
        for (let i = 0; i < _collection.length; i++) {
            if (_collection[i].EbSid === _name) {
                retObject.Value = _collection[i];
                break;
            }
            else {
                if (_collection[i].IsContainer && _collection[i].Controls.ToArray().length > 0) {
                    this.GetByNameInner(_name, _collection[i].Controls.$values, retObject);
                }
            }
        }
    };

    this.DelByName = function (_name) {
        let retObject = new Object();
        this.DelByNameInner(_name, this.$values, retObject);
        return retObject.Value;
    };

    this.DelByNameInner = function (_name, _collection, retObject) {
        for (let i = 0; i < _collection.length; i++) {
            if (_collection[i].EbSid === _name) {
                _collection.splice(i, 1);
                break;
            }
            else {
                if (_collection[i].IsContainer && _collection[i].Controls.ToArray().length > 0)
                    this.DelByNameInner(_name, _collection[i].Controls.$values, retObject);
            }
        }
    };
};
