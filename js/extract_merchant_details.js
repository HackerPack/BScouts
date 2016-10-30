var apiKey = "37e025004d343eb5fbb69e6810b8cf18";
var merchantId = "";
var customerPurchases = {};
var zipAmountMap = {};
function getMerchantDetails(callback_success, callback_failure) {
	$.ajax({
		url : "http://api.reimaginebanking.com/merchants/" + merchantId + "?key=" + apiKey,
		type : 'GET',
		success : function(data) {
			merchantLat = data.geocode.lat;
			merchantLon = data.geocode.lng;
			if (callback_success ) callback_success();
		},
		error: function(data) {
			if (callback_failure ) callback_failure();
		}
	});
}
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

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function processLoadedData(zipAmountMap) {
	topAmounts = [];
	topCusts = [];
	csvdata = "zippoi,latitude,longitude,customer_count,amount\n";
	$.each(zipAmountMap, function(k, v) {
		if (k in zips) {
			c = k + "," + Number(zips[k][0]) + "," + Number(zips[k][1]) + "," + v['ccount'] + "," + v['amount'] + "\n";
			csvdata += c
			topAmounts.push([k, v['amount']]);
			topCusts.push([k, v['ccount']]);
		}
	});

	topAmounts.sort(sortFunction);
	topCusts.sort(sortFunction);

	ta = [['Zip', 'Revenue']]
	tc = [['Zip', 'Population']]

	for (i = 0 ; i < 4 ; i++) {
		ta.push(topAmounts[i]);
		tc.push(topCusts[i]);
	}

	loadMap(csvdata, ta, tc);
}

function loadAllDetails() {
	getMerchantDetails();
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
}
