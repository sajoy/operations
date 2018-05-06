import Days from './Days';
import Totals from './Totals';
import LocalData from './localStorage';

class App {
    constructor (week, month) {
        this.settingsOpen = false;
        this.localData = new LocalData();
        
        this.initView();
        
        this.dataEndPoint = 'http://localhost:3000/graphql';
        this.fetchDays();
    }

    initView () {
        const menuToggle = document.getElementById('menu-toggle');
        menuToggle.addEventListener('click', () => {
            this.settingsOpen = !this.settingsOpen;
            this.toggleSettings();
        });

        this.focusEle = document.querySelector('[data-content="focus"] h1');
        this.focusEle.addEventListener('blur', (e) => {
            this.localData.set('focus', e.target.textContent);
        });

        this.loadLocalData();
    }

    loadLocalData () {
        this.loadFocus();
    }

    loadFocus () {
        try {
            this.localData.get('focus');
        }
        catch (err) {
            this.localData.set('focus',  'be intentional');
        }

        this.focusEle.textContent = this.localData.get('focus');
    }


    fetchDays () {
        this.days = new Days();
        fetch(this.dataEndPoint, {
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
                        expenses {
                            description
                            amount
                            category
                        }
                    }
                }`
            })
        })
        .then(res => res.json())
        .then(res => {
            this.days.load(res.data);
            this.today = this.days.list[this.days.list.length - 1];
            this.week = this.today.week;
            this.month = this.today.month;
        })
        .then(()=> this.displayTotals())
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

export default App;