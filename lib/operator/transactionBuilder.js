const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
const ArgumentError = require('../util/argumentError');
const Transaction = require('../blockchain/transaction');

class TransactionBuilder {
    constructor() {
        this.listOfUTXO = null;
        this.outputAddress = null;
        this.totalAmount = null;
        this.changeAddress = null;
        this.feeAmount = 0;
        this.secretKey = null;
        this._type = null;
        this._publicKey = null;
        this._studentId = null;
        this._eventId = null;
        this._timestamp = Date.now();
        this._outputs = null;
        //this._studentIDList = null;
    }

    from(listOfUTXO) {
        this.listOfUTXO = listOfUTXO;
        return this;
    }

    to(address, amount) {
        this.outputAddress = address;
        this.totalAmount = amount;
        return this;
    }

    change(changeAddress) {
        this.changeAddress = changeAddress;
        return this;
    }

    fee(amount) {
        this.feeAmount = amount;
        return this;
    }

    outputs(outputs) {
        this._outputs = outputs;
        return this;
    }

    sign(secretKey) {
        this.secretKey = secretKey;
        let txHash = CryptoUtil.hash(this.build());
        this.signature = CryptoEdDSAUtil.signHash(CryptoEdDSAUtil.generateKeyPairFromSecret(secretKey), txHash);
        return this;
    }

    type(type) {
        this._type = type;
        return this;
    }

    studentId(studentId) {
        this._studentId = studentId;
        return this;
    }

/*    studentIDList(studentIDList) {
        this._studentIDList = studentIDList;
        return this;
    }*/

    eventId(eventId) {
        this._eventId = eventId;
        return this;
    }

    timestamp(timestamp) {
        this._timestamp = timestamp;
        return this;
    }

    publicKey(publicKey) {
        this._publicKey = publicKey;
        return this;
    }


    build() {
        if (this._type === 'register') {
            return Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: this._type,
                data: {
                    studentId: this._studentId,
                    publicKey: this._publicKey,
                    signature: this.signature
                }
            });
        } else if (this._type === 'create_event_wallet') {
            return Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: this._type,
                data: {
                    eventId: this._eventId,
                    publicKey: this._publicKey,
                    signature: this.signature,
                    outputs: this._outputs
                }
            });
        } else if (this._type === 'take_attendance') {
            return Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: this._type,
                data: {
                    studentId: this._studentId,
                    eventId: this._eventId,
                    timestamp: this._timestamp
                }
            });
        } else {
            if (this.listOfUTXO == null) throw new ArgumentError('It\'s necessary to inform a list of unspent output transactions.');
            if (this.outputAddress == null) throw new ArgumentError('It\'s necessary to inform the destination address.');
            if (this.totalAmount == null) throw new ArgumentError('It\'s necessary to inform the transaction value.');

            let totalAmountOfUTXO = R.sum(R.pluck('amount', this.listOfUTXO));
            let changeAmount = totalAmountOfUTXO - this.totalAmount - this.feeAmount;

            let self = this;
            let inputs = R.map((utxo) => {
                let txInputHash = CryptoUtil.hash({
                    transaction: utxo.transaction,
                    index: utxo.index,
                    address: utxo.address,
                    studentId: self._studentId,
                    eventId: self._eventId,
                    timestamp: self._timestamp,
                    //publicKey: self._publicKey,
                    //type: self._type

                });
                utxo.signature = CryptoEdDSAUtil.signHash(CryptoEdDSAUtil.generateKeyPairFromSecret(self.secretKey), txInputHash);
                return {
                    transaction: utxo.transaction,
                    index: utxo.index,
                    amount: utxo.amount,
                    address: utxo.address,
                    studentId: self._studentId,
                    eventId: self._eventId,
                    timestamp: self._timestamp,
                    //publicKey: self._publicKey,
                    signature: utxo.signature,
                    //type: self._type
                };
            }, this.listOfUTXO);

            let outputs = [];
            outputs.push({
                amount: this.totalAmount,
                address: this.outputAddress
            });

            if (changeAmount > 0) {
                outputs.push({
                    amount: changeAmount,
                    address: this.changeAddress
                });
            } else {
                throw new ArgumentError('The sender does not have enough to pay for the transaction.');
            }

            return Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: this._type,
                data: {
                    inputs: inputs,
                    outputs: outputs,
                    singature: this.signature
                }
            });
        }
    }
}

module.exports = TransactionBuilder;
