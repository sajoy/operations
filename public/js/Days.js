class Day {
    constructor (data) {
        Object.keys(data).map(propName => this[propName] = data[propName]);

        this.setDisplayInfo();
        this.render();
    }

    render () {
        const calendar = document.querySelector('#calendar');
        const template = document.querySelector('#day-template');       
        const day = document.importNode(template.content, true);

        day.querySelector('header h2').textContent = this.displayDate;
        day.querySelector('header h1').textContent = this.displayName;

        const activities = day.querySelector('[data-content="tasks"] ul');
        const activityTemplate = document.querySelector('#activity-template');

        this.activities.forEach(activity => {
            // set innerHTML so can setAttribute
            const ele = document.createElement('li');
            ele.innerHTML = activityTemplate.innerHTML;

            ele.setAttribute('data-category', activity.category);
            ele.innerHTML = activity.description;

            activities.appendChild(ele);
        });

        calendar.prepend(day);

        // grab element and update attributes because you can't when its a document fragment
        this.ele = calendar.children[0];
        this.ele.setAttribute('data-week', this.week);
        this.ele.setAttribute('data-month', this.month);
    }

    setDisplayInfo () {
        let dateInfo = new Date(this.date);

        const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];

        this.displayDate = `${dateInfo.getMonth() + 1}/${dateInfo.getDate()}`;
        this.displayName = days[dateInfo.getDay()];
    }
}

class Days {
    load (data) {
        const days = Object.keys(data);
        this.list = data[days].map(day => new Day(day));
    }
}