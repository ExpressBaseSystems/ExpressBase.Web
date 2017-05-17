var EbSelect = function (name, dataSourceId, dropdownHeight, valueMember, displayMember, maxLimit, minLimit, multiSelect, required, defaultSearchFor, DMembers, vueDMcode, servicestack_url) {
    this.clmAdjst  = 0;
    this.VMindex =null;
    this.DMindex = null;
    this.DMindexes = [];
    this.DtFlag = false;
    this.cellTr = null;
    this.Msearch_colName = '';

    this.name = name;
    this.dataSourceId = dataSourceId;
    this.dropdownHeight = dropdownHeight;
    this.valueMember = valueMember;
    this.displayMember = displayMember;
    this.maxLimit = maxLimit;
    this.minLimit = minLimit;
    this.multiSelect = multiSelect;
    this.required = required;
    this.defaultSearchFor = defaultSearchFor;
    this.DMembers = DMembers;
    this.vueDMcode = vueDMcode;
    this.servicestack_url = servicestack_url;
}