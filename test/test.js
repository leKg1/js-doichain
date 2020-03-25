import chai from 'chai'
chai.Assertion.addProperty('uppercase', function () {
  var obj = this._obj;
  new chai.Assertion(obj).to.be.a('string');

  this.assert(
      obj === obj.toUpperCase() // adapt as needed
      , 'expected #{this} to be all uppercase'    // error message when fail for normal
      , 'expected #{this} to not be all uppercase'  // error message when fail for negated
  );
});
import {generateMnemonic} from '../lib/generateMnemonic'
import {validateMnemonic} from "../lib/validateMnemonic";
import {createHdKeyFromMnemonic} from "../lib/createHdKeyFromMnemonic"
import {createDoichainWalletFromHdKey,noEmailError} from "../lib/createDoichainWalletFromHdKey"
import {getAddress} from "../lib/getAddress"
import {changeNetwork, DEFAULT_NETWORK, DOICHAIN_REGTEST,DOICHAIN_TESTNET,DOICHAIN} from "../lib/network"
import {fundWallet} from "../lib/fundWallet";
import {listTransactions} from "../lib/listTransactions"
import {listUnspent} from "../lib/listUnspent";
import {encryptAES} from "../lib/encryptAES";
import {decryptAES} from "../lib/decryptAES";

const SEEDPHRASE = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
const PASSWORD = "julianAssange2020"

describe('js-doichain', function(){
  this.timeout(0);
  describe('basic doichain functions', function(){
    it('should create a new mnemonic seed phrase', function () {
      const mnemonic = generateMnemonic()
      chai.assert.equal(mnemonic.split(' ').length,12,'mnemonic doesnt contain 12 words')
    })

    it('should validate a mnemonic seed phrase', function () {
      const mnemonic = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
      const valid = validateMnemonic(mnemonic)
      chai.assert.equal(valid,true,"mnomnic seed phrase not valid")
    })

    it('should create a hdkey from a mnemonic without password', function() {
      const mnemonic = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      chai.expect(hdKey).to.have.own.property('_privateKey');
      chai.expect(hdKey).to.have.own.property('_publicKey');
    })

    it('should create a new Doichain wallet from a seed in mainnet', function () {
      const mnemonic = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
      const hdKey = createHdKeyFromMnemonic(mnemonic)

      chai.expect(() => createDoichainWalletFromHdKey(hdKey)).to.throw();
      chai.expect(() => createDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org')).to.not.throw();

      const wallet = createDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org',DOICHAIN)
      // bitcoin testnet P2PKH addresses start with a 'm' or 'n'
      chai.assert.strictEqual(wallet.addresses[0].address.startsWith('D') || wallet.addresses[0].address.startsWith('N'),true)
      chai.expect(wallet.addresses[0].address).to.have.length(34)
      chai.expect(wallet.addresses[0].address.substring(0,1)).to.be.uppercase
    })

    it('should create a new Doichain wallet from a seed in testnet', function () {
      const mnemonic = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      const wallet = createDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org',DOICHAIN_TESTNET)
      chai.assert.strictEqual(wallet.addresses[0].address.startsWith('d') || wallet.addresses[0].address.startsWith('n'),true)
      chai.expect(wallet.addresses[0].address).to.have.length(34)
      chai.expect(wallet.addresses[0].address.substring(0,1)).to.not.be.uppercase
    })

    it('should create a new Doichain address for a regtest wallet ', async () => {
      changeNetwork('regtest')
      const mnemonic = "balance blanket camp festival party robot social stairs noodle piano copy drastic"
      const hdKey = createHdKeyFromMnemonic(mnemonic)
      const wallet = createDoichainWalletFromHdKey(hdKey,'alice@ci-doichain.org',DEFAULT_NETWORK)
      chai.assert.strictEqual(wallet.addresses[0].address.startsWith('d') || wallet.addresses[0].address.startsWith('n'),true)
      chai.expect(wallet.addresses[0].address).to.have.length(34)
      chai.expect(wallet.addresses[0].address.substring(0,1)).to.not.be.uppercase
      const doi = 10
      const funding = await fundWallet(wallet.addresses[0].address,doi)
      console.log('funding',funding)
      const wif = funding.data.wif
      const address = funding.data.address
      chai.expect(address).to.have.length(34)
      chai.expect(address.substring(0,1)).to.not.be.uppercase
      const unspent = await listUnspent(address)
      console.log(unspent)
      const transactions = await listTransactions(address)
      console.log(transactions)
    })

    it('Encrypt and decrypt seed phrase', function () {
      const encryptedSeedPhrase = encryptAES(SEEDPHRASE, PASSWORD)
      chai.assert.isAbove(encryptedSeedPhrase.length,0,"seed phrase not encrypted")
      const decryptedSeedPhrase = decryptAES(encryptedSeedPhrase, PASSWORD)
      chai.assert.equal(decryptedSeedPhrase,SEEDPHRASE,"seed phrase not decrypted")
    })

  })

});
