export default class BudgetTracker {
  constructor(querySelectorString) {
    this.root = document.querySelector(querySelectorString);
    this.root.innerHTML = BudgetTracker.html();

    // listening for click event on new-entry
    this.root.querySelector(".new-entry").addEventListener("click", () => {
      this.onNewEntryBtnClick();
    });

    // loading data from local storage
    this.load();
  }

  // return html for table
  static html() {
    return `
        <table class="budget-tracker">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th></th>
                </tr>
            </thead>
            <tbody class="entries">
            </tbody>
            <tbody>
                <tr>
                    <td colspan="5" class="controls">
                        <button class="new-entry" type="button">New Entry</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <td colspan="5" class="summary">
                    <strong>Total:</strong>
                    <span class='total'>$0.00</span>
                </td>
            </tfoot>
        </table>
                 `;
  }

  // return html for single row in table
  static entryHtml() {
    return `
        <tr>
        <td>
            <input type="date" class="input input-date">
        </td>
        <td>
            <input type="text" class="input input-description" placeholder="Income, Expenses, etc.">
        </td>
        <td>
            <select class="input input-type">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
        </td>
        <td>
           <input type="number" class="input input-amount">
        </td>
        <td>
            <button type="button" class="delete-entry">&#10005;</button>
        </td>
    </tr>
        `;
  }

  // initial loading
  load() {
    //   data coming form local storage on inital page load will be in JSON. This parses that data if there is data || if there is none, empty array
      const entries = JSON.parse(localStorage.getItem('budget-tracker-entries') || '[]');
            // on load adds entry to our table
        for (const entry of entries) {
            this.addEntry(entry);
        }
        // on initial load updates the summary if there is any informaiton 
        this.updateSummary();
  }

  // take current rows and display total amount
  updateSummary() {
      const total = this.getEntryRows().reduce((total, row) => {
        const amount = row.querySelector('.input-amount').value;
        const isExpense = row.querySelector('.input-type').value === 'expense';
        const modifier = isExpense ? -1 : 1;

        return total + (amount * modifier);
      }, 0)

      const totalFormated = new Intl.NumberFormat('en-US', {
          style: 'currency', 
          currency: 'USD'
      }).format(total);
      this.root.querySelector('.total').textContent = totalFormated;
  }

  // save to local storage
  save() {
    const data = this.getEntryRows().map(row => {
        return {
            date: row.querySelector('.input-date').value,
            description: row.querySelector('.input-description').value,
            type: row.querySelector('.input-type').value,
            amount: parseFloat(row.querySelector('.input-amount').value),
        };
    });
    localStorage.setItem('budget-tracker-entries', JSON.stringify(data));
    this.updateSummary();
  }

  // add new entry in table
  addEntry(entry = {}) {
    //   adds function to add table row on using btn
      this.root.querySelector('.entries').insertAdjacentHTML('beforeend', BudgetTracker.entryHtml())

      const row = this.root.querySelector('.entries tr:last-of-type');
    //   gives us entry date or current date in ISO format and using regex to give us only date. 
      row.querySelector('.input-date').value = entry.date || new Date().toISOString().replace(/T.*/, '');
      row.querySelector('.input-description').value = entry.description || '';
      row.querySelector('.input-type').value = entry.type || 'income';
      row.querySelector('.input-amount').value = entry.amount || 0;
      row.querySelector('.delete-entry').addEventListener('click', e => {
          this.onDeleteEntryBtnClick(e);
      })

      row.querySelectorAll('.input').forEach(input => {
          input.addEventListener('change', () => this.save());
      });
  };

  // get all rows
  getEntryRows() {
      return Array.from(this.root.querySelectorAll('.entries tr'))
  }

  // button to add new entry
  onNewEntryBtnClick() {
      this.addEntry();
  }

  // button to delete entry
  onDeleteEntryBtnClick(e) {

   e.target.closest('tr').remove();
   this.save();
  }
}
