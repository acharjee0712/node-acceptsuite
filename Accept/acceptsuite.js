const express = require('express');
const app = express();
var fs = require("fs");
var http = require('http');
var ApiContracts = require('./Service/sdk-node-master/lib/apicontracts')
var getcustomerprofile = require('./Service/Authorizenet-Api/CustomerProfiles/get-customer-profile')
var getacceptcustomerprofilepage = require('./Service/Authorizenet-Api/CustomerProfiles/get-accept-customer-profile-page')
var getanacceptpaymentpage = require('./Service/Authorizenet-Api/PaymentTransactions/get-an-accept-payment-page')
var createpayment = require('./Service/Authorizenet-Api/PaymentTransactions/create-an-accept-payment-transaction')
var sslOptions = { //ssl certficate
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync ('cert.pem'),
  passphrase: '0712'
};
app.use(function (req, res, next) { //allow origin for cors
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.get('/acceptsuite/validateCustomer', (req, resp, next) => { //route to get customer profile
  var apiloginid = req.query.apiLoginId;
  var transactionkey = req.query.apiTransactionKey;
  var customerprofileid = req.query.customerId;
  var obj = new acceptResponse();
  getcustomerprofile.getCustomerProfile(apiloginid, transactionkey, customerprofileid, function (res) {
    if (res != null) {
      if (res.getMessages() != null && res.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        obj.successValue = res.getMessages().getMessage()[0].getCode() + " " +
          res.getMessages().getMessage()[0].getText()
        obj.status = 'True'
      }
      else {
        obj.status = 'False'
        obj.errorMessag = "error" + " " + res.getMessages().getMessage()[0].getCode() + " " +
          res.getMessages().getMessage()[0].getText()
      }
    }
    else {
      obj.Status = 'False'
      return null
    }
    resp.send(obj)
  });
});
app.get('/acceptsuite/AcceptCustomer', (req, resp, next) => { //route to get accept customer profile page
  var apiloginid = req.query.apiLoginId;
  var transactionkey = req.query.apiTransactionKey;
  var customerprofileid = req.query.customerId;
  var hostedPaymentIFrameCommunicatorUrl = req.query.iFrameCommunicatorUrl;
  var obj = new acceptResponse();
  getacceptcustomerprofilepage.getAcceptCustomerProfilePage(apiloginid, transactionkey, customerprofileid,
    hostedPaymentIFrameCommunicatorUrl, function (res) {
      if (res != null) {
        if (res.getMessages() != null && res.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
          obj.successValue = res.getToken();
          obj.status = 'True'
        }
        else {
          obj.status = 'False'
          obj.errorMessag = "error" + " " + res.getMessages().getMessage()[0].getCode() + " " +
            res.getMessages().getMessage()[0].getText()
        }
      }
      else {
        obj.Status = 'False'
        return null
      }
      resp.send(obj)
    })
});
app.get('/acceptsuite/AcceptHosted', (req, resp, next) => { // route to accept payment page
  var apiloginid = req.query.apiLoginId;
  var transactionkey = req.query.apiTransactionKey;
  var customerprofileid = req.query.customerId;
  var iFrameCommunicatorUrl = req.query.iFrameCommunicatorUrl;
  var obj = new acceptResponse();
  getanacceptpaymentpage.getAnAcceptPaymentPage(apiloginid, transactionkey, customerprofileid,
    iFrameCommunicatorUrl, function (res) {
      if (res != null) {
        if (res.getMessages() != null && res.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
          obj.successValue = res.getToken();
          obj.status = 'True'
        }
        else {
          obj.status = 'False'
          obj.errorMessage = "Failed to get hosted payment page Error: " + " " +
            res.getMessages().getMessage()[0].getCode() + " " +
            res.getMessages().getMessage()[0].getText()
        }
      }
      else {
        obj.Status = 'False'
        return null
      }
      resp.send(obj)
    })
});
app.get('/acceptsuite/AcceptJs', (req, resp, next) => { //route to create an accept payment transaction
  var apiloginid = req.query.apiLoginId;
  var transactionkey = req.query.apiTransactionKey;
  var token = req.query.token;
  var obj = new acceptResponse();
  createpayment.createAnAcceptPaymentTransaction(apiloginid, transactionkey, token, function (res) {
    if (res != null) {
      if (res.getMessages() != null && res.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        obj.successValue = res.getTransactionResponse().getTransId();
        obj.status = 'True'
      }
      else {
        obj.status = 'False'
        obj.errorMessage = "Failed Transaction" + " " + res.getMessages().getMessage()[0].getCode() + " " +
          res.getMessages().getMessage()[0].getText()
      }
    }
    else {
      obj.Status = 'False'
      return null
    }
    resp.send(obj)
  })
});
http.createServer(sslOptions, app).listen(process.env.PORT || 8080, function () {
 console.log('server started in 8080');
});
//  // Accept Response class is returning the response from Sample code API's based on status
//     * if status is true it will return successValue.
//      * if status is false it will return errorMessage.
class acceptResponse {
  getJSON() {
    utils.delete_null_properties(this, true);
    var obj = { 'ErrorResponse': this };
    return obj;
  }
  constructor(obj) {
    if (arguments.length == 1) {
      if (('successValue ' in obj) && (obj.successValue != null)) { this.setSuccessValue(obj.successValue); }
      if (('errorMessage' in obj) && (obj.errorMessage != null)) { this.setErrorMessage(new MessageType(obj.errorMessage)); }
      if (('status' in obj) && (obj.status != null)) { this.setStatus(obj.Status) }
    }
    else {
      this.setSuccessValue(null);
      this.setErrorMessage(null);
      this.setStatus(null);
    }
  }
  setSuccessValue(p_successValue) { this.successValue = p_successValue; }
  getSuccessValue() { if ('successValue' in this) { return this.successValue; } }
  setErrorMessage(p_errorMessage) { this.errorMessage = p_errorMessage; }
  getErrorMessage() { if ('errorMessage' in this) { return this.errorMessage; } }
  setStatus(p_status) { this.status = p_status; }
  getValue() { if ('status' in this) { return this.status; } }
}


