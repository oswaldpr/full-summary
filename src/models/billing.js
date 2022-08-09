import {singleRow} from "./singleRow.js";
import {taxesList} from "../data/taxGridFees.js";
import {productFees} from "../data/gridFees.js";

export class billing {
    constructor(amount, state, convCurrency = null) {
        const homeCurrency = 'CAD';
        this.amount = amount;
        this.homeCurrency = homeCurrency;
        this.convCurrency = convCurrency || homeCurrency;
        this.homeState = 'QC';
        this.purchaseState = state;
        this.rows = this.rowDefinitions();
        this.subtotal = 0; // total without taxes
        this.taxDetails = {}; // each taxes + total taxes
        this.total = 0; // total with taxes
        this.totalConverted = 0;
        this.calculateTotal();
    }

    initRows() {
        let rowList = [];
        const amount = this.amount;
        const singleProductFees = productFees(amount);
        rowList.push({'amount': amount, 'title': 'Selling price', 'state': this.purchaseState});
        if(amount){
            rowList.push({'amount': singleProductFees, 'title': 'Purchase fees'});
            rowList.push({'amount': 50, 'title': 'Non-Dealer fees'});
            rowList.push({'amount': 10, 'title': 'Environmental fees'});
            rowList.push({'amount': 65, 'title': 'AuctionNow fees'});
            rowList.push({'amount': 35, 'title': 'Exit fees'});
        }
        return rowList;
    }

    rowDefinitions() {
        let rowDefinitions = []
        let rowList = this.initRows();
        rowList.forEach((row) => {
            const state = row.state || this.homeState
            rowDefinitions.push(new singleRow(row.amount, state, row.otherTax, row.title));
        })
        return rowDefinitions;
    }

    calculateTotal() {
        let total = 0;
        let subtotal = 0;
        let taxDetails = {
            'GST': 0,
            'PST': 0,
            'HST': 0,
            'QST': 0,
            'otherTax': 0,
            'totalTax': 0
        };

        let rowDefinitions = this.rows;
        rowDefinitions.forEach((row) => {
            const taxList = taxesList();
            taxList.forEach((tax) => {
                taxDetails[tax] = taxDetails[tax] + row[tax];
            });

            taxDetails.totalTax = taxDetails.totalTax + row.totalTax;
            subtotal = subtotal + row.amount;
            total = total + row.amountWithTaxes;
        })

        this.subtotal = subtotal;
        this.taxDetails = taxDetails;
        this.total = total;

        return rowDefinitions;
    }

    getSummaryRow(title = null) {
        let totalTitle = title || 'Total';
        return {
            'title' : totalTitle,
            'amount' : this.subtotal,
            'GST' : this.taxDetails.GST,
            'PST' : this.taxDetails.PST,
            'HST' : this.taxDetails.HST,
            'QST' : this.taxDetails.QST,
            'otherTax' : this.taxDetails.otherTax,
            'amountWithTaxes' : this.total,
        };
    }
}