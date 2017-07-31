var EbControlCollection = function () {
    this.InnerCollection = [];

    this.ToArray = function () {
        return this.InnerCollection;
    };

    this.PopByName = function (_name) {
        var parentId = $("#" + _name).parent().attr("id");
        var ele = this.GetByName(_name);

        if (parentId === "form-buider-form")
            return this.InnerCollection.pop(this.InnerCollection.indexOf(ele));

        var parent = this.GetByName(parentId);
        return parent.Controls.InnerCollection.pop(parent.Controls.InnerCollection.indexOf(ele));
    };

    this.Append = function (newObject) {
        var parentId = $("#" + newObject.Name).parent().attr("id");
        if (parentId === undefined)
            this.InnerCollection.push(newObject);
        else if (parentId !== "form-buider-form") {
            var parent = this.GetByName(parentId);
            parent.Controls.InnerCollection.push(newObject);
        }
        else //parentId === "form-buider-form"
            this.InnerCollection.push(newObject);
    };

    this.PopByindex = function () {

    };

    this.InsertAt = function (index, newObject) {
        var parentId = $("#" + newObject.Name).parent().attr("id");
        if (parentId === "form-buider-form") {
            this.InnerCollection.splice(index, 0, newObject);
            return this.InnerCollection.length;
        }
        var parent = this.GetByName(parentId);
        parent.Controls.InnerCollection.splice(index, 0, newObject);
        return parent.Controls.InnerCollection.length;
    };

    this.InsertBefore = function (beforeObj, newObject) {
        this.InnerCollection.splice(this.InnerCollection.indexOf(beforeObj), 0, newObject);
    };

    this.GetByIndex = function (_index) {
        return this.InnerCollection[_index];
    };

    this.Pop = function (_name) {
        this.InnerCollection.pop();
    };

    this.GetByName = function (_name) {
        var retObject = new Object();
        this.GetByNameInner(_name, this.InnerCollection, retObject);
        return (retObject.Value) ? retObject.Value : null;
    };


    this.GetByNameInner = function (_name, _collection, retObject) {
        for (var i = 0; i < _collection.length; i++) {
            if (_collection[i].Name === _name) {
                retObject.Value = _collection[i];
                break;
            }
            else {
                if (_collection[i].IsContainer && _collection[i].Controls.ToArray().length > 0) {
                    this.GetByNameInner(_name, _collection[i].Controls.InnerCollection, retObject);
                }
            }
        }
    };

    this.DelByName = function (_name) {
        var retObject = new Object();
        this.DelByNameInner(_name, this.InnerCollection, retObject);
        return retObject.Value;
    };

    this.DelByNameInner = function (_name, _collection, retObject) {
        for (var i = 0; i < _collection.length; i++) {
            if (_collection[i].Name === _name) {
                _collection.splice(i, 1);
                break;
            }
            else {
                if (_collection[i].IsContainer && _collection[i].Controls.ToArray().length > 0)
                    this.DelByNameInner(_name, _collection[i].Controls.InnerCollection, retObject);
            }
        }
    };
};