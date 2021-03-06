const bitcoin = require('bitcoinjs-lib')
var conv = require('binstring');
import base58 from 'bs58'
import {VERSION, NETWORK_FEE,VALIDATOR_FEE,EMAIL_VERIFICATION_FEE,TRANSACTION_FEE} from './constants'
import broadcastTransaction from './broadcastTransaction'

export const sendToAddress = (keypair, destAddress, changeAddress, amount, inputsSelected, nameId, nameValue, encryptedTemplateData,network) => {

    let opCodesStackScript = undefined

    //check if we want a nameId or nameValue transaction (create OpCodeStackScript)
    if (nameId && nameValue && typeof nameId === 'string' && typeof nameValue === 'string') {
        let nameIdPart2 = ''
       /* if (nameId.length > 57) //we have only space for 77 chars in the name in case its longer as in signatures put the rest into the value
        {
            nameIdPart2 = nameId.substring(57, nameId.length)
            nameId = nameId.substring(0, 57)
            nameValue = nameIdPart2 + ' ' + nameValue
        }*/
        const op_name = conv(nameId, {in: 'binary', out: 'hex'})
        let op_value = conv(nameValue, {in: 'binary', out: 'hex'})
        const op_address = base58.decode(destAddress).toString('hex').substr(2, 40);
        opCodesStackScript = bitcoin.script.fromASM(
            `
                                              OP_10
                                              ${op_name}
                                              ${op_value}
                                              OP_2DROP
                                              OP_DROP
                                              OP_DUP
                                              OP_HASH160
                                              ${op_address}
                                              OP_EQUALVERIFY
                                              OP_CHECKSIG
                                        `.trim().replace(/\s+/g, ' '),
        )
    }  //if no nameId it could be nameId is a network object
    if (nameId instanceof Object) network = nameId
    if (!network) network = global.DEFAULT_NETWORK

    if (inputsSelected === undefined) { //TODO get required inputs from current available transactions (confirmed / unconfirmed)
    }
    const inputs = inputsSelected
    const txb = new bitcoin.TransactionBuilder(network)
    let inputsBalance = 0
    if (inputs) {
        inputs.forEach((input) => {
            inputsBalance += input.amount
            txb.addInput(input.txid, input.n)
        })
    }
    const fee = inputs.length * 180 + 3 * 34 + 500000
    console.log('fee',fee)

    // https://bitcoin.stackexchange.com/questions/1195/how-to-calculate-transaction-size-before-sending-legacy-non-segwit-p2pkh-p2sh
    const changeAmount = Math.round(inputsBalance * 100000000 - amount - fee - (opCodesStackScript?NETWORK_FEE.satoshis:0))
    txb.addOutput(destAddress, amount)
    txb.addOutput(changeAddress, changeAmount)

    if (opCodesStackScript) {
        txb.setVersion(VERSION) //use this for name transactions
        txb.addOutput(opCodesStackScript, NETWORK_FEE.satoshis)
    }

    if (!Array.isArray(keypair))
        txb.sign(0, keypair)
    else {
        for (let i = 0; i < keypair.length; i++) {
            console.log('signing with keypair ' + i, keypair[i])
            txb.sign(i, keypair[i])
        }
    }

    try {
        const txSignedSerialized = txb.build().toHex()
        if (!encryptedTemplateData)
            return broadcastTransaction(null, txSignedSerialized, null, null, destAddress)
        else
            return broadcastTransaction(nameId, txSignedSerialized, encryptedTemplateData, null, destAddress)
    } catch (e) {
        console.log('error broadcasting transaction', e)
    }
}




