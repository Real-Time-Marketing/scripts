//RTM-RTR script version 1.0.1
var globalbID_;
var RTRLIB = RTRLIB || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
            var bID = _args[0];
            globalbID_=bID;
            /*THIS IS FOR HTTP REQUEST*/
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var div = document.getElementById('rtr-embed-holder');
                    div.innerHTML +=  this.responseText;
                }
            };
            var params = 'bID='+bID;
            var url = 'https://dashboard.realtimemarketing.com/embed_rtr?'+params;
            console.log(url);
            xhttp.open("GET", url, true);
            xhttp.send();
        },
        closeEmbed: function(){
            //put closing embed code here
            rtrTogglePane();
        },
    };
}());

function rtrTogglePane() {
    document.getElementById("rtr-widget").classList.toggle("visible");
    document.getElementById("rtr-button--close").classList.toggle("visible");
    document.getElementById("rtr-mask").classList.toggle("visible");
    document.body.classList.toggle("rtr-is-active");

    const element = document.querySelector("#rtr-button--close");
    const visible = element.classList.contains("visible");
 
    if(visible == true){
        document.getElementById("iframe_review_list").contentWindow.reviews();
        fetch('https://dashboard.realtimemarketing.com/p/rtr/actions?action=increment-page-views&bID='+globalbID_,
            {
                method: "POST",
            },
        ).then(function(response) {
            console.log('rtr.pageviews++ logged');
        });
    }
}
