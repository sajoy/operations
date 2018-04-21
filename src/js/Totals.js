class Totals {
    constructor (timeFrame, id) {
        this.id = id;
        this.timeFrame = timeFrame;

        const expenseNodes = document.querySelectorAll(`[data-${timeFrame}="${id}"] .dollars`);
        this.expenseNodes = [...expenseNodes];
    }

    calculate () {
        const total = this.expenseNodes.reduce((acc, curr) => acc + parseFloat(curr.textContent.slice(1)), 0);
        return total.toFixed(2);
    }

    display () {
        const ele = document.querySelector(`[data-content="${this.timeFrame}-total"]`);
        ele.textContent = this.calculate();
    }
}

export default Totals;