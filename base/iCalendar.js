class iCalendar {
    constructor(config = {}) {
        this.selfObj = null;
        this.elementID = config.elementID || 'icalendar';
        this.lang = config.lang || 'en';
        this.displayMode = config.displayMode || 'day';
        this.displayDate = (new Date(config.date || new Date())).toLocaleString('en-US', {
            timeZone: 'Asia/Hong_Kong'
        });
        this.startHm = config.startHm || 800;
        this.endHm = config.endHm || 2200;
        this.interval = config.interval || 5;
        this.maxHeight = config.maxHeight || 'none';

        this.resources = null;
        this.events = null;
  
        this.resourcesURL = config.resources || false;
        this.noResources = false;
        this.eventsURL = config.events || false;
        this.eventTemplate = config.eventTemplate || false;
        this.eventClick = config.eventClick || false;

        this.extraParas = config.extraParas || false;  
    }

    init(resources = null, events = null) {
        this.selfObj = document.getElementById(this.elementID);
        if(!this.selfObj) {
            return;
        }
        this.selfObj.style.position = 'relative';
        this.selfObj.style.background = '#fff';
        this.selfObj.style.fontFamily = 'Arial, sans-serif';
        this.selfObj.style.fontSize = '13px';
        this.selfObj.style.border = '1px solid #e6e6e6';
        this.selfObj.style.boxSizing = 'border-box';
        this.selfObj.style.overflow = 'hidden';
        ['div.fixedCorner', 'div.fixedHeader', 'div.fixedLeft', 'div.timeSlots'].forEach(selector => {
            this.selfObj.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        this.showLoadingMask();
        this.resources = resources || this.resources;
        this.events = events || this.events;
        this.setupElements();
        
        if(resources === null && this.resourcesURL) {
            this.fetchData(this.resourcesURL, (data) => {
                this.resources = data;
                if(this.eventsURL) {
                    this.fetchData(this.eventsURL, (data) => {
                        this.events = data;
                        this.refresh();
                    });
                }
            });
        } else if(events === null && this.eventsURL) {
            this.fetchData(this.eventsURL, (data) => {
                this.events = data;
                this.refresh();
            });
        }
        
        return this;
    }

    refresh(resources, events) {
        document.getElementById('icalendar-showdate').innerHTML = this.getDisplayDate();

        this.resources = resources || this.resources;
        this.events = events || this.events;

        this.showLoadingMask();
        if(this.resources === null && this.resourcesURL) {
            this.fetchData(this.resourcesURL, (data) => {
                this.resources = data;
                if(this.eventsURL) {
                    this.fetchData(this.eventsURL, (data) => {
                        this.events = data;
                        this.setupElements(true);
                    });
                }
            });
        } else if(this.eventsURL) {
            this.fetchData(this.eventsURL, (data) => {
                this.events = data;
                this.setupElements(true);
            });
        } else {
            this.setupElements(true);
        }
    }

    setupElements(renew = false) {
        if(!renew) {
            this.renderControls();
            this.renderBody();
            this.syncScroll();
        }
        this.setHeader();
        this.setLeft();
        this.setSlots();
        this.drawEvents(this.events);
        setTimeout(this.hideLoadingMask, 500);
    }

    renderControls() {
        const controlsTable = this.createElement('table', {
            width: '100%'
        });
        const row = this.createElement('tr');
        const leftCell = this.createControlsLeftCell();
        const centerCell = this.createControlsCenterCell();
        const rightCell = this.createControlsRightCell();

        row.append(leftCell, centerCell, rightCell);
        controlsTable.appendChild(row);

        const controlsContainer = this.createElement('div', {
            position: 'relative',
            padding: '8px 4px',
            border: '1px solid #e6e6e6',
            boxSizing: 'border-box'
        });

        controlsContainer.appendChild(controlsTable);
        this.selfObj.appendChild(controlsContainer);
    }

    createControlsLeftCell() {
        const cell = this.createElement('td', {
            width: '30%',
            textAlign: 'left'
        });
        const gotoButton = this.createControlButton(this.lang === 'zh' ? '跳至' : 'Go To', () => this.showTodayDialog());
        const prevButton = this.createControlButton(this.lang === 'zh' ? '前一個' : 'Prev', () => this.changeDate(-1));
        const nextButton = this.createControlButton(this.lang === 'zh' ? '後一個' : 'Next', () => this.changeDate(1));
        cell.append(gotoButton, prevButton, nextButton);
        return cell;
    }

    createControlsCenterCell() {
        const cell = this.createElement('td', {
            fontSize: '16px',
            textAlign: 'center'
        });
        cell.innerHTML = `<strong id="icalendar-showdate">${this.getDisplayDate()}</strong>`;
        return cell;
    }

    createControlsRightCell() {
        const cell = this.createElement('td', {
            width: '30%',
            textAlign: 'right'
        });
        const modes = [{
                text: this.lang === 'zh' ? '月' : 'Month',
                mode: 'month'
            },
            {
                text: this.lang === 'zh' ? '週' : 'Week',
                mode: 'week'
            },
            {
                text: this.lang === 'zh' ? '日' : 'Day',
                mode: 'day'
            }
        ];
        modes.forEach(({
            text,
            mode
        }) => {
            const button = this.createControlButton(text, () => this.changeMode(mode));
            cell.appendChild(button);
        });
        return cell;
    }

    createControlButton(text, onClick) {
        const button = this.createElement('button', {
            type: 'button',
            display: 'inline-block',
            background: '#f6f6f6',
            fontSize: '14px',
            height: '28px',
            padding: '4px 8px',
            marginLeft: '4px',
            marginRight: '4px',
            border: '2px solid #e6e6e6',
            boxSizing: 'border-box',
            borderRadius: '4px',
            verticalAlign: 'middle',
            cursor: 'pointer'
        });
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }
    
    showTodayDialog() {
        const todaydialogElement = this.selfObj.querySelector('div.todaydialog');
        if(!todaydialogElement) {
            const div = this.createElement('div', {
                position: 'absolute',
                background: '#fff',
                top: '40px',
                left: '8px',
                padding: '8px',
                border: '2px solid #e6e6e6',
                boxSizing: 'border-box',
                borderRadius: '4px',
                overflow: 'hidden',
                zIndex: '5'
            }, 'todaydialog');

            const input = this.createElement('input', {
                border: '1px solid #e6e6e6',
                width: '140px',
                height: '28px',
                padding: '2px 8px',
                boxSizing: 'border-box'
            });
            input.type = 'date';
            input.placeholder = 'YYYY-MM-DD';
            input.addEventListener('change', (e) => {
                const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
                if(regex.test(e.target.value)) {
                    const dateObj = new Date(e.target.value);
                    this.displayDate = dateObj.toLocaleString('en-US', {
                        timeZone: 'Asia/Hong_Kong'
                    });
                    this.refresh();
                    e.target.closest('div.todaydialog').remove();
                }
            });
            div.appendChild(input);

            this.selfObj.appendChild(div);
        }
        else {
            todaydialogElement.remove();
        }
    }

    changeDate(offset) {
        let dateObj = new Date(this.displayDate);
        if(this.displayMode === 'week') {
            dateObj.setDate(dateObj.getDate() + offset * 7);
        }
        else if(this.displayMode === 'day') {
            dateObj.setDate(dateObj.getDate() + offset);
        } else {
            dateObj = this.getPrevNextMonth(this.displayDate, offset);
        }
        this.displayDate = dateObj.toLocaleString('en-US', {
            timeZone: 'Asia/Hong_Kong'
        });
        this.refresh();
    }

    changeMode(mode) {
        this.displayMode = mode;
        this.refresh();
    }

    getDisplayDate() {
        if(this.displayMode === 'week') {
            const tempDate = new Date(this.displayDate);
            tempDate.setDate(tempDate.getDate() + 6);
            return this.lang === 'zh' ?
                `由 ${this.getYmd(this.displayDate)} 至 ${this.getYmd(tempDate)}` :
                `From ${this.getYmd(this.displayDate)} To ${this.getYmd(tempDate)}`;
        } else {
            return this.getYmd(this.displayDate, ((this.displayMode === 'month') ? this.displayMode : 'week'));
        }
    }

    renderBody() {
        const body = this.createElement('div', {
            position: 'relative',
            background: '#f6f6f6',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }, 'details');

        this.fixedCorner = this.createElement('div', {
            position: 'absolute',
            background: '#f6f6f6',
            top: '0px',
            left: '0px',
            width: '61px',
            height: '47px',
            border: '1px solid #e6e6e6',
            boxSizing: 'border-box',
            zIndex: '5'
        }, 'fixedCorner');

        this.fixedHeader = this.createElement('div', {
            position: 'absolute',
            top: '0px',
            left: '61px',
            right: '0px',
            overflowX: 'hidden',
            overflowY: 'scroll',
            zIndex: '4'
        }, 'fixedHeader');

        this.fixedLeft = this.createElement('div', {
            position: 'absolute',
            top: '46px',
            left: '0px',
            maxHeight: `${this.maxHeight}px`,
            zIndex: '3'
        }, 'fixedLeft');

        this.timeSlots = this.createElement('div', {
            position: 'relative',
            background: '#fff',
            maxHeight: `${this.maxHeight}px`,
            marginTop: '46px',
            marginLeft: '61px',
            overflowX: 'auto',
            overflowY: 'scroll'
        }, 'timeSlots');

        body.append(this.fixedCorner, this.fixedHeader, this.fixedLeft, this.timeSlots);
        this.selfObj.appendChild(body);
    }

    createElement(tag, styles = {}, className) {
        const el = document.createElement(tag);
        if(className) el.className = className;
        Object.assign(el.style, styles);
        return el;
    }

    setHeader() {
        this.noResources = false;
        if(!this.resources || (this.resources && this.resources.length === 0)) {
            this.resources = [{
                id: 0,
                name: ''
            }];
            this.noResources = true;
        }

        this.fixedCorner.style.display = ((this.displayMode === 'week' || this.displayMode === 'day')) ? 'block' : 'none';
        this.fixedHeader.style.left = ((this.displayMode === 'week' || this.displayMode === 'day')) ? '61px' : '0px';
        this.fixedHeader.style.overflow = ((this.displayMode === 'week' || this.displayMode === 'day')) ? 'hidden scroll' : 'hidden';

        this.fixedHeader.innerHTML = '';
        if(this.displayMode === 'week' || this.displayMode === 'day') {
            const headerTable = this.createElement('table', {
                width: '100%',
                borderCollapse: 'collapse'
            });
            const headerRow = this.createElement('tr');
            if(this.resources) {
                this.resources.forEach((resource, index) => {
                    if(this.displayMode === 'week') {
                        const startOfWeek = new Date(this.displayDate);
                        for (let w = 0; w < 7; w++) {
                            const day = new Date(startOfWeek);
                            day.setDate(startOfWeek.getDate() + w);
                            const dayCell = this.createElement('th', {
                                position: 'relative',
                                background: '#f6f6f6',
                                width: `calc((100% - 60px) / ${(this.resources.length * 7)})`,
                                minWidth: '180px',
                                height: '46px',
                                padding: '4px',
                                textAlign: 'center',
                                border: '1px solid #e6e6e6',
                                boxSizing: 'border-box'
                            });
                            dayCell.innerHTML = (resource.id) ? `${resource.name}<br/><small>` + this.getYmd(day, 'week') + `</small>` : `${this.getYmd(day, 'week')}`;
                            headerRow.appendChild(dayCell);
                        }
                    } else if(this.displayMode === 'day') {
                        const dayCell = this.createElement('th', {
                            position: 'relative',
                            background: '#f6f6f6',
                            width: `calc((100% - 60px) / ${this.resources.length})`,
                            minWidth: '180px',
                            height: '46px',
                            padding: '4px',
                            textAlign: 'center',
                            border: '1px solid #e6e6e6',
                            boxSizing: 'border-box'
                        });
                        dayCell.innerHTML = (resource.id) ? `${resource.name}` : (this.lang === 'zh' ? '今天' : 'Today');
                        headerRow.appendChild(dayCell);
                    }
                });
            }

            headerTable.appendChild(headerRow);
            this.fixedHeader.appendChild(headerTable);
        } else if(this.displayMode === 'month') {
            const headerTable = this.createElement('table', {
                width: '100%',
                borderCollapse: 'collapse'
            });
            const headerRow = this.createElement('tr');
            const daysOfWeek = this.lang === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            daysOfWeek.forEach(day => {
                const dayCell = this.createElement('th', {
                    position: 'relative',
                    background: '#f6f6f6',
                    width: `calc((100% / ${daysOfWeek.length})`,
                    height: '46px',
                    padding: '4px',
                    textAlign: 'center',
                    border: '1px solid #e6e6e6',
                    boxSizing: 'border-box'
                });
                dayCell.textContent = day;
                headerRow.appendChild(dayCell);
            });

            headerTable.appendChild(headerRow);
            this.fixedHeader.appendChild(headerTable);
        }
        
        const calcHeight = this.selfObj.querySelector('.fixedHeader').offsetHeight;
        this.fixedCorner.style.height = calcHeight+'px';
        this.fixedLeft.style.top = calcHeight+'px';
        this.timeSlots.style.marginTop = calcHeight+'px';
    }

    setLeft() {
        this.fixedLeft.style.display = ((this.displayMode === 'week' || this.displayMode === 'day')) ? 'block' : 'none';
        this.fixedLeft.innerHTML = '';
        const leftTable = this.createElement('table', {
            width: '100%',
            borderCollapse: 'collapse'
        });
        let currentTime = this.startHm;
        while (currentTime <= this.endHm) {
            const row = this.createElement('tr');
            const cell = this.createElement('th', {
                position: 'relative',
                background: '#f6f6f6',
                width: '60px',
                height: '30px',
                padding: '4px',
                border: '1px solid #e6e6e6',
                boxSizing: 'border-box',
                textAlign: 'center'
            });

            const timeString = currentTime.toString().padStart(4, '0');
            const formattedTime = `${timeString.slice(0, 2)}:${timeString.slice(2)}`;
            cell.innerHTML = `${formattedTime}`;

            row.appendChild(cell);
            leftTable.appendChild(row);
            currentTime = this.getNextTimeSlot(currentTime, this.interval);
        }

        this.fixedLeft.appendChild(leftTable);
    }

    setSlots() {
        this.timeSlots.style.marginLeft = ((this.displayMode === 'week' || this.displayMode === 'day')) ? '61px' : '0px';
        this.timeSlots.style.maxHeight = ((this.displayMode === 'week' || this.displayMode === 'day')) ? (this.maxHeight + 'px') : 'none';
        this.timeSlots.style.overflow = ((this.displayMode === 'week' || this.displayMode === 'day')) ? 'auto scroll' : 'hidden';
        this.timeSlots.innerHTML = '';

        if(this.displayMode === 'week' || this.displayMode === 'day') {
            if(this.resources) {
                const timeSlotsTable = this.createElement('table', {
                    width: '100%',
                    borderCollapse: 'collapse'
                });
                let currentTime = this.startHm;
                while (currentTime <= this.endHm) {
                    const row = this.createElement('tr');
                    this.resources.forEach((resource, index) => {
                        const startOfWeek = new Date(this.displayDate);
                        if(this.displayMode === 'week') {
                            for (let w = 0; w < 7; w++) {
                                const day = new Date(startOfWeek);
                                day.setDate(startOfWeek.getDate() + w);
                                const cell = this.createElement('td', {
                                    position: 'relative',
                                    background: '#fff',
                                    width: `calc((100% - 60px) / ${(this.resources.length * 7)})`,
                                    minWidth: '180px',
                                    height: '30px',
                                    padding: '4px',
                                    border: '1px solid #e6e6e6',
                                    boxSizing: 'border-box'
                                });
                                cell.setAttribute('data-timeslot', `${resource.id}_` + this.getYmd(day) + `_${currentTime}`);
                                row.appendChild(cell);
                            }
                        } else {
                            const cell = this.createElement('td', {
                                position: 'relative',
                                background: '#fff',
                                width: `calc((100% - 60px) / ${this.resources.length})`,
                                minWidth: '180px',
                                height: '30px',
                                padding: '4px',
                                border: '1px solid #e6e6e6',
                                boxSizing: 'border-box'
                            });
                            cell.setAttribute('data-timeslot', `${resource.id}_` + this.getYmd(startOfWeek) + `_${currentTime}`);
                            row.appendChild(cell);
                        }
                    });

                    timeSlotsTable.appendChild(row);
                    currentTime = this.getNextTimeSlot(currentTime, this.interval);
                }

                this.timeSlots.appendChild(timeSlotsTable);
            }
        } else {
            const targetDate = new Date(this.displayDate);
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDay = firstDay.getDay();
            const daysInMonth = lastDay.getDate();

            const timeSlotsTable = this.createElement('table', {
                width: '100%',
                borderCollapse: 'collapse'
            });

            let row = this.createElement('tr');

            for (let i = 0; i < startDay; i++) {
                const cell = this.createElement('td', {
                    position: 'relative',
                    width: `calc(100% / 7)`,
                    padding: '4px',
                    border: '1px solid #e6e6e6',
                    boxSizing: 'border-box',
                    verticalAlign: 'top',
                    overflow: 'hidden'
                });
                row.appendChild(cell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const cell = this.createElement('td', {
                    position: 'relative',
                    width: `calc(100% / 7)`,
                    padding: '4px',
                    border: '1px solid #e6e6e6',
                    boxSizing: 'border-box',
                    verticalAlign: 'top',
                    overflow: 'hidden'
                });
                cell.setAttribute('data-timeslot', this.getYmd(year + '-' + (month + 1) + '-' + day));
                cell.innerHTML = this.createSvgSquare(day);
                row.appendChild(cell);

                if((day + startDay) % 7 === 0) {
                    timeSlotsTable.appendChild(row);
                    row = this.createElement('tr');
                }
            }

            if(row.querySelectorAll('td').length > 0 && row.querySelectorAll('td').length < 7) {
                for (let i = row.querySelectorAll('td').length; i < 7; i++) {
                    const cell = this.createElement('td', {
                        position: 'relative',
                        width: `calc(100% / 7)`,
                        padding: '4px',
                        border: '1px solid #e6e6e6',
                        boxSizing: 'border-box',
                        verticalAlign: 'top',
                        overflow: 'hidden'
                    });
                    row.appendChild(cell);
                }
            }

            timeSlotsTable.appendChild(row);
            this.timeSlots.appendChild(timeSlotsTable);
        }
    }

    createSvgSquare(day) {
        return `<svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" style="position: relative; width: 100%; height: 100%; display: block; cursor: pointer;"><rect x="0" y="0" width="40" height="40" style="fill: #fff;"></rect><text x="32" y="8" alignment-baseline="middle" text-anchor="middle" style="fill: #e6e6e6; font-size: 10px;">${day}</text></svg>`;
    }

    syncScroll() {
        this.timeSlots.onscroll = () => {
            this.fixedHeader.querySelector('table').style.transform = `translateX(${-this.timeSlots.scrollLeft}px)`;
            this.fixedLeft.querySelector('table').style.transform = `translateY(${-this.timeSlots.scrollTop}px)`;
        };
    }

    drawEvents(events) {
        this.events = events || this.events;
        this.timeSlots.querySelectorAll('div.ievent').forEach(event => event.remove());

        const formatTime = (time) => {
            const timeStr = time.toString().padStart(4, '0');
            const hours = timeStr.slice(0, -2);
            const minutes = timeStr.slice(-2);
            return `${hours}:${minutes}`;
        };

        if(events) {
            events.sort((a, b) => {
                if(a.targetDate === b.targetDate) {
                    return a.startHm - b.startHm;
                }
                return new Date(a.targetDate) - new Date(b.targetDate);
            });

            events.forEach(event => {
                if(this.displayMode === 'week' || this.displayMode === 'day') {
                    const findMatchSlot = this.timeSlots.querySelector(`[data-timeslot="${(!this.noResources ? event.resourceId : 0)}_${event.targetDate}_${Math.max(this.startHm, event.startHm)}"]`);
                    if(findMatchSlot) {
                        const blockCount = findMatchSlot.querySelectorAll('div.ievent').length;
                        const startMinutes = Math.floor(Math.max(this.startHm, event.startHm) / 100) * 60 + (Math.max(this.startHm, event.startHm) % 100);
                        const endMinutes = Math.floor(Math.min(this.endHm, event.endHm) / 100) * 60 + (Math.min(this.endHm, event.endHm) % 100);
                        const durationMinutes = endMinutes - startMinutes;
                        const height = (Math.ceil(durationMinutes / this.interval) + 1) * 30;

                        const block = this.createElement('div', {
                            position: 'absolute',
                            background: event.background || '#3788d8',
                            top: '0px',
                            left: `${blockCount * 40}px`,
                            right: '0px',
                            height: `${height}px`,
                            padding: '8px',
                            border: '1px solid #e6e6e6',
                            boxSizing: 'border-box',
                            borderRadius: '8px',
                            wordBreak: 'break-all',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            opacity: '0.95',
                            zIndex: 1
                        }, ('ievent ' + this.displayMode));
                        block.innerHTML = (typeof this.eventTemplate === 'function') ? this.eventTemplate(event) : `<div>${((event.content) ? event.content : (formatTime(event.startHm) + ` ~ ` + formatTime(event.endHm)))}</div>`;
                        block.setAttribute('data-id', event.id || 0);
                        block.setAttribute('data-targetDate', event.targetDate || '');
                        block.setAttribute('data-startHm', event.startHm || '');
                        block.setAttribute('data-endHm', event.endHm || '');

                        block.onclick = (e) => {
                            e.stopPropagation();
                            const currentzIndex = block.style.zIndex;
                            this.timeSlots.querySelectorAll('div.ievent').forEach(event => event.style.zIndex = 1);
                            if(currentzIndex === '1') {
                                block.style.zIndex = 2;
                            }
                            if(typeof this.eventClick === 'function') {
                                this.eventClick(event);
                            }
                        };

                        findMatchSlot.appendChild(block);
                    }
                } else {
                    const findMatchSlot = this.timeSlots.querySelector(`[data-timeslot="${event.targetDate}"]`);
                    if(findMatchSlot) {
                        const blockCount = findMatchSlot.querySelectorAll('div.ievent').length;
                        const block = this.createElement('div', {
                            position: 'relative',
                            background: event.background || '#3788d8',
                            width: '100%',
                            minHeight: '25px',
                            padding: '4px 8px',
                            marginTop: ((blockCount === 0) ? '-64%' : '0px'),
                            border: '1px solid #e6e6e6',
                            boxSizing: 'border-box',
                            borderRadius: '4px',
                            wordBreak: 'break-all',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            opacity: '0.95',
                            zIndex: 1
                        }, ('ievent ' + this.displayMode));
                        block.innerHTML = (typeof this.eventShortTemplate === 'function') ? this.eventShortTemplate(event) : `<div>${((event.short_content) ? event.short_content : (formatTime(event.startHm) + ` ~ ` + formatTime(event.endHm)))}</div>`;
                        block.setAttribute('data-id', event.id || 0);
                        block.setAttribute('data-targetDate', event.targetDate || '');
                        block.setAttribute('data-startHm', event.startHm || '');
                        block.setAttribute('data-endHm', event.endHm || '');

                        block.onclick = (e) => {
                            e.stopPropagation();
                            const currentzIndex = block.style.zIndex;
                            this.timeSlots.querySelectorAll('div.ievent').forEach(event => event.style.zIndex = 1);
                            if(currentzIndex === '1') {
                                block.style.zIndex = 2;
                            }
                            if(typeof this.eventClick === 'function') {
                                this.eventClick(event);
                            }
                        };

                        findMatchSlot.appendChild(block);
                    }
                }
            });
        }
    }

    getPrevNextMonth(date, offset) {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate.toISOString().split('T')[0];
    }

    getMonthStartEnd(date) {
        const targetDate = new Date(date);
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            start: formatDate(startOfMonth),
            end: formatDate(endOfMonth)
        };
    }

    getYmd(date, format) {
        const hongKongDate = new Date(date);
        const formatter = new Intl.DateTimeFormat(((this.lang === 'zh') ? 'zh-HK' : 'en-US'), {
            timeZone: 'Asia/Hong_Kong',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
        });

        const parts = formatter.formatToParts(hongKongDate);
        const year = parts.find(part => part.type === 'year').value;
        const month = parts.find(part => part.type === 'month').value;
        const day = parts.find(part => part.type === 'day').value;
        const weekday = parts.find(part => part.type === 'weekday').value.replace('星期', '').replace('週', '');

        if(format === 'month') {
            return (this.lang === 'zh') ? `${month}月/${year}` : `${month}/${year}`;
        } else {
            if(format === 'week') {
                return `${year}-${month}-${day} (${weekday})`;
            } else {
                return `${year}-${month}-${day}`;
            }
        }
    }

    getNextTimeSlot(hm, interval) {
        let nextHm = hm + interval;
        if(nextHm % 100 >= 60) {
            nextHm = (Math.floor(nextHm / 100) + 1) * 100 + (nextHm % 100 - 60);
        }
        return nextHm;
    }

    async fetchData(url, callback) {
        try {
            let fullUrl = url;

            if(!this.extraParas) {
                this.extraParas = {};
            }
            if(this.displayMode === 'month') {
                const minMaxDate = this.getMonthStartEnd(this.displayDate);
                this.extraParas['startDate'] = minMaxDate.start;
                this.extraParas['endDate'] = minMaxDate.end;
            } else if(this.displayMode === 'week') {
                const tempDate = new Date(this.displayDate);
                tempDate.setDate(tempDate.getDate() + 6);
                this.extraParas['startDate'] = this.getYmd(this.displayDate);
                this.extraParas['endDate'] = this.getYmd(tempDate);
            } else {
                this.extraParas['startDate'] = this.getYmd(this.displayDate);
                this.extraParas['endDate'] = this.getYmd(this.displayDate);
            }

            if(this.extraParas) {
                const queryParams = new URLSearchParams(this.extraParas).toString();
                const separator = url.includes('?') ? '&' : '?';
                fullUrl = `${url}${separator}${queryParams}`;
            }
            
            const response = await fetch(fullUrl);
            const data = await response.json();
            if(typeof callback === 'function') {
                callback(data);
            }
        } catch (error) {
            console.log('Error fetching data:', error);
            return false;
        }
    }

    addSpinnerAnimationStyle() {
        let style = document.getElementById('icalendar-spin-animation');
        if(!style) {
            style = this.createElement('style');
            style.id = 'icalendar-spin-animation';
            style.innerHTML = `@keyframes icalendar-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`;
            document.head.appendChild(style);
        }
    }

    showLoadingMask() {
        this.addSpinnerAnimationStyle();

        const loadingMask = document.getElementById('icalendar-loading-mask');
        if(!loadingMask) {
            const loadingMask = this.createElement('div', {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '10'
            });
            loadingMask.id = 'icalendar-loading-mask';

            const spin = this.createElement('div', {
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'icalendar-spin 1s linear infinite'
            });
            spin.id = 'icalendar-spin';

            loadingMask.appendChild(spin);
            this.selfObj.appendChild(loadingMask);
        }
    }

    hideLoadingMask() {
        const loadingMask = document.getElementById('icalendar-loading-mask');
        if(loadingMask) {
            loadingMask.remove();
        }
    }
}