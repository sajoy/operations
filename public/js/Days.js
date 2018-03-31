class Day {
    constructor (data) {
        Object.keys(data).map(propName => this[propName] = data[propName]);
        this.render();
    }

    render () {
        const calendar = document.querySelector('#calendar');
        const template = document.querySelector('#day-template');

        

    }
}

class Days {
    load (data) {
        const days = Object.keys(data);
        this.list = data[days].map(day => new Day(day));
    }
}