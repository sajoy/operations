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
    }

    initView () {
        const menuToggle = document.getElementById('menu-toggle');
        menuToggle.addEventListener('click', () => {
            this.settingsOpen = !this.settingsOpen;
            this.toggleSettings();
        });
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