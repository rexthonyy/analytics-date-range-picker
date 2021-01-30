const customRangeLabel = "Custom Range";

class AnalyticsDateRangePicker {
	constructor(analyticsDateRangePickerElement, options){
		this.analyticsDateRangePickerElement = analyticsDateRangePickerElement;
		this.model = new AnalyticsDateRangePickerModel(options, this.updateView.bind(this));

		this.isShown = false;
		this.onUpdateListener = ()=>{};

		this.updateView();
		this.toggleDropdownVisibility();
	}

	updateView(){
		this.createView();
		this.createMenuItems();
		this.setMenuItemSelection();
		this.setClickListener();
	}

	createView(){
		let elementWidth = this.analyticsDateRangePickerElement.offsetWidth + "px";
		let elementHeight = this.analyticsDateRangePickerElement.offsetHeight + "px";

		this.analyticsDateRangePickerElement.innerHTML = `
		<div id="ADRP_AnalyticsDateRangePickerContainer">
		<div id="ADRP_DropdownClickHandler" style="height: ${elementHeight};">
		<div id="ADRP_DisplayTextContainer">
		<span id="ADRP_DropdownIcon">&#9660;</span>
		<span id="ADRP_DisplayText">${this.model.getSelectedMenuDisplayLabel()}</span>
		</div>
		<div id="ADRP_DateRangePicker">
		<input id="ADRP_StartDateInput" class="ADRP_DateInput" type="text" />
		<input id="ADRP_EndDateInput" class="ADRP_DateInput" type="text"/>
		</div>
		</div>

		<div id="ADRP_DropdownContainer">
		<div id="ADRP_DropdownMenuContainer" style="width: ${elementWidth};">

		</div>
		</div>
		</div>
		`;
	}

	createMenuItems(){
		let innerHTML = "";

		this.model.options.menus.forEach(menu => {
			innerHTML += `
			<div class="ADRP_MenuItem">
			${menu.menuLabel}
			</div>
			`;
		});

		document.getElementById("ADRP_DropdownMenuContainer").innerHTML = innerHTML;
	}

	setMenuItemSelection(){
		let menuItemElems = document.getElementsByClassName("ADRP_MenuItem");

		for(let i = 0; i < this.model.options.menus.length; i++){
			if(this.model.options.menus[i].isSelected){
				menuItemElems[i].className = "ADRP_MenuItem ADRP_MenuItemSelected";
			}else{
				menuItemElems[i].className = "ADRP_MenuItem";
			}
		}
	}

	setClickListener(){
		this.setElementClickListener();
		this.setMenuItemClickListener();
		this.setCalendarItemClickListener();
	}

	setElementClickListener(){
		document.getElementById("ADRP_DropdownClickHandler").onclick = (e) => {
			this.stopClickPropagation(e);
			this.toggleDropdownVisibility();
		};
	}

	toggleDropdownVisibility(){
		let dropdownContainer = document.getElementById("ADRP_DropdownContainer");
		if(this.isShown){
			dropdownContainer.style.display = "block";
			window.onclick = () => {
				this.toggleDropdownVisibility();
			};
		}else{
			dropdownContainer.style.display = "none";
			window.onclick = () => {};
			//console.log(document.getElementById("ADRP_StartDateInput").value);
		}

		this.isShown = !this.isShown;
	}

	stopClickPropagation(e){
		if(!e) e = window.event;
		if(e.stopPropagation){
			e.stopPropagation();
		}else{
			e.cancelBubble = true;
		}
	}

	setMenuItemClickListener(){
		let menuItemElems = document.getElementsByClassName("ADRP_MenuItem");

		let menuItemElemsLength = menuItemElems.length;
		for(let i = 0; i < menuItemElemsLength - 1; i++){
			menuItemElems[i].onclick = (e) => {
				//this.stopClickPropagation(e);
				this.onUpdateListener(this.model.options.menus[i].getRange());
				this.model.selectMenuItem(i);
				this.updateView();
			};
		}

		//click the custom range
		menuItemElems[menuItemElemsLength - 1].onclick = () => {
			this.selectionCount = 0;
			this.isSwapDates = false;
			this.isManualSelection = false;
			let elem = document.getElementById("ADRP_DateRangePicker");
			this.dateRangePicker = new DateRangePicker(elem, { });
			let range = this.model.getSelectedMenuDisplayRange();
			this.dateRangePicker.setDates(range.startDate, range.endDate);

			this.isManualSelection = true;
			document.getElementById("ADRP_StartDateInput").focus();
		};
	}

	setCalendarItemClickListener(){
		const startDateInput = document.getElementById("ADRP_StartDateInput");
		const endDateInput = document.getElementById("ADRP_EndDateInput");

		this.onInputChange(startDateInput, (val) => {
			if(this.isManualSelection){
				if(!this.isSwapDates){
					
					let selectedDate = (new Date(val)).getTime();
					let currentEndDate = this.model.options.endDate.getTime();

					if(selectedDate < currentEndDate){
						if(this.selectionCount == 0){
							endDateInput.focus();
						}else{
							let dates = this.dateRangePicker.getDates();

							let time0 = dates[0].getTime();
							let time1 = dates[1].getTime();

							if(time0 > time1){
								let temp = dates[0];
								dates[0] = dates[1];
								dates[1] = temp;
							}

							this.model.options.startDate = dates[0];
							this.model.options.endDate = dates[1];

							this.dateRangePicker.destroy();

							let customMenuIndex = this.model.options.menus.length - 1;
							this.onUpdateListener(this.model.options.menus[customMenuIndex].getRange());
							this.model.selectMenuItem(customMenuIndex);
							this.toggleDropdownVisibility();
							this.updateView();
						}
					}else{
						this.selectionCount++;
						if(this.selectionCount == 1){
							this.isSwapDates = true;
						}else{
							let dates = this.dateRangePicker.getDates();

							let time0 = dates[0].getTime();
							let time1 = dates[1].getTime();

							if(time0 > time1){
								let temp = dates[0];
								dates[0] = dates[1];
								dates[1] = temp;
							}

							this.model.options.startDate = dates[0];
							this.model.options.endDate = dates[1];

							this.dateRangePicker.destroy();

							let customMenuIndex = this.model.options.menus.length - 1;
							this.onUpdateListener(this.model.options.menus[customMenuIndex].getRange());
							this.model.selectMenuItem(customMenuIndex);
							this.toggleDropdownVisibility();
							this.updateView();
						}
					}
				}
			}
		});

		this.onInputChange(endDateInput, (val) => {
			if(this.isManualSelection){
				if(!this.isSwapDates){

					let dates = this.dateRangePicker.getDates();

					let time0 = dates[0].getTime();
					let time1 = dates[1].getTime();

					if(time0 > time1){
						let temp = dates[0];
						dates[0] = dates[1];
						dates[1] = temp;
					}

					this.model.options.startDate = dates[0];
					this.model.options.endDate = dates[1];

					this.dateRangePicker.destroy();

					let customMenuIndex = this.model.options.menus.length - 1;
					this.onUpdateListener(this.model.options.menus[customMenuIndex].getRange());
					this.model.selectMenuItem(customMenuIndex);
					this.toggleDropdownVisibility();
					this.updateView();
				}else{
					this.isSwapDates = false;
				}
			}
		});
	}

	onInputChange(inputElm, callback){
		const {get, set} = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
		Object.defineProperty(inputElm, 'value', {
			get() {
				return get.call(this);
			},
			set(newVal){
				callback(newVal);
				return set.call(this, newVal);
			}
		});
	}
}

class AnalyticsDateRangePickerModel {
	constructor(options, callback){
		this.callback = callback;
		this.options = options;
		
		this.addCustomRange();
		this.selectMenuItem(this.options.menus.length - 1);
	}

	addCustomRange(){
		this.options.menus.push({
			menuLabel: customRangeLabel,
			getDisplayLabel: () => {

				let startDay = this.options.startDate.getDate();
				let startMonth = this.options.startDate.getMonth() + 1;
				let startYear = this.options.startDate.getFullYear();

				let endDay = this.options.endDate.getDate();
				let endMonth = this.options.endDate.getMonth() + 1;
				let endYear = this.options.endDate.getFullYear();


				return startDay + "/" + startMonth + "/" + startYear + " to " + endDay + "/" + endMonth + "/" + endYear;
			},
			getRange: () => {
				return {
					startDate: this.options.startDate,
					endDate: this.options.endDate
				};
			}
		});
	}

	getSelectedMenuDisplayLabel(){
		for(let i = 0; i < this.options.menus.length; i++){
			if(this.options.menus[i].isSelected){
				return this.options.menus[i].getDisplayLabel();
			}
		}
	}

	getSelectedMenuDisplayRange(){
		for(let i = 0; i < this.options.menus.length; i++){
			if(this.options.menus[i].isSelected){
				return this.options.menus[i].getRange();
			}
		}
	}

	deselectAllMenuItems(){
		this.options.menus.forEach(menu => {
			menu.isSelected = false;
		});
	}

	selectMenuItem(index){
		this.deselectAllMenuItems();
		this.options.menus[index].isSelected = true;
	}
}