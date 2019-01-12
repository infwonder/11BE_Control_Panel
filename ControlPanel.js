'use strict';

const fs   = require('fs');
const path = require('path');
const ethUtils = require('ethereumjs-utils');

// 11BE BladeIron Client API
const BladeIronClient = require('bladeiron_api');

class ControlPanel extends BladeIronClient {
        constructor(rpcport, rpchost, options)
        {
                super(rpcport, rpchost, options);
		this.TokenList = this.configs.tokens; // just a list;
		this.TokenInfo = {};
		this.newJobsHandler = null;

		this.toWei = (eth, decimals) => this.toBigNumber(String(eth)).times(this.toBigNumber(10 ** decimals)).floor(); 
		this.toEth = (wei, decimals) => this.toBigNumber(String(wei)).div(this.toBigNumber(10 ** decimals));
		this.hex2num = (hex) => this.toBigNumber(String(hex)).toString();		

		this.watchTokens = () => 
		{
			return this.client.call('hotGroups', this.TokenList);
		}

		this.unwatchTokens = (tokenSymbol) =>
		{
			this.TokenList = this.TokenList.filter((t) => { return t !== tokenSymbol; });

			return this.watchTokens();
		}

		this.syncTokenInfo = () => 
		{
			return this.client.call('hotGroupInfo').then((info) => {
				this.TokenInfo = info;

				return true;
			})
			.catch((err) => {
				console.trace(err);
				return false;
			})
		}

		this.setGasPrice = (priceInWei) => 
		{
			return this.client.call('setGasPrice', priceInWei);
		}

		this.setGWeiGasPrice = (priceInGWei) =>
		{
			let priceInWei = this.toWei(priceInGWei, 9);

			return this.setGasPrice(priceInWei);
		}

		this.gasPriceEst = () => 
		{
			return this.client.call('gasPriceEst');
		}

		this.launchGUI = () => 
		{
			const gui = Promise.resolve();

			return gui.then(() => 
			{
				const spawn = require('child_process').spawn;
		                let cwd = process.cwd(); 
		                let topdir = path.join(cwd, 'dapps', this.appName, 'GUI');
		                let configDir = require(path.join(cwd, '.local', 'bootstrap_config.json')).configDir;
		
		                const subprocess = spawn(path.join(topdir,'node_modules','.bin','electron'), ['.'], {
		                  cwd: topdir,
		                  env: {DISPLAY: process.env.DISPLAY, XAUTHORITY: process.env.XAUTHORITY, configDir },
		                  detached: true,
		                  stdio: 'ignore'
		                });
		
		                subprocess.unref();

				return true;
			})
		}

		this.addrEtherBalance = (address) => 
		{
			return this.client.call('addrEtherBalance', [address]);
		}

		this.addrTokenBalance = (TokenSymbol) => (address) => 
		{
			return this.client.call('addrTokenBalance', [TokenSymbol, address]);
		}

		this.subscribeNewJobs = (handler = null) =>{
			console.log("subcribing the newJobs Event...");
			this.client.subscribe('newJobs');
			this.newJobsHandler = handler;
            this.client.on('newJobs', this.newJobsDispatcher);  
		}

		this.newJobsDispatcher = (obj) =>{
			console.log("Getting newJob events")
			if(!this.newJobsHandler){
				console.log("No valid handler for newJobs events")
			}else{
				this.newJobsHandler(obj)
			}
		}
	}
}

module.exports = ControlPanel;