const log4js = require('log4js');
const logger = log4js.getLogger('Handlers');
const fs = require('fs');
const yaml = require('js-yaml');
const {FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
logger.level = 'debug';
const path = require('path');
const fixtures = path.resolve(__dirname, '../');
const configfilepath = '../connection.yaml';
var CurrentDate = moment();
var contract;


const addProduct = async (req, res) => {
    logger.debug('===================POST API /product called==================');
    
    var name = req.body.name;
    var color = req.body.color;  
    var identityLabel = req.body.userid;
    var cert = req.body.certificate;
    var key = req.body.privateKey;
    //assuming here object structures look like {name: String, color: String, userid: String, cert: Cert, Key: privatekey }
    var CurrentDate = moment().toISOString();

    var object = {
       name: name,
       color: color,
       user:  user,
       timestamp: CurrentDate 
     };

    const gateway = new Gateway();
    const wallet = await new FileSystemWallet('../identity/user/wallet');

    // Main try/catch block
    try {
        const identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);

        let connectionProfile = yaml.safeLoad(fs.readFileSync(configfilepath, 'utf8'));

        logger.debug('==========================================');
        //Enroll the admin user, and import the new identity into the wallet.
        let connectionOptions = {
            identity: identityLabel,
            wallet: wallet,
            discovery: { enabled: false, asLocalhost: true }
		};

       await gateway.connect(connectionProfile, connectionOptions);
        logger.debug('Use network channel: mychannel.');
        logger.debug('Gateway connected');
        const network = await gateway.getNetwork("mychannel");
        const contract = await network.getContract('mycc');
   
        const result = await contract.submitTransaction('addProduct', object);
        return res.status(200).json({msg: result.toString()});

    } catch (err) {
        logger.error("Error received ", err)
        return res.status(500).json(response.error(err));
    } finally {
        logger.debug('Transaction ends')
    }
};


const getProduct = async (req, res) => {
    logger.debug('===================GET API /product/:id called==================');
    const gateway = new Gateway();
    const wallet = await new FileSystemWallet('../identity/user/wallet');
    var productid = req.params.id;
    var identityLabel = req.params.username;
    // Main try/catch block
    try {

        const identity = X509WalletMixin.createIdentity('Org1MSP', cert, key);
        let connectionProfile = yaml.safeLoad(fs.readFileSync(configfilepath, 'utf8'));

        logger.debug('==========================================');
        //Enroll the admin user, and import the new identity into the wallet.
        let connectionOptions = {
            identity: identityLabel,
            wallet: wallet,
            discovery: { enabled: false, asLocalhost: true }
                };

       await gateway.connect(connectionProfile, connectionOptions);
        logger.debug('Use network channel: mychannel.');
        logger.debug('Gateway connected');
        const network = await gateway.getNetwork("mychannel");
        const contract = await network.getContract('mycc');

        const result = await contract.evaluateTransaction('getProduct', productid);
        let object = response.res("Received the product details", result.toString());
        return res.status(200).json(object);
    } catch (err) {
        logger.error("Error received ", err)
        return res.status(500).json(response.error(err));
    }
};



exports.addProduct = addProduct;
exports.getProduct = getProduct;
