
(function(t) {

    window.setTimeout(function() {
        checkOnModal();
    }, 200); 

    function checkOnModal() {
        if(localStorage.getItem('interactedWithDownload') === null || localStorage.getItem('interactedWithDownload') !== 'true') {
            let modal = document.getElementById('course-download-modal');
            modal.style.display = 'flex';
        }
    }

    window.setTimeout(function() {
        initDisplay();
    }, 200);

    function initDisplay() {
        waitUntilElementExists('.parent_section_selector', 2000000)
            .then((elem) => {
                elem.classList.add('active');
                // grab the first completion indicator elem and add completion to the section
                let section = document.querySelector('#core-course-section-selector').querySelector('.active').dataset.subsections.split(" ")[0];
                let divider = document.querySelector('.thinkmodular-tabs.active');
                divider = divider.querySelector('ion-item-divider');

                prependCompletion(section, divider);

                toggleNextButton();

                // open general module
                let activeSection = document.querySelector('.thinkmodular-tabs.active').querySelector('.section-container');
                openModule(activeSection);

            });
    }

    function prependCompletion(section, divider) {
        // grab completion info from hidden div
        let completionIndicator = document.createElement('div');
        completionIndicator.classList.add('completion-indicator');
        let completed = document.querySelector('.' + section).dataset.completed;
        if(completed === 'true') {
            completionIndicator.innerHTML = '<span class="completed-icon icon custom-icon d-inline-flex" style="color: green; height: 12px;"></span>';
        } else {
            completionIndicator.innerHTML = document.querySelector('.' + section).querySelector('.completion_percentage').innerHTML;
            completionIndicator.style.cssText += "background: #fff;";
        }

        completionIndicator.style.cssText += "color: #1A1A1A; border-radius: 5px; text-align: center; padding: 3px; font-size: 0.8em; font-weight: 600; display: flex; justify-content: center; align-items: center;";
        divider.prepend(completionIndicator);
    }

    function toggleNextButton() {
        // check if active selector is the last in the list
        let currentSection = document.querySelector('#core-course-section-selector').querySelector('.active');
        let allSections = document.querySelector('#core-course-section-selector').querySelectorAll('.parent_section_selector');
        let currentIndex;
        allSections.forEach((section, index) => {
            if(section === currentSection) {
                currentIndex = index;
            }
        });

        let btnCont = document.getElementById('nav-btn-container');
        let nextBtn = btnCont.querySelector('#nextBtn');
        let prevBtn = btnCont.querySelector('#prevBtn');

        if(currentIndex === allSections.length-1) {
            nextBtn.style.display = 'none';
            prevBtn.style.display = 'block';
        } else if(currentIndex === 0) {
            nextBtn.style.display = 'block';
            prevBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
            prevBtn.style.display = 'block';
        }
    }

    /**
     * Get the closest matching element up the DOM tree.
     * @private
     * @param  {Element} elem     Starting element
     * @param  {String}  selector Selector to match against
     * @return {Boolean|Element}  Returns null if not match found
     */
    let getClosest = function ( elem, selector ) {

        // Element.matches() polyfill
        if (!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1;
                };
        }

        // Get closest match
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            if ( elem.matches( selector ) ) return elem;
        }

        return null;

    };

    t.clickSectionTitle = function(event) {
        //console.log(getClosest(event.target, 'core-course-module'));
        //let sectionTitle = getClosest(event.target, 'core-course-module').querySelector('ion-item');
        
        let sectionTitle = getClosest(event.target, 'ion-item').previousElementSibling.querySelector('ion-item');
        sectionTitle.click();
        let checkExist = setInterval(function() {
            let pageCont = getClosest(sectionTitle, 'page-core-course-section').parentNode;
            let iframeCont = pageCont.querySelector('page-addon-mod-h5pactivity-index');
            if(iframeCont) {
                addListenerToH5P();
                clearInterval(checkExist);
            }
        }, 100);
    };


    function addListenerToH5P() {
        waitUntilElementExists('iframe', 20000)
            .then((el) => {
                makeFullScreenContainer(el);
            });
    }

    const waitUntilElementExists = (DOMSelector, MAX_TIME = 10000) => {
        let timeout = 0;
        const waitForContainerElement = (resolve, reject) => {
            let container = document.querySelector(DOMSelector);
            timeout += 30;
        
            if (timeout >= MAX_TIME) reject('Element not found');
        
            if (!container || container.length === 0) {
                setTimeout(waitForContainerElement.bind(this, resolve, reject), 30);
            } else {
                resolve(container);
            }
        };
      
        return new Promise((resolve, reject) => {
          waitForContainerElement(resolve, reject);
        });
    };
    

    function makeFullScreenContainer(iframeElem) {
        // create new div
        let fullScreenDiv = document.createElement('div');
        fullScreenDiv.classList = "h5p-modal";
        fullScreenDiv.style.cssText = "position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999; display: flex; justify-content: center; align-items: center; background-color: #000;";

        // create iframe wrapper
        let iframeWrapper = document.createElement('div');
        iframeWrapper.classList.add('iframe-wrapper');

        // create new iframe 
        let newIframe = document.createElement('iframe');
        newIframe.src = iframeElem.src;

        //newIframe.cssText = "height: 250px; width: 250px; position: relative; margin: auto;";
        
        newIframe.addEventListener("load", function() {
            
            // remove iframe resizing class 
            let body = this.contentWindow.document.body || this.contentWindow.document.getElementsByTagName('body')[0];
            body.classList.remove('h5p-resizing');
            console.log(body);    

            // create new iframe css style elem
            let css = '.h5p-resizing { margin: 0 !important; }',
                head = this.contentWindow.document.head || this.contentWindow.document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            head.appendChild(style);
            style.type = 'text/css';
            if (style.styleSheet){
                // This is required for IE8 and below.
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            
            let innerIframe = this.contentWindow.document.querySelector('iframe');
            
            let iframeHeight = innerIframe.scrollHeight;
            let iframeWidth = innerIframe.scrollWidth;

            //let ratio = iframeHeight/iframeWidth;
            let ratio = 1.32;
            console.log('initial ratio', iframeWidth/iframeHeight);
            console.log('initial height', iframeHeight);
            console.log('initial width', iframeWidth);

            let winWidth = window.innerWidth;
            let winHeight = window.innerHeight;
            let iframeWrapperWidth = winHeight*ratio;

            if(winWidth > winHeight) { // we know we're in landsape mode
                //iframeWrapper.style.width = '60%';
                iframeWrapper.style.cssText = "height: 100%; width: " + iframeWrapperWidth + "px;";
            } else {
                iframeWrapper.style.cssText = 'height: auto; width: 100%;';
            }


            window.iframeHeight = iframeHeight;
            window.iframeWidth = iframeWidth;
            window.iframeWrapper = iframeWrapper;


            // create new iframe css style elem
            let css2 = '.h5p-fullscreen { display: none !important; }',
                head2 = innerIframe.contentWindow.document.head || innerIframe.contentWindow.document.getElementsByTagName('head')[0],
                style2 = document.createElement('style');

            head2.appendChild(style2);
            style2.type = 'text/css';
            if (style2.styleSheet){
                // This is required for IE8 and below.
                style2.styleSheet.cssText = css2;
            } else {
                style2.appendChild(document.createTextNode(css2));
            }

            // catch for errors in resizing
            setTimeout(function(){
                let realHeight = newIframe.clientHeight;
                let realWidth = newIframe.clientWidth;
                let realRatio = realWidth/realHeight;
                console.log('real ratio', realRatio);

                let realTargetWidth = winHeight*realRatio;

                if(realRatio !== ratio) {
                    if(winWidth > winHeight) { // we know we're in landsape mode
                        //iframeWrapper.style.width = '60%';
                        iframeWrapper.style.cssText = "height: 100%; width: " + realTargetWidth + "px;";
                    } else {
                        iframeWrapper.style.cssText = 'height: auto; width: 100%;';
                    }
                }
            }, 300);

            // remove event listener
            newIframe.removeEventListener("load", arguments.callee);
        });
        
        
        iframeWrapper.appendChild(newIframe);
        fullScreenDiv.appendChild(iframeWrapper);

        let exitbutton = document.createElement('div');
        exitbutton.id = "exit-button";
        exitbutton.innerText = 'x';
        exitbutton.style.cssText = "position: absolute; top: 5px; right: 5px; color: #fff; font-size: 2em; font-family: sans-serif;";
        exitbutton.addEventListener('click', () => {
            let shouldGoBack = removeModal(fullScreenDiv, true);
            if(shouldGoBack) {
                goBack();
            }
        });
        fullScreenDiv.appendChild(exitbutton);
        document.querySelector('body').appendChild(fullScreenDiv);

        // to handle back button issue on android 
        document.addEventListener('backbutton', function(event) {
            //alert(exitbutton.innerHTML);
            event.preventDefault();
            removeModal(fullScreenDiv, false); 
        });      

        console.log(window);
        window.addEventListener('resize', resizeIframeContainer, false);
    }

    function resizeIframeContainer(e) {
        let iframe = document.querySelector('.iframe-wrapper').querySelector('iframe');
        //let iframeHeight = e.currentTarget.iframeHeight;
        //let iframeWidth = e.currentTarget.iframeWidth;
        let iframeWrapper = e.currentTarget.iframeWrapper;

        let innerIframe = iframe.contentWindow.document.querySelector('iframe');
            
        let iframeHeight = innerIframe.scrollHeight;
        let iframeWidth = innerIframe.scrollWidth;
        console.log('iframe height resize', iframeHeight);
        console.log('iframe width resize', iframeWidth);

        //let ratio = iframeHeight/iframeWidth;
        let ratio = iframeWidth/iframeHeight;
        console.log('resize ratio', iframeWidth/iframeHeight);

        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let iframeWrapperWidth = winHeight*ratio;

        if(winWidth > winHeight) { // we know we're in landsape mode
            //iframeWrapper.style.width = '60%';
            iframeWrapper.style.cssText = "height: 100%; width: " + iframeWrapperWidth + "px;";
        } else {
            iframeWrapper.style.cssText = 'height: auto; width: 100%;';
        }

        // catch for errors in resizing
        let checkRealRatio = setInterval(function(){
            let realHeight = iframe.clientHeight;
            let realWidth = iframe.clientWidth;
            let realRatio = realWidth/realHeight;
            console.log('real ratio', realRatio);

            let realTargetWidth = winHeight*realRatio;
            let wrapperHeight = document.querySelector('.iframe-wrapper').clientHeight;
            console.log('wrapper height', wrapperHeight);
            console.log('real height', realHeight);
            console.log('real width', realWidth);

            if(realHeight > realWidth) {
                console.log('taller than it is wide');
                clearInterval(checkRealRatio);
            } else if(realHeight === wrapperHeight || document.querySelector('.iframe-wrapper') === null || winWidth < winHeight){
                clearInterval(checkRealRatio);
            } else if(realRatio !== ratio) {
                if(winWidth > winHeight) { // we know we're in landsape mode
                    //iframeWrapper.style.width = '60%';
                    iframeWrapper.style.cssText = "height: 100%; width: " + realTargetWidth + "px;";
                } else {
                    iframeWrapper.style.cssText = 'height: auto; width: 100%;';
                }
            }
            
        }, 300);
    }


    function removeModal(fullScreenDiv, shouldGoBack) {
        fullScreenDiv.remove();
        let checkBtnExist = setInterval(function() {
            let btnCont = document.querySelector('.alert-button-group');
            let cancelBtn = btnCont.querySelector('.alert-button');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    //document.querySelector('.h5p-modal').style.display = "flex";
                    makeFullScreenContainer(fullScreenDiv.querySelector('iframe'));
                });
            }
            clearInterval(checkBtnExist);
        }, 100);

        return shouldGoBack;
    }

    function goBack() {
        document.querySelector('.back-button').click();
    }


    t.toggleModules = function(event) {


        let sectionContainer = getClosest(event.target, '.section-container');
        
        openModule(sectionContainer);
        hideInactiveModules(sectionContainer);

        let divider = sectionContainer.querySelector('ion-item-divider');
        let offsetTop = divider.offsetTop;
        let scrollContainer = getClosest(document.getElementById('thinkmod_topics_wrapper'), '.scroll-content');
        scrollContainer.scroll({top: offsetTop, behavior: 'smooth'});
    };

    function hideInactiveModules(activeSection) {
        let allModules = document.querySelectorAll('.module-container');
        allModules.forEach(mod => {
            // check if the parent cont is the same as event.target
            let parentCont = getClosest(mod, '.section-container');
            let parentDivider = parentCont.querySelector('ion-item-divider');
            if(parentCont !== activeSection) {
                mod.style.display = "none";
                parentDivider.querySelector('.custom-icon').classList.remove('rotated');
            }
        });
    }

    function openModule(sectionContainer) {
        let divider = sectionContainer.querySelector('ion-item-divider');

        if(divider.classList.contains('selected')) {
            divider.classList.remove('selected');
            divider.querySelector('.custom-icon.arrow-icon').classList.remove('rotated');

        } else {
            divider.classList.add('selected');
            divider.querySelector('.custom-icon.arrow-icon').classList.add('rotated');
        }

        let modules = sectionContainer.querySelectorAll('.module-container');
        modules.forEach(module => {
            if(module.style.display === "block") {
                module.style.display = "none";
            } else {
                module.style.display = "block";
            }
        });

    }

    t.selectParentSection = function(event) {
        let options = document.querySelector('#section-selector-modal').querySelectorAll('a');
        options.forEach(option => {
            let link = getClosest(option, 'a');
            link.classList.remove('active');
        });
        let tar = getClosest(event.target, 'a'); 
        tar.classList.add('active');


        let sectionTitle = event.target.innerText;
        let sectionColor = event.target.parentNode.parentNode.style.background;

        setButtonHTML(sectionTitle, sectionColor);

        // hide currentl active tabs
        let currentTabs = document.getElementsByClassName('active thinkmodular-tabs');
    
        //hide current
        Array.from(currentTabs).forEach(tabs => {
            tabs.classList.remove('active');
        });


        //  retrieve subsections from data attribute
        let subSections = event.target.parentNode.parentNode.dataset.subsections.split(" ").filter(function(el) {return el.length != 0});
        let parentClassName;
        let parentClassList = event.target.parentNode.parentNode.classList;
        for (let i = parentClassList.length - 1; i >= 0; i--) {
            let className = parentClassList[i];
            if (className.startsWith('section_')) {
                parentClassName = className;
            }
        }

        displaySubsectionTabs(subSections, parentClassName, sectionColor);

        let sectionSelector = document.getElementById('section-selector-modal');
        sectionSelector.style.display = "none";

    }


    function displaySubsectionTabs(subSections, parentClassName, sectionColor) {
        // find all of the sections that we have in the array
        subSections.forEach(section => {
            
            let sectionContainer = document.querySelector('.' + section + '_tab');
            if(sectionContainer) {
                // display subsection tabs
                let tabElem = getClosest(sectionContainer, '.thinkmodular-tabs');
                tabElem.classList.add('active');
                tabElem.classList.add(parentClassName);

                let divider = tabElem.querySelector('ion-item-divider');
                let color = sectionColor.replace(')', ', 0.15)').replace('rgb', 'rgba');
                divider.style.backgroundColor = color;
                if(divider.innerText.toLowerCase().trim() !== 'general') {
                    divider.onmouseover = function() {
                        this.style.backgroundColor = sectionColor;
                        this.style.color = '#fff';
                    }
                    divider.onmouseout = function() {
                        this.style.backgroundColor = color;
                        this.style.color = '#000';
                    }
                }

                // check if completion exists
                let completionDiv = sectionContainer.querySelector('.completion-indicator');
                if(!completionDiv) {
                    prependCompletion(section, divider);
                }
            }
        });

        toggleNextButton();
    }

    function setButtonHTML(sectionTitle, sectionColor) {
        let button = document.getElementById('core-course-section-button');

        button.querySelector('.core-button-select-text').innerText = sectionTitle;
        button.style.background = sectionColor;

        if(button.innerText.includes('General')) {
            button.style.color = '#3E4755';
        } else {
            button.style.color = '#fff';
        }
    }

    t.viewNextSection = function(event) {
        // hide current active tabs
        let currentTabs = document.getElementsByClassName('active thinkmodular-tabs');
    
        Array.from(currentTabs).forEach(tabs => {
            tabs.classList.remove('active');
        });

        // find active parent section
        let activeParent = document.querySelector('#section-selector-modal').querySelector('.active');
        activeParent.classList.remove('active');
        let sibling = activeParent.nextElementSibling;
        sibling.classList.add('active');
        //  retrieve subsections from data attribute
        let subSections = sibling.dataset.subsections.split(" ").filter(function(el) {return el.length != 0});
        let parentClassName;
        let parentClassList = event.target.parentNode.parentNode.classList;
        for (let i = parentClassList.length - 1; i >= 0; i--) {
            let className = parentClassList[i];
            if (className.startsWith('section_')) {
                parentClassName = className;
            }
        }

        let sectionTitle = sibling.querySelector('h2').innerText;
        let sectionColor = sibling.style.background;
        setButtonHTML(sectionTitle, sectionColor);

        displaySubsectionTabs(subSections, parentClassName, sectionColor);
    };

    t.viewPreviousSection = function(event) {
        // hide current active tabs
        let currentTabs = document.getElementsByClassName('active thinkmodular-tabs');
    
        Array.from(currentTabs).forEach(tabs => {
            tabs.classList.remove('active');
        });

        // find active parent section
        let activeParent = document.querySelector('#section-selector-modal').querySelector('.active');
        activeParent.classList.remove('active');
        let sibling = activeParent.previousElementSibling;
        sibling.classList.add('active');
        //  retrieve subsections from data attribute
        let subSections = sibling.dataset.subsections.split(" ").filter(function(el) {return el.length != 0});
        let parentClassName;
        let parentClassList = event.target.parentNode.parentNode.classList;
        for (let i = parentClassList.length - 1; i >= 0; i--) {
            let className = parentClassList[i];
            if (className.startsWith('section_')) {
                parentClassName = className;
            }
        }

        let sectionTitle = sibling.querySelector('h2').innerText;
        let sectionColor = sibling.style.background;
        setButtonHTML(sectionTitle, sectionColor);

        displaySubsectionTabs(subSections, parentClassName, sectionColor);
    };

    t.showSectionChoices = function(event) {
        let sectionSelector = document.getElementById('section-selector-modal');
        sectionSelector.style.display = "block";
        
    };

    t.closeModal = function(event) {
        let elem = event.target;
        let modal = document.getElementById('course-download-modal');
        let modalContent = document.querySelector('.modal-content');

        if(!elem.closest('#course-download-modal').length && elem !== modalContent && !elem.closest('.modal-content')) {
            modal.style.display = 'none';
        }
    };

    t.modalDismissDownload = function(event) {
        let modal = document.getElementById('course-download-modal');
        modal.style.display = 'none'; 
        localStorage.setItem('interactedWithDownload', 'true');
    };

    t.modalDownloadCourse = function(event) {
        let page = document.querySelector('page-core-course-section');
        let header = page.querySelector('ion-header');
        let toolbar = header.querySelector('.toolbar');
        let buttons = toolbar.querySelectorAll('button');
        let button = buttons[buttons.length-1];
        button.click();

        window.setTimeout(function() {
            clickDownload();
        }, 1000);

        localStorage.setItem('interactedWithDownload', 'true');

        let modal = document.getElementById('course-download-modal');
        modal.style.display = 'none';
        
    };

    function clickDownload() {
        let menu = document.querySelector('core-context-menu-popover');
        let downloadButton = menu.querySelector('a');
        downloadButton.click();
    }


})(this);