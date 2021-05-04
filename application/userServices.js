
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const enrollUser = async (req, res) => {
    try {
        // load the network configuration
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../connection.yaml', 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = connectionProfile.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '../identity/user/wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
      
        const identityLabel = req.body.userid;
        const userpwd = req.body.userpwd;
        // Check to see if we've already enrolled the admin user.
        const userExists = await wallet.get(identityLabel);
        if (userExists) {
            console.log('An identity for the client user already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: identityLabel , enrollmentSecret: userpwd });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(identityLabel, x509Identity);
        console.log('Successfully enrolled client user and imported it into the wallet');
        return res.status(200).json({
                message: identityLabel + 'User enrolled successfully',
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            });

    } catch (err) {
        logger.error("Error received ", err)
        return res.status(500).json(response.error(err));
    } finally {
        logger.debug('Transaction ends')
    }

}

exports.enrollUser = enrollUser;
