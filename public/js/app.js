class Totals {
    constructor (timeFrame, id) {
        this.id = id;
        this.timeFrame = timeFrame;

        const expenseNodes = document.querySelectorAll(`[data-${timeFrame}="${id}"] .dollars`);
        this.expenseNodes = [...expenseNodes];
    }

    calculate () {
        const total = this.expenseNodes.reduce((acc, curr) => acc + parseFloat(curr.textContent), 0);
        return total.toFixed(2);
    }

    display () {
        const ele = document.querySelector(`[data-content="${this.timeFrame}-total"]`);
        ele.textContent = this.calculate();
    }
}

class App {
    constructor (week, month) {
        this.week = week;
        this.month = month;

        this.settingsOpen = false;

        this.initView();
        this.displayTotals();

        // get current day, week, month from server

        // get all days data from server
        // TODO replace with library probably
        this.fetchDays();

    }

    initView () {
        const menuToggle = document.getElementById('menu-toggle');
        menuToggle.addEventListener('click', () => {
            this.settingsOpen = !this.settingsOpen;
            this.toggleSettings();
        });
    }


    fetchDays () {
        this.days = new Days();
        const dataEndPoint = 'http://localhost:3000/graphql'
        fetch(dataEndPoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `{ 
                    days {
                        date
                        week
                        month
                        activities {
                            description
                            category
                        } 	
                    }
                }`
            })
        })
        .then(res => res.json())
        .then(res => this.days.load(res.data));
    }

    toggleSettings () {
        const settingsPanel = document.querySelector('[data-content="menu"]');
        settingsPanel.classList.toggle('open');
    }

    displayTotals () {
        this.wkTotals = new Totals('week', this.week);
        this.wkTotals.display();

        this.monthTotals = new Totals('month', this.month);
        this.monthTotals.display();
    }
}

// ??? How to deal with ~time~
const app = new App(2, 1);