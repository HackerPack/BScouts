var apiKey = "37e025004d343eb5fbb69e6810b8cf18";
var merchantId = "57cf75cea73e494d8675ec49";
var customerPurchases = {};
var zipAmountMap = {};

function accountIdToCustomerId(account_id, callback, callback_fail) {
	$.ajax({
		url : "http://api.reimaginebanking.com/accounts/" + account_id + "?key=" + apiKey,
		type : 'GET',
		success : function(data) {
			callback(data.customer_id);
		},
		error: function(data) {
			callback_fail();
		}
	});
}

function getCustomerDetails(account_id, callback, callback_fail) {
	accountIdToCustomerId(account_id, function(customer_id) {
		$.ajax({
			url : "http://api.reimaginebanking.com/customers/" + customer_id + "?key=" + apiKey,
			type : 'GET',
			success : function(data) {
				callback(customer_id, data.address.zip);
			},
			error: function(data) {
				callback_fail();
			}
		});
	}, function() {
		callback_fail();
	});
}
vals  = [];

function processLoadedData(zipAmountMap) {
	$.each(zipAmountMap, function(k, v) {
	});
}

$(document).ready(function() {
	return;
	$.ajax({
		url : "http://api.reimaginebanking.com/merchants/" + merchantId + "/purchases?key=" + apiKey,
		type : 'GET',
		success : function(data) {
			$.each(data, function(i, pValue) {
				account_id = pValue.payer_id;
				if (customerPurchases.hasOwnProperty(account_id)) {
					customerPurchases[account_id]['amount'] += pValue.amount;
					customerPurchases[account_id]['count'] ++;
				}
				else {
					customerPurchases[account_id] = {};
					customerPurchases[account_id]['amount'] = pValue.amount;
					customerPurchases[account_id]['count'] = 1;
				}
			});

			actualLength = Object.keys(customerPurchases).length;
			obtainedLength = 0;
			$.each(customerPurchases, function(account_id, c_val) {
				(function(c_amount, c_count) {
					getCustomerDetails(account_id, function(customer_id, zip) {
						if (zipAmountMap.hasOwnProperty(zip)) {
							zipAmountMap[zip]["customers"][customer_id] = true;
							zipAmountMap[zip]["ccount"] += c_val['count'];
							zipAmountMap[zip]["amount"] += c_amount;
						}
						else {
							zipAmountMap[zip] = {"customers" : {}, "amount" : 0 };
							zipAmountMap[zip]["customers"][customer_id] = true;
							zipAmountMap[zip]["ccount"] = c_val['count'];
							zipAmountMap[zip]["amount"] += c_amount;
						}
						obtainedLength += 1;
						vals.push(obtainedLength);
						if (obtainedLength == actualLength) {
							processLoadedData(zipAmountMap);
						}
					}, function() {
						obtainedLength += 1;
						vals.push(obtainedLength);
						if (obtainedLength == actualLength) {
							processLoadedData(zipAmountMap);
						}
					});
				})(c_val['amount'], c_val['count']);
			});
		}
	});
});
