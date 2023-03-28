const axios = require('axios');
const emoji = require('node-emoji');
require('dotenv').config();
const env = process.env;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {polling: true});
// Define a function to scrape data from the API and log a message to the console
let oldblockNumber = 319000;
const scrapeAndLogMessage = async () => {
    
  try {
    // Scrape the block number from the API and convert it to a decimal number
    const blockNumberResponse = await axios.get('https://zksync2-mainnet.zkscan.io/api?module=block&action=eth_block_number');
    const blockNumberHex = blockNumberResponse.data.result;
    const blockNumbernow = parseInt(blockNumberHex, 16);
    console.log('Scanning from Block: '+ oldblockNumber);
    console.log('to Block: '+blockNumbernow);
    
    

    // // Construct the URL for the getLogs endpoint with the block number as a parameter
    const getLogsUrl = `https://zksync2-mainnet.zkscan.io/api?module=logs&action=getLogs&fromBlock=${oldblockNumber}&toBlock=${blockNumbernow}&topic0=0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0`;
    
    // // Scrape the data from the getLogs endpoint to obtain the contract address
    const getLogsResponse = await axios.get(getLogsUrl);
    // console.log(getLogsResponse.data.result[0].address);
    const addressWithTrailingZeros = getLogsResponse.data.result[0].topics[1];
    const addressWithoutTrailingZeros = addressWithTrailingZeros.replace(/^0x0+/, '0x');
    // console.log(addressWithoutTrailingZeros); // '0x1234567890123456789012345678901234567890'
    const creatoraddress = `https://explorer.zksync.io/address/${addressWithoutTrailingZeros}`
    // console.log(creatoraddress);
    const ownerethbalanceurlapi = `https://zksync2-mainnet.zkscan.io/api?module=account&action=balance&address=${addressWithoutTrailingZeros}`
    const getownerbalance = await axios.get(ownerethbalanceurlapi);
    // console.log((getownerbalance.data.result/10**18).toFixed(5) + " eth");
    const contractAddress = getLogsResponse.data.result[0].address;

    // // Construct the URL for the getToken endpoint with the contract address as a parameter
    const getTokenUrl = `https://zksync2-mainnet.zkscan.io/api?module=token&action=getToken&contractaddress=${contractAddress}`;

    // // Scrape the data from the getToken endpoint to obtain the name of the token
    const getTokenResponse = await axios.get(getTokenUrl);
    // console.log(getTokenResponse.data.result);
    // const tokenName = getTokenResponse.data.result.name;
    const dexscreenerchart = `https://dexscreener.com/defi/zksync/${contractAddress}`
    const linktoken = `https://explorer.zksync.io/address/${contractAddress}`
    // console.log(linktoken);
    const tokenSymbol = getTokenResponse.data.result.symbol;
    // console.log(emoji.get('rocket')+" NEW TOKEN CREATED "+emoji.get('rocket'));
    // console.log('   '+emoji.get('moneybag')+'Token Symbol :' +tokenSymbol);
    const tokenName = getTokenResponse.data.result.name;
    // console.log('   '+emoji.get('trident')+' Token Name : ' +tokenName);
    const tokenDecimals = getTokenResponse.data.result.decimals;
    // console.log('   '+emoji.get('1234')+' Token Decimals : ' +tokenDecimals);
    // console.log('   '+emoji.get('link')+' Token Address : ' +<a href="${linktoken}">${contractAddress}</a>);
    const tokenurl = `https://explorer.zksync.io/address/${contractAddress}`
    const tokenTotalSupply = getTokenResponse.data.result.totalSupply;
    // console.log('   '+emoji.get('dragon')+' Token Total Supply :' +tokenTotalSupply/10**tokenDecimals);
    // console.log('   '+emoji.get('nerd_face')+' Creator Address :'+<a href="${creatoraddress}">${addressWithoutTrailingZeros}</a>);
    // console.log('Creator Address Url :' +creatoraddress);
    const ownerbalance = (getownerbalance.data.result/10**18).toFixed(5)
    // console.log('   '+emoji.get('briefcase')+' Owner Balance :' +ownerbalance +' ETH' );
    // console.log('   '+emoji.get('chart_with_upwards_trend')+' Dex Screener Chart : ' +<a href="${dexscreenerchart}">Dex Screener Chart</a>);
    const logMessage = `
    🚀 NEW TOKEN CREATED 🚀
    💰 Token Symbol: ${tokenSymbol}
    🕊️ Token Name: <a href="${tokenurl}">${tokenName}</a>
    🔢 Token Decimals: ${tokenDecimals}
    🔗 Token Address: <code onclick="copyToClipboard('${contractAddress}')">${contractAddress}</code>
    📈 Token Total Supply: ${tokenTotalSupply/10**tokenDecimals}
    👤 Creator Address: <a href="${creatoraddress}">Owner Address</a>
    💼 Creator Balance: ${ownerbalance} ETH
    📈 Dex Screener Chart: <a href="${dexscreenerchart}">Dex Screener Chart</a>
  `;
    bot.sendMessage(env.CHAT_ID, logMessage, {parse_mode: 'HTML'});
    oldblockNumber = blockNumbernow;
    // Log the message to the console
  } catch (error) {
    console.log("no new token")
    // console.log(error);
  }
};

// Set up a loop to periodically scrape data and log messages to the console
setInterval(scrapeAndLogMessage, 4000); // Scrape every 3 minutes