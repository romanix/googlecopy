// from: https://developer.chrome.com/extensions/options
console.log("run options.js");

/*
function loadjquery() {
    var jq = document.createElement('script');
    jq.src = chrome.extension.getURL('jquery.min.js');
    jq.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(jq);
}
*/


function save_options() {

        console.log('Save otions button has been clicked !!!');
  
        var _sex = document.getElementById("sex").value;
        var _birthyear = document.getElementById("birthyear").value;
        var _use  = document.getElementById("use").value;
        var _pseudonym = document.getElementById("pseudonym").value;
        var _btcaddress = document.getElementById("btcaddress").value;

        console.log("_sex :", _sex);
        console.log("_birthyear :", _birthyear);
        console.log("_use :", _use);
        console.log("_pseudonym :", _pseudonym);
        console.log("_btcaddress :", _btcaddress);

        var formdata = {
            'sex': _sex,
            'birthyear': _birthyear, 
            'use': _use,
            'pseudonym': _pseudonym,
            'btcaddress': _btcaddress,
            'active': false // to do read from icon box ?             
        };
        
        var usersettings = {};
        usersettings["data"] = formdata;
            
        chrome.storage.sync.set(usersettings, function(result) {          
            console.log('saved ...');     
            window.alert("Settings updated successfully");

            //-- Request userdata memory update  
            //-- send message to backround script 
            chrome.runtime.sendMessage({method: "updateUserData"}, function(response) {  
                console.log('Update response : ', response);
            });

        });
} 


function restore_options() {
    console.log('load settings from storage !!!');  
    chrome.storage.sync.get('data' , function(items) {
          console.log(items.data);
          document.getElementById('sex').value = items.data.sex;
          document.getElementById('birthyear').value = items.data.birthyear;
          document.getElementById('use').value = items.data.use;
          document.getElementById('pseudonym').value = items.data.pseudonym;
          document.getElementById('btcaddress').value = items.data.btcaddress;
    });

}




document.addEventListener('DOMContentLoaded', restore_options);
//document.addEventListener('DOMContentLoaded', loadjquery);
document.getElementById('saveoptions').addEventListener('click', save_options);
