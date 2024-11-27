const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const R = require('ramda');
const path = require('path');
const swaggerDocument = require('./swagger.json');
const Block = require('../blockchain/block');
const Transaction = require('../blockchain/transaction');
const TransactionAssertionError = require('../blockchain/transactionAssertionError');
const BlockAssertionError = require('../blockchain/blockAssertionError');
const HTTPError = require('./httpError');
const ArgumentError = require('../util/argumentError');
const CryptoUtil = require('../util/cryptoUtil');
const timeago = require('timeago.js');

class HttpServer {
    constructor(node, blockchain, operator, miner) {
        this.app = express();

        const projectWallet = (wallet) => {
            return {
                id: wallet.id,
                addresses: R.map((keyPair) => {
                    return keyPair.publicKey;
                }, wallet.keyPairs)
            };
        };

        this.app.use(cors());
        this.app.use(bodyParser.json());

        this.app.set('view engine', 'pug');
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.locals.formatters = {
            time: (rawTime) => {
                const timeInMS = new Date(rawTime * 1000);
                return `${timeInMS.toLocaleString()} - ${timeago().format(timeInMS)}`;
            },
            hash: (hashString) => {
                return hashString != '0' ? `${hashString.substr(0, 5)}...${hashString.substr(hashString.length - 5, 5)}` : '<empty>';
            },
            amount: (amount) => amount.toLocaleString()
        };
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        this.app.get('/blockchain', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/index.pug', {
                    pageTitle: 'Blockchain',
                    blocks: blockchain.getAllBlocks()
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });

        this.app.get('/blockchain/blocks', (req, res) => {
            res.status(200).send(blockchain.getAllBlocks());
        });

        this.app.get('/blockchain/blocks/latest', (req, res) => {
            let lastBlock = blockchain.getLastBlock();
            if (lastBlock == null) throw new HTTPError(404, 'Last block not found');

            res.status(200).send(lastBlock);
        });

        this.app.put('/blockchain/blocks/latest', (req, res) => {
            let requestBlock = Block.fromJson(req.body);
            let result = node.checkReceivedBlock(requestBlock);

            if (result == null) res.status(200).send('Requesting the blockchain to check.');
            else if (result) res.status(200).send(requestBlock);
            else throw new HTTPError(409, 'Blockchain is update.');
        });

        this.app.get('/blockchain/blocks/:hash([a-zA-Z0-9]{64})', (req, res) => {
            let blockFound = blockchain.getBlockByHash(req.params.hash);
            if (blockFound == null) throw new HTTPError(404, `Block not found with hash '${req.params.hash}'`);

            res.status(200).send(blockFound);
        });

        this.app.get('/blockchain/blocks/:index', (req, res) => {
            let blockFound = blockchain.getBlockByIndex(parseInt(req.params.index));
            if (blockFound == null) throw new HTTPError(404, `Block not found with index '${req.params.index}'`);

            res.status(200).send(blockFound);
        });

        this.app.get('/blockchain/blocks/transactions/:transactionId([a-zA-Z0-9]{64})', (req, res) => {
            let transactionFromBlock = blockchain.getTransactionFromBlocks(req.params.transactionId);
            if (transactionFromBlock == null) throw new HTTPError(404, `Transaction '${req.params.transactionId}' not found in any block`);

            res.status(200).send(transactionFromBlock);
        });

        this.app.get('/blockchain/transactions', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/transactions/index.pug', {
                    pageTitle: 'Unconfirmed Transactions',
                    transactions: blockchain.getAllTransactions()
                });
            else
                res.status(200).send(blockchain.getAllTransactions());
        });

        this.app.post('/blockchain/transactions', (req, res) => {
            let requestTransaction = Transaction.fromJson(req.body);
            let transactionFound = blockchain.getTransactionById(requestTransaction.id);

            if (transactionFound != null) throw new HTTPError(409, `Transaction '${requestTransaction.id}' already exists`);

            try {
                let newTransaction = blockchain.addTransaction(requestTransaction);
                res.status(201).send(newTransaction);
            } catch (ex) {
                if (ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, requestTransaction, ex);
                else throw ex;
            }
        });

        this.app.get('/blockchain/transactions/unspent', (req, res) => {
            res.status(200).send(blockchain.getUnspentTransactionsForAddress(req.query.address));
        });

        this.app.get('/operator/wallets', (req, res) => {
            let wallets = operator.getWallets();

            let projectedWallets = R.map(projectWallet, wallets);

            res.status(200).send(projectedWallets);
        });

        //Create new wallet
        this.app.post('/operator/wallets', async (req, res) => {
            let password = req.body.password;
            //if (R.match(/\w+/g, password).length <= 4) throw new HTTPError(400, 'Password must contain more than 4 words');
            let studentID = req.body.studentId;
            let eventID = req.body.eventId;

            if (eventID) {
                //event wallet
                let existingWallet = operator.getWalletById(eventID);
                if (existingWallet != null) {
                    res.status(409).send({error: `Wallet for event '${eventID}' already exists`});
                    return;
                }
                let newWallet = operator.createWalletFromPassword(eventID, eventID);

                let projectedWallet = projectWallet(newWallet);
                let walletId = projectedWallet.id;

                //Create new address
                try {
                    let newAddress = operator.generateAddressForWallet(walletId);
                    let publicKey = newAddress.publicKey;

                    // Create a transaction for the new wallet
                    let transactionResponse = await this.createEventWalletTransaction(eventID, publicKey);

                    res.status(201).send({walletId: walletId, address: newAddress, transaction: transactionResponse});
                } catch (ex) {
                    if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                    else throw ex;
                }
            } else {
                /// Validation of Student ID
                if (!studentID) {
                    res.status(400).send({error: 'studentID is required'});
                    return;
                }
                if (!/^\d{8}[a-zA-Z]$/.test(studentID)) {
                    res.status(400).send({error: 'studentID must be eight numbers followed by a character'});
                    return;
                }
                studentID = studentID.slice(0, 8) + studentID.slice(8).toLowerCase();

                let existingWallet = operator.getWalletById(studentID);
                if (existingWallet != null) {
                    res.status(409).send({error: `Wallet for student '${studentID}' already exists`});
                    return;
                }
                let newWallet = operator.createWalletFromPassword(password, studentID);

                let projectedWallet = projectWallet(newWallet);
                let walletId = projectedWallet.id;

                //Create new address
                try {
                    let newAddress = operator.generateAddressForWallet(walletId);
                    let publicKey = newAddress.publicKey;

                    // Create a transaction for the new wallet
                    let transactionResponse = await this.createWalletTransaction(walletId, publicKey, studentID, password);

                    res.status(201).send({walletId: walletId, address: newAddress, transaction: transactionResponse});
                } catch (ex) {
                    if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                    else throw ex;
                }
            }

        });

        this.app.get('/operator/wallets/:walletId', (req, res) => {
            let walletFound = operator.getWalletById(req.params.walletId);
            if (walletFound == null) throw new HTTPError(404, `Wallet not found with id '${req.params.walletId}'`);

            let projectedWallet = projectWallet(walletFound);

            res.status(200).send(projectedWallet);
        });

        this.app.post('/operator/wallets/:walletId/transactions', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;
            let type = req.body.type;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newTransaction = operator.createTransaction(walletId, req.body.fromAddress, req.body.toAddress, req.body.amount, req.body['changeAddress'] || req.body.fromAddress, req.body.studentId, req.body.eventId, type);

                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send({
                    id: transactionCreated.id,
                    hash: transactionCreated.hash,
                    type: transactionCreated.type,
                    data: {
                        inputs: (transactionCreated.data.inputs || []).map(input => ({
                            transaction: input.transaction,
                            index: input.index,
                            amount: input.amount,
                            address: input.address,
                            studentId: input.studentId, // Include studentId
                            eventId: input.eventId,     // Include eventId
                            timestamp: input.timestamp,
                            signature: input.signature
                        })),
                        outputs: (transactionCreated.data.outputs || []).map(output => ({
                            amount: output.amount,
                            address: output.address
                        }))
                    },
                    timestamp: transactionCreated.timestamp
                });
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.get('/operator/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            try {
                let addresses = operator.getAddressesForWallet(walletId);
                res.status(200).send(addresses);
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.post('/operator/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newAddress = operator.generateAddressForWallet(walletId);
                res.status(201).send({address: newAddress});
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.get('/operator/:addressId/balance', (req, res) => {
            let addressId = req.params.addressId;

            try {
                let balance = operator.getBalanceForAddress(addressId);
                res.status(200).send({balance: balance});
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(404, ex.message, {addressId}, ex);
                else throw ex;
            }
        });

        this.app.get('/node/peers', (req, res) => {
            res.status(200).send(node.peers);
        });

        this.app.post('/node/peers', (req, res) => {
            let newPeer = node.connectToPeer(req.body);
            res.status(201).send(newPeer);
        });

        this.app.get('/node/transactions/:transactionId([a-zA-Z0-9]{64})/confirmations', (req, res) => {
            node.getConfirmations(req.params.transactionId)
                .then((confirmations) => {
                    res.status(200).send({confirmations: confirmations});
                });
        });

        this.app.post('/miner/mine', (req, res, next) => {
            miner.mine(req.body.rewardAddress, req.body['feeAddress'] || req.body.rewardAddress)
                .then((newBlock) => {
                    newBlock = Block.fromJson(newBlock);
                    blockchain.addBlock(newBlock);
                    res.status(201).send(newBlock);
                })
                .catch((ex) => {
                    if (ex instanceof BlockAssertionError && ex.message.includes('Invalid index')) next(new HTTPError(409, 'A new block were added before we were able to mine one'), null, ex);
                    else next(ex);
                });
        });

        this.app.use(function (err, req, res, next) {  // eslint-disable-line no-unused-vars
            if (err instanceof HTTPError) res.status(err.status);
            else res.status(500);
            res.send(err.message + (err.cause ? ' - ' + err.cause.message : ''));
        });

        this.app.post('/operator/wallets/:walletId/register', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;
            let publicKey = req.body.publicKey;
            let studentId = req.body.studentId;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newTransaction = operator.createTransaction(walletId, publicKey, publicKey, 0, publicKey, studentId, null, 'register');

                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send({
                    id: transactionCreated.id,
                    hash: transactionCreated.hash,
                    type: transactionCreated.type,
                    data: {
                        studentId: transactionCreated.data.studentId,
                        publicKey: transactionCreated.data.publicKey
                    },
                    timestamp: transactionCreated.timestamp
                });
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });
    }

    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on port: ${this.server.address().port}, to access the API documentation go to http://${host}:${this.server.address().port}/api-docs/`);
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) reject(err);
                console.info('Closing http');
                resolve(this);
            });
        });
    }


    async createWalletTransaction(walletId, publicKey, studentId, password) {
        return new Promise((resolve, reject) => {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'password': password
                },
                body: JSON.stringify({
                    type: 'register',
                    fromAddress: publicKey,
                    //toAddress: address,
                    //amount: 0,
                    //changeAddress: address,
                    studentId: studentId,
                    publicKey: publicKey,
                    //eventId: null
                })
            };

            fetch(`http://localhost:3001/operator/wallets/${walletId}/transactions`, options)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
    }

    async takeAttendanceTransaction(walletId, publicKey, studentId, eventId, password) {
        return new Promise((resolve, reject) => {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'password': password
                },
                body: JSON.stringify({
                    type: 'take_attendance',
                    fromAddress: publicKey,
                    //toAddress: address,
                    //amount: 0,
                    //changeAddress: address,
                    studentId: studentId,
                    publicKey: publicKey,
                    eventId: eventId
                })
            };

            fetch(`http://localhost:3001/operator/wallets/${walletId}/transactions`, options)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
    }

    async createEventWalletTransaction(eventID, publicKey) {
        return new Promise((resolve, reject) => {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'password': eventID
                },
                body: JSON.stringify({
                    type: 'create_event_wallet',
                    fromAddress: publicKey,
                    eventId: eventID,
                    publicKey: publicKey,
                })
            };

            fetch(`http://localhost:3001/operator/wallets/${eventID}/transactions`, options)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
    }
}

module.exports = HttpServer;
