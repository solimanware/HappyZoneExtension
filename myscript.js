//https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom

console.log('you should feel good always')
initScript()

var oldURL = location.href
setInterval(function () {
    var newURL = location.href

    if (newURL != oldURL) {
        setTimeout(() => {
            initScript();
        }, 500)
    }
    oldURL = location.href

}, 100);

function initScript() {
    console.log('script started');
    var observeDOM = (function () {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            eventListenerSupported = window.addEventListener;

        return function (obj, callback) {
            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) 
                        callback(mutations[0].addedNodes);
                    }
                );
                // have the observer observe foo for changes in children
                obs.observe(obj, {
                    childList: true,
                    subtree: true
                });
            }
        };
    })();

    let oldPosts = [];
    // Observe a specific DOM element:
    observeDOM(document.getElementById('mainContainer'), function (e) {

        let allPagePosts = Array.from(document.getElementsByClassName('userContent'));
        let newPosts = returnNewElementsFromNewArray(oldPosts, allPagePosts)
        for(let post of newPosts){
            oldPosts.push(post)
        }

        for (let element of newPosts) {
            console.log(element.textContent);

            var english = /^[A-Za-z0-9]*$/;
            if (element.textContent && english.test(element.textContent[0])) {

                console.log('sending ajax');
                //console.log(element.textContent, english.test(element.textContent[0]));
                chrome
                    .runtime
                    .sendMessage({
                        method: 'POST',
                        action: 'xhttp',
                        url: 'https://happy-zone.herokuapp.com/api/isSadPost',
                        data: `text=${element.textContent}`
                    }, (res) => {

                        console.log(res);
                        var resObj = JSON.parse(res)
                        var isSad = resObj.data.result
                        if (isSad) {
                            console.log('I found a sad post');
                            element
                                .classList
                                .add("blur");
                            element
                                .onclick = function(){
                                    this.classList.toggle("blur")
                                }
                        }

                    });
            }

        }

    });

    function returnNewElementsFromNewArray(oldArr, newArr) {
        return newArr.filter(val => !oldArr.includes(val))
    }

}
