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
        let parentArr;
        console.log("parentId" + parentId);
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
            parentArr = this;
        else
            parentArr = this.GetByName(parentId).Controls;

        let idx = parentArr.$values.indexOf(ele);
        if (idx === -1) {
            console.error("element not found in collection");
            return;
        }

        let obj = parentArr.PopByIndex(idx);
        obj.dragFromAt = function () {
            return { parentArr: parentArr, index: idx };
        }.bind(this);
        return obj;
    };

    this.insertInto = function (_name) {
        let parentId = this.getParentId(_name);
        let ele = this.GetByName(_name);
        let parentArr;
        console.log("parentId" + parentId);
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
            parentArr = this;
        else
            parentArr = this.GetByName(parentId).Controls;

        let idx = parentArr.$values.indexOf(ele);
        if (idx === -1) {
            console.error("element not found in collection");
            return;
        }

        let obj = parentArr.PopByIndex(idx);
        obj.dragFromAt = function () {
            return { parentArr: parentArr, index: idx };
        }.bind(this);
        return obj;
    };

    this.Append = function (newObject) {
        try {
            let parentId = this.getParentId(newObject.EbSid);
            let parent;
            if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
                parent = this;
            else {//parentId is root form id
                parent = this.GetByName(parentId).Controls;
            }

            parent.$values.push(newObject);
        }
        catch (e) {
            debugger;
        }
    };

    this.getParent = function (obj) {
        let parentId = this.getParentId(obj.EbSid);
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
            return commonObj.Current_obj;
        return this.GetByName(parentId);
    };

    this.InsertAt = function (index, newObject) {
        let parentId = this.getParentId(newObject.EbSid);
        let parentArr;
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
            parentArr = this;
        else
            parentArr = this.GetByName(parentId).Controls;

        //if (newObject.dragFromAt) {
        //    let dragFromAt = newObject.dragFromAt();
        //    if (dragFromAt.parentArr === parentArr && dragFromAt.index < index)
        //        index--;// to consider on drag control pop
        //}

        parentArr.$values.splice(index, 0, newObject);
        console.log("append");
        console.log(parentArr.$values);
        return parentArr.$values.length;
    };

    this.InsertBefore = function (beforeObj, newObject) {
        let parentId = this.getParentId(beforeObj.EbSid);
        let parentArr;
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
            parentArr = this;
        else
            parentArr = this.GetByName(parentId).Controls;
        parentArr.$values.splice(parentArr.$values.indexOf(beforeObj), 0, newObject);
    };

    this.InsertAfter = function (relativeObj, newObject) {
        let parentId = this.getParentId(relativeObj.EbSid);
        let parentArr;
        if ($(`[ebsid ="${parentId}"]`).attr("eb-form") === "true")
            parentArr = this;
        else
            parentArr = this.GetByName(parentId).Controls;
        parentArr.$values.splice((parentArr.$values.indexOf(relativeObj) + 1), 0, newObject);
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
