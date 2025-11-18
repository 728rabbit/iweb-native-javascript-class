class iwebApp {
    constructor() {
        this.currentLangCode = 'en';
        this.language = {
            en: {
                pleaseSelect: 'Please Select',
                noRecordFound: 'No record found',
                btnConfirm: 'OK',
                btnYes: 'Yes',
                btnNo: 'No',
                errorFileType: 'File type is not allowed.',
                errorMaxFileSize: 'Maximum allowed file size is {num}M.',
                errorRequiredAll: 'Please fill out all required fields correctly.',
                errorRequired: 'Please fill out this field correctly.',
                errorPasswordFormat: 'Password must contain at least 6 characters, including upper/lowercase and numbers (e.g. Abc123).',
                errorEmailFormat: 'Invalid email address format.',
                errorNumberFormat: 'Invalid number format.',
                errorDateFormat: 'Invalid date format.',
                errorTimeFormat: 'Invalid time format.',
                errorGE0: 'Value must be greater than or equal to 0.',
                errorGT0: 'Value must be greater than 0.'
            },
            zh_hant: {
                pleaseSelect: '請選擇',
                noRecordFound: '找不到相關記錄',
                btnConfirm: '確定',
                btnYes: '是',
                btnNo: '否',
                errorFileType: '不允許的檔案類型。',
                errorMaxFileSize: '檔案大小不能超過{num}M。',
                errorRequiredAll: '請正確填寫所有必須欄位。',
                errorRequired: '請正確填寫此欄位。',
                errorPasswordFormat: '密碼必須至少包含6個字符，包括大寫/小寫和數字(例如Abc123)。',
                errorEmailFormat: '無效的郵件地址格式。',
                errorNumberFormat: '無效的數字格式。',
                errorDateFormat: '無效的日期格式。',
                errorTimeFormat: '無效的時間格式。',
                errorGE0: '數值必須大於或等於 0。',
                errorGT0: '數值必須大於 0。'
            },
            zh_hans: {
                pleaseSelect: '请选择',
                noRecordFound: '找不到相关记录',
                btnConfirm: '确定',
                btnYes: '是',
                btnNo: '否',
                errorFileType: '不允许的档案类型。',
                errorMaxFileSize: '档案大小不能超过{num}M。',
                errorRequiredAll: '请正确填写所有必须栏位。',
                errorRequired: '请正确填写此栏位。',
                errorPasswordFormat: '密码必须至少包含6个字符，包括大写/小写和数字(例如Abc123)。',
                errorEmailFormat: '无效的邮件地址格式。',
                errorNumberFormat: '无效的数字格式。',
                errorDateFormat: '无效的日期格式。',
                errorTimeFormat: '无效的时间格式。',
                errorGE0: '数值必须大於或等於 0。',
                errorGT0: '数值必须大於 0。'
            }
        };

        this.md5;
        this.csrfToken;
        
        this.timer;
        this.scrollTimer;
        this.isBusy = false;

        this.datePicker;
        this.timePicker;

        this.uploaderOptions = {};
        this.uploaderFiles = {};
        this.uploaderFilesIgnore = {};

        this.viewerWidth = 0;
        
        this.eventMap = {};
    }

    init() {
        const thisInstance = this;
        
        // Helper function to safely call if the function is defined
        const safeCallFunc = (func, args) => {
            if ((typeof window[func]) === 'function') {
                window[func](args);
            }
        };
        
        // Call optional layout and extra functions if they are defined
        document.addEventListener('DOMContentLoaded', function() {
            // Set current language
            const defaultLang = document.documentElement.lang;
            const htmlLang = (defaultLang ? defaultLang.toLowerCase().replace('-', '_') : 'en');
            if (thisInstance.isValue(htmlLang) && thisInstance.isValue(thisInstance.language[htmlLang])) {
                thisInstance.currentLangCode = htmlLang;
            }
            
            // md5 encrypt
            thisInstance.md5 = (new iMD5());

            // Set CSRF token
            const metaToken = document.querySelector('meta[name="csrf-token"]');
            const csrfTokenContent = metaToken ? metaToken.content : '';
            if (thisInstance.isValue(csrfTokenContent)) {
                const hostname = (location.hostname || '/');
                thisInstance.csrfToken = thisInstance.md5.hash(thisInstance.md5.hash('iweb@' + hostname) + '@' + csrfTokenContent);
            }

            // Init body & component
            thisInstance.initBody();
            thisInstance.initComponent();
            
            // Set iweb-viewer width
            if(document.querySelector('div.iweb-viewer')) {
                thisInstance.viewerWidth = parseInt(document.querySelector('div.iweb-viewer').offsetWidth);
            }

            // Call function
            setTimeout(function() {
                //console.log('DOM done');
                document.body.style.setProperty('--iscrollbar-width', (window.innerWidth - thisInstance.viewerWidth) + 'px');
                
                thisInstance.responsive();
                thisInstance.responsiveTable();
                
                safeCallFunc('iwebCommonLayout', thisInstance.viewerWidth);
                safeCallFunc('iwebLayout', thisInstance.viewerWidth);
                safeCallFunc('iwebChildLayout', thisInstance.viewerWidth);
                safeCallFunc('iwebExtraLayout', thisInstance.viewerWidth);

                safeCallFunc('iwebCommonFunc');
                safeCallFunc('iwebFunc');
                safeCallFunc('iwebChildFunc');
                safeCallFunc('iwebExtraFunc');
                
                thisInstance.copyright();
            }, 100);
        });

        // Page load completed
        window.onload = function() {
            setTimeout(function() {
                //console.log('window done');
                safeCallFunc('iwebCommonLayoutEnd', thisInstance.viewerWidth);
                safeCallFunc('iwebLayoutEnd', thisInstance.viewerWidth);
                safeCallFunc('iwebChildLayoutEnd', thisInstance.viewerWidth);
                safeCallFunc('iwebExtraLayoutEnd', thisInstance.viewerWidth);

                safeCallFunc('iwebCommonFuncEnd');
                safeCallFunc('iwebFuncEnd');
                safeCallFunc('iwebChildEnd');
                safeCallFunc('iwebExtraEnd');
            }, 100);
        };

        // Page resize
        window.addEventListener('resize', function() {
            clearTimeout(thisInstance.timer);
            thisInstance.timer = setTimeout(() => {
                //console.log('window resize');
                if (thisInstance.viewerWidth !== parseInt(document.querySelector('div.iweb-viewer').offsetWidth)) {
                    thisInstance.viewerWidth = parseInt(document.querySelector('div.iweb-viewer').offsetWidth);

                    thisInstance.responsive();
                    thisInstance.responsiveTable();
                    
                    safeCallFunc('iwebCommonLayout', thisInstance.viewerWidth);
                    safeCallFunc('iwebLayout', thisInstance.viewerWidth);
                    safeCallFunc('iwebChildLayout', thisInstance.viewerWidth);
                    safeCallFunc('iwebExtraLayout', thisInstance.viewerWidth);
                }
            }, 100);
        });

        // Page scroll
        window.addEventListener('scroll', function() {
            clearTimeout(thisInstance.scrollTimer);
            thisInstance.scrollTimer = setTimeout(() => {
                //console.log('window scroll');
                safeCallFunc('iwebCommonScroll', window.scrollY);
                safeCallFunc('iwebScroll', window.scrollY);
                safeCallFunc('iwebChildScroll', window.scrollY);
                safeCallFunc('iwebExtraScroll', window.scrollY);
            }, 100);
        });
        
        return thisInstance;
    }

    initBody() {
        const thisInstance = this;

        // Add core class to body
        document.body.classList.add('iweb');

        // Wrap elements except for <script>, <noscript>, and <style>
        const elementsToWrap = Array.from(document.body.children).filter(function(e) {
            return !['SCRIPT', 'NOSCRIPT', 'STYLE'].includes(e.tagName.toUpperCase());
        });
        if (elementsToWrap.length > 0) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('iweb-viewer');
            elementsToWrap.forEach(function(e) {
                wrapper.appendChild(e);
            });
            document.body.prepend(wrapper);
        }

        // Handle click
        document.addEventListener('click', function(e) {
            const target = e.target;

            // Handle anchor click
            if (target.closest('a')) {
                const href = target.closest('a').getAttribute('href');
                if (!thisInstance.isValue(href) || thisInstance.isMatch(href, '#')) {
                    e.preventDefault();
                    
                    // Hide tips message
                    if (target.closest('div.iweb-tips-message')) {
                        target.closest('div.iweb-tips-message').classList.remove('error');
                        target.closest('div.iweb-tips-message').classList.remove('success');
                        target.closest('div.iweb-tips-message').innerHTML = '';
                    } 
                    
                    // Reset autocomplete's input
                    else if (target.closest('a.fill-reset')) {
                        const fillID = target.closest('div.iweb-input-autocomplete').querySelector('input.fill-id');
                        const fillText = target.closest('div.iweb-input-autocomplete').querySelector('input.fill-text');
                        const fillReset = target.closest('div.iweb-input-autocomplete').querySelector('a.fill-reset');
                        fillID.value = '';
                        fillText.value = '';
                        fillText.readOnly = false;
                        fillReset.remove();

                        // Callback
                        const removeCallBack = fillID.getAttribute('data-rfunc');
                        if ((typeof window[removeCallBack]) === 'function') {
                            window[removeCallBack](fillID);
                        }
                    } 
                    
                    // Change page font size
                    else if (target.closest('a.font-switch')) {
                        const newFontSize = target.getAttribute('data-size');
                        if (thisInstance.isValue(newFontSize)) {
                            thisInstance.setCookie('iweb_font_size', newFontSize);
                            document.documentElement.classList.remove(...fontSizeClasses);
                            document.documentElement.classList.add(newFontSize + '-font');
                            fontButtons.forEach(function(e) {
                                e.classList.toggle('current', thisInstance.isMatch(e.getAttribute('data-size'), newFontSize));
                            });
                        }
                    }
                    
                    // Show or hide expand area
                    else if (target.closest('a.control-stretch') && target.closest('div.widget.expand')) {
                        if (target.closest('div.widget.expand').classList.contains('show')) {
                            target.closest('div.widget.expand').classList.remove('show');
                        } 
                        else {
                            target.closest('div.widget.expand').classList.add('show');
                        }
                    }
                }
            }

            // Switch password input display mode
            if (target.closest('button.switch-pwd-type')) {
                const InputPwd = target.closest('div.iweb-input').querySelector('input');
                const ShowIconPwd = target.closest('div.iweb-input').querySelector('i.show');
                const HideIconPwd = target.closest('div.iweb-input').querySelector('i.hide');
                if (thisInstance.isMatch(InputPwd.type, 'password')) {
                    InputPwd.type = 'text';
                    ShowIconPwd.style.display = 'block';
                    HideIconPwd.style.display = 'none';
                } 
                else {
                    InputPwd.type = 'password';
                    ShowIconPwd.style.display = 'none';
                    HideIconPwd.style.display = 'block';
                }
            }

            // Hide autocomplete options
            if (!target.closest('div.iweb-input-autocomplete')) {
                document.querySelectorAll('div.iweb-input-autocomplete ul.fill-options').forEach(function(e1) {
                    e1.remove();
                });
            }

            // Show or hide select options
            if (!target.closest('div.iweb-select')) {
                document.querySelectorAll('div.iweb-select').forEach(function(e1) {
                    e1.classList.remove('show');
                });
            } 
            else {
                const virtualOptions = target.closest('div.iweb-select').querySelector('div.virtual > div.options > ul');
                if (thisInstance.isValue(virtualOptions)) {
                    if (target.closest('a.result')) {
                        if (target.closest('div.iweb-select').classList.contains('show')) {
                            target.closest('div.iweb-select').classList.remove('show');
                        } 
                        else {
                            target.closest('div.iweb-select').classList.add('show');
                        }
                    }
                    
                    document.querySelectorAll('div.iweb-select').forEach(function(otherSelector) {
                        const otherOptions = otherSelector.querySelector('div.virtual > div.options > ul');
                        if (otherOptions) {
                            if (!thisInstance.isMatch(otherOptions.getAttribute('data-index'), virtualOptions.getAttribute('data-index'))) {
                                otherSelector.classList.remove('show');
                            }
                        }
                    });

                    if (target.closest('a') && target.closest('li.node')) {
                        const isMultiple = target.closest('div.iweb-select').classList.contains('iweb-select-multiple');
                        const selectElement = target.closest('div.iweb-select').querySelector('div.real > select');
                        let selectedOptions = [];
                        
                        // Handle multiple selection
                        if (isMultiple) {
                            selectElement.querySelectorAll('option').forEach(function(optionGroup) {
                                if (optionGroup.children.length > 0) {
                                    Array.from(optionGroup.children).forEach(function(option) {
                                        if (option.selected) {
                                            selectedOptions.push(option.value.toString());
                                        }
                                    });
                                }
                                else if (optionGroup.selected) {
                                    selectedOptions.push(optionGroup.value.toString());
                                }
                            });

                            const selectedValue = (target.getAttribute('data-value') || '').toString();
                            if (!selectedOptions.includes(selectedValue)) {
                                selectedOptions.push(selectedValue);
                            } 
                            else {
                                selectedOptions = selectedOptions.filter(function(value) {
                                    return value !== selectedValue;
                                });
                            }

                            // Update the select element with selected options
                            selectElement.querySelectorAll('option').forEach(function(option) {
                                if (selectedOptions.includes(option.value.toString())) {
                                    option.selected = true;
                                } 
                                else {
                                    option.selected = false;
                                }
                            });
                            selectElement.dispatchEvent(new Event('change', {
                                bubbles: true
                            }));

                        }
                        
                        // Handle single selection
                        else {
                            target.closest('div.iweb-select').classList.remove('show');
                            selectElement.value = (target.getAttribute('data-value') || '');
                            selectElement.dispatchEvent(new Event('change', {
                                bubbles: true
                            }));
                        }
                    }
                } 
                else {
                    document.querySelectorAll('div.iweb-select').forEach(function(otherSelect) {
                        otherSelect.classList.remove('show');
                    });
                }
            }
        });

        // Handle input
        document.addEventListener('input', function(e) {
            const target = e.target;
            if (target.closest('div.iweb-input')) {
                target.closest('div.iweb-input').classList.remove('error');
                const oriSmallTips = target.closest('div.iweb-input').querySelector('small.tips');
                if (oriSmallTips) {
                    oriSmallTips.remove();
                }
            }

            // Color code
            if (target.closest('div.iweb-input-color')) {
                if (thisInstance.isMatch(target.type, 'color')) {
                    const inputColorCode = target.closest('div.iweb-input-color').querySelector('input[type="text"]');
                    if (/^#[0-9A-F]{6}$/i.test(target.value)) {
                        inputColorCode.value = target.value;
                    }
                } 
                else {
                    const input = target.closest('div.iweb-input-color').querySelector('input[type="color"]');
                    if (!target.value.startsWith('#')) {
                        target.value = '#' + target.value;
                    }
                    if (/^#[0-9A-F]{6}$/i.test(target.value)) {
                        input.value = target.value;
                    }
                }
            }
            
            // Autocomplete
            else if (target.closest('div.iweb-input-autocomplete') && target.closest('input.fill-text')) {
                clearTimeout(thisInstance.timer);
                thisInstance.timer = setTimeout(() => {
                    // Remove error, tips & options list
                    target.closest('div.iweb-input-autocomplete').classList.remove('error');
                    const oriSmallTips = target.closest('div.iweb-input-autocomplete').querySelector('small.tips');
                    if (oriSmallTips) {
                        oriSmallTips.remove();
                    }
                    const oriFillOptions = target.closest('div.iweb-input-autocomplete').querySelector('ul.fill-options');
                    if(oriFillOptions) {
                        oriFillOptions.remove();
                    }

                    // Gather extra parameters
                    let extraPayload = {};
                    for (let i = 1; i <= 5; i++) {
                        let param = target.closest('div.iweb-input-autocomplete').querySelector('input.fill-id').getAttribute('data-param' + i);
                        if (thisInstance.isValue(param)) {
                            let [key, value] = param.split(':');
                            extraPayload[key] = value;
                        }
                    }

                    // Merge post data
                    const keywords = target.value;
                    const url = target.closest('div.iweb-input-autocomplete').querySelector('input.fill-id').getAttribute('data-url');
                    const requestData = {
                        url: url,
                        payload: Object.assign({
                            keywords: keywords
                        }, extraPayload),
                        showBusy: false
                    };

                    // Search result handling
                    if (thisInstance.isValue(keywords)) {
                        thisInstance.doRequest(requestData, function(responseData) {
                            if (thisInstance.isValue(responseData)) {
                                responseData = Object.values(responseData);

                                // Create options list
                                const fillOptions = document.createElement('ul');
                                fillOptions.classList.add('fill-options');
                                responseData.forEach(function(value) {
                                    const li = document.createElement('li');
                                    const a = document.createElement('a');
                                    a.setAttribute('data-id', value.id);
                                    a.setAttribute('data-value', (thisInstance.isValue(value.value)?value.value:value.name));
                                    a.textContent = value.name;
                                    a.addEventListener('click', thisInstance.deBounce(function(e1) {
                                        const target = e1.target;
                                        const orifillReset = target.closest('div.iweb-input-autocomplete').querySelector('a.fill-reset');
                                        if(orifillReset) {
                                            orifillReset.remove();
                                        }

                                        // Set id input & search input
                                        const fillID = target.closest('div.iweb-input-autocomplete').querySelector('input.fill-id');
                                        const fillText = target.closest('div.iweb-input-autocomplete').querySelector('input.fill-text');
                                        fillID.value = (target.getAttribute('data-id') || '');
                                        fillText.value = (target.getAttribute('data-value') || '');
                                        fillText.readOnly = true;

                                        // Create reset button
                                        const fillReset = document.createElement('a');
                                        fillReset.classList.add('fill-reset');

                                        // Create Reset icon
                                        const fillResetIcon = document.createElement('i');
                                        fillResetIcon.classList.add('fa', 'fa-times');
                                        fillResetIcon.style.color = '#d73d32';

                                        // Append elements
                                        fillReset.appendChild(fillResetIcon);
                                        fillID.closest('div.iweb-input-autocomplete').appendChild(fillReset);

                                        // Remove error, tips & options list
                                        fillID.closest('div.iweb-input-autocomplete').classList.remove('error');
                                        const oriSmallTips = fillID.closest('div.iweb-input-autocomplete').querySelector('small.tips');
                                        if(oriSmallTips) {
                                            oriSmallTips.remove();
                                        }
                                        const oriFillOptions = fillID.closest('div.iweb-input-autocomplete').querySelector('ul.fill-options');
                                        if(oriFillOptions) {
                                            oriFillOptions.remove();
                                        }

                                        // Callback
                                        const selectCallBack = fillID.getAttribute('data-sfunc');
                                        if ((typeof window[selectCallBack]) === 'function') {
                                            window[selectCallBack](fillID.value, fillID);
                                        }
                                    }));

                                    // Append elements
                                    li.appendChild(a);
                                    fillOptions.appendChild(li);
                                });

                                // Append elements
                                target.closest('div.iweb-input-autocomplete').appendChild(fillOptions);
                            } 
                            else {
                                const fillOptions = document.createElement('ul');
                                fillOptions.classList.add('fill-options');
                                const li = document.createElement('li');
                                li.classList.add('empty');
                                li.textContent = thisInstance.language[thisInstance.currentLangCode]['noRecordFound'];
                                fillOptions.appendChild(li);

                                // Append elements
                                target.closest('div.iweb-input-autocomplete').appendChild(fillOptions);
                            }
                        });
                    }
                }, 1000);
            } 
            
            // Select search options
            else if (target.closest('div.iweb-select') && target.closest('li.filter')) {
                const fkw = target.value;
                
                // Find all node elements
                if (thisInstance.isValue(fkw)) {
                    target.closest('div.iweb-select').querySelectorAll('div.virtual > div.options ul > li.node > a').forEach(function(anchor) {
                        const textContent = anchor.textContent || anchor.innerText;
                        if (textContent.toLowerCase().indexOf(fkw.toLowerCase()) > -1) {
                            anchor.parentElement.classList.remove('hide');
                            const parentNode = anchor.closest('li.node-parent');
                            if (parentNode) {
                                parentNode.classList.remove('hide');
                            }
                        }
                        else {
                            anchor.parentElement.classList.add('hide');
                        }
                    });
                } 
                
                // If filter is empty, remove 'hide' class from all node elements
                else {
                    target.closest('div.iweb-select').querySelectorAll('div.virtual > div.options ul > li.node').forEach(function(nodeElement) {
                        nodeElement.classList.remove('hide');
                    });
                }
            }
        });

        // Handle change
        document.addEventListener('change', function(e) {
            const target = e.target;
                
            // Select
            if (target.closest('div.iweb-select')) {
                let selectedOptions = [];
                let selectedOptionLabel = '';

                // Remove error & tips
                target.closest('div.iweb-select').classList.remove('error');
                const oriSmallTips = target.closest('div.iweb-select').querySelector('small.tips');
                if(oriSmallTips) {
                    oriSmallTips.remove();
                } 

                // Traverse through the options
                Array.from(target.querySelectorAll('option')).forEach(function(option) {
                    if (option.children.length > 0) {
                        Array.from(option.children).forEach(function(childOption) {
                            if (childOption.selected) {
                                selectedOptions.push(childOption.value.toString());
                            }
                        });
                    }
                    else {
                        if (option.selected) {
                            selectedOptions.push(option.value.toString());
                        }
                    }
                });

                // Find and update the corresponding virtual options
                if (target.closest('div.iweb-select').querySelectorAll('div.virtual > div.options ul > li > a').length > 0) {
                    target.closest('div.iweb-select').querySelectorAll('div.virtual > div.options ul > li > a').forEach(function(anchor) {
                        const optionValue = anchor.getAttribute('data-value');
                        if (thisInstance.isValue(optionValue)) {
                            if (!thisInstance.isMatch(selectedOptions.indexOf(optionValue), -1)) {
                                anchor.parentElement.classList.add('node-selected');
                                if (thisInstance.isValue(selectedOptionLabel)) {
                                    selectedOptionLabel += ', ';
                                }
                                selectedOptionLabel += anchor.textContent;
                            }
                            else {
                                anchor.parentElement.classList.remove('node-selected');
                            }
                        }
                    });

                    // Set the default option label if none selected
                    if (!thisInstance.isValue(selectedOptionLabel)) {
                        selectedOptionLabel = ((thisInstance.isValue(target.getAttribute('data-default'))) ? target.getAttribute('data-default') : thisInstance.language[thisInstance.currentLangCode]['pleaseSelect']);
                    }

                    // Update the virtual result label
                    target.closest('div.iweb-select').querySelector('div.virtual > a.result').innerHTML = selectedOptionLabel;
                }
            } 
            
            // File
            else if (target.closest('div.iweb-input-file') && !target.closest('div.iweb-files-dropzone')) {
                const filePreviewArea = target.closest('div.iweb-input-file').querySelector('div.preview');
                if(filePreviewArea) {
                    filePreviewArea.remove();
                }
                if(target.files.length > 0) {
                    let selectedFiles = Array.from(target.files);
                    const previewArea = document.createElement('div');
                    previewArea.classList.add('preview');
                    selectedFiles.forEach(function(file, i) {
                        const blockdiv = document.createElement('div');
                        const span = document.createElement('span');
                        span.innerHTML = file.name;
        
                        const deleteBtn = document.createElement('a');
                        deleteBtn.setAttribute('data-index', i);
                        deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
                        
                        deleteBtn.addEventListener('click', function(e){
                            const btnTarget = e.target;
                            const inputTarget = btnTarget.closest('div.iweb-input-file').querySelector('input[type="file"]');

                            selectedFiles.splice(target.getAttribute('data-index'), 1);
                            btnTarget.closest('div').remove();
                            
                            const newInput = inputTarget.cloneNode(false);
                            const dt = new DataTransfer();
                            selectedFiles.forEach(file => dt.items.add(file));
                            newInput.files = dt.files;

                            inputTarget.parentNode.replaceChild(newInput, inputTarget);
                        });
                        
                        blockdiv.appendChild(span);
                        blockdiv.appendChild(deleteBtn);
                        previewArea.appendChild(blockdiv);
                    });
                    
                    target.closest('div.iweb-input-file').appendChild(previewArea);
                }
            }
            
            // Checkbox
            else if (target.closest('div.iweb-checkbox')) {
                const relatedObject = document.querySelectorAll('input[type="checkbox"][name="' + (target.name) + '"]');
                relatedObject.forEach(function(relatedCheckbox) {
                    relatedCheckbox.closest('div.iweb-checkbox').classList.remove('checked');
                    if (relatedCheckbox.checked) {
                        relatedCheckbox.closest('div.iweb-checkbox').classList.add('checked');
                    }
                    relatedCheckbox.closest('div.iweb-checkbox').classList.remove('error');
                });

                // Remove tips
                if (target.closest('div.iweb-checkbox-set')) {
                    const oriSmallTips = target.closest('div.iweb-checkbox-set').querySelector('small.tips');
                    if(oriSmallTips) {
                        oriSmallTips.remove();
                    }
                }
            } 
            
            // Radio
            else if (target.closest('div.iweb-radio')) {
                const selectedValue = target.value;
                const relatedObject = document.querySelectorAll('input[type="radio"][name="' + (target.name) + '"]');
                relatedObject.forEach(function(relatedRadio) {
                    if (thisInstance.isMatch(relatedRadio.value, selectedValue)) {
                        relatedRadio.checked = true;
                        relatedRadio.closest('div.iweb-radio').classList.add('checked');
                    }
                    else {
                        relatedRadio.checked = false;
                        relatedRadio.closest('div.iweb-radio').classList.remove('checked');
                    }
                    relatedRadio.closest('div.iweb-radio').classList.remove('error');
                });

                // Remove tips
                if (target.closest('div.iweb-radio-set')) {
                    const oriSmallTips = target.closest('div.iweb-radio-set').querySelector('small.tips');
                    if(oriSmallTips) {
                        oriSmallTips.remove();
                    }
                }
            }
        });

        // Init default font size
        const fontSizeClasses = ['small-font', 'middle-font', 'large-font'];
        const defaultFontSize = (thisInstance.getCookie('iweb_font_size'));
        const fontButtons = document.querySelectorAll('a.font-switch');
        if (thisInstance.isValue(defaultFontSize)) {
            document.documentElement.classList.remove(...fontSizeClasses);
            document.documentElement.classList.add(defaultFontSize + '-font');
            fontButtons.forEach(function(btn) {
                btn.classList.toggle('current', thisInstance.isMatch(btn.getAttribute('data-size'), defaultFontSize));
            });
        }
    }

    initComponent() {
        const thisInstance = this;
        
        // Beautify components
        thisInstance.inputBox();
        thisInstance.selectBox();
        thisInstance.checkBox();
        thisInstance.radioBox();
        setTimeout(function() {
            thisInstance.iframe();
            thisInstance.video();
            thisInstance.responsive();
        }, 500);
        
        // set flex gap
        const uls = document.querySelectorAll('ul.iweb-flex');
        if(uls.length > 0) {
            uls.forEach(ul => {
                const gap = ul.dataset.gap;
                if (thisInstance.isNumber(gap)) {
                    if (!ul.classList.contains('inited')) {
                        ul.style.gap = Math.max(0, parseInt(gap, 0)) + 'px';
                        ul.removeAttribute('data-gap');
                        ul.classList.add('inited');
                    }
                }
            });
        }

        // insert div before & after into editor div
        const editors = document.querySelectorAll('div.iweb-editor');
        if(editors.length > 0) {
            editors.forEach(editor => {
                if (!editor.classList.contains('inited')) {
                    const clearBefore = document.createElement('div');
                    clearBefore.className = 'clearboth';
                    editor.insertAdjacentElement('afterbegin', clearBefore);

                    const clearAfter = document.createElement('div');
                    clearAfter.className = 'clearboth';
                    editor.insertAdjacentElement('beforeend', clearAfter);

                    editor.classList.add('inited');
                }
            });
        }
        
        // init responsive table
        const rtable = document.querySelectorAll('table.iweb-rtable');
        if(rtable.length > 0) {
            rtable.forEach(function(table) {
                const headerTxts = Array.from(table.querySelectorAll('thead th'), th => th.textContent.trim());
                if(headerTxts.length > 0) {
                    table.querySelectorAll('th, td').forEach(cell => {
                        const wrapper = document.createElement('div');
                        while (cell.firstChild) {
                          wrapper.appendChild(cell.firstChild);
                        }
                        cell.appendChild(wrapper);
                    });
                }
                else {
                    table.classList.remove('iweb-rtable');
                }
            });
        }
        
        // Init form
        thisInstance.initForm();
    }

    inputBox(inputObject, callBack) {
        const thisInstance = this;

        // Default to selecting all relevant elements if none provided
        if (!thisInstance.isValue(inputObject)) {
            const defaultInput = [
                'input[type="text"]',
                'input[type="password"]',
                'input[type="datetime-local"]',
                'input[type="date"]',
                'input[type="time"]',
                'input[type="color"]',
                'input[type="tel"]',
                'input[type="email"]',
                'input[type="number"]',
                'input[type="file"]',
                'textarea'
            ];
            inputObject = document.querySelectorAll(defaultInput.join(', '));
        }

        if (inputObject.length > 0) {
            inputObject.forEach(function(input) {
                if (!input.closest('div.iweb-input')) {
                    // Create div and move the input into it
                    const inputType = input.type;
                    const isAutocomplete = (thisInstance.isMatch(input.getAttribute('data-autocomplete'), 1) || thisInstance.isMatch(input.getAttribute('data-autocomplete'), true));
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.classList.add('iweb-input');
                    wrapperDiv.classList.add((isAutocomplete ? 'iweb-input-autocomplete' : 'iweb-input-' + (thisInstance.isValue(input.type) ? input.type : 'text')));
                    input.parentNode.insertBefore(wrapperDiv, input);
                    wrapperDiv.appendChild(input);

                    // Add additional elements to the input
                    if (!isAutocomplete) {
                        if (thisInstance.isMatch(inputType, 'password')) {
                            // Create password switch type button
                            const BtnSwitchType = document.createElement('button');
                            BtnSwitchType.type = 'button';
                            BtnSwitchType.classList.add('switch-pwd-type');

                            const eyeSlashIcon = document.createElement('i');
                            eyeSlashIcon.classList.add('fa', 'fa-eye-slash', 'hide');
                            eyeSlashIcon.style.display = 'block';
                            const eyeIcon = document.createElement('i');
                            eyeIcon.classList.add('fa', 'fa-eye', 'show');
                            eyeIcon.style.display = 'none';

                            // Append elements
                            BtnSwitchType.appendChild(eyeSlashIcon);
                            BtnSwitchType.appendChild(eyeIcon);
                            wrapperDiv.appendChild(BtnSwitchType);
                        }
                        else if (thisInstance.isMatch(inputType, 'color')) {
                            // Set color input
                            input.style.position = 'relative';
                            input.style.zIndex = 1;

                            // Create color code input
                            const inputColorCode = document.createElement('input');
                            inputColorCode.type = 'text';
                            inputColorCode.maxLength = 7;
                            inputColorCode.value = input.value;
                            inputColorCode.style.position = 'absolute';
                            inputColorCode.style.top = '0px';
                            inputColorCode.style.left = '0px';
                            inputColorCode.style.right = '0px';
                            inputColorCode.style.bottom = '0px';
                            inputColorCode.style.paddingLeft = '42px';

                            // Append elements
                            wrapperDiv.appendChild(inputColorCode);
                        }
                    }
                    else {
                        // Create search input
                        const validationArray = (thisInstance.isValue(input.getAttribute('data-validation'))?(input.getAttribute('data-validation').toString().split('|')):[]);
                        const canNew = (thisInstance.isMatch(input.getAttribute('data-cannew'), 1)) ? true : false;

                        const fillText = document.createElement('input');
                        fillText.type = 'text';
                        if (canNew) {
                            fillText.name = input.name.toString().replace(/(\w+)(\[\])?$/, '$1_txt$2');
                            if ((validationArray.includes('required'))) {
                                fillText.setAttribute('data-validation', 'required');
                            }
                        }
                        fillText.placeHolder = (input.getAttribute('data-placeHolder') || '');
                        fillText.classList.add('fill-text');
                        fillText.style.display = 'block';
                        fillText.style.width = '100%';
                        fillText.autocomplete = 'off';
                        
                        wrapperDiv.appendChild(fillText);

                        // Create reset button
                        const defaultText = input.getAttribute('data-default');
                        input.removeAttribute('data-default');
                        if (thisInstance.isValue(defaultText)) {
                            fillText.setAttribute('data-value', input.value);
                            fillText.setAttribute('data-default', defaultText);
                            fillText.setAttribute('value', defaultText);
                            fillText.readOnly = true;

                            const fillReset = document.createElement('a');
                            fillReset.classList.add('fill-reset');

                            // Create Reset icon
                            const fillResetIcon = document.createElement('i');
                            fillResetIcon.classList.add('fa', 'fa-times');

                            // Append elements
                            fillReset.appendChild(fillResetIcon);
                            wrapperDiv.appendChild(fillReset);
                        }

                        // Hide input
                        input.type = 'hidden';
                        input.classList.add('fill-id');
                        input.removeAttribute('data-validation');
                        input.removeAttribute('data-cannew');
                        input.removeAttribute('data-autocomplete');
                    }

                    // Set input styles
                    input.style.display = (thisInstance.isMatch(inputType, 'color') ? 'inline-block' : 'block');
                    input.style.width = (thisInstance.isMatch(inputType, 'color') ? '36px' : '100%');
                    input.autocomplete = 'off';
                }
            });
        }

        // Init date picker
        if (!thisInstance.isValue(thisInstance.datePicker)) {
            thisInstance.datePicker = new iDatePicker(thisInstance.currentLangCode);
        }
        thisInstance.datePicker.render('input[type="date"]');

        // Init time picker
        if (!thisInstance.isValue(thisInstance.timePicker)) {
            thisInstance.timePicker = new iTimePicker();
        }
        thisInstance.timePicker.render('input[type="time"]');

        // Callback
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }

    selectBox(selectObject, callBack) {
        const thisInstance = this;

        // Default to selecting all relevant elements if none provided
        if (!thisInstance.isValue(selectObject)) {
            selectObject = document.querySelectorAll('select');
        }

        if (selectObject.length > 0) {
            selectObject.forEach(function(select, selectIndex) {
                if (!select.closest('div.iweb-select')) {
                    // Get config
                    const isMultiple = ((thisInstance.isMatch(select.multiple, 1) || thisInstance.isMatch(select.multiple, true)) ? true : false);
                    const isVirtual = ((thisInstance.isMatch(select.getAttribute('data-virtual'), 1) || thisInstance.isMatch(select.getAttribute('data-virtual'), true)) ? true : false);
                    const isFilter = ((thisInstance.isMatch(select.getAttribute('data-filter'), 1) || thisInstance.isMatch(select.getAttribute('data-filter'), true)) ? true : false);
                    const isPositionTop = ((thisInstance.isMatch(select.getAttribute('data-top'), 1) || thisInstance.isMatch(select.getAttribute('data-top'), true)) ? true : false);

                    if (isVirtual) {
                        // Create div & move the select into div
                        const wrapperDiv = document.createElement('div');
                        wrapperDiv.classList.add('iweb-select');
                        if (isMultiple) {
                            wrapperDiv.classList.add('iweb-select-multiple');
                        };

                        const realDiv = document.createElement('div');
                        realDiv.classList.add('real', 'hidden');

                        select.parentNode.insertBefore(realDiv, select);
                        realDiv.appendChild(select);

                        realDiv.parentNode.insertBefore(wrapperDiv, realDiv);
                        wrapperDiv.appendChild(realDiv);

                        // Create a virtual div & move the result section into div
                        let virtualSelect = '';
                        const virtualDiv = document.createElement('div');
                        virtualDiv.classList.add('virtual');

                        const resultLink = document.createElement('a');
                        resultLink.classList.add('result');
                        resultLink.textContent = virtualSelect;
                        virtualDiv.appendChild(resultLink);

                        // Create options list
                        const optionsDiv = document.createElement('div');
                        optionsDiv.classList.add('options');
                        if (isPositionTop) {
                            optionsDiv.classList.add('top');
                        }
                        const optionsList = document.createElement('ul');
                        optionsList.setAttribute('data-index', 'iss' + selectIndex);

                        // Create filter input
                        if (isFilter) {
                            const filterLi = document.createElement('li');
                            filterLi.classList.add('filter');

                            const placeHolderText = (select.getAttribute('data-placeHolder') || '');
                            const filterInput = document.createElement('input');
                            filterInput.id = 'fkw_' + selectIndex;
                            filterInput.type = 'text';
                            filterInput.placeHolder = placeHolderText.trim();

                            // Append elements
                            filterLi.appendChild(filterInput);
                            optionsList.appendChild(filterLi);
                        }

                        // Loop through options and create the list
                        if (select.children.length > 0) {
                            Array.from(select.children).forEach(function(optionGroup) {
                                if (optionGroup.children.length > 0) {
                                    const parentLi = document.createElement('li');
                                    parentLi.classList.add('node', 'node-parent');

                                    const parentLink = document.createElement('a');
                                    parentLink.textContent = optionGroup.getAttribute('label');
                                    parentLi.appendChild(parentLink);

                                    const childUl = document.createElement('ul');
                                    Array.from(optionGroup.children).forEach(function(option) {
                                        if (thisInstance.isValue(option.value)) {
                                            const childLi = document.createElement('li');
                                            childLi.classList.add('node');
                                            if (option.selected) {
                                                childLi.classList.add('node-selected');
                                                childLi.setAttribute('data-ori', 'selected');
                                                virtualSelect += (virtualSelect ? ', ' : '');
                                                virtualSelect += option.textContent;
                                            }

                                            const childLink = document.createElement('a');
                                            childLink.setAttribute('data-value', option.value);
                                            childLink.textContent = option.textContent;

                                            // Append elements
                                            childLi.appendChild(childLink);
                                            childUl.appendChild(childLi);
                                        }
                                    });

                                    // Append elements
                                    parentLi.appendChild(childUl);
                                    optionsList.appendChild(parentLi);
                                }
                                else {
                                    const singleLi = document.createElement('li');
                                    singleLi.classList.add('node');
                                    const singleLink = document.createElement('a');
                                    singleLink.setAttribute('data-value', optionGroup.value);
                                    singleLink.textContent = optionGroup.textContent;
                                    if (optionGroup.selected) {
                                        singleLi.classList.add('node-selected');
                                        singleLi.setAttribute('data-ori', 'selected');
                                        virtualSelect += (virtualSelect ? ', ' : '');
                                        virtualSelect += optionGroup.textContent;
                                    }

                                    // Append elements
                                    singleLi.appendChild(singleLink);
                                    optionsList.appendChild(singleLi);
                                }
                            });
                        }

                        // Set the default select text if nothing is selected
                        if (!thisInstance.isValue(virtualSelect)) {
                            virtualSelect = (thisInstance.isValue(select.getAttribute('data-default')) ? select.getAttribute('data-default') : thisInstance.language[thisInstance.currentLangCode]['pleaseSelect']);
                        }
                        resultLink.textContent = virtualSelect;

                        // Append elements
                        optionsDiv.appendChild(optionsList);
                        virtualDiv.appendChild(optionsDiv);
                        wrapperDiv.appendChild(virtualDiv);
                    }
                    else {
                        // Create div & move the select into the div
                        const wrapperDiv = document.createElement('div');
                        wrapperDiv.classList.add('iweb-select');
                        const realDiv = document.createElement('div');
                        realDiv.classList.add('real');

                        select.parentNode.insertBefore(realDiv, select);
                        realDiv.appendChild(select);

                        realDiv.parentNode.insertBefore(wrapperDiv, realDiv);
                        wrapperDiv.appendChild(realDiv);
                    }

                    // Remove select Attribute
                    select.removeAttribute('data-virtual');
                    select.removeAttribute('data-filter');
                }
            });
        }

        // Callback
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }

    checkBox(checkboxObject, callBack) {
        const thisInstance = this;

        // Default to selecting all relevant elements if none provided
        if (!thisInstance.isValue(checkboxObject)) {
            checkboxObject = document.querySelectorAll('input[type="checkbox"]');
        }

        if (checkboxObject.length > 0) {
            checkboxObject.forEach(function(checkbox) {
                if (!checkbox.closest('div.iweb-checkbox')) {
                    const findCheckboxLabel = checkbox.nextElementSibling;

                    // Create div
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.classList.add('iweb-checkbox');
                    if (checkbox.checked) {
                        wrapperDiv.classList.add('checked');
                    }

                    // Move the checkbox into div and then append label next to it
                    checkbox.parentNode.insertBefore(wrapperDiv, checkbox);
                    wrapperDiv.appendChild(checkbox);
                    if (findCheckboxLabel && thisInstance.isMatch(findCheckboxLabel.tagName, 'label')) {
                        findCheckboxLabel.parentNode.insertBefore(wrapperDiv, findCheckboxLabel);
                        wrapperDiv.appendChild(findCheckboxLabel);
                    }
                }
            });
        }

        // Callback
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }
    
    setCheckBox(checkboxObject, isChecked = false, callBack) {
        const thisInstance = this;
        
        if (thisInstance.isValue(checkboxObject)) {
            if (checkboxObject instanceof Element) {
                checkboxObject.checked = isChecked;
                if(checkboxObject.checked) {
                    checkboxObject.parentElement.classList.add('checked');
                }
                else {
                    checkboxObject.parentElement.classList.remove('checked');
                }
            }
            else if (checkboxObject instanceof NodeList) {
                checkboxObject.forEach(checkbox => {
                    checkbox.checked = isChecked;
                    if(checkbox.checked) {
                        checkbox.parentElement.classList.add('checked');
                    }
                    else {
                        checkbox.parentElement.classList.remove('checked');
                    }
                });
            }
        }
        
        // Callback
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }

    radioBox(radioObject, callBack) {
        const thisInstance = this;

        // Default to selecting all relevant elements if none provided
        if (!thisInstance.isValue(radioObject)) {
            radioObject = document.querySelectorAll('input[type="radio"]');
        }

        if (radioObject.length > 0) {
            radioObject.forEach(function(radio) {
                if (!radio.closest('div.iweb-radio')) {
                    const findRadioLabel = radio.nextElementSibling;

                    // Create div
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.classList.add('iweb-radio');
                    if (radio.checked) {
                        wrapperDiv.classList.add('checked');
                    }

                    // Move the radio into div and then append label next to it
                    radio.parentNode.insertBefore(wrapperDiv, radio);
                    wrapperDiv.appendChild(radio);
                    if (findRadioLabel && thisInstance.isMatch(findRadioLabel.tagName, 'label')) {
                        findRadioLabel.parentNode.insertBefore(wrapperDiv, findRadioLabel);
                        wrapperDiv.appendChild(findRadioLabel);
                    }
                }
            });
        }

        // Callback
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }
    
    setRadioBox(radioObject, isChecked = false, callBack) {
        const thisInstance = this;
        
        if (thisInstance.isValue(radioObject)) {
            if (radioObject instanceof Element) {
                radioObject.checked = isChecked;
                if(radioObject.checked) {
                    radioObject.parentElement.classList.add('checked');
                }
                else {
                    radioObject.parentElement.classList.remove('checked');
                }
            }
            else if (radioObject instanceof NodeList) {
                radioObject.forEach(radio => {
                    radio.checked = isChecked;
                    if(radio.checked) {
                        radio.parentElement.classList.add('checked');
                    }
                    else {
                        radio.parentElement.classList.remove('checked');
                    }
                });
            }
        }
        
        // Callback
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }

    iframe(element = 'div.iweb-editor', callBack) {
        const thisInstance = this;

        if (thisInstance.isValue(element)) {
            // Get all specified tags within the given element
            let elements = null;
            ['iframe', 'video', 'object', 'embed'].forEach(function(value) {
                elements = document.querySelectorAll(element + ' ' + value);
                elements.forEach(function(e) {
                    // Check if the parent does not have the class 'iweb-responsive'
                    if (!e.closest('div.iweb-responsive')) {
                        // Wrap the element in a div with 'iweb-responsive' class
                        const wrapper = document.createElement('div');
                        wrapper.className = 'iweb-responsive';
                        wrapper.setAttribute('data-width', e.offsetWidth);
                        wrapper.setAttribute('data-height', e.offsetHeight);

                        e.classList.add('vframe');
                        e.parentNode.insertBefore(wrapper, e);
                        wrapper.appendChild(e);
                    }
                });
            });
            
            if ((typeof callBack) === 'function') {
                callBack();
            }
        }
    }
    
    video(callBack) {
        const thisInstance = this;
        
        const elements = document.querySelectorAll('video.iweb-video');
        elements.forEach(async function(e) {
            if (!e.closest('div.iweb-video')) {
                e.removeAttribute('controls');
                
                const included_rdiv = (thisInstance.isValue(e.closest('div.iweb-responsive')));
                const wrapper = document.createElement('div');
                wrapper.className = 'iweb-video iweb-responsive';
                wrapper.setAttribute('data-width', (e.getAttribute('width') || e.offsetWidth));
                wrapper.setAttribute('data-height', (e.getAttribute('height') || e.offsetHeight));

                if (!thisInstance.isValue(e.querySelector('source').getAttribute('src')) && thisInstance.isValue(e.getAttribute('data-source'))) {
                    try {
                        const response = await fetch(e.getAttribute('data-source'));
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        e.querySelector('source').src = blobUrl;
                        e.load();
                        e.addEventListener('canplay', (v) => {
                            setTimeout(function() {
                                const width = (e.getAttribute('width') || e.offsetWidth);
                                const height = (e.getAttribute('height') || e.offsetHeight);
                                if(width <= 0 || height <= 0) {
                                    width = 300;
                                    height = 250;
                                }
                                v.target.closest('div.iweb-video').setAttribute('data-width', width);
                                v.target.closest('div.iweb-video').setAttribute('data-height', height);
                                thisInstance.responsive();
                            }, 500);
                        });
                    } catch (err) {
                        console.log('Failed to load video from ' + e.getAttribute('data-source'), err);
                    }
                }
                e.removeAttribute('data-source');
                e.removeAttribute('class');
                e.addEventListener('contextmenu', function(v) {
                    v.preventDefault();
                });
                e.addEventListener('loadedmetadata', (v) => {
                    v.target.closest('div.iweb-video').querySelector('span.v-duration').textContent = thisInstance.formatTime(0) + ' / ' + thisInstance.formatTime(e.duration);
                });
                e.addEventListener('timeupdate', (v) => {
                    if(e.duration > 0) {
                        v.target.closest('div.iweb-video').querySelector('span.v-duration').textContent = thisInstance.formatTime(e.currentTime) + ' / ' + thisInstance.formatTime(e.duration);
                        v.target.closest('div.iweb-video').querySelector('input.v-progress-bar').value = (e.currentTime / e.duration) * 100;
                        if(parseInt(e.currentTime) >= parseInt(e.duration)) {
                            v.target.closest('div.iweb-video').querySelector('button.v-play-btn').innerHTML = '<svg viewBox="0 0 20 20" fill="#ffffff" stroke="#ffffff"><path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path></svg>';
                        }
                    }
                });

                if (!included_rdiv) {
                    e.parentNode.insertBefore(wrapper, e);
                    wrapper.appendChild(e);
                }
                else {
                    e.closest('div.iweb-responsive').classList.add('iweb-video');
                } 

                const controls = document.createElement('div');
                controls.className = 'controls';

                // Play Button
                const playDiv = document.createElement('div');
                const playBtn = document.createElement('button');
                playBtn.className = 'v-play-btn';
                playBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="#ffffff" stroke="#ffffff"><path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path></svg>';
                playBtn.addEventListener('click', function(e) {
                    const target = e.target;
                    target.closest('div.iweb-video').querySelector('div.volume').classList.remove('show');
                    const video = target.closest('div.iweb-video').querySelector('video');
                    if (video.paused) {
                        video.play();
                        target.closest('div.iweb-video').querySelector('button.v-play-btn').innerHTML = '<svg viewBox="0 0 26 24" fill="#ffffff" stroke="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.163 3.819C5 4.139 5 4.559 5 5.4v13.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C8.861 3 8.441 3 7.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zm9 0C14 4.139 14 4.559 14 5.4v13.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.655c.32.164.74.164 1.581.164h.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .655-.656c.164-.32.164-.74.164-1.581V5.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 3 17.441 3 16.6 3h-.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.655.656z" fill="#ffffff"></path></svg>';
                    }
                    else {
                        video.pause();
                        target.closest('div.iweb-video').querySelector('button.v-play-btn').innerHTML = '<svg viewBox="0 0 20 20" fill="#ffffff" stroke="#ffffff"><path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path></svg>';
                    }
                });
                playDiv.appendChild(playBtn);

                // Duration
                const durationDiv = document.createElement('div');
                const durationSpan = document.createElement('span');
                durationSpan.className = 'v-duration';
                durationSpan.textContent = '00:00 / 00:00';
                durationDiv.appendChild(durationSpan);

                // Volume
                const soundDiv = document.createElement('div');
                const soundBtn = document.createElement('button');
                soundBtn.className = 'v-sound-btn';
                soundBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff"><path d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
                soundBtn.addEventListener('click', function(e) {
                    const target = e.target;
                    if (target.closest('div').querySelector('div.volume').classList.contains('show')) {
                        target.closest('div').querySelector('div.volume').classList.remove('show');
                    }
                    else {
                        target.closest('div').querySelector('div.volume').classList.add('show');
                    }
                });

                const volumeDiv = document.createElement('div');
                volumeDiv.className = 'volume';
                const volumeRange = document.createElement('input');
                volumeRange.type = 'range';
                volumeRange.className = 'v-volume-bar';
                volumeRange.min = '0';
                volumeRange.max = '1';
                volumeRange.step = '0.01';
                volumeRange.value = '1';
                volumeRange.addEventListener('input', function(e) {
                    const target = e.target;
                    const video = target.closest('div.iweb-video').querySelector('video');
                    video.volume = e.target.value;
                });
                volumeDiv.appendChild(volumeRange);
                soundDiv.appendChild(soundBtn);
                soundDiv.appendChild(volumeDiv);

                // Fullscreen
                const fullscreenDiv = document.createElement('div');
                const fullscreenBtn = document.createElement('button');
                fullscreenBtn.className = 'v-fullscreen-btn';
                fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff"><path d="M21 9V8C21 5.79086 18.9853 4 16.5 4H15.25M21 15V16C21 18.2091 18.9853 20 16.5 20H15.25M3 15V16C3 18.2091 5.01472 20 7.5 20H8.75M3 9V8C3 5.79086 5.01472 4 7.5 4H8.75" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
                fullscreenBtn.addEventListener('click', function(e) {
                    const target = e.target;
                    if (target.closest('div.iweb-video').classList.contains('fullscreen')) {
                        target.closest('div.iweb-video').classList.remove('fullscreen');
                        document.body.classList.remove('iweb-disable-scroll');
                    }
                    else {
                        target.closest('div.iweb-video').classList.add('fullscreen');
                        document.body.classList.add('iweb-disable-scroll');
                    }
                    target.closest('div.iweb-video').querySelector('div.volume').classList.remove('show');
                });
                fullscreenDiv.appendChild(fullscreenBtn);

                // Progress bar
                const progressDiv = document.createElement('div');
                const progressRange = document.createElement('input');
                progressRange.type = 'range';
                progressRange.className = 'v-progress-bar';
                progressRange.min = '0';
                progressRange.max = '100';
                progressRange.value = '0';
                progressRange.addEventListener('input', function(e) {
                    const target = e.target;
                    const video = target.closest('div.iweb-video').querySelector('video');
                    video.currentTime = parseFloat((e.target.value / 100) * video.duration);
                    target.closest('div.iweb-video').querySelector('div.volume').classList.remove('show');
                });

                progressDiv.appendChild(progressRange);

                // Append all
                controls.appendChild(playDiv);
                controls.appendChild(durationDiv);
                controls.appendChild(soundDiv);
                controls.appendChild(fullscreenDiv);
                controls.appendChild(progressDiv);

                if (!included_rdiv) {
                    wrapper.appendChild(controls);
                }
                else {
                    e.closest('div.iweb-responsive').appendChild(controls);
                }
            }
        });
        
        if ((typeof callBack) === 'function') {
            callBack();
        }
    }

    responsive() {
        const thisInstance = this;
        const responsiveElements = document.querySelectorAll('div.iweb-responsive');
        if (responsiveElements.length > 0) {
            responsiveElements.forEach(function(e) {
                let currentWidth = e.clientWidth;
                let newHeight = 0;
                let defineRatioWidth = e.getAttribute('data-width');
                let defineRatioHeight = e.getAttribute('data-height');

                if (thisInstance.isValue(defineRatioWidth) && thisInstance.isValue(defineRatioHeight)) {
                    if (defineRatioHeight > 0 && defineRatioWidth > 0) {
                        newHeight = parseInt((currentWidth * defineRatioHeight) / defineRatioWidth);
                    }
                }

                if (newHeight > 0) {
                    e.style.height = newHeight + 'px';
                }
                else {
                    e.style.height = 'auto';
                }
            });
        }
    }
    
    responsiveTable() {
        const thisInstance = this;
        const rtable = document.querySelectorAll('table.iweb-rtable');
        if(rtable.length > 0) {
            rtable.forEach(function(table) {
                const switch_width = (table.dataset.rw || 720);
                const headerTxts = Array.from(table.querySelectorAll('thead th'), th => th.textContent.trim());
                if(headerTxts.length > 0 && switch_width >= thisInstance.viewerWidth) {
                    const headerBackground = window.getComputedStyle(table.querySelector('thead tr')).backgroundColor;
                    const headerBackgrounds = Array.from(table.querySelectorAll('thead th'), th => window.getComputedStyle(th).backgroundColor);
            
                    table.classList.add('responsive');
                    table.querySelectorAll('tbody tr').forEach(function (tr) {
                        tr.querySelectorAll('td').forEach(function(td, index) {
                            if(!thisInstance.isValue(td.querySelector('div.vlabel'))) {
                                const setBackground = thisInstance.isMatch((headerBackgrounds[index] || 'rgba(0, 0, 0, 0)'), 'rgba(0, 0, 0, 0)')?headerBackground:(headerBackgrounds[index] || 'rgba(0, 0, 0, 0)');
                                const wrapper = document.createElement('div');
                                wrapper.classList.add('vlabel');
                                wrapper.textContent = (headerTxts[index] || '');
                                if(!thisInstance.isMatch(setBackground, 'rgba(0, 0, 0, 0)')) {
                                    wrapper.style.background = setBackground;
                                    const rgb = setBackground.match(/\d+/g).map(Number); // [r, g, b, (a)]
                                    const [r, g, b] = rgb;
                                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                    if(brightness < 128) {
                                        wrapper.style.color = '#fff';
                                    }
                                }
                                td.insertBefore(wrapper, td.firstChild);
                            }
                        });
                    });
                    
                }
                else {
                    table.classList.remove('responsive');
                    table.querySelectorAll('tbody td').forEach(function(td) {
                        if(thisInstance.isValue(td.querySelector('div.vlabel'))) {
                            td.querySelector('div.vlabel').remove();
                        }
                    });
                }
            });
        }
    }

    pagination(element) {
        document.querySelectorAll(element).forEach(function(e) {
            new iPagination(e, {
                mode: (e.getAttribute('data-mode') || 1),
                size: (e.getAttribute('data-size') || 5),
                total: (e.getAttribute('data-totalpage') || 1),
                placeHolder: (e.getAttribute('data-placeHolder') || '')
            });
        });
    }

    // Request, default once by once
    doPost(requestData, callBack, finalCallBack, progressCallBack) {
        const thisInstance = this;
        thisInstance.doRequest(requestData, callBack, finalCallBack, progressCallBack);
    }
    
    doFetch(requestData, callBack, finalCallBack, progressCallBack) {
        const thisInstance = this;
        
        requestData = Object.assign({
            method: 'GET',
            includedToken: false
        }, requestData);
        
        thisInstance.doRequest(requestData, callBack, finalCallBack, progressCallBack);
    }

    doRequest(requestData, callBack, finalCallBack, progressCallBack) {
        const thisInstance = this;

        // Merge request data
        requestData = Object.assign({
            method: 'POST',
            url: '',
            payload: {},
            includedToken: true,
            dataType: 'json',
            showBusy: true,
            multiThread: false
        }, requestData);
 
        if (requestData.multiThread) {
            thisInstance.isBusy = false;
        }

        let formData = null;
        if (!thisInstance.isBusy && thisInstance.isValue(requestData.url)) {
            const localTime = thisInstance.formatDateTime();
            
            if (requestData.method.toUpperCase() === 'GET') {
                const params = new URLSearchParams();
                
                // Append token
                if(thisInstance.isValue(thisInstance.csrfToken) && thisInstance.isMatch(requestData.includedToken, true)) {
                    params.append('itoken', window.btoa(thisInstance.md5.hash(thisInstance.csrfToken + '#dt' + localTime) + '%' + localTime));
                }
                
                // Append payload
                if (requestData.payload) {
                    for (let key in requestData.payload) {
                        if (requestData.payload.hasOwnProperty(key)) {
                            const value = requestData.payload[key];
                            if (typeof value === 'object') {
                                for (let subKey in value) {
                                    params.append((key + '[' + subKey + ']'), value[subKey]);
                                }
                            } 
                            else {
                                params.append(key, value);
                            }
                        }
                    }
                }
                requestData.url += (requestData.url.includes('?') ? '&' : '?') + params.toString();
            }
            else {
                formData = new FormData();
                
                // Append token
                if(thisInstance.isValue(thisInstance.csrfToken) && thisInstance.isMatch(requestData.includedToken, true)) {
                    formData.append('itoken', window.btoa(thisInstance.md5.hash(thisInstance.csrfToken + '#dt' + localTime) + '%' + localTime));
                }
                
                // Append payload
                if (requestData.payload) {
                    for (let key in (requestData.payload)) {
                        if ((requestData.payload).hasOwnProperty(key)) {
                            const value = requestData.payload[key];
                            // Check if the value is an object or array and stringify it
                            if (typeof value === 'object' && !(value instanceof File || value instanceof FileList)) {
                                for (let subKey in value) {
                                    formData.append((key + '[' + subKey + ']'), value[subKey]);
                                }
                            } 
                            else {
                                formData.append(key, value);
                            }
                        }
                    }
                }
            }

            // Helper function to safely call if the function is defined
            const safeFinalFunc = () => {
                thisInstance.isBusy = false;
                if (!thisInstance.isMatch(requestData.showBusy, 2)) {
                    thisInstance.showBusy(false);
                }

                // Final Callbacked
                if ((typeof finalCallBack) === 'function') {
                    finalCallBack();
                }
            };

            // Try to send data with progress tracking using XMLHttpRequest
            try {
                thisInstance.isBusy = true;
                thisInstance.showBusy(true, ((thisInstance.isMatch(requestData.showBusy, 1) || thisInstance.isMatch(requestData.showBusy, true)) ? 50 : 0));

                // Use XMLHttpRequest for progress tracking
                const xhr = new XMLHttpRequest();
                xhr.open(requestData.method, requestData.url, true);

                // Monitor upload progress
                xhr.upload.onprogress = function(event) {
                    if (event.lengthComputable) {
                        const percentComplete = Math.ceil((event.loaded / event.total) * 100);
                        // Progress Callbacked
                        if ((typeof progressCallBack) === 'function') {
                            progressCallBack(percentComplete);
                        }
                    }
                };

                // Handle the response
                xhr.onload = function() {
                    safeFinalFunc();
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let responseData;
                        switch (requestData.dataType.toLowerCase()) {
                            case 'json':
                                responseData = JSON.parse(xhr.responseText);
                                break;
                            case 'blob':
                                responseData = xhr.response;
                                break;
                            default:
                                responseData = xhr.responseText;
                                break;
                        }

                        // Callbacked
                        if ((typeof callBack) === 'function') {
                            callBack(responseData);
                        }
                    }
                    else {
                        throw new Error(xhr.statusText);
                    }
                };

                // Handle network errors
                xhr.onerror = function() {
                    safeFinalFunc();
                    alert('Unstable network, please check your network connection.');
                };

                // Handle server errors
                xhr.onabort = function() {
                    safeFinalFunc();
                    alert('Request aborted.');
                };

                xhr.ontimeout = function() {
                    safeFinalFunc();
                    alert('Request timed out.');
                };

                // Send the form data
                xhr.send(formData);
            } catch (error) {
                safeFinalFunc();
                let alertMessage = error.message;
                if (error.message.includes('NetworkError')) {
                    alertMessage = 'Unstable network, please check your network connection.';
                } 
                else if (error.message.includes('404')) {
                    alertMessage = 'The requested page not found.';
                } 
                else if (error.message.includes('500')) {
                    alertMessage = 'Internal Server Error.';
                }
                alert(alertMessage);
                return false;
            }
        }
    }

    initForm(formObject) {
        const thisInstance = this;

        // Default to selecting all relevant elements if none provided
        if (!thisInstance.isValue(formObject)) {
            formObject = document.querySelectorAll('form[data-ajax="1"]');
        }

        if (formObject.length > 0) {
            formObject.forEach(function(form) {
                const showTips = ((!thisInstance.isMatch(form.getAttribute('data-showtips'), false)) && (!thisInstance.isMatch(form.getAttribute('data-showtips'), 0)));
                const busyMode = (thisInstance.isValue(form.getAttribute('data-busy'))) ? form.getAttribute('data-busy') : true;
                const alertResult = (thisInstance.isValue(form.getAttribute('data-alert'))) ? true : false;

                form.removeAttribute('data-ajax');
                form.removeAttribute('data-showtips');
                form.removeAttribute('data-busy');
                form.removeAttribute('data-alert');
                form.method = 'post';
                form.autocomplete = 'off';

                // Bind event for form submit
                form.addEventListener('submit', thisInstance.deBounce(function() {
                    // Remove error & tips
                    const tipsMessageArea = document.querySelector('div.iweb-tips-message');
                    if (tipsMessageArea) {
                        tipsMessageArea.classList.remove('error');
                        tipsMessageArea.classList.remove('success');
                        tipsMessageArea.innerHTML = '';
                    }

                    const errorElements = form.querySelectorAll('.error');
                    errorElements.forEach(function(e) {
                        if (!e.closest('div.iweb-tips-message')) {
                            e.classList.remove('error');
                        }
                    });

                    const tipsElements = form.querySelectorAll('small.tips');
                    tipsElements.forEach(function(tips) {
                        tips.remove();
                    });

                    // Do checking before submit
                    let canSubmit = true;
                    const requiredInputs = form.querySelectorAll('input[data-validation]:not(:disabled), select[data-validation]:not(:disabled), textarea[data-validation]:not(:disabled)');
                    if (requiredInputs.length > 0) {
                        requiredInputs.forEach(function(input) {
                            const validationArray = (input.getAttribute('data-validation').toString().split('|'));
                            if (thisInstance.isMatch(input.type, 'checkbox')) {
                                if (validationArray.includes('required') && input.closest('div.iweb-checkbox-set') && !input.closest('div.iweb-checkbox-set').querySelector('input[type="checkbox"]:checked')) {
                                    if (showTips && !input.closest('div.iweb-checkbox-set').querySelector('small.tips')) {
                                        const errorTips = document.createElement('small');
                                        errorTips.classList.add('tips');
                                        errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorRequired'];
                                        input.closest('div.iweb-checkbox-set').appendChild(errorTips);
                                    }
                                    input.closest('div.iweb-checkbox').classList.add('error');
                                    canSubmit = false;
                                }
                            } 
                            else if (thisInstance.isMatch(input.type, 'radio')) {
                                if (validationArray.includes('required') && input.closest('div.iweb-radio-set') && !input.closest('div.iweb-radio-set').querySelector('input[type="radio"]:checked')) {
                                    if (showTips && !input.closest('div.iweb-radio-set').querySelector('small.tips')) {
                                        const errorTips = document.createElement('small');
                                        errorTips.classList.add('tips');
                                        errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorRequired'];
                                        input.closest('div.iweb-radio-set').appendChild(errorTips);
                                    }
                                    input.closest('div.iweb-radio').classList.add('error');
                                    canSubmit = false;
                                }
                            } 
                            else if (thisInstance.isMatch(input.type, 'select-one') || thisInstance.isMatch(input.type, 'select-multiple')) {
                                if (validationArray.includes('required') && !thisInstance.isValue(input.value)) {
                                    if (showTips && !input.closest('div.iweb-select').querySelector('small.tips')) {
                                        const errorTips = document.createElement('small');
                                        errorTips.classList.add('tips');
                                        errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorRequired'];
                                        input.closest('div.iweb-select').appendChild(errorTips);
                                    }
                                    input.closest('div.iweb-select').classList.add('error');
                                    canSubmit = false;
                                }
                            } 
                            else {
                                if (validationArray.includes('required') && !thisInstance.isValue(input.value)) {
                                    if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                        const errorTips = document.createElement('small');
                                        errorTips.classList.add('tips');
                                        errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorRequired'];
                                        input.closest('div.iweb-input').appendChild(errorTips);
                                    }
                                    input.closest('div.iweb-input').classList.add('error');
                                    canSubmit = false;
                                } 
                                else if (thisInstance.isValue(input.value)) {
                                    let nextRegex = true;
                                    if ((validationArray.includes('number')) && !thisInstance.isNumber(input.value)) {
                                        if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                            const errorTips = document.createElement('small');
                                            errorTips.classList.add('tips');
                                            errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorNumberFormat'];
                                            input.closest('div.iweb-input').appendChild(errorTips);
                                        }
                                        input.closest('div.iweb-input').classList.add('error');
                                        canSubmit = false;
                                        nextRegex = false;
                                    } 
                                    else if ((validationArray.includes('email')) && !thisInstance.isEmail(input.value)) {
                                        if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                            const errorTips = document.createElement('small');
                                            errorTips.classList.add('tips');
                                            errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorEmailFormat'];
                                            input.closest('div.iweb-input').appendChild(errorTips);
                                        }
                                        input.closest('div.iweb-input').classList.add('error');
                                        canSubmit = false;
                                        nextRegex = false;
                                    } 
                                    else if ((validationArray.includes('password')) && !thisInstance.isPassword(input.value)) {
                                        if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                            const errorTips = document.createElement('small');
                                            errorTips.classList.add('tips');
                                            errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorPasswordFormat'];
                                            input.closest('div.iweb-input').appendChild(errorTips);
                                        }
                                        input.closest('div.iweb-input').classList.add('error');
                                        canSubmit = false;
                                        nextRegex = false;
                                    } 
                                    else if ((validationArray.includes('date')) && !thisInstance.isDate(input.value)) {
                                        if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                            const errorTips = document.createElement('small');
                                            errorTips.classList.add('tips');
                                            errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorDateFormat'];
                                            input.closest('div.iweb-input').appendChild(errorTips);
                                        }
                                        input.closest('div.iweb-input').classList.add('error');
                                        canSubmit = false;
                                        nextRegex = false;
                                    } 
                                    else if ((validationArray.includes('time')) && !thisInstance.isTime(input.value)) {
                                        if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                            const errorTips = document.createElement('small');
                                            errorTips.classList.add('tips');
                                            errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorTimeFormat'];
                                            input.closest('div.iweb-input').appendChild(errorTips);
                                        }
                                        input.closest('div.iweb-input').classList.add('error');
                                        canSubmit = false;
                                        nextRegex = false;
                                    } 
                                    else if ((validationArray.includes('ge0'))) {
                                        if (!thisInstance.isNumber(input.value)) {
                                            if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                                const errorTips = document.createElement('small');
                                                errorTips.classList.add('tips');
                                                errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorNumberFormat'];
                                                input.closest('div.iweb-input').appendChild(errorTips);
                                            }
                                            input.closest('div.iweb-input').classList.add('error');
                                            canSubmit = false;
                                            nextRegex = false;
                                        } 
                                        else {
                                            const regex = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
                                            if (!regex.test(input.value)) {
                                                if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                                    const errorTips = document.createElement('small');
                                                    errorTips.classList.add('tips');
                                                    errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorGE0'];
                                                    input.closest('div.iweb-input').appendChild(errorTips);
                                                }
                                                input.closest('div.iweb-input').classList.add('error');
                                                canSubmit = false;
                                                nextRegex = false;
                                            }
                                        }
                                    } 
                                    else if ((validationArray.includes('gt0'))) {
                                        if (!thisInstance.isNumber(input.value)) {
                                            if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                                const errorTips = document.createElement('small');
                                                errorTips.classList.add('tips');
                                                errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorNumberFormat'];
                                                input.closest('div.iweb-input').appendChild(errorTips);
                                            }
                                            input.closest('div.iweb-input').classList.add('error');
                                            canSubmit = false;
                                            nextRegex = false;
                                        } 
                                        else if (parseFloat(input.value) <= 0) {
                                            if (showTips && !input.closest('div.iweb-input').querySelector('small.tips')) {
                                                const errorTips = document.createElement('small');
                                                errorTips.classList.add('tips');
                                                errorTips.textContent = thisInstance.language[thisInstance.currentLangCode]['errorGT0'];
                                                input.closest('div.iweb-input').appendChild(errorTips);
                                            }
                                            input.closest('div.iweb-input').classList.add('error');
                                            canSubmit = false;
                                            nextRegex = false;
                                        }
                                    }

                                    if (nextRegex && validationArray.includes('regex')) {
                                        const regex = new RegExp(input.getAttribute('data-regex'));
                                        const regexError = input.getAttribute('data-error');
                                        if (!regex.test(input.value.toString().toLowerCase())) {
                                            if (showTips && !input.closest('div.iweb-input').querySelector('small.tips') && thisInstance.isValue(regexError)) {
                                                const errorTips = document.createElement('small');
                                                errorTips.classList.add('tips');
                                                errorTips.textContent = regexError.toString();
                                                input.closest('div.iweb-input').appendChild(errorTips);
                                            }
                                            input.closest('div.iweb-input').classList.add('error');
                                            canSubmit = false;
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // Extra checking if need
                    let extraCanSubmit = true;
                    const validationFunc = form.getAttribute('data-vfunc');
                    if (canSubmit && (typeof window[validationFunc]) === 'function') {
                        extraCanSubmit = window[validationFunc](canSubmit);
                    }

                    if (canSubmit && extraCanSubmit) {
                        let requestData = {
                            method: 'POST',
                            url: form.action,
                            payload: {},
                            includedToken: true,
                            dataType: 'json',
                            showBusy: busyMode
                        };

                        // Iterate over form data
                        const formData = new FormData(form);
                        formData.forEach(function(value, key) {
                            const regex = /(.*)((\[)(.*)(\]))$/i; // Regular expression
                            const match = key.match(regex);
                            if (match) {
                                let baseName = match[1];
                                let childIndex = match[4]
                                if (!requestData.payload[baseName]) {
                                    requestData.payload[baseName] = {};
                                }
                                if (!thisInstance.isValue(childIndex)) {
                                    childIndex = Object.keys(requestData.payload[baseName]).length + 1;
                                }
                                requestData.payload[baseName][childIndex] = value;
                            } 
                            else {
                                requestData.payload[key] = value;
                            }
                        });

                        thisInstance.doRequest(requestData, function(responseData) {
                            // Callback
                            const completeFunc = form.getAttribute('data-cfunc');
                            const extraFunc = form.getAttribute('data-efunc');
                            if ((typeof window[completeFunc]) === 'function') {
                                window[completeFunc](responseData);
                            } 
                            else {   
                                if(thisInstance.isMatch(responseData.status, 200)) {
                                    if (thisInstance.isValue(responseData.url)) {
                                        if (thisInstance.isMatch(alertResult, true) || thisInstance.isMatch(alertResult, 1)) {
                                            thisInstance.alert(responseData.message, function() {
                                                if (!thisInstance.isMatch(responseData.url, '#')) {
                                                    window.location.href = responseData.url;
                                                } 
                                                else {
                                                    window.location.reload();
                                                }
                                            });
                                        }
                                        else {
                                            if (!thisInstance.isMatch(responseData.url, '#')) {
                                                window.location.href = responseData.url;
                                            } 
                                            else {
                                                window.location.reload();
                                            }
                                        }
                                        return;
                                    }
                                }
                                
                                thisInstance.tipsMsg(responseData.message, (thisInstance.isValue(responseData.status) && thisInstance.isMatch(responseData.status, 200)));
                                
                                if ((typeof window[extraFunc]) === 'function') {
                                    window[extraFunc](responseData);
                                }
                            }
                        });
                    } 
                    else if (!canSubmit && extraCanSubmit) {
                        const tipsMessageArea = document.querySelector('div.iweb-tips-message');
                        if (tipsMessageArea) {
                            thisInstance.tipsMsg(thisInstance.language[thisInstance.currentLangCode]['errorRequiredAll'], false);
                        }
                        thisInstance.scrollTo('.error');
                    }
                    
                    return false;
                }));

                // Bind event for form reset
                form.addEventListener('reset', thisInstance.deBounce(function() {
                    const resetElements = form.querySelectorAll('input, select, textarea');
                    if (resetElements.length > 0) {
                        resetElements.forEach(function(element) {
                            if (thisInstance.isMatch(element.type, 'checkbox') ||
                                thisInstance.isMatch(element.type, 'radio') ||
                                thisInstance.isMatch(element.type, 'select-one') ||
                                thisInstance.isMatch(element.type, 'select-multiple')) {
                                element.dispatchEvent(new Event('change', {
                                    bubbles: true
                                }));
                            } 
                            else {
                                if (element.closest('div.iweb-input-autocomplete')) {
                                    // Remove error & tips
                                    element.closest('div.iweb-input-autocomplete').classList.remove('error');
                                    const oriSmallTips = element.closest('div.iweb-input-autocomplete').querySelector('small.tips');
                                    if(oriSmallTips) {
                                        oriSmallTips.remove();
                                    }

                                    const fillID = element.closest('div.iweb-input-autocomplete').querySelector('input.fill-id');
                                    const fillText = element.closest('div.iweb-input-autocomplete').querySelector('input.fill-text');
                                    const oriFillReset = element.closest('div.iweb-input-autocomplete').querySelector('a.fill-reset');
                                    if(oriFillReset) {
                                        oriFillReset.remove();
                                    }

                                    if (thisInstance.isValue(fillText.getAttribute('data-value')) && thisInstance.isValue(fillText.getAttribute('data-default'))) {
                                        fillID.value = fillText.getAttribute('data-value');
                                        fillText.value = fillText.getAttribute('data-default');
                                        fillText.readOnly = false;

                                        // Create reset button
                                        const fillReset = document.createElement('a');
                                        fillReset.classList.add('fill-reset');

                                        // Create Reset icon
                                        const fillResetIcon = document.createElement('i');
                                        fillResetIcon.classList.add('fa');
                                        fillResetIcon.classList.add('fa-times');
                                        fillResetIcon.style.color = '#d73d32';

                                        // Append elements
                                        fillReset.appendChild(fillResetIcon);
                                        element.closest('div.iweb-input-autocomplete').appendChild(fillReset);
                                    }
                                } 
                                else {
                                    element.dispatchEvent(new Event('input', {
                                        bubbles: true
                                    }));
                                }
                            }
                        });
                    }
                }, 100, false));
            });
        }
    }

    uploader(options, callBack) {
        const thisInstance = this;

        // Create input file
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.addEventListener('change', thisInstance.deBounce(function(e) {
            const fileInput = this;
            const target = e.target;

            // Max 8 files
            const maxFiles = Math.max(1, (thisInstance.isValue(options) && thisInstance.isValue(options.maxFiles))?parseInt(options.maxFiles):8);
            let selectedFiles = fileInput.files;
            if (selectedFiles.length > maxFiles) {
                selectedFiles = Array.from(selectedFiles).slice(0, maxFiles);
            }
            thisInstance.uploaderFiles.selectedFiles = selectedFiles;
            thisInstance.uploaderFilesIgnore.selectedFiles = [-1];
            thisInstance.uploaderOptions.selectedFiles = {
                method: 'POST',
                url: '',
                payload: {},
                includedToken: true,
                dataType: 'json',
                showBusy: false,
                
                allowedTypes: '',
                maxFileSize: 64,
                typeErrorMessage: thisInstance.language[thisInstance.currentLangCode]['errorFileType'],
                maxErrorMessage: thisInstance.language[thisInstance.currentLangCode]['errorMaxFileSize'],
                btnStartAll: '<i class="fa fa-cloud-upload"></i>',
                btnClose: '<i class="fa fa-close"></i>',
                btnStart: '<i class="fa fa-cloud-upload"></i>',
                btnRemove: '<i class="fa fa-trash"></i>',
                autoClose: false
            };
            if (thisInstance.isValue(options)) {
                Object.assign(thisInstance.uploaderOptions.selectedFiles, options);
            }
            if (thisInstance.isValue(thisInstance.uploaderOptions.selectedFiles.allowedTypes)) {
                thisInstance.uploaderOptions.selectedFiles.allowedTypes = thisInstance.uploaderOptions.selectedFiles.allowedTypes.split('|');
            }
            thisInstance.uploaderOptions.selectedFiles.maxErrorMessage = thisInstance.uploaderOptions.selectedFiles.maxErrorMessage.replace('{num}', thisInstance.uploaderOptions.selectedFiles.maxFileSize);

            // Create upload panel
            if (thisInstance.isValue(thisInstance.uploaderOptions.selectedFiles.url) && thisInstance.uploaderFiles.selectedFiles.length > 0) {
                // Create div for button
                const uploaderDiv = document.createElement('div');
                uploaderDiv.classList.add('action');

                const startAllButton = document.createElement('button');
                startAllButton.type = 'button';
                startAllButton.classList.add('start-all');
                startAllButton.innerHTML = thisInstance.uploaderOptions.selectedFiles.btnStartAll;

                const closeAllButton = document.createElement('button');
                closeAllButton.type = 'button';
                closeAllButton.classList.add('close');
                closeAllButton.innerHTML = thisInstance.uploaderOptions.selectedFiles.btnClose;

                uploaderDiv.appendChild(startAllButton);
                uploaderDiv.appendChild(closeAllButton);

                // Create div for list
                const listContainer = document.createElement('div');
                listContainer.classList.add('list');

                // Append elements
                const dialogContent = document.createElement('div');
                dialogContent.appendChild(uploaderDiv);
                dialogContent.appendChild(listContainer);

                // Preview list
                thisInstance.dialog(dialogContent.innerHTML, function() {
                    thisInstance.uploaderPreview(thisInstance.uploaderFiles.selectedFiles);

                    // Event handlers
                    const startAllButton = document.querySelector('div.iweb-info-dialog.uploader > div > div.content > div > div.action > button.start-all');
                    const closeAllButton = document.querySelector('div.iweb-info-dialog.uploader > div > div.content > div > div.action > button.close');
                    const listContainer = document.querySelector('div.iweb-info-dialog.uploader > div > div.content > div > div.list');

                    startAllButton.addEventListener('click', thisInstance.deBounce(function() {
                        const items = listContainer.querySelectorAll('div.item');
                        let loopUploadIndex = [];
                        items.forEach(function(item) {
                            loopUploadIndex.push(item.getAttribute('data-index').toString());
                        });
                        thisInstance.uploaderStart(-1, loopUploadIndex, loopUploadIndex[loopUploadIndex.length - 1]);
                    }));

                    closeAllButton.addEventListener('click', thisInstance.deBounce(function() {
                        document.querySelector('div.iweb-info-dialog.uploader > div > div.content > a.btn-close').dispatchEvent(new Event('click', {
                            bubbles: true
                        }));
                    }));

                    listContainer.querySelectorAll('div.item > button.start').forEach(function(button) {
                        button.addEventListener('click', thisInstance.deBounce(function(e1) {
                            const target = e1.target;
                            thisInstance.uploaderStart(target.closest('div.item').getAttribute('data-index'));
                        }));
                    });

                    listContainer.querySelectorAll('div.item > button.remove').forEach(function(button) {
                        button.addEventListener('click', thisInstance.deBounce(function(e2) {
                            const target = e2.target;
                            thisInstance.uploaderFilesIgnore.selectedFiles.push(target.closest('div.item').getAttribute('data-index').toString());
                            target.closest('div.item').remove();
                            if (listContainer.querySelectorAll('div.item').length === 0) {
                                document.querySelector('div.iweb-info-dialog.uploader > div > div.content > a.btn-close').dispatchEvent(new Event('click', {
                                    bubbles: true
                                }));
                            }
                        }));
                    });
                }, function() {
                    // Callback
                    if ((typeof callBack) === 'function') {
                        callBack();
                    }
                }, 'uploader');
            }
        }));

        // Auto click
        fileInput.click();
    }

    uploaderArea(fileInputID, options, callBack) {
        const thisInstance = this;

        // Create input file
        const fileInput = document.getElementById(fileInputID);
        fileInput.removeAttribute('name');
        fileInput.multiple = true;
        fileInput.addEventListener('change', thisInstance.deBounce(function(e) {
            const fileInput = this;
            const target = e.target;

            // Max 8 files
            const maxFiles = Math.max(1, (thisInstance.isValue(options) && thisInstance.isValue(options.maxFiles))?parseInt(options.maxFiles):8);
            let selectedFiles = fileInput.files;
            if (selectedFiles.length > maxFiles) {
                selectedFiles = Array.from(selectedFiles).slice(0, maxFiles);
            }
            thisInstance.uploaderFiles['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)] = selectedFiles;
            thisInstance.uploaderFilesIgnore['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)] = [-1];
            thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)] = {
                method: 'POST',
                url: '',
                payload: {},
                includedToken: true,
                dataType: 'json',
                showBusy: false,
                
                allowedTypes: '',
                maxFileSize: 64,
                typeErrorMessage: thisInstance.language[thisInstance.currentLangCode]['errorFileType'],
                maxErrorMessage: thisInstance.language[thisInstance.currentLangCode]['errorMaxFileSize'],
                btnStartAll: '<i class="fa fa-cloud-upload"></i>',
                btnClose: '<i class="fa fa-close"></i>',
                btnStart: '<i class="fa fa-cloud-upload"></i>',
                btnRemove: '<i class="fa fa-trash"></i>',
                autoClose: false
            };
            if (thisInstance.isValue(options)) {
                thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)] = Object.assign(
                    thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)],
                    options
                );
            }
            if (thisInstance.isValue(thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].allowedTypes)) {
                thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].allowedTypes = thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].allowedTypes.split('|');
            }
            thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].maxErrorMessage = thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].maxErrorMessage.replace('{num}', thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].maxFileSize);

            if (thisInstance.isValue(thisInstance.uploaderOptions['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].url) && fileInput.files.length > 0) {
                const uploaderAreDiv = target.closest('div.iweb-files-dropzone').querySelector('div.iweb-files-uploader');

                // Create div for button
                const uploaderDiv = document.createElement('div');
                uploaderDiv.className = 'action';

                const startAllButton = document.createElement('button');
                startAllButton.className = 'start-all';
                startAllButton.type = 'button';
                startAllButton.title = 'Start All';
                startAllButton.innerHTML = '<i class="fa fa-cloud-upload"></i>';

                const closeAllButton = document.createElement('button');
                closeAllButton.className = 'close';
                closeAllButton.type = 'button';
                closeAllButton.innerHTML = '<i class="fa fa-close"></i>';

                const listContainer = document.createElement('div');
                listContainer.classList.add('list');

                // Append elements
                uploaderDiv.appendChild(startAllButton);
                uploaderDiv.appendChild(closeAllButton);
                uploaderAreDiv.appendChild(uploaderDiv);
                uploaderAreDiv.appendChild(listContainer);

                // Preview list
                thisInstance.uploaderPreview(thisInstance.uploaderFiles['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)], 0, fileInputID);

                // Event handlers
                startAllButton.addEventListener('click', thisInstance.deBounce(function() {
                    const items = listContainer.querySelectorAll('div.item');
                    let loopUploadIndex = [];
                    items.forEach(function(item) {
                        loopUploadIndex.push(item.getAttribute('data-index').toString());
                    });
                    thisInstance.uploaderStart(-1, loopUploadIndex, loopUploadIndex[loopUploadIndex.length - 1], fileInputID);
                }));

                closeAllButton.addEventListener('click', thisInstance.deBounce(function() {
                    uploaderAreDiv.innerHTML = '';
                    fileInput.value = '';
                    // Callback
                    if ((typeof callBack) === 'function') {
                        callBack();
                    }
                }));

                listContainer.querySelectorAll('div.item > button.start').forEach(function(button) {
                    button.addEventListener('click', thisInstance.deBounce(function(e1) {
                        const target = e1.target;
                        thisInstance.uploaderStart(target.closest('div.item').getAttribute('data-index'), null, null, fileInputID);
                    }));
                });

                listContainer.querySelectorAll('div.item > button.remove').forEach(function(button) {
                    button.addEventListener('click', thisInstance.deBounce(function(e2) {
                        const target = e2.target;
                        thisInstance.uploaderFilesIgnore['inline_selectedFiles_' + thisInstance.md5.hash(fileInputID)].push(target.closest('div.item').getAttribute('data-index').toString());
                        target.closest('div.item').remove();
                        if (listContainer.querySelectorAll('div.item').length === 0) {
                            uploaderAreDiv.innerHTML = '';
                            fileInput.value = '';
                        }
                    }));
                });
            }
        }));

        // Append elements
        const parent = fileInput.parentElement;
        parent.id = fileInputID + '-iweb-files-dropzone';
        parent.classList.add('iweb-files-dropzone');

        const uploaderDiv = document.createElement('div');
        uploaderDiv.className = 'iweb-files-uploader';
        parent.appendChild(uploaderDiv);
    }

    uploaderPreview(selectingFiles, key = 0, fileInputID) {
        const thisInstance = this;
        const regex = /^(.*)(.jpg|.jpeg|.gif|.png|.bmp)$/;

        if (key >= selectingFiles.length) return; // Exit if there are no more files

        let file = selectingFiles[key];
        let extension = file.name.split('.').pop().toLowerCase();
        let checking = true;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.setAttribute('data-index', key);

        const photoDiv = document.createElement('div');
        photoDiv.classList.add('photo');
        const imgElement = document.createElement('img');

        if (regex.test(file.name.toLowerCase()) && (typeof(FileReader) !== 'undefined')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgElement.src = e.target.result;
                photoDiv.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        } 
        else {
            const fileIcons = {
                pdf: '<i class="fa fa-file-pdf-o" style="color:#ef4130;"></i>',
                doc: '<i class="fa fa-file-word-o" style="color:#5091cd;"></i>',
                docx: '<i class="fa fa-file-word-o" style="color:#5091cd;"></i>',
                xls: '<i class="fa fa-file-excel-o" style="color:#66cdaa;"></i>',
                xlsx: '<i class="fa fa-file-excel-o" style="color:#66cdaa;"></i>',
                ppt: '<i class="fa fa-file-powerpoint-o" style="color:#f7b002;"></i>',
                pptx: '<i class="fa fa-file-powerpoint-o" style="color:#f7b002;"></i>',
                txt: '<i class="fa fa-file-text-o"></i>',
                avi: '<i class="fa fa-file-video-o" style="color:#5091cd;"></i>',
                mov: '<i class="fa fa-file-video-o" style="color:#5091cd;"></i>',
                mp4: '<i class="fa fa-file-video-o" style="color:#5091cd;"></i>',
                ogg: '<i class="fa fa-file-video-o" style="color:#5091cd;"></i>',
                wmv: '<i class="fa fa-file-video-o" style="color:#5091cd;"></i>',
                webm: '<i class="fa fa-file-video-o" style="color:#5091cd;"></i>',
                mp3: '<i class="fa fa-file-audio-o" style="color:#66cdaa;"></i>',
                wav: '<i class="fa fa-file-audio-o" style="color:#66cdaa;"></i>',
                rar: '<i class="fa fa-file-zip-o" style="color:#f7b002;"></i>',
                zip: '<i class="fa fa-file-zip-o" style="color:#f7b002;"></i>'
            };
            photoDiv.innerHTML = fileIcons[extension] || '<i class="fa fa-file-code-o"></i>';
        }

        itemDiv.appendChild(photoDiv);

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info');

        const titleDiv = document.createElement('div');
        titleDiv.classList.add('title');
        titleDiv.textContent = file.name;
        infoDiv.appendChild(titleDiv);

        const sizeDiv = document.createElement('div');
        sizeDiv.classList.add('size');
        sizeDiv.textContent = thisInstance.formatBytes(file.size, 0);
        infoDiv.appendChild(sizeDiv);

        const hashKey = thisInstance.isValue(fileInputID) ?
            'inline_selectedFiles_' + thisInstance.md5.hash(fileInputID) :
            'selectedFiles';

        const options = thisInstance.uploaderOptions[hashKey];
        const allowedTypes = options.allowedTypes || [];
        const maxFileSize = options.maxFileSize * 1024 * 1024;

        if (allowedTypes.length && allowedTypes.indexOf(extension) < 0) {
            const tipsDiv = document.createElement('div');
            tipsDiv.classList.add('tips');
            tipsDiv.innerHTML = '<small>' + options.typeErrorMessage + '</small>';
            infoDiv.appendChild(tipsDiv);
            checking = false;
        } 
        else if (file.size > maxFileSize) {
            const tipsDiv = document.createElement('div');
            tipsDiv.classList.add('tips');
            tipsDiv.innerHTML = '<small>' + options.maxErrorMessage + '</small>';
            infoDiv.appendChild(tipsDiv);
            checking = false;
        } 
        else {
            const progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar');
            progressBar.innerHTML = '<div class="percent"></div>';
            infoDiv.appendChild(progressBar);
        }

        itemDiv.appendChild(infoDiv);

        if (checking) {
            const startButton = document.createElement('button');
            startButton.type = 'button';
            startButton.classList.add('start');
            startButton.innerHTML = '<i class="fa fa-cloud-upload"></i>';
            itemDiv.appendChild(startButton);
        }

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('remove');
        removeButton.innerHTML = '<i class="fa fa-trash"></i>';
        itemDiv.appendChild(removeButton);

        const dropzone = thisInstance.isValue(fileInputID) ?
            '#' + fileInputID + '-iweb-files-dropzone > div.iweb-files-uploader > div.list' :
            'div.iweb-info-dialog.uploader > div > div.content > div > div.list';

        document.querySelector(dropzone).appendChild(itemDiv);

        // Continue to preview the next file
        thisInstance.uploaderPreview(selectingFiles, key + 1, fileInputID);
    }

    uploaderStart(index, loopUploadIndex, lastUploadIndex, fileInputID) {
        const thisInstance = this;

        let mainIndex = 'selectedFiles';
        if (thisInstance.isValue(fileInputID)) {
            mainIndex = 'inline_selectedFiles_' + thisInstance.md5.hash(fileInputID);
        }

        // Helper function to safely call if the function is defined
        const safeEndFunction = () => {
            const uploaderDialog = (thisInstance.isValue(fileInputID)) ? document.querySelector('#' + fileInputID + '-iweb-files-dropzone') : document.querySelector('div.iweb-info-dialog.uploader');
            if (uploaderDialog) {
                const startCount = uploaderDialog.querySelectorAll('div.list > div.item > button.start').length;
                if (parseInt(startCount) === 0) {
                    const oriBtnStartAll = uploaderDialog.querySelector('div.action > button.start-all');
                    if(oriBtnStartAll) {
                        oriBtnStartAll.remove();
                    }
                    
                    if (thisInstance.uploaderOptions[mainIndex].autoClose) {
                        uploaderDialog.querySelector('div.action > button.close').dispatchEvent(new Event('click', {
                            bubbles: true
                        }));
                    }
                }
                uploaderDialog.classList.remove('busy');
            }
        };

        const uploaderDialog = (thisInstance.isValue(fileInputID)) ? document.querySelector('#' + fileInputID + '-iweb-files-dropzone') : document.querySelector('div.iweb-info-dialog.uploader');
        uploaderDialog.classList.add('busy');

        // Init
        let isBatch = true;
        if (!thisInstance.isValue(loopUploadIndex)) {
            loopUploadIndex = [index];
            lastUploadIndex = index;
            isBatch = false;
        } 
        else {
            index = index + 1;
        }

        // Upload one by one
        if (parseInt(index) <= parseInt(lastUploadIndex)) {
            if (!loopUploadIndex.includes(index.toString())) {
                if (isBatch) {
                    thisInstance.uploaderStart(index, loopUploadIndex, lastUploadIndex, fileInputID);
                } 
                else {
                    safeEndFunction();
                }
            } 
            else {
                if (thisInstance.isValue(thisInstance.uploaderFiles[mainIndex]) && !thisInstance.uploaderFilesIgnore[mainIndex].includes(index.toString())) {
                    thisInstance.uploaderFilesIgnore[mainIndex].push(index.toString());

                    const selectingFiles = thisInstance.uploaderFiles[mainIndex];
                    const extension = selectingFiles[index].name.split('.').pop().toLowerCase();
                    let checking = true;
                    if (thisInstance.isValue(thisInstance.uploaderOptions[mainIndex].allowedTypes) && !thisInstance.uploaderOptions[mainIndex].allowedTypes.includes(extension.toString())) {
                        checking = false;
                    } 
                    else if (selectingFiles[index].size > thisInstance.uploaderOptions[mainIndex].maxFileSize * 1024 * 1024) {
                        checking = false;
                    }

                    if (checking) {
                        let requestData = {
                            method: 'POST',
                            url: thisInstance.uploaderOptions[mainIndex].url,
                            payload: {},
                            includedToken: true,
                            dataType: 'json',
                            showBusy: false
                        };

                        const formData = new FormData();
                        formData.append('page_action', 'file_upload');
                        if (thisInstance.isValue(thisInstance.uploaderOptions[mainIndex].payload)) {
                            const extraPayload = thisInstance.uploaderOptions[mainIndex].payload;
                            for (let key in extraPayload) {
                                if (extraPayload.hasOwnProperty(key)) {
                                    formData.append(key, extraPayload[key]);
                                }
                            }
                        }
                        formData.append('myfile', selectingFiles[index], selectingFiles[index].name);
                        formData.forEach(function(value, key) {
                            requestData.payload[key] = value;
                        });

                        thisInstance.doRequest(requestData, function(responseData) {
                            const itemDiv = uploaderDialog.querySelector('div.list > div.item[data-index="' + index + '"]');
                            const oriProgressBar = itemDiv.querySelector('div.info > div.progress-bar');
                            if(oriProgressBar) {
                                oriProgressBar.remove();
                            }

                            const message = (responseData.message || responseData);
                            const infoDiv = itemDiv.querySelector('div.info');
                            const tipsDiv = document.createElement('div');
                            tipsDiv.classList.add('tips');
                            tipsDiv.innerHTML = '<small>' + message + '</small>';
                            infoDiv.appendChild(tipsDiv);

                            // Next
                            if (isBatch) {
                                thisInstance.uploaderStart(index, loopUploadIndex, lastUploadIndex, fileInputID);
                            } 
                            else {
                                safeEndFunction();
                            }
                        }, null, function(percentage) {
                            const itemDiv = uploaderDialog.querySelector('div.list > div.item[data-index="' + index + '"]');
                            const oriBtnStart = itemDiv.querySelector('button.start');
                            if(oriBtnStart) {
                                oriBtnStart.remove();
                            }
                            const oriBtnRemove = itemDiv.querySelector('button.remove');
                            if(oriBtnRemove) {
                                oriBtnRemove.remove();
                            }

                            const progressBarPercent = itemDiv.querySelector('div.info > div.progress-bar > div.percent');
                            if (progressBarPercent) {
                                progressBarPercent.style.width = percentage + '%';
                            }
                        });
                    } 
                    else {
                        const itemDiv = uploaderDialog.querySelector('div.list > div.item[data-index="' + index + '"]');
                        const oriBtnStart = itemDiv.querySelector('button.start');
                        if(oriBtnStart) {
                            oriBtnStart.remove();
                        }
                        const oriBtnRemove = itemDiv.querySelector('button.remove');
                        if(oriBtnRemove) {
                            oriBtnRemove.remove();
                        }

                        // Next
                        if (isBatch) {
                            thisInstance.uploaderStart(index, loopUploadIndex, lastUploadIndex, fileInputID);
                        } 
                        else {
                            safeEndFunction();
                        }
                    }
                } 
                else {
                    if (isBatch) {
                        thisInstance.uploaderStart(index, loopUploadIndex, lastUploadIndex, fileInputID);
                    } 
                    else {
                        safeEndFunction();
                    }
                }
            }
        } 
        else {
            safeEndFunction();
        }
    }

    // dialog
    alert(message, callBack, customizeClassName) {
        // Prevent duplicate dialogs
        if (document.querySelectorAll('div.iweb-alert-dialog').length > 0) {
            return;
        }

        const thisInstance = this;
        if (thisInstance.isValue(message)) {
            // Create div
            const alertDialog = document.createElement('div');
            alertDialog.classList.add('iweb-alert-dialog');
            if (thisInstance.isValue(customizeClassName)) {
                alertDialog.classList.add(customizeClassName);
            }

            const innerDiv = document.createElement('div');
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');
            contentDiv.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            contentDiv.style.transform = 'translateY(-320%)';
            contentDiv.style.opacity = '0';

            const detailsDiv = document.createElement('div');
            detailsDiv.innerHTML = message;

            // Create close button
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.classList.add('btn');
            closeButton.classList.add('btn-close');
            closeButton.textContent = thisInstance.language[thisInstance.currentLangCode]['btnConfirm'];
            closeButton.addEventListener('click', thisInstance.deBounce(function(e) {
                const target = e.target;
                contentDiv.style.transform = 'translateY(-320%)';
                contentDiv.style.transform = '0';
                contentDiv.addEventListener('transitionend', function() {
                    target.closest('div.iweb-alert-dialog').remove();
                    if (document.querySelectorAll('div.iweb-alert-dialog').length === 0 && document.querySelectorAll('div.iweb-info-dialog').length === 0) {
                        document.body.classList.remove('iweb-disable-scroll');
                    }

                    // Callback
                    if ((typeof callBack) === 'function') {
                        callBack();
                    }
                }, {
                    once: true
                });
            }));

            // Append to body
            const viewer = document.querySelector('div.iweb-viewer');
            innerDiv.appendChild(contentDiv);
            contentDiv.appendChild(detailsDiv);
            contentDiv.appendChild(closeButton);
            alertDialog.appendChild(innerDiv);
            viewer.insertBefore(alertDialog, viewer.firstChild);
            document.body.classList.add('iweb-disable-scroll');

            // Show dialog
            setTimeout(function() {
                thisInstance.showBusy(false);
                contentDiv.style.transform = 'translateY(0)';
                contentDiv.style.opacity = '1';
            }, 100);
        }
        else {
            // Callback
            if ((typeof callBack) === 'function') {
                callBack();
            }
        }
    }

    confirm(message, callBack, customizeClassName) {
        // Prevent duplicate dialogs
        if (document.querySelectorAll('div.iweb-alert-dialog').length > 0) {
            return;
        }

        const thisInstance = this;
        if (thisInstance.isValue(message)) {
            // Create div
            const alertDialog = document.createElement('div');
            alertDialog.classList.add('iweb-alert-dialog');
            if (thisInstance.isValue(customizeClassName)) {
                alertDialog.classList.add(customizeClassName);
            }

            const innerDiv = document.createElement('div');
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');
            contentDiv.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            contentDiv.style.transform = 'translateY(-320%)';
            contentDiv.style.opacity = '0';

            const detailsDiv = document.createElement('div');
            detailsDiv.innerHTML = message;

            // Create the yes/no button
            const yesButton = document.createElement('button');
            yesButton.type = 'button';
            yesButton.classList.add('btn');
            yesButton.classList.add('btn-yes');
            yesButton.textContent = thisInstance.language[thisInstance.currentLangCode]['btnYes'];
            yesButton.addEventListener('click', thisInstance.deBounce(function(e) {
                const target = e.target;
                contentDiv.style.transform = 'translateY(-320%)';
                contentDiv.style.transform = '0';
                contentDiv.addEventListener('transitionend', function() {
                    target.closest('div.iweb-alert-dialog').remove();
                    if (document.querySelectorAll('div.iweb-alert-dialog').length === 0 && document.querySelectorAll('div.iweb-info-dialog').length === 0) {
                        document.body.classList.remove('iweb-disable-scroll');
                    }

                    // Callback
                    if ((typeof callBack) === 'function') {
                        callBack(true);
                    }
                }, {
                    once: true
                });
            }));

            const noButton = document.createElement('button');
            noButton.type = 'button';
            noButton.classList.add('btn');
            noButton.classList.add('btn-no');
            noButton.textContent = thisInstance.language[thisInstance.currentLangCode]['btnNo'];
            noButton.addEventListener('click', thisInstance.deBounce(function(e) {
                const target = e.target;
                contentDiv.style.transform = 'translateY(-320%)';
                contentDiv.style.transform = '0';
                contentDiv.addEventListener('transitionend', function() {
                    target.closest('div.iweb-alert-dialog').remove();
                    if (document.querySelectorAll('div.iweb-alert-dialog').length === 0 && document.querySelectorAll('div.iweb-info-dialog').length === 0) {
                        document.body.classList.remove('iweb-disable-scroll');
                    }

                    // Callback
                    if ((typeof callBack) === 'function') {
                        callBack(false);
                    }
                }, {
                    once: true
                });
            }));

            // Append to body
            const viewer = document.querySelector('div.iweb-viewer');
            innerDiv.appendChild(contentDiv);
            contentDiv.appendChild(detailsDiv);
            contentDiv.appendChild(yesButton);
            contentDiv.appendChild(noButton);
            alertDialog.appendChild(innerDiv);
            viewer.insertBefore(alertDialog, viewer.firstChild);
            document.body.classList.add('iweb-disable-scroll');

            setTimeout(function() {
                thisInstance.showBusy(false);
                contentDiv.style.transform = 'translateY(0)';
                contentDiv.style.opacity = '1';
            }, 100);
        }
        else {
            // Callback
            if ((typeof callBack) === 'function') {
                callBack();
            }
        }
    }

    dialog(htmlContent, initFunc, callBack, customizeClassName) {
        // Prevent duplicate dialogs
        if (document.querySelector('div.iweb-info-dialog')) {
            return;
        }

        const thisInstance = this;
        if (thisInstance.isValue(htmlContent)) {
            // Create div
            const infoDialog = document.createElement('div');
            infoDialog.classList.add('iweb-info-dialog');
            if (thisInstance.isValue(customizeClassName)) {
                infoDialog.classList.add(customizeClassName);
            }

            const innerDiv = document.createElement('div');
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');
            contentDiv.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            contentDiv.style.transform = 'translateY(-320%)';
            contentDiv.style.opacity = '0';

            const detailsDiv = document.createElement('div');
            if ((typeof htmlContent) === 'string') {
                detailsDiv.insertAdjacentHTML('beforeend', htmlContent);
            } 
            else {
                detailsDiv.appendChild(htmlContent);
            }

            // Create the close button
            const closeButton = document.createElement('a');
            closeButton.classList.add('btn');
            closeButton.classList.add('btn-close');
            closeButton.addEventListener('click', thisInstance.deBounce(function(e) {
                const target = e.target;
                contentDiv.style.transform = 'translateY(-320%)';
                contentDiv.style.transform = '0';
                contentDiv.addEventListener('transitionend', function() {
                    target.closest('div.iweb-info-dialog').remove();
                    if (document.querySelectorAll('div.iweb-alert-dialog').length === 0 && document.querySelectorAll('div.iweb-info-dialog').length === 0) {
                        document.body.classList.remove('iweb-disable-scroll');
                    }

                    // Callback
                    if ((typeof callBack) === 'function') {
                        callBack();
                    }
                }, {
                    once: true
                });
            }));

            // Append to body
            const viewer = document.querySelector('div.iweb-viewer');
            innerDiv.appendChild(contentDiv);
            contentDiv.appendChild(detailsDiv);
            contentDiv.appendChild(closeButton);
            infoDialog.appendChild(innerDiv);
            viewer.insertBefore(infoDialog, viewer.firstChild);
            document.body.classList.add('iweb-disable-scroll');

            // Show dialog
            setTimeout(function() {
                thisInstance.showBusy(false);

                // init component & form
                thisInstance.initComponent();

                // Callback
                if ((typeof initFunc) === 'function') {
                    initFunc();
                }

                contentDiv.style.transform = 'translateY(0)';
                contentDiv.style.opacity = '1';
            }, 100);
        }
    }
    
    modalDialog(htmlContent, initFunc, options) {
        const thisInstance = this;
        if(thisInstance.isValue(htmlContent)) {
            options = Object.assign({
                title : '',
                ClassName: '',
                width: 0,
                height: 0,
                init: initFunc
            }, options);
            if(!thisInstance.isValue(options.ClassName)) {
                options.ClassName = 'default';
            }
            new iModalDialog(htmlContent, options);
        }
    }

    tipsMsg(message, isSuccess = false, callBack) {
        const thisInstance = this;
        
        if (thisInstance.isValue(message)) {
            let tipsMessageArea = null;
            const popupDialog = document.querySelector('div.iweb-info-dialog') || document.querySelector('div.imodal-dialog.current');
            if(thisInstance.isValue(popupDialog)) {
                tipsMessageArea = popupDialog.querySelector('div.iweb-tips-message');
            }
            else {
                tipsMessageArea = document.querySelector('div.iweb-tips-message');
            }
            
            if (thisInstance.isValue(tipsMessageArea)) {
                const defaultOffset = Math.max(0, (tipsMessageArea.getAttribute('data-offset') || 0));
                tipsMessageArea.classList.remove('error');
                tipsMessageArea.classList.remove('success');
                tipsMessageArea.classList.add(((isSuccess) ? 'success' : 'error'));
                tipsMessageArea.innerHTML = '';
                const divElement = document.createElement('div');
                const closeButton = document.createElement('a');
                closeButton.className = 'close';
                closeButton.textContent = '×';
                const messageSpan = document.createElement('span');
                messageSpan.textContent = message;
                divElement.appendChild(closeButton);
                divElement.appendChild(messageSpan);
                tipsMessageArea.appendChild(divElement);
                thisInstance.scrollTo('div.iweb-tips-message', defaultOffset);
                // Callback
                if ((typeof callBack) === 'function') {
                    callBack();
                }
            }
            else {
                thisInstance.alert(message, callBack);
            }
        } 
        else {
            // Callback
            if ((typeof callBack) === 'function') {
                callBack();
            }
        }
    }

    // bind event
    bindEvent(eventType, selector, callBack) {
        const thisInstance = this;

        // If the eventType is not yet handled, set it up
        if (!thisInstance.eventMap[eventType]) {
            thisInstance.eventMap[eventType] = [];

            // Add a single event listener for the document on this event type
            document.addEventListener(eventType, function(e) {
                // Loop through all the registered selectors for this event type
                thisInstance.eventMap[eventType].forEach(function(item) {
                    const target = e.target.closest(item.selector);
                    if (target) {
                        // Call the corresponding callback with the target and event
                        item.callBack(target, e);
                    }
                });
            });
        }

        // Add the selector and its callback to the event map
        thisInstance.eventMap[eventType].push({
            selector,
            callBack
        });
    }

    unBindEvent(eventType, selector) {
        if (this.eventMap[eventType]) {
            // Filter out the event listener that matches the selector
            this.eventMap[eventType] = this.eventMap[eventType].filter(item => item.selector !== selector);

            // If there are no more selectors for this event type, clean up
            if (this.eventMap[eventType].length === 0) {
                delete this.eventMap[eventType];
            }
        }
    }

    triggerEvent(eventType, selector) {
        const target = document.querySelector(selector);
        if (target) {
            // Create a new event with the specified type
            const customEvent = new Event(eventType, {
                bubbles: true, // Allow the event to bubble up
                cancelable: true // Allow the event to be canceled
            });
            target.dispatchEvent(customEvent);
        }
    }

    // validation
    isValue(value) {
        if ((typeof value) === 'undefined' || value === null) {
            return false;
        } 
        else if (value instanceof HTMLElement) {
            return value.outerHTML.trim() !== '';
        } 
        else if ((typeof value) === 'object') {
            return Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0;
        }

        return value.toString().trim() !== '';
    }

    isMatch(value1, value2, sensitive = false) {
        const thisInstance = this;

        if (thisInstance.isValue(value1) && thisInstance.isValue(value2)) {
            const trimmedValue1 = (value1.toString().trim());
            const trimmedValue2 = (value2.toString().trim());
            return (sensitive) ? (trimmedValue1 === trimmedValue2) : (trimmedValue1.toLowerCase() === trimmedValue2.toLowerCase());
        }

        return false;
    }

    isNumber(value, digitalMode = false) {
        const thisInstance = this;
        const reg = ((digitalMode) ? /^[0-9]+$/ : /(^((-)?[1-9]{1}\d{0,2}|0\.|0$))(((\d)+)?)(((\.)(\d+))?)$/);

        if (thisInstance.isValue(value)) {
            return reg.test(value);
        }

        return false;
    }

    isEmail(value) {
        const thisInstance = this;
        const reg = /^([A-Za-z0-9_\-\.])+@([A-Za-z0-9_\-\.])+\.[A-Za-z]{2,}$/;

        if (thisInstance.isValue(value)) {
            return reg.test(value);
        }

        return false;
    }

    isPassword(value) {
        const thisInstance = this;
        const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

        if (thisInstance.isValue(value)) {
            return reg.test(value);
        }

        return false;
    }

    isDate(value, format = 'Y-m-d') {
        const thisInstance = this;
        const reg = /^(\d{4})(\-)(\d{2})(\-)(\d{2})$/;

        if (thisInstance.isValue(value)) {
            if (!thisInstance.isMatch(format, 'Y-m-d')) {
                value = value.split('/').reverse().join('-');
            }
            if (reg.test(value)) {
                let ymdChecking = true;
                const parts = value.split('-');
                const day = parseInt(parts[2]);
                const month = parseInt(parts[1]);
                const year = parseInt(parts[0]);
                if (isNaN(day) || isNaN(month) || isNaN(year)) {
                    ymdChecking = false;
                } 
                else {
                    if (year <= 0 || month <= 0 || month > 12 || day <= 0) {
                        ymdChecking = false;
                    } 
                    else if ([1, 3, 5, 7, 8, 10, 12].includes(month) && day > 31) {
                        ymdChecking = false;
                    } 
                    else if ([4, 6, 9, 11].includes(month) && day > 30) {
                        ymdChecking = false;
                    } 
                    else if (month == 2) {
                        const isLeapYear = ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0));
                        if ((isLeapYear && day > 29) || (!isLeapYear && day > 28)) {
                            ymdChecking = false;
                        }
                    }
                }

                return ((new Date(value) instanceof Date) && ymdChecking);
            }
        }

        return false;
    }

    isTime(value) {
        const thisInstance = this;
        const reg = /^(\d{2}):(\d{2})$/;

        if (thisInstance.isValue(value)) {
            const match = reg.exec(value);
            if (match) {
                const hours = parseInt(match[1], 10);
                const minutes = parseInt(match[2], 10);
                return (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59);
            }
        }
        return false;
    }

    // convert
    formatBytes(bytes, decimals) {
        // Return '0 Bytes' if bytes is falsy (0, null, undefined, etc.)
        if (!bytes) return '0 Bytes';

        const k = 1024; // Base of the byte conversion
        const dm = (decimals < 0) ? 0 : decimals; // Determine decimal places
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; // Size units

        // Calculate the index for the size
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        // Format the bytes and append the appropriate size unit
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    
    formatNumber(value, currencyMode, decimal = 2, autoBeautify = true) {
        const thisInstance = this;

        value = value.toString().replace(/[^\d|\-|\.]/g, '');
        if (thisInstance.isNumber(value)) {
            if (thisInstance.isNumber(decimal) && parseInt(decimal) > 0) {
                let power10 = Math.pow(10, decimal);
                value = value * power10;
                value = (Math.round(value) / power10).toString();
                let dpp = value.indexOf('.');
                if (dpp < 0) {
                    dpp = value.length;
                    value += '.';
                }
                while (value.length <= dpp + decimal) {
                    value += '0';
                }
            }
            if (autoBeautify) {
                value = value.toString().replace(/(\.\d+?)0+$/g, '$1');
                value = value.toString().replace(/(\.0)$/g, '');
            }
            if (thisInstance.isMatch(currencyMode, true)) {
                const [integerPart, decimalPart] = value.toString().split('.');
                const formattedInteger = integerPart.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
                return decimalPart ? (formattedInteger + '.' + decimalPart) : formattedInteger;
            } 
            else {
                return value;
            }
        }
        return 0;
    }

    formatDateTime(value, format = 'Y-m-d H:i:s') {
        const thisInstance = this;

        let now = ((thisInstance.isValue(value)) ? new Date(value) : new Date());
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        if (month.toString().length == 1) {
            month = '0' + month;
        }
        if (day.toString().length == 1) {
            day = '0' + day;
        }
        if (hour.toString().length == 1) {
            hour = '0' + hour;
        }
        if (minute.toString().length == 1) {
            minute = '0' + minute;
        }
        if (second.toString().length == 1) {
            second = '0' + second;
        }

        let dateTime = '';
        switch (format) {
            case 'Y-m-d H:i:s':
                dateTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                break;
            case 'Y-m-d H:i':
                dateTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
                break;
            case 'd/m/Y H:i:s':
                dateTime = day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
                break;
            case 'd/m/Y H:i':
                dateTime = day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
                break;
            case 'Y-m-d':
                dateTime = year + '-' + month + '-' + day;
                break;
            case 'd/m/Y':
                dateTime = day + '/' + month + '/' + year;
                break;
            case 'H:i:s':
                dateTime = hour + ':' + minute + ':' + second;
                break;
            case 'H:i':
                dateTime = hour + ':' + minute;
                break;
            case 'Y':
                dateTime = year;
                break;
            case 'm':
                dateTime = month;
                break;
            case 'd':
                dateTime = day;
                break;
            case 'h':
                dateTime = hour;
                break;
            case 'i':
                dateTime = minute;
                break;
            case 's':
                dateTime = second;
                break;
        }
        return dateTime;
    }
    
    formatTime(seconds = 0) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return (hrs > 0) ? (hrs.toString().padStart(2, '0') + ':' + mins + ':' + secs) : (mins + ':' + secs);
    }

    // cookie
    setCookie(cname, cvalue, exdays = 14) {
        const thisInstance = this;

        if (navigator.cookieEnabled) {
            if (thisInstance.isValue(cname)) {
                const d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                const expires = 'expires=' + d.toUTCString();
                const pathParts = window.location.pathname.split('/');
                const projectFolder = ((pathParts.length > 1 && pathParts[1] !== '') ? '/' + pathParts[1] + '/' : '/');
                document.cookie = cname + '=' + cvalue + ';' + expires + ';path=' + projectFolder;
            }
        } 
        else {
            alert('Cookies Blocked or not supported by your browser.');
        }
    }

    getCookie(cname) {
        const thisInstance = this;

        if (navigator.cookieEnabled) {
            if (thisInstance.isValue(cname)) {
                const name = cname + '=';
                const ca = document.cookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i].trim();
                    if (c.indexOf(name) === 0) {
                        return c.substring(name.length, c.length);
                    }
                }
            }
        } 
        else {
            alert('Cookies Blocked or not supported by your browser.');
        }
        return '';
    }

    deleteCookie(cname) {
        const thisInstance = this;
        thisInstance.setCookie(cname, '', -1);
    }

    // others
    deBounce(callBack, delay = 100, prevent = true) {
        let timeout;
        return function(e) {
            // Prevent default behavior
            if (prevent) {
                if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
            }

            //Clear the previous timer
            clearTimeout(timeout);

            // Capture this for the setTimeout callback
            const context = this;
            const args = arguments;

            //Set a new timer
            timeout = setTimeout(() => callBack.apply(context, args), delay);
        };
    }

    showBusy(status, value) {
        const thisInstance = this;

        if (thisInstance.isMatch(status, 1) || thisInstance.isMatch(status, true)) {
            if (document.querySelectorAll('div.iweb-processing').length === 0) {
                // Init opacity based on value
                let opacity = 1;
                if (thisInstance.isNumber(value, true)) {
                    opacity = (Math.round(parseInt(value) / 100 * 100) / 100);
                }

                // Create the main div
                const processingDiv = document.createElement('div');
                processingDiv.classList.add('iweb-processing');
                if (parseFloat(opacity) === 0) {
                    processingDiv.style.opacity = 0;
                } 
                else {
                    processingDiv.style.background = 'rgba(255, 255, 255, ' + opacity + ')';
                }


                // Create the inner loading div
                const loadingDiv = document.createElement('div');
                loadingDiv.classList.add('loading');

                // Create the SVG element
                const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgElement.setAttribute('width', '48px');
                svgElement.setAttribute('height', '48px');
                svgElement.setAttribute('viewBox', '0 0 100 100');
                svgElement.setAttribute('preserveAspectRatio', 'xMidYMid');

                // Create the circle element
                const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circleElement.setAttribute('cx', '50');
                circleElement.setAttribute('cy', '50');
                circleElement.setAttribute('fill', 'none');
                circleElement.setAttribute('stroke', '#dddddd');
                circleElement.setAttribute('stroke-width', '10');
                circleElement.setAttribute('r', '36');
                circleElement.setAttribute('stroke-dasharray', '169.64600329384882 58.548667764616276');

                // Create the animateTransform element
                const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                animateTransform.setAttribute('attributeName', 'transform');
                animateTransform.setAttribute('type', 'rotate');
                animateTransform.setAttribute('repeatCount', 'indefinite');
                animateTransform.setAttribute('dur', '1s');
                animateTransform.setAttribute('values', '0 50 50;360 50 50');
                animateTransform.setAttribute('keyTimes', '0;1');

                // Append animateTransform to the circle
                circleElement.appendChild(animateTransform);

                // Append circle to the SVG element
                svgElement.appendChild(circleElement);

                // Append the SVG to the loading div
                loadingDiv.appendChild(svgElement);

                // Append the loading div to the main processing div
                processingDiv.appendChild(loadingDiv);

                // Insert the processingDiv into the document body
                document.body.insertBefore(processingDiv, document.body.firstChild);
            }
        } 
        else {
            let microsecond = 0;
            if (thisInstance.isNumber(value, true)) {
                microsecond = parseInt(value);
            }
            setTimeout(function() {
                const processingDivs = document.querySelectorAll('div.iweb-processing');
                processingDivs.forEach(function(div) {
                    div.remove();
                });
            }, microsecond);
        }
    }

    scrollTo(element, offset, callBack) {
        const thisInstance = this;
        const targetElement = document.querySelector(element);

        let elementScrollTopValue = 0;
        if (targetElement) {
            offset = (thisInstance.isValue(offset)) ? parseInt(offset) : 80;
            elementScrollTopValue = Math.max(0, parseInt(targetElement.getBoundingClientRect().top) + window.pageYOffset - offset);   
        }

        // Smooth scrolling
        window.scrollTo({
            top: elementScrollTopValue,
            behavior: 'smooth'
        });

        // Callback
        setTimeout(function() {
            if (Math.abs(window.pageYOffset - elementScrollTopValue) <= 1) {
                if ((typeof callBack) === 'function') {
                    callBack();
                }
            }
        }, 100);
    }
    
    getURL(extra) {
        const thisInstance = this;
        return (window.location.href.split('?')[0]).toString() + ((thisInstance.isValue(extra)) ? ('/' + extra) : '');
    }

    getURLParam(name) {
        const thisInstance = this;

        let param = '';
        if (thisInstance.isValue(name)) {
            let urlParams = window.location.search.substring(1).split('&');
            for (let i = 0; i < parseInt(urlParams.length); i++) {
                let currentParam = urlParams[i].split('=');
                let currentParamIndex = currentParam[0];
                let currentParamValue = currentParam[1];
                if (thisInstance.isValue(currentParamIndex) && thisInstance.isValue(currentParamValue)) {
                    if (thisInstance.isMatch(currentParamIndex, name)) {
                        param = currentParamValue;
                        break;
                    }
                }
            }
        }
        return param;
    }

    randomNum(min, max) {
        const thisInstance = this;

        if (!thisInstance.isValue(min) || parseInt(min) < 0) {
            min = 0;
        }
        if (!thisInstance.isValue(max) || parseInt(max) < 1) {
            max = 1;
        }
        min = parseInt(min);
        max = parseInt(max);
        if (parseInt(min) > parseInt(max)) {
            min = 0;
            max = 1;
        }
        return parseInt(Math.random() * (max + 1 - min) + min);
    }

    randomString(length) {
        const thisInstance = this;

        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        if (!thisInstance.isNumber(length)) {
            length = 8;
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            let rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum + 1);
        }
        return result;
    }
    
    randomPassword(length) {
        const thisInstance = this;

        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        
        if (!thisInstance.isNumber(length)) {
            length = 8;
        }

        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];

        const allChars = uppercase + lowercase + numbers;
        for (let i = 3; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
    
    filterMaliciousCode(ignore_script_iframe = false) {
        const thisInstance = this;
        
        let dangerousPatterns = [
            /<script\b[^>]*>[\s\S]*?<\/script>/gi,
            /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
            /<(input|textarea|select|form)\b[^>]*>[\s\S]*?<\/?(input|textarea|select|form)\b[^>]*>/gi,
            /\b((javascript|vbscript|wscript|jscript|vbs)\s*:\s*["\']?\s*\w+\s*\([^)]*\)\s*[,;]?["\']?)/gi,
            /\b((document|(document\.)?window)\.(location|on\w*))/gi,
            /\b(expression\s*\([^)]*\)\s*[,;]?)/gi,
            /\b(Redirect\s+30\d)/gi,
            /\b(on\w+\s*=\s*["\']?\s*\w+\s*\(.*\)\s*[,;]?["\']?)/gi
        ];
        if(thisInstance.isMatch(ignore_script_iframe, true)) {
            dangerousPatterns = [
                /<(input|textarea|select|form)\b[^>]*>[\s\S]*?<\/?(input|textarea|select|form)\b[^>]*>/gi,
                /\b((javascript|vbscript|wscript|jscript|vbs)\s*:\s*["\']?\s*\w+\s*\([^)]*\)\s*[,;]?["\']?)/gi,
                /\b((document|(document\.)?window)\.(location|on\w*))/gi,
                /\b(expression\s*\([^)]*\)\s*[,;]?)/gi,
                /\b(Redirect\s+30\d)/gi,
                /\b(on\w+\s*=\s*["\']?\s*\w+\s*\(.*\)\s*[,;]?["\']?)/gi
            ];
        }

        // filter function
        function filterInputValue(value) {
            let filtered = value;
            dangerousPatterns.forEach(pattern => {
                if (pattern.test(filtered)) {
                    filtered = filtered.replace(pattern, '');
                }
            });
            return filtered;
        }

        // use event delegation to listen to all input events
        document.addEventListener('input', function(event) {
            const target = event.target;

            // only handle input and textarea
            if (target.matches && (target.matches('input') || target.matches('textarea'))) {
                const original = target.value;
                const filtered = filterInputValue(original);

                if (filtered !== original) {
                    target.value = filtered;

                    // trigger input Event to ensure other listeners receive the update
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
    }
    
    copyright() {
        const startYear = 2023;
        const currentYear = new Date().getFullYear();
        const yearText = (startYear === currentYear) ? `${currentYear}` : `${startYear}–${currentYear}`;
        const author = 'KaiyunChan';
        const text = [
            'iweb native javaScript class - easily build web applications with the most commonly used features already included.',
            'Copyright: ' + yearText+ ' ' + author,
            'License: Personal/educational use only. Modifications and commercial use require permission.',
            'Learn more: https://github.com/728rabbit/iweb-native-javascript-class'
        ];
        console.log(`%c${text.join('\n')}`, 'color: #525896; font-weight: bold;');
    }
}

class iMD5 {
    constructor() {
        this.hexChr = '0123456789abcdef'.split('');
    }

    add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }

    cmn(q, a, b, x, s, t) {
        return this.add32((this.add32(this.add32(a, q), this.add32(x, t)) << s) | (this.add32(this.add32(a, q), this.add32(x, t)) >>> (32 - s)), b);
    }

    ff(a, b, c, d, x, s, t) {
        return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    gg(a, b, c, d, x, s, t) {
        return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    hh(a, b, c, d, x, s, t) {
        return this.cmn(b ^ c ^ d, a, b, x, s, t);
    }

    ii(a, b, c, d, x, s, t) {
        return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    md5cycle(x, k) {
        let a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = this.ff(a, b, c, d, k[0], 7, -680876936);
        d = this.ff(d, a, b, c, k[1], 12, -389564586);
        c = this.ff(c, d, a, b, k[2], 17, 606105819);
        b = this.ff(b, c, d, a, k[3], 22, -1044525330);
        a = this.ff(a, b, c, d, k[4], 7, -176418897);
        d = this.ff(d, a, b, c, k[5], 12, 1200080426);
        c = this.ff(c, d, a, b, k[6], 17, -1473231341);
        b = this.ff(b, c, d, a, k[7], 22, -45705983);
        a = this.ff(a, b, c, d, k[8], 7, 1770035416);
        d = this.ff(d, a, b, c, k[9], 12, -1958414417);
        c = this.ff(c, d, a, b, k[10], 17, -42063);
        b = this.ff(b, c, d, a, k[11], 22, -1990404162);
        a = this.ff(a, b, c, d, k[12], 7, 1804603682);
        d = this.ff(d, a, b, c, k[13], 12, -40341101);
        c = this.ff(c, d, a, b, k[14], 17, -1502002290);
        b = this.ff(b, c, d, a, k[15], 22, 1236535329);

        a = this.gg(a, b, c, d, k[1], 5, -165796510);
        d = this.gg(d, a, b, c, k[6], 9, -1069501632);
        c = this.gg(c, d, a, b, k[11], 14, 643717713);
        b = this.gg(b, c, d, a, k[0], 20, -373897302);
        a = this.gg(a, b, c, d, k[5], 5, -701558691);
        d = this.gg(d, a, b, c, k[10], 9, 38016083);
        c = this.gg(c, d, a, b, k[15], 14, -660478335);
        b = this.gg(b, c, d, a, k[4], 20, -405537848);
        a = this.gg(a, b, c, d, k[9], 5, 568446438);
        d = this.gg(d, a, b, c, k[14], 9, -1019803690);
        c = this.gg(c, d, a, b, k[3], 14, -187363961);
        b = this.gg(b, c, d, a, k[8], 20, 1163531501);
        a = this.gg(a, b, c, d, k[13], 5, -1444681467);
        d = this.gg(d, a, b, c, k[2], 9, -51403784);
        c = this.gg(c, d, a, b, k[7], 14, 1735328473);
        b = this.gg(b, c, d, a, k[12], 20, -1926607734);

        a = this.hh(a, b, c, d, k[5], 4, -378558);
        d = this.hh(d, a, b, c, k[8], 11, -2022574463);
        c = this.hh(c, d, a, b, k[11], 16, 1839030562);
        b = this.hh(b, c, d, a, k[14], 23, -35309556);
        a = this.hh(a, b, c, d, k[1], 4, -1530992060);
        d = this.hh(d, a, b, c, k[4], 11, 1272893353);
        c = this.hh(c, d, a, b, k[7], 16, -155497632);
        b = this.hh(b, c, d, a, k[10], 23, -1094730640);
        a = this.hh(a, b, c, d, k[13], 4, 681279174);
        d = this.hh(d, a, b, c, k[0], 11, -358537222);
        c = this.hh(c, d, a, b, k[3], 16, -722521979);
        b = this.hh(b, c, d, a, k[6], 23, 76029189);
        a = this.hh(a, b, c, d, k[9], 4, -640364487);
        d = this.hh(d, a, b, c, k[12], 11, -421815835);
        c = this.hh(c, d, a, b, k[15], 16, 530742520);
        b = this.hh(b, c, d, a, k[2], 23, -995338651);

        a = this.ii(a, b, c, d, k[0], 6, -198630844);
        d = this.ii(d, a, b, c, k[7], 10, 1126891415);
        c = this.ii(c, d, a, b, k[14], 15, -1416354905);
        b = this.ii(b, c, d, a, k[5], 21, -57434055);
        a = this.ii(a, b, c, d, k[12], 6, 1700485571);
        d = this.ii(d, a, b, c, k[3], 10, -1894986606);
        c = this.ii(c, d, a, b, k[10], 15, -1051523);
        b = this.ii(b, c, d, a, k[1], 21, -2054922799);
        a = this.ii(a, b, c, d, k[8], 6, 1873313359);
        d = this.ii(d, a, b, c, k[15], 10, -30611744);
        c = this.ii(c, d, a, b, k[6], 15, -1560198380);
        b = this.ii(b, c, d, a, k[13], 21, 1309151649);
        a = this.ii(a, b, c, d, k[4], 6, -145523070);
        d = this.ii(d, a, b, c, k[11], 10, -1120210379);
        c = this.ii(c, d, a, b, k[2], 15, 718787259);
        b = this.ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = this.add32(a, x[0]);
        x[1] = this.add32(b, x[1]);
        x[2] = this.add32(c, x[2]);
        x[3] = this.add32(d, x[3]);
    }

    md51(s) {
        let n = s.length;
        let state = [1732584193, -271733879, -1732584194, 271733878];
        let i;

        for (i = 64; i <= s.length; i += 64) {
            this.md5cycle(state, this.md5blk(s.substring(i - 64, i)));
        }

        s = s.substring(i - 64);

        let tail = new Array(16).fill(0);
        for (i = 0; i < s.length; i++) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);

        if (i > 55) {
            this.md5cycle(state, tail);
            tail = new Array(16).fill(0);
        }

        tail[14] = n * 8;

        this.md5cycle(state, tail);

        return state;
    }

    md5blk(s) {
        let md5blks = [];
        for (let i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    rhex(n) {
        let s = '';
        for (let j = 0; j < 4; j++) {
            s += this.hexChr[(n >> (j * 8 + 4)) & 0x0F] + this.hexChr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    hex(x) {
        for (let i = 0; i < x.length; i++) {
            x[i] = this.rhex(x[i]);
        }
        return x.join('');
    }

    hash(s) {
        return this.hex(this.md51(s));
    }
}

class iDatePicker {
    constructor(lang = 'en', dateFormat = 'YYYY-MM-DD') {
        this.lang = lang;
        this.dateFormat = dateFormat;
        this.calendarElement;
        this.currentDate = new Date();
        this.selectedDate;
        this.minDate;
        this.maxDate;
        this.activeInputElement;

        document.addEventListener('click', (e) => {
            if (this.calendarElement &&
                !e.target.closest('input.idatepicker') &&
                !e.target.closest('div.idatepicker-calendar') &&
                e.target.id !== 'idatepicker-prev-month' &&
                e.target.id !== 'idatepicker-next-month') {
                this.hideCalendar();
            } 
            else if (e.target.closest('input.idatepicker')) {
                this.onFocusInput(e.target);
            }
        });
    }

    render(elements) {
        // Add event listeners to new input elements if not already present
        const inputElements = document.querySelectorAll(elements);
        if (inputElements) {
            inputElements.forEach((inputElement) => {
                if (!inputElement.classList.contains('idatepicker')) {
                    inputElement.type = 'text';
                    inputElement.classList.add('idatepicker');
                }
            });
        }
    }

    onFocusInput(inputElement) {
        // Update the calendar date based on the input value if present
        let inputValue = inputElement.value;
        // Check if the input value matches the expected date format
        if (!(inputValue && this.isValidDateFormat(inputValue))) {
            inputValue = this.formatDate(new Date());
        }

        this.currentDate = this.parseDate(inputValue); // Parse the input date
        this.selectedDate = new Date(this.currentDate);
        
        const minAttr = inputElement.getAttribute('data-min');
        this.minDate = minAttr ? minAttr.trim() : null;

        const maxAttr = inputElement.getAttribute('data-max');
        this.maxDate = maxAttr ? maxAttr.trim() : null;

        this.activeInputElement = inputElement; // Set the active input element
        this.showCalendar(inputElement); // Display the calendar
    }

    showCalendar(inputElement) {
        // Remove existing calendar if present
        if (this.calendarElement) {
            this.calendarElement.remove();
        }

        // Create a new calendar element with basic styling
        this.calendarElement = this.createElement('div', {
            position: 'absolute',
            backgroundColor: '#fff',
            fontSize: '12px',
            padding: '8px',
            border: '2px solid #e6e6e6',
            borderRadius: '4px',
            boxSizing: 'border-box',
            marginTop: '2px',
            zIndex: '100'
        }, 'idatepicker-calendar');

        document.body.appendChild(this.calendarElement);

        // Position the calendar below the input element
        const rect = inputElement.getBoundingClientRect();
        this.calendarElement.style.top = (rect.bottom + window.scrollY) + 'px';
        this.calendarElement.style.left = (rect.left + window.scrollX) + 'px';

        this.buildCalendar(); // Build the calendar UI
    }

    hideCalendar() {
        // Remove the calendar from the DOM
        if (this.calendarElement) {
            this.calendarElement.remove();
            this.calendarElement;
        }
    }

    buildCalendar() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        this.calendarElement.innerHTML = ''; // Clear previous calendar content

        const headerDiv = this.createHeader(); // Create header with navigation
        const table = this.createCalendarTable(currentYear, currentMonth); // Create calendar table

        this.calendarElement.appendChild(headerDiv);
        this.calendarElement.appendChild(table);
    }

    createHeader() {
        // Create the header with previous and next month buttons and current month/year display
        const headerDiv = this.createElement('div', {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '5px 0px 10px 0px'
        });

        const prevButton = this.createButton('🞀', 'idatepicker-prev-month', () => this.changeMonth(-1)); // Button to go to the previous month
        const monthYearSpan = this.createElement('span', {
            fontSize: '15px',
            fontWeight: 'bold'
        });
        monthYearSpan.textContent = this.currentDate.toLocaleString(this.lang === 'en' ? 'en' : 'zh', {
            month: 'short'
        }) + ' / ' + this.currentDate.getFullYear();

        const nextButton = this.createButton('🞂', 'idatepicker-next-month', () => this.changeMonth(1)); // Button to go to the next month

        headerDiv.appendChild(prevButton);
        headerDiv.appendChild(monthYearSpan);
        headerDiv.appendChild(nextButton);

        return headerDiv;
    }

    createButton(text, id, onClick) {
        // Create a button with specified text, ID, and click event handler
        const button = this.createElement('button', {
            position: 'relative',
            backgroundColor: '#2ca4e9',
            fontSize: '12px',
            color: '#fff',
            padding: '3px 6px',
            border: 'none',
            borderRadius: '3px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            boxSizing: 'border-box',
            cursor: 'pointer'
        });
        button.type = 'button';
        button.id = id;
        button.textContent = text;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            onClick();
        });
        return button;
    }

    changeMonth(delta) {
        // Adjust the displayed month by the delta value (e.g., -1 for previous month, 1 for next month)
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.buildCalendar(); // Rebuild the calendar with the new month
    }

    createCalendarTable(year, month) {
        // Create the main table structure for the calendar
        const table = this.createElement('table', {
            width: '100%',
            borderCollapse: 'collapse'
        });
        const thead = this.createTableHeader(); // Create table header with day names
        const tbody = this.createTableBody(year, month); // Create table body with date cells

        table.appendChild(thead);
        table.appendChild(tbody);
        return table;
    }

    createTableHeader() {
        // Create the header row with day names based on language setting
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const days = (this.lang === 'en') ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['日', '一', '二', '三', '四', '五', '六'];
        days.forEach((day) => {
            const th = this.createElement('th', {
                width: '36px',
                height: '28px',
                fontSize: '12px',
                color: '#2ca4e9',
                padding: '4px',
                border: '2px solid #e6e6e6',
                boxSizing: 'border-box',
                textAlign: 'center'
            });
            th.textContent = day;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        return thead;
    }

    createTableBody(year, month) {
        // Create the body of the calendar with day cells
        const tbody = document.createElement('tbody');
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // Get the day of the week for the first day of the month
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the current month

        const prevMonthDays = new Date(year, month, 0).getDate(); // Total days in the previous month
        let startDay = prevMonthDays - firstDayOfMonth + 1; // Start day for the leading dates from the previous month

        let day = 1;
        let nextMonthDay = 1;

        for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
            const row = document.createElement('tr');

            for (let colIndex = 0; colIndex < 7; colIndex++) {
                let td;

                if (rowIndex === 0 && colIndex < firstDayOfMonth) {
                    // Display days from the previous month
                    const dateObj = this.formatDate(new Date(year, month - 1, startDay++));
                    td = this.createDateCell(startDay - 1, dateObj, true);
                } 
                else if (day > daysInMonth) {
                    // Display days from the next month
                    const dateObj = this.formatDate(new Date(year, month + 1, nextMonthDay));
                    td = this.createDateCell(nextMonthDay++, dateObj, true);
                } 
                else {
                    // Display days from the current month
                    const dateObj = this.formatDate(new Date(year, month, day));
                    td = this.createDateCell(day++, dateObj, false);
                }

                row.appendChild(td);
            }

            tbody.appendChild(row);
        }

        return tbody;
    }

    createDateCell(day, dateObj, isOtherMonth) {
        // Create a table cell representing a day in the calendar
        let canSelect = true;
        if(this.minDate !== null) {
            if(new Date(this.minDate) - new Date(dateObj) > 0) {
                canSelect = false;
            }
        }
        if(this.maxDate !== null) {
            if(new Date(this.maxDate) - new Date(dateObj) < 0) {
                canSelect = false;
            }
        }
        
        const td = this.createElement('td', {
            backgroundColor: this.selectedDate && dateObj === this.formatDate(this.selectedDate) ? '#2ca4e9' : '',
            width: '36px',
            height: '28px',
            fontSize: '12px',
            color: (!canSelect || isOtherMonth)  ? '#aaa' : this.selectedDate && dateObj === this.formatDate(this.selectedDate) ? '#fff' : '',
            padding: '4px',
            border: '2px solid #e6e6e6',
            boxSizing: 'border-box',
            textAlign: 'center',
            cursor: 'pointer'
        });
        td.dataset.date = dateObj; // Store the date value in the cell
        td.textContent = day;
        if(canSelect) {
            td.addEventListener('click', () => this.onDateSelect(dateObj)); // Add event listener for date selection
        }
        return td;
    }
    

    onDateSelect(dateObj) {
        // Parse the date from the formatted string
        const selectedDate = this.parseDate(dateObj);
        if (!isNaN(selectedDate)) {
            this.activeInputElement.value = this.formatDate(selectedDate);
            this.activeInputElement.dispatchEvent(new Event('change', {
                bubbles: true
            }));
            this.selectedDate = selectedDate;
            this.buildCalendar();
            this.hideCalendar();
        }
    }

    createElement(tag, styles = {}, className) {
        // Create an HTML element with optional class and styles
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.assign(el.style, styles);
        return el;
    }

    isValidDateFormat(dateString) {
        // Define the regex pattern based on the specified date format
        let regex;
        if ((this.dateFormat.toString().toUpperCase()) === 'DD/MM/YYYY') {
            // Match DD/MM/YYYY format, e.g., 25/12/2024
            regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        } 
        else {
            // Default to YYYY-MM-DD format, e.g., 2024-12-25
            regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        }

        // Return whether the input matches the regex pattern
        return regex.test(dateString);
    }

    parseDate(dateString) {
        // Parse date based on the specified format
        const [year, month, day] = (this.dateFormat.toString().toUpperCase()) === 'DD/MM/YYYY' ?
        dateString.split('/').map(Number).reverse(): dateString.split('-').map(Number);

        // Return a new Date object based on parsed values
        return new Date(year, month - 1, day);
    }

    formatDate(date) {
        // Format a date object into a string based on the specified dateFormat
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Return the date formatted according to the specified dateFormat
        if ((this.dateFormat.toString().toLowerCase()) === 'DD/MM/YYYY') {
            return day + '/' + month + '/' + year;
        }
        return year + '-' + month + '-' + day; // Default format: YYYY-MM-DD
    }
}

class iTimePicker {
    constructor() {
        this.activeInput = null;
        document.addEventListener('click', (e) => {
            if (!e.target.closest('input.itimepicker') &&
                !e.target.closest('div.time-picker-list')) {
                this.hidePicker();
            } 
            else if (e.target.closest('input.itimepicker')) {
                this.showTimePicker(e.target);
                this.formatInputTime(e.target);
            }
        });
    }

    render(elements) {
        // Add event listeners to new input elements if not already present
        const inputElements = document.querySelectorAll(elements);
        if (inputElements) {
            inputElements.forEach((inputElement) => {
                if (!inputElement.classList.contains('itimepicker')) {
                    inputElement.type = 'text';
                    inputElement.classList.add('itimepicker');
                }
            });
        }
    }

    showTimePicker(input) {
        this.hidePicker();

        this.activeInput = input; // Track the input currently being edited
        const startTime = (parseInt(input.getAttribute('data-start') || 600)); // Use data-start or default to 600
        const endTime = (parseInt(input.getAttribute('data-end') || 2200)); // Use data-end or default to 2200
        const interval = parseInt(input.getAttribute('data-interval') || 5); // Use data-interval or default to 5
        const picker = this.createPicker(startTime, endTime, interval);
        document.body.appendChild(picker);

        const { top, left, height } = input.getBoundingClientRect();
        picker.style.position = 'absolute';
        picker.style.top = (top + window.scrollY + height) + 'px';
        picker.style.left = (left + window.scrollX) + 'px';

        picker.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-option')) {
                this.activeInput.value = e.target.textContent;
                this.activeInput.dispatchEvent(new Event('change', {
                    bubbles: true
                }));
                this.hidePicker();
            }
        });
    }

    hidePicker() {
        const picker = document.querySelector('div.time-picker-list');
        if (picker) {
            picker.remove();
        }
    }

    createPicker(startTime, endTime, interval) {
        const picker = document.createElement('div');
        picker.classList.add('time-picker-list');
        picker.style.border = '2px solid #e6e6e6';
        picker.style.backgroundColor = '#fff';
        picker.style.padding = '10px';
        picker.style.marginTop = '2px';
        picker.style.maxHeight = '200px';
        picker.style.overflow = 'auto';
        picker.style.zIndex = '100';

        const times = this.generateTimeOptions(startTime, endTime, interval);
        times.forEach(time => {
            const timeOption = document.createElement('div');
            timeOption.textContent = time;
            timeOption.classList.add('time-option');
            timeOption.style.padding = '5px';
            timeOption.style.cursor = 'pointer';
            timeOption.style.borderBottom = '1px solid #f0f0f0';
            picker.appendChild(timeOption);
        });

        return picker;
    }

    generateTimeOptions(startTime, endTime, interval) {
        const times = [];
        const startHour = Math.floor(startTime / 100);
        const startMinute = startTime % 100;
        const endHour = Math.floor(endTime / 100);
        const endMinute = endTime % 100;

        let currentHour = startHour;
        let currentMinute = startMinute;

        while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
            if (parseInt(currentHour) < 24) {
                times.push(this.formatTime(currentHour, currentMinute));
            }
            currentMinute += interval;
            if (currentMinute >= 60) {
                currentMinute = 0;
                currentHour++;
            }
        }

        return times;
    }

    formatTime(hour, minute) {
        const formattedHour = String(hour).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');
        return (formattedHour + ':' + formattedMinute);
    }

    formatInputTime(input) {
        const value = input.value.replace(/\D/g, ''); // Remove non-digit characters
        if (value.length > 4) return; // Limit to 4 digits for HHMM

        if (value.length === 4) {
            // Format to HH:MM
            const hour = value.slice(0, 2);
            const minute = value.slice(2, 4);
            input.value = this.formatTime(parseInt(hour), parseInt(minute));
        }
    }
}

class iPagination {
    constructor(el, options) {
        this.options = Object.assign({
            mode: 1,
            size: 5,
            total: 1,
            placeHolder: ''
        }, options);

        this.currentPage = 1;
        this.url = new URL(window.location.href);
        this.searchParams = new URLSearchParams(this.url.search);
        if (this.searchParams.has('page')) {
            this.currentPage = Math.max(parseInt(this.searchParams.get('page')), 1);
        }
        this.searchParams.delete('page');
        this.baseUrl = this.url.origin + this.url.pathname + '?' + this.searchParams.toString();

        this.renderPagination(el);
    }

    createPageUrl(page) {
        return (this.baseUrl + '&page=' + page).replace('?&', '?');
    }

    jumpToPage(inputElement) {
        inputElement.addEventListener('keypress', (e) => {
            if (e.which === 13) {
                let jumpToPage = Math.min(Math.max(parseInt(inputElement.value) || 1, 1), inputElement.getAttribute('data-max'));
                window.location.href = this.createPageUrl(jumpToPage);
            }
        });
    }

    createPaginationElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    renderPagination(element) {
        if (!element.querySelector('div.iweb-pagination')) {
            let pageSize = element.getAttribute('data-size') || this.options.size;
            let totalPage = element.getAttribute('data-totalpage') || this.options.total;

            let firstPage = 1;
            let prevPage = Math.max(this.currentPage - 1, firstPage);
            let nextPage = Math.min(this.currentPage + 1, totalPage);
            let lastPage = totalPage;
            let diffPageNum = Math.floor(pageSize / 2);
            let startPageNum = Math.max(this.currentPage - diffPageNum, firstPage);
            let endPageNum = Math.min(this.currentPage + diffPageNum, lastPage);

            if (endPageNum - startPageNum + 1 < pageSize) {
                if (this.currentPage < firstPage + diffPageNum) {
                    endPageNum = Math.min(lastPage, startPageNum + pageSize - 1);
                } 
                else {
                    startPageNum = Math.max(firstPage, endPageNum - pageSize + 1);
                }
            }

            if (totalPage > 1) {
                // Create pagination container
                const paginationContainer = this.createPaginationElement('div', 'iweb-pagination');
                const paginationList = this.createPaginationElement('ul');

                // First Page
                let firstPageLink = this.createPaginationElement('a', 'first', this.options.mode === 2 && this.currentPage > diffPageNum ? '<span>' + firstPage + '..</span>' : '<i></i><i></i>');
                firstPageLink.href = this.createPageUrl(firstPage);
                firstPageLink.title = 'First Page';
                let firstLi = this.createPaginationElement('li');
                firstLi.appendChild(firstPageLink);
                paginationList.appendChild(firstLi);

                // Previous Page
                let prevPageLink = this.createPaginationElement('a', 'prev', '<i></i>');
                prevPageLink.href = this.createPageUrl(prevPage);
                prevPageLink.title = 'Previous Page';
                let prevLi = this.createPaginationElement('li');
                prevLi.appendChild(prevPageLink);
                paginationList.appendChild(prevLi);

                // Page Numbers
                for (let i = startPageNum; i <= endPageNum; i++) {
                    let pageLink = this.createPaginationElement('a', 'num' + (i === this.currentPage ? ' current' : ''), '<span>' + i + '</span>');
                    pageLink.href = this.createPageUrl(i);
                    let pageLi = this.createPaginationElement('li');
                    pageLi.appendChild(pageLink);
                    paginationList.appendChild(pageLi);
                }

                // Next Page
                let nextPageLink = this.createPaginationElement('a', 'next', '<i></i>');
                nextPageLink.href = this.createPageUrl(nextPage);
                nextPageLink.title = 'Next Page';
                let nextLi = this.createPaginationElement('li');
                nextLi.appendChild(nextPageLink);
                paginationList.appendChild(nextLi);

                // Last Page
                let lastPageLink = this.createPaginationElement('a', 'last', this.options.mode === 2 && this.currentPage < totalPage - diffPageNum ? '<span>..' + lastPage + '</span>' : '<i></i><i></i>');
                lastPageLink.href = this.createPageUrl(lastPage);
                lastPageLink.title = 'Last Page';
                let lastLi = this.createPaginationElement('li');
                lastLi.appendChild(lastPageLink);
                paginationList.appendChild(lastLi);

                // Jump to Page Input
                let inputLi = this.createPaginationElement('li');
                let jumpInput = this.createPaginationElement('input', 'jumpto_page');
                jumpInput.type = 'text';
                jumpInput.placeHolder = this.options.placeHolder;
                jumpInput.setAttribute('data-max', totalPage);
                this.jumpToPage(jumpInput);
                inputLi.appendChild(jumpInput);
                paginationList.appendChild(inputLi);

                // Append the list to the pagination container and the container to the element
                paginationContainer.appendChild(paginationList);
                element.appendChild(paginationContainer);
            }
        }
    }
}

class iModalDialog {
    constructor(content = '', options) {
        this.options = Object.assign({
            title: '',
            width: 0,
            height: 0,
            className: null,
            init: null
        }, options);
        
        this.createModal(content);
        this.makeDraggable();
        this.makeResizable();
        this.makeMaximizable();
    }

    createModal(content) {
        this.modal = document.createElement('div');
        this.modal.classList.add('imodal-dialog');
        if(this.options.className !== null) {
            this.modal.classList.add(this.options.className);
        }
        if(this.options.width > 0 && this.options.height > 0) {
            this.modal.style.width = this.options.width + 'px';
            this.modal.style.height = this.options.height + 'px';
        }
        
        const topBar = document.createElement('div');
        topBar.classList.add('top');

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('title');
        titleSpan.textContent = this.options.title;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');
        
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.classList.add('fullscreen');
        const fullscreenIcon = document.createElement('i');
        fullscreenIcon.classList.add('fa', 'fa-clone');
        fullscreenBtn.appendChild(fullscreenIcon);

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close');
        const closeIcon = document.createElement('i');
        closeIcon.classList.add('fa', 'fa-times');
        closeBtn.appendChild(closeIcon);

        actionsDiv.appendChild(fullscreenBtn);
        actionsDiv.appendChild(closeBtn);

        topBar.appendChild(titleSpan);
        topBar.appendChild(actionsDiv);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');
        contentDiv.innerHTML = content;

        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');

        this.modal.appendChild(topBar);
        this.modal.appendChild(contentDiv);
        this.modal.appendChild(resizeHandle);
        
        document.body.appendChild(this.modal);
        
        this.modal.style.left = ((document.documentElement.clientWidth - this.modal.offsetWidth) / 2) + (Math.random() * 100 - 50) + 'px';
        this.modal.style.top = ((document.documentElement.clientHeight - this.modal.offsetHeight) / 2) + (Math.random() * 100 - 50) + 'px';

        this.modal.querySelector('button.close').addEventListener('click', () => this.close());
        this.modal.querySelector('button.fullscreen').addEventListener('click', () => this.toggleMaximize());

        this.bringToFront();
        this.modal.addEventListener('mousedown', () => this.bringToFront());
        
        if ((typeof this.options.init) === 'function') {
            this.options.init();
        }
    }
    
    bringToFront() {
        let maxZ = 200;
        document.querySelectorAll('div.imodal-dialog').forEach((modal) => {
            modal.classList.remove('current');
            const zIndex = parseInt(window.getComputedStyle(modal).zIndex, 10);
            if (!isNaN(zIndex)) {
                maxZ = Math.max(maxZ, zIndex);
            }
        });
        this.modal.classList.add('current');
        this.modal.style.zIndex = maxZ + 1;
    }
    
    makeDraggable() {
        let offsetX, offsetY, isDragging = false;

        this.modal.querySelector('div.top').addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - this.modal.offsetLeft;
            offsetY = e.clientY - this.modal.offsetTop;
            this.bringToFront();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            x = Math.max(0, Math.min(x, document.documentElement.clientWidth - this.modal.offsetWidth));
            y = Math.max(0, Math.min(y, document.documentElement.clientHeight - this.modal.offsetHeight));

            requestAnimationFrame(() => {
                this.modal.style.left = x + 'px';
                this.modal.style.top =  y + 'px';
            });
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => isDragging = false);
    }

    makeResizable() {
        let isResizing = false, startX, startY, startWidth, startHeight;
        const handle = this.modal.querySelector('div.resize-handle');

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.modal.offsetWidth;
            startHeight = this.modal.offsetHeight;
            this.bringToFront();
        });

        const onMouseMove = (e) => {
            if (!isResizing) return;
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
            newWidth = Math.max(200, Math.min(newWidth, document.documentElement.clientWidth - this.modal.offsetLeft));
            newHeight = Math.max(150, Math.min(newHeight, document.documentElement.clientHeight - this.modal.offsetTop));

            requestAnimationFrame(() => {
                this.modal.style.width = newWidth + 'px';
                this.modal.style.height = newHeight + 'px';
            });
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => isResizing = false);
    }

    makeMaximizable() {
        this.isMaximized = false;
        this.normalState = { width: '', height: '', left: '', top: '' };

        this.toggleMaximize = () => {
            if (this.isMaximized) {
                this.modal.style.width = this.normalState.width;
                this.modal.style.height = this.normalState.height;
                this.modal.style.left = this.normalState.left;
                this.modal.style.top = this.normalState.top;
            } 
            else {
                this.normalState = {
                    width: this.modal.style.width,
                    height: this.modal.style.height,
                    left: this.modal.style.left,
                    top: this.modal.style.top
                };
                this.modal.style.width = document.documentElement.clientWidth + 'px';
                this.modal.style.height = document.documentElement.clientHeight + 'px';
                this.modal.style.left = '0px';
                this.modal.style.top = '0px';
            }
            this.isMaximized = !this.isMaximized;
        };
    }

    close() {
        this.modal.remove();
    }
}