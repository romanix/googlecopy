console.log('Hi Im injected Script !!!!!! ~~~~~~~ !!!!!!!');
// http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script/9517879#9517879
// Methode #1

/* was ist die aktuelle URL ? Sind wir auf Web, Maps, Images, ... */

// criteria for google home page
// 1) "I'm feeling lucky" 

var imfeelingluckyBtn = null;
var isGoogleHomePage = null;


//var target_host = "https://localhost:3000";
var target_host = "https://188.226.133.11:3000" // production server 

 _uuid = null; // Create unique  id for  search term 

  //-- uuid  function
  uuid = function(a) {
      if (a) {
          return (a ^ Math.random() * 16 >> a / 4).toString(16);
      } else {
          return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[108]/g, uuid);
      }
  };

  //-- assume user is on google page with links to image, news, maps, etc:
  try { 
      imfeelingluckyBtn = document.getElementById("gbqfsb");       
      if (imfeelingluckyBtn.textContent.search("lucky") > 0) {
          isGoogleHomePage = true
      }else{
          isGoogleHomePage = false
      }
  }
  catch(err){ var searchterm = ""; 
      console.log("Exception while trying to locate the Goolge I'm feelling Lucky button.");
      isGoogleHomePage = false;
  }

  //console.log("isGoogleHomePage = " + isGoogleHomePage);

  /* Suchbegriffeingabe in 
    (a) Omnibox 
    (b) Suchfeld oben rechts 
    (c) Suchfeld in der Mitte der Page 
    (d) Suchfeld oben   */


  /* gab es einen "Seitenwechsel" via HTML 5 History URL Update bzw. pushState ? */
  /* was ist der aktuelle Suchbegriff? Ist es der gleiche wie beim letzten Aufruf? */

console.log("run content.js");




// from: http://stackoverflow.com/questions/9114051/how-do-i-detect-clicks-on-links

document.body.onclick = function(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    // console.log('target ', target);    
    // console.log('nodeName: ', target.nodeName);  
    // sometimes nodeName:  is EM   ???
    
    if(target.nodeName === 'A') {
        //console.log('target: ',  $(target).text());
        console.log("URL clicked " + target.getAttribute("data-href"));
        var posturl =  target_host + '/update/';
        console.log("post url: ", posturl);        
        var postData  = {  uuid: _uuid,  url: target.getAttribute("data-href") , title: target.text } ;
        console.log('data to post:  ', postData);
        httpPost(posturl, postData);
    }
};


// fetch search info and send it to my server
function doit(caller) {
    // get the search terms
    var searchterm = "";
    console.log('caller is: ', caller);

    // assume user is on google page with links to image, news, maps, etc:
    try { searchterm = document.querySelector('[name="q"]').value; 
    }
    catch(err){ var searchterm = ""; 
        console.log("Exception: not input field with name 'q' found.")
    }

    if (searchterm === "") {
        // assume user is on google home page (e.g. on Ubuntu) with fake-input field
        try {
            fakebox_input = document.getElementById("fakebox-input");
            // next step: read content from Chrome Browser Omnibox once user presses enter key
            // TODO
        }
        catch(err) {
            console.log("Exception: no fakebox-input (most likely user is not on google home page")
        }
    };

    try  {var gpage = document.getElementsByClassName("hdtb_msel")[0].innerText;} // google page (e.g. images
    catch(err){ console.log("in catch clause ...");}
    var pathname = window.location.pathname;
    console.log("caller = " + caller + "| searchterm = " + searchterm);
    
    // don't submit the same search terms more than once
    // TODO
    // send search term to the server   
    
    var posturl = target_host +  "/create";  
    _uuid  = uuid();
    var postData =  { gpage: gpage,  searchterm: searchterm, uuid: _uuid, user: _usersettings  }
    console.log('prepare  data posting ...', postData);
    httpPost(posturl, postData);

    return searchterm;
}


// function to make HTTP requests without using JQuery 
function httpPost(posturl, postData) {

    console.log('user settings before post', _usersettings.active);

    if(!_usersettings.active)  { console.log('Extension disabled quit here !!!');   return;  }  // Extension is not  Active Dont send any data to server  !!! 

    var xhr = new XMLHttpRequest();
    xhr.open("POST", posturl, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('xhr response: ', xhr.responseText);
        } else {
          console.error('hhr status: ', xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error('xhr error:', xhr.statusText);
    };

    xhr.send(JSON.stringify(postData));
}


// function httpGet(theUrl)
// {
//     var xmlHttp = null;
//     xmlHttp = new XMLHttpRequest();
//     xmlHttp.open( "GET", theUrl, false );
//     xmlHttp.send( null );
//     return xmlHttp.responseText;
// }


// get search input HTML element which is <input type="text" ...> but very nested and with lots of classes
// use querySelector because sometimes its an array sometimes not. querySelector makes this irrelevent
var input_element = document.querySelector('[name="q"]')

// detect when search terms change
// doesn't cover changes through auto-suggested list.  

//input_element.addEventListener("change", doit("on change event") );


// if user clicks search button
var button = document.querySelector('[name="btnG"]');
button.addEventListener("click", function() {
    doit("on button click event");
    });

// if the user clicks on one of the auto suggest list entries below the search input field
// problem: when coming to the HTML page, there are not yet any auto-suggests
// so the script can't do the job

// create a list of the auto-suggest entries (list of div elements, no URLs)
autosuggests = document.getElementsByClassName("sbqs_c");

// attach .click() event listeners to the auto-suggested search term entries
for (var i = autosuggests.length - 1; i >= 0; i--) {
    autosuggests[i].addEventListener("click", function() { 
    doit("on auto suggest");
    });
};


// if user clicks enter key
document.onkeydown = function (evt) {
  var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
  if (keyCode == 13) {
    // For Enter.
    doit("on enter key event")
  }
};


// on www.google.ch sometimes there is no change event in combination with auto suggest
// but the URL might change
// src: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers.onhashchange

function locationHashChanged() {
    // if we are still on a google page (maps, www, .ch, .com, ...)
    if (window.location.origin.search("google") >= 0) {
        doit("locationHashChanged")
        }
}

window.onhashchange = locationHashChanged;
