'use strict';

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;


function getCustomerProfile(apiloginid, transactionkey, customerProfileId, callback) {

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(apiloginid);
	merchantAuthenticationType.setTransactionKey(transactionkey);

	var getRequest = new ApiContracts.GetCustomerProfileRequest();
	getRequest.setCustomerProfileId(customerProfileId);
	getRequest.setMerchantAuthentication(merchantAuthenticationType);

	var ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());

	ctrl.execute(function () {

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetCustomerProfileResponse(apiResponse);

		if (response != null) {
			if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {

				console.log('Customer profile ID : ' + response.getProfile().getCustomerProfileId());
				console.log('Customer Email : ' + response.getProfile().getEmail());
				console.log('Description : ' + response.getProfile().getDescription());
			}
			else {

				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else {
			console.log('Null response received');
		}

		callback(response);
	});
}

if (require.main === module) {

	getCustomerProfile('1813212446', function () {
		console.log('getCustomerProfile call complete.');
	});
}

module.exports.getCustomerProfile = getCustomerProfile;