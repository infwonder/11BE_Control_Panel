"use strict";

// Third-parties
import React, { Component } from 'react';
import Reflux from 'reflux';
import Dropdown from 'react-dropdown';

// Reflux store
import ControlPanelStore from '../store/ControlPanelStore';


// Components
import Receipts from '../components/Receipts';

class ReceiptsView extends Reflux.Component {
    constructor(props) {
        super(props);

        this.store = ControlPanelStore;
        this.storeKeys=["receipts", "Qs", "selectedQ"];

        this.getReceipts = this.getReceipts.bind(this);

    }

    componentDidMount = () => {
        if (this.state.Qs.length > 0 && this.state.selectedQ === "") {
            this.setState({selectedQ: [...this.state.Qs].splice(-1)[0]});
        }
    }

    handleChange = (event) => { this.setState({ selectedQ: event.value }); }
    getReceipts = () => { return this.state.receipts[this.state.selectedQ] }

    render() {
        console.log("in ReceiptsView render()");
        return (
            <div className="item ReceiptsLayout">
                <label className="item RLabel">Queue IDs:</label>
                <Dropdown className="item ReceiptsDrop" options={this.state.Qs} onChange={this.handleChange}
                          value={this.state.selectedQ} placeholder={'Please select a Queue ID'} />
                <Receipts receipts={this.getReceipts()} />
            </div>
        )
    }
}

export default ReceiptsView;
