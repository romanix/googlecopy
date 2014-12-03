/*
   chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
          console.log('Page uses History API and we heard a pushSate/replaceState.');
          // do your thing
  });

*/
console.log('Hi Im Background script !!!');


var userdata = {};

//-- load user data in memory ? 
chrome.storage.sync.get('data', function(d) {                    
        userdata = d;        
});

//-- http://stackoverflow.com/questions/9915311/chrome-extension-code-vs-content-scripts-vs-injected-scripts


// omnibox
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    alert('You just typed "' + text + '"');
  });


// Tab 
chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab) {    
      
      chrome.pageAction.show(tabid);      
      seticonStyle(tabid, userdata);
      // if (changeInfo.status == 'complete') {
      //    chrome.tabs.executeScript(tabid,{file:"inject_script.js"});
      // }
});


//-- Listen content script 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content script send BG  getUserData method message');
    if (request.method == "getUserData"){      
      sendResponse({status:  userdata });
    }else{ 
      sendResponse({}); // snub them.
    }    
});

//-- Listen propery  page: updateUserData
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {       
      console.log('???'); 
      chrome.storage.sync.get('data', function(d) {                    
        userdata = d;        
      });
});

var activated = new Array();

chrome.pageAction.onClicked.addListener(function(tab) { 
   
      //userdata.data.active = true;          
      var usersettings = {};
      usersettings["data"] = userdata.data;
    
      userdata.data.active = !userdata.data.active;
      seticonStyle(tab.id, userdata);

      chrome.storage.sync.set(usersettings, function(result) {          
          //console.log('saved ...');
      });

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
           chrome.tabs.sendMessage(tabs[0].id, usersettings, function(response) {
                  //--  Dont need response here !!
           });  
    });

});


function seticonStyle(tabid, userdata){
      
    if(userdata.data.active){
          chrome.pageAction.setIcon({tabId: tabid, path: 'images/icon19.png'});
          //userdata.data.active = false;          
      }else{          
          chrome.pageAction.setIcon({tabId: tabid, path: 'images/icon19disabled.png'});
          //userdata.data.active = true;          
      }

} 
