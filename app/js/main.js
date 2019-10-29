"use strict";

const slider = document.querySelector('.slider');
const pin = slider.querySelector('.slider__btn');
const textarea = document.querySelector('.about-textarea');

const CoordsLimit = {
	LEFT: 0 - pin.offsetWidth / 2,
	RIGHT: slider.offsetWidth - pin.offsetWidth / 2,
};

const setStartCoords = function () {
	var start = slider.offsetWidth / 2;
	pin.style.left = start + 'px'
};

const updateAreaHeight = function () {
	textarea.style.height = '';
	textarea.style.height = textarea.scrollHeight + 'px';
};

pin.addEventListener('mousedown', function (evt) {
	evt.preventDefault();
	pin.classList.add('slider__btn--active');
	let startCoordsX = evt.clientX;

	const mouseMoveHandler = function (moveEvt) {
		moveEvt.preventDefault();

		let shiftX = startCoordsX - moveEvt.clientX;

		startCoordsX = moveEvt.clientX;

		let currentCoordsX = pin.offsetLeft - shiftX;

		currentCoordsX = currentCoordsX > CoordsLimit.RIGHT ? CoordsLimit.RIGHT : currentCoordsX;
		currentCoordsX = currentCoordsX < CoordsLimit.LEFT ? CoordsLimit.LEFT : currentCoordsX;

		pin.style.left = currentCoordsX + 'px';
	};

	const mouseUpHandler = function (upEvt) {
		upEvt.preventDefault();
		pin.classList.remove('slider__btn--active');

		document.removeEventListener('mousemove', mouseMoveHandler);
		document.removeEventListener('mouseup', mouseUpHandler);
	};

	document.addEventListener('mousemove', mouseMoveHandler);
	document.addEventListener('mouseup', mouseUpHandler);
});

textarea.addEventListener('input', function(){
	this.style.height = this.scrollTop > 0 ? this.scrollHeight + "px" : this.style.height;
});

window.addEventListener("resize", setStartCoords);

setStartCoords();
updateAreaHeight();
