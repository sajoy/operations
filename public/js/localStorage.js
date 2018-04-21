class LocalData {
    get (key) {
        if (!localStorage[key]) throw Error ('Nothing there');
        return JSON.parse(localStorage[key]);
    }

    set (key, value) {
        localStorage[key] = JSON.stringify(value);
    }
}