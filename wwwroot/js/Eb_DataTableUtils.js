function tagFocused(e, pg) {
    var $me = $(e.target);
    $me.focus();
    new Eb_PropertyGrid(pg, { "id": 0, "Name": "Roby" }, [{ "name": "id", "group": "Behavior", "editor": 2, "options": null }, { "name": "Name", "group": "Behavior", "editor": 2, "options": null }]);
}