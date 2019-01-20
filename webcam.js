function newTab() {
    chrome.tabs.create({active:true});
}

function removeTab() {
    chrome.tabs.query({active:true,currentWindow:true},(tab)=>{
        chrome.tabs.remove([tab[0].id]);
    })
}

function TabForward() {
    chrome.tabs.query({currentWindow:true},(tab)=>{
        console.log(tab);
        chrome.tabs.query({currentWindow:true,active:true},(tab2)=>{
            console.log("current tab = ");
            console.log(tab2);
            let pos =0;
            while(pos<tab.length && tab[pos].id!=tab2[0].id){
                pos++;
            }
            pos++;
            pos = pos%tab.length;
            chrome.tabs.highlight({tabs:[pos]});
        });
    });
}

function TabBackward() {
    chrome.tabs.query({currentWindow:true},(tab)=>{
        console.log(tab);
        chrome.tabs.query({currentWindow:true,active:true},(tab2)=>{
            console.log("current tab = ");
            console.log(tab2);
            let pos =0;
            while(pos<tab.length && tab[pos].id!=tab2[0].id){
                pos++;
            }
            pos--;
            pos = pos+tab.length;
            pos = pos%tab.length;
            chrome.tabs.highlight({tabs:[pos]});
        });
    });
}

function ScrollUp() {
    chrome.tabs.query({active:true,currentWindow:true},(tab)=>{
        chrome.tabs.executeScript(tab[0].id,{code:"window.scrollBy(0,-500)"},()=>{
        });
    });
}

function ScrollDown() {
    chrome.tabs.query({active:true,currentWindow:true},(tab)=>{
        chrome.tabs.executeScript(tab[0].id,{code:"window.scrollBy(0,500)"},()=>{
        });
    });
}

function zoomIn(){
    chrome.tabs.query({active:true,currentWindow:true},(tab)=>{
        chrome.tabs.getZoom(tab[0].id,(zoomFactor) => {
            chrome.tabs.setZoom(tab[0].id,zoomFactor+0.50,()=>{
                console.log("zooming in");
            });
        });
    });
}

function zoomOut(){
    chrome.tabs.query({active:true,currentWindow:true},(tab)=>{
        chrome.tabs.getZoom(tab[0].id,(zoomFactor) => {
            chrome.tabs.setZoom(tab[0].id,zoomFactor-0.25,()=>{
                console.log("zooming in");
            });
        });
    });
}

var video = document.getElementById('video');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.srcObject = stream;
    });
}
// Elements for taking the snapshot
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var video = document.getElementById('video');
var input = $("#image");
var form = $("form");

let arr = [];
const fun = async(value) => {
    
}

var intId;
const postMan = () => {
    intId = setInterval(() => {
		context.drawImage(video, 0, 0, 640, 480);
        let encode = canvas.toDataURL();
		$.ajax({
			url: 'http://localhost:5000/',
			type: 'POST',
			data: { encode },
			success :async function(dat) {
                JSON.parse(dat);
                //console.log(dat);
                res = parseInt(dat);
                console.log(dat, res);
                arr.push(res);
                let i = arr.length, data=0;
                if(i>100)
                {
                    arr.splice(0,1);
                }
                //console.log(arr);
                i = arr.length;
                let cnt = 7;
                let v = Array(cnt, 0);
                for(let k=0; k<cnt; k++)
                {
                    v[k] = 0;
                }
                //a = Array(8, 0);
                for(let k=0;k<8;k++){
                    let j = k+2;
                    v[arr[i-j]]+=1;
                    //console.log(arr[i-j]);
                };
                let temp=0,ans=0;
                for(let j=0;j<cnt;j++){
                    if(v[j] > temp)
                    {
                        temp = v[j];
                        ans = j;
                    }
                };
                if(temp > 1)
                {
                    data = ans;
                }
                else
                {
                    data = 0;
                }
                if(data!=0 && data!=1)
                    delay = 3000;
                console.log(v, temp, data);
                data = data.toString();
                //data = "2";
                console.log(data);
                if(data === "1"){
                    //removeTab();
                }else if(data === "3"){
                    // newTab();
                }else if(data==="6"){
                    ScrollUp();
                }else if(data==="2"){
                    ScrollDown();
                    //window.scrollBy(0,500);
                }else if(data==="4"){
                    TabBackward();
                }else if(data=="5"){
                    TabForward();
                }
                setTimeout(() => {}, delay);
            },
            datatype: "String"
		});
    }, 200);
};
postMan();