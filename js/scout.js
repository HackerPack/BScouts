function scout(){

	ref.authWithOAuthPopup("facebook", function(error, authData) {
  		if (error) {
   			console.log("Merchant ID not recognized", error);
            alert("Merchant ID not recognized. Re-enter the merchant ID")
  		} else {
  			console.log("Merchant exists", authData.facebook.cachedUserProfile.first_name);
  		}
	}, {
  		remember: "sessionOnly"
	});
}
