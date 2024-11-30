const R = require('ramda');
const Wallets = require('./wallets');
const Wallet = require('./wallet');
const Transaction = require('../blockchain/transaction');
const TransactionBuilder = require('./transactionBuilder');
const Db = require('../util/db');
const ArgumentError = require('../util/argumentError');
const Config = require('../config');

const OPERATOR_FILE = 'wallets.json';


class Operator {
    constructor(dbName, blockchain) {
        this.db = new Db('data/' + dbName + '/' + OPERATOR_FILE, new Wallets());

        // INFO: In this implementation the database is a file and every time data is saved it rewrites the file, probably it should be a more robust database for performance reasons
        this.wallets = this.db.read(Wallets);
        this.blockchain = blockchain;
    }

    addWallet(wallet) {
        this.wallets.push(wallet);
        this.db.write(this.wallets);
        return wallet;
    }

    createWalletFromPassword(password, studentId) {
        let newWallet = Wallet.fromPassword(password, studentId);
        return this.addWallet(newWallet);
    }    

    checkWalletPassword(walletId, passwordHash) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        return wallet.passwordHash === passwordHash;
    }

    getWallets() {
        return this.wallets;
    }

    getWalletById(walletId) {
        return R.find((wallet) => { return wallet.id == walletId; }, this.wallets);
    }

    getRegisteredWalletByStudentId(ID) {
        let transactions = this.blockchain.getTransactionsByType("register");
        return R.find((tx) => tx.data.studentId === ID, transactions);
    }

    getRegisteredWalletByEventId(ID) {
        let transactions = this.blockchain.getTransactionsByType("create_event_wallet");
        return R.find((tx) => tx.data.eventId === ID, transactions);
    }

    getPublicKeyByStudentId(studentId) {
        let transactions = this.blockchain.getTransactionsByType("register");
        let transaction = R.find((tx) => tx.data.studentId === studentId, transactions);
        return transaction ? transaction.data.publicKey : null;
    }

    generateAddressForWallet(walletId) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let address = wallet.generateAddress();
        this.db.write(this.wallets);
        return address;
    }

    getAddressesForWallet(walletId) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let addresses = wallet.getAddresses();
        return addresses;
    }    

    getBalanceForAddress(addressId) {        
        let utxo = this.blockchain.getUnspentTransactionsForAddress(addressId);

        if (utxo == null || utxo.length == 0) throw new ArgumentError(`No transactions found for address '${addressId}'`);
        return R.sum(R.map(R.prop('amount'), utxo));
    }

    createTransaction(walletId, fromAddressId, toAddressId, amount, changeAddressId, studentId, eventId, type, outputs) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        if(type !== 'register' && type !== 'create_event_wallet') {
            let secretKey = wallet.getSecretKeyByAddress(fromAddressId);
            if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        }

        let tx = new TransactionBuilder();
        tx.from(utxo)
            .to(toAddressId, amount)
            .change(changeAddressId || fromAddressId)
            .fee(0)
            .studentId(studentId) // Set studentId
            .eventId(eventId)
            .timestamp(Date.now()) // Set timestamp
            .type(type)
            .publicKey(fromAddressId)
            .outputs(outputs);

        if (type !== 'register' && type !== 'create_event_wallet') {
            let secretKey = wallet.getSecretKeyByAddress(fromAddressId);
            tx.sign(secretKey);
        }

        return Transaction.fromJson(tx.build());
    }
}

module.exports = Operator;
