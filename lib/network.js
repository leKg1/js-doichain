import settings from './settings'
export var network
export var DEFAULT_NETWORK
export var DEFAULT_SETTINGS
global.network = network
global.DEFAULT_NETWORK = DEFAULT_NETWORK
global.DEFAULT_SETTINGS = DEFAULT_SETTINGS

export const DOICHAIN = {
    name: 'mainnet',
    messagePrefix: '\x19Doichain Signed Message:\n',
    bech32: 'dc',
    bip32: {
        public: 0x0488b21e,
        private: 0x0499ade4
    },
    pubKeyHash: 52, //D=30 d=90 (52=M) https://en.bitcoin.it/wiki/List_of_address_prefixes
    scriptHash: 13,
    wif: 180, //???
};

export const DOICHAIN_TESTNET = {
    name: 'testnet',
    messagePrefix: '\x19Doichain-Testnet Signed Message:\n',
    bech32: 'dt',
    bip32: {
        public: 0x043587cf,
        private: 0x04358394
    },
    pubKeyHash: 111, //D=30 d=90 (52=N) (111=m/n) https://en.bitcoin.it/wiki/List_of_address_prefixes
    scriptHash: 196,
    wif: 239, //???
};

export const DOICHAIN_REGTEST = {
    name: 'regtest',
    messagePrefix: '\x19Doichain-Regtest Signed Message:\n',
    bech32: 'dcrt',
    bip32: {
        public: 0x043587cf,
        private: 0x04358394
    },
    pubKeyHash: 111, //D=30 d=90 (52=N) 111 (m/n)(https://en.bitcoin.it/wiki/List_of_address_prefixes
    scriptHash: 196,
    wif: 239, //???
};

const settingsMainnet = {
    testnet: false,
    from: "doichain@le-space.de",
    ssl: true,
    port: 443,
    host: "doichain-v0-0-9-89.doi.works"
}

const settingsTestnet = {
    testnet: true,
    from: "newsletter@doichain.org",
    port: 443,
    ssl: true,
    host: "doichain-testnet-v0-0-9-88.doi.works"
}

const settingsRegTest = {
    regtest: true,
    from: "alice@ci-doichain.org",
    port: 3000,
    host: "localhost"
}

export const changeNetwork = (newNetwork) => {
    var GLOBAL = global || window;
    //console.log('newNetwork:'+newNetwork)
    if(!newNetwork || newNetwork === undefined) GLOBAL.network == "mainnet"
    else GLOBAL.network = newNetwork

    if (GLOBAL.network === "mainnet") {
        GLOBAL.DEFAULT_NETWORK = DOICHAIN
        GLOBAL.DEFAULT_SETTINGS = settingsMainnet
    }
    else if (GLOBAL.network === "testnet") {
        GLOBAL.DEFAULT_NETWORK = DOICHAIN_TESTNET
        GLOBAL.DEFAULT_SETTINGS = settingsTestnet
    }
    else { //(GLOBAL.network === "regtest") {
        GLOBAL.network = "regtest"
        GLOBAL.DEFAULT_NETWORK = DOICHAIN_REGTEST
        GLOBAL.DEFAULT_SETTINGS = settingsRegTest
    }
    console.log('changed network to',GLOBAL.network)
    //if(GLOBAL.network !== 'mainnet' && GLOBAL.network !== 'testnet' && GLOBAL.network !== 'regtest')
    //console.log('setSettings', GLOBAL.DEFAULT_SETTINGS)
    settings.setSettings(GLOBAL.DEFAULT_SETTINGS)
    //console.log('DEFAULT_NETWORK',DEFAULT_NETWORK)
    //console.log('DEFAULT_SETTINGS',DEFAULT_SETTINGS)
}
