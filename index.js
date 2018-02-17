web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contract_address = "0x1EcCD1B5CE36FC23998b85D1c8f3ff71c24f2e51";

var contract_abi = [{"constant":true,"inputs":[],"name":"getCreator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"myNewNumber","type":"uint256"}],"name":"setMyNumber","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getMyNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"whoIncreased","type":"address"},{"indexed":true,"name":"oldNumber","type":"uint256"},{"indexed":true,"name":"newNumber","type":"uint256"}],"name":"NumberIsIncreased","type":"event"}];

//Interact with wallet balance example
function getBalance(){
    document.getElementById('myBalance').innerText = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), "Ether");
}

//Interact with contract example
var contract_instance = web3.eth.contract(contract_abi).at(contract_address);

function getCounter() {
    document.getElementById("myCounter").innerText = contract_instance.getMyNumber().toNumber();
}

function increaseCounter() {
    var currentNumber = contract_instance.getMyNumber().toNumber();
    currentNumber++;
    web3.personal.unlockAccount(web3.eth.accounts[0], 'test123');
    contract_instance.setMyNumber(currentNumber, {from: web3.eth.accounts[0]}, function(error, result) {
        if(error) {
            console.error(error);
        } else {
            var txHash = result;
            console.log(txHash);
            callWhenMined(txHash, getCounter);
        }
    });
}

function callWhenMined(txHash, callback) {
    web3.eth.getTransactionReceipt(txHash, function(error, rcpt) {
        if(error) {
            console.error(error);
        } else {
            if(rcpt == null) {
                setTimeout(function() {
                    callWhenMined(txHash, callback);
                }, 500);
            } else {
                callback();
            }
        }
    })
}

//Events and Filters example

function makeButtonsVisible() {
    var buttons = document.getElementsByClassName("buttonVisibleWhenInstanceAvailable");
    for(var i = 0; i < buttons.length; i++) {
        buttons[i].style.visibility = 'visible';
    }
}
function getPreviouslyDeployedContract() {
    contract_instance = web3.eth.contract(contract_abi).at(contract_address);
    makeButtonsVisible();
}

var myEvent;

function watchEvents() {
    myEvent = contract_instance.NumberIsIncreased({}, {fromBlock:'latest', toBlock:'latest'});
    console.log(myEvent);
    myEvent.watch(function(error, result) {
        if(error) {
            console.log(error);
        } else {
            console.log(result);
            document.getElementById("events").innerHTML = document.getElementById("events").innerHTML + "<br />" + JSON.stringify(result);
        }
    });
}

function stopWatchingEvents() {
    if(myEvent !== undefined) {
        myEvent.stopWatching();
    }
}
function getAllEvents() {
    contract_instance.allEvents({fromBlock: 0, toBlock: 'latest'}, function(error, result) {
        if(error) {
            console.error(error);
        } else {
            console.log(result);
        }
    })
}
function getNumberIsIncreasedEvent() {
    contract_instance.NumberIsIncreased({}, {fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
        if(error) {
            console.error(error);
        } else {
            console.log(result);
        }
    });
}

var filter;

function filterEventsWatch() {
    filter = web3.eth.filter({fromBlock:0, toBlock: 'latest', address: contract_instance.address, 'topics':[web3.sha3('NumberIsIncreased(address,uint256,uint256)')]});
    filter.watch(function(error, result) {
        if(error) {
            console.error(error);
        } else {
            console.log({"type": "filter", "obj": result});
            console.log(web3.toDecimal(result.topics[3]));
        }
    })
}

function stopFilterEventsWatch() {
    filter.stopWatching();
}

function filterEventsGet() {
    var filter = web3.eth.filter({fromBlock:0, toBlock: 'latest', address: contract_instance.address, 'topics':[web3.sha3('NumberIsIncreased(address,uint256,uint256)')]});
    filter.get(function(error, result) {
        if(error) {
            console.error(error);
        } else {
            console.log({"type": "filter", "obj": result});
        }
    })
}