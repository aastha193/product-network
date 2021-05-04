package main

import (
        "crypto/ecdsa"
        "crypto/sha256"
        "crypto/x509"
        "encoding/json"
        "errors"
        "fmt"
        "math/big"

        "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

//SmartContract provides functions
type SmartContract struct {
        contractapi.Contract
}


func (sc *SmartContract) Init(ctx contractapi.TransactionContextInterface, chainid string, chaincodename string) (string, error) {
        ctx.GetStub().PutState("test", []byte("0"))
        return "", nil
}

// Product is
type Product struct {
        Name   string `json:"name"`
        Color    int  `json:"color"`
        Timestamp string `json:"timestamp"`
        User    string `json:"user"`
}

//AddProduct ...
func (sc *SmartContract) AddProduct(ctx contractapi.TransactionContextInterface, productJSON string) (string, error) {
        productBytes := []byte(productJSON)

        product := Product{}
        err = json.Unmarshal(productBytes, &product)
        if err != nil {
                return "", errors.New("product format is not valid: " + err.Error())
        }
        userid := "user123"
        //userid is the authenticated userid
        product.user = userid
        compositeKey, compositeErr := ctx.GetStub().CreateCompositeKey("productData", product.Name)
        if compositeErr != nil {
                return "", errors.New("Could not create a composite key for " + product.Name + ": " + compositeErr.Error())
        }

        compositePutErr := ctx.GetStub().PutState(compositeKey, productBytes)
        if compositePutErr != nil {
                return "", errors.New("Could not insert " + product.Name + "in the ledger: " + compositePutErr.Error())
        }

        return "Successfully added Product to the ledger", nil
}


//GetProductDetails
func (sc *SmartContract) GetProduct(ctx contractapi.TransactionContextInterface, name string) (string, error) {
        result, err := ctx.GetStub().GetStateByPartialCompositeKey([]string{"productData", name})
        if err != nil {
                return nil, fmt.Errorf("Could not retrieve value for %v: %v", infos, err)
        }
        defer result.Close()

        // Check the variable existed
        if !result.HasNext() {
                return nil, nil
        }

        value, nextErr := result.Next()
        if nextErr != nil {
                return nil, nextErr
        }
        record := value.GetValue()
        if err != nil {
                return "", errors.New("Error is " + err.Error())
        }
        return string(record), nil
}


func main() {
        fmt.Println("Inside main...")
        chaincode, err := contractapi.NewChaincode(new(SmartContract))

        if err != nil {
                fmt.Printf("Error create mycc chaincode: %s", err.Error())
                return
        }

        if err := chaincode.Start(); err != nil {
                fmt.Printf("Error starting mycc chaincode: %s", err.Error())
        }
}

