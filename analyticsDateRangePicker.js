const customRangeLabel = "Custom Range";

class AnalyticsDateRangePicker {
	constructor(analyticsDateRangePickerElement, options){
		this.analyticsDateRangePickerElement = analyticsDateRangePickerElement;
		this.model = new AnalyticsDateRangePickerModel(options, this.updateView.bind(this));

		this.isShown = false;
		this.onUpdate = ()=>{};

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
					<span id="ADRP_DisplayText">${this.model.getDisplayText()}</span>
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
					${menu.menuItemLabel}
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

		for(let i = 0; i < menuItemElems.length; i++){
			menuItemElems[i].onclick = (e) => {
				//this.stopClickPropagation(e);
				this.model.selectMenuItem(i);
				this.updateView();
				this.onUpdate(this.model.options.menus[i].getRange);
			};
		}
	}

	setCalendarItemClickListener(){

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
			menuItemLabel: customRangeLabel,
			getDisplayText: () => {

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

	getDisplayText(){
		for(let i = 0; i < this.options.menus.length; i++){
			if(this.options.menus[i].isSelected){
				return this.options.menus[i].getDisplayText();
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