'use strict'

//import { Map as LeafletMap, Icon, Marker } from "leaflet"
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map;
let mapEvent;


/*
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const lat = mapEvent.latlng.lat;
    const long = mapEvent.latlng.lng;

    const cord = [lat, long];


    L.marker(cord).addTo(map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
        }).setContent("ok boy yo hava done it")
        )
        .openPopup();


});

inputType.addEventListener('change', function () {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
*/
class Workout {
    date = new Date();
    id =(Date.now() + '').slice(-10);
    constructor(coords, distance, duration) {

        this.coords = coords;
        this.distance = distance;
        this.duration = duration;

    }

    _setdescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;

    }


}
class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration,cadence) {

        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setdescription();
    }
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;


    }
}

class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {

        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setdescription();
    }
    calcSpeed() {
        this.speed = this.distance / this.duration;

        return this.speed;
    }

}

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 95, 523);
console.log(run1, cycling1);



class App {
    #map;
    #mapEvent;
    #workout = [];
    #mapZoomLevel = 13;
    constructor() {
        this._getPosition();
        this._getLocalStorage();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevation);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))

    }
    _getPosition() {
        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
                function () { console.log("fails") });


        }

    }

    _loadMap(position) {
        console.log(position);
        console.log("your current locations is this")
        const latitude = position.coords.latitude;
        const longitutde = position.coords.longitude;
        console.log(`https://www.google.com/maps/@29.2401481,76.9954009`);
        const Coordinates = [latitude, longitutde];
        this.#map = L.map('map').setView(Coordinates, 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
       // console.log("hi");
        this.#map.on('click', this._showForm.bind(this));

        this.#workout.forEach((work) => this._renderWorkoutMarker(work));
    }
    

    _showForm(mapEv) {

        form.classList.remove("hidden");
        this.#mapEvent = mapEv;
        inputDistance.focus();
    }
    _toggleElevation() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e) {
        e.preventDefault();
        

        const validInput = function (...arg) {
            return arg.every(function (ip) { return Number.isFinite(ip); });
        };
        const positiveNumber = function (...arg) {
            return arg.every(function (ip) {
                return ip > 0;
            });

        };
  

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const cadence = +inputCadence.value;
        const elevation = +inputElevation.value;
        let work;
        const lat = this.#mapEvent.latlng.lat;
        const long = this.#mapEvent.latlng.lng;
        const cord = [lat, long];
        console.log(positiveNumber(distance, duration, cadence));
        if (type == "running") {
            
            if (!validInput(distance, duration, cadence) || !positiveNumber(distance, duration, cadence))
                { alert("enter a positive number"); return; }
             work = new Running(cord, distance, duration, cadence);

        }
        else if (type == "cycling") {
            if (!validInput(distance, duration, elevation) || !positiveNumber(distance, duration, elevation))
            { alert("enter a positive number"); return; }

             work = new Cycling(cord, distance, duration, elevation);
        }

        console.log(work);

        this.#workout.push(work);
        this._renderWorkoutMarker(work);
        this._renderWorkout(work);
        this._hideForm();
        this._setLocalStorage();
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
       
    }
    _renderWorkoutMarker(work) {
        L.marker(work.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${work.type}-popup`,
            }).setContent(`${work.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${work.description }`)
            )
            .openPopup();

    }
        
    _renderWorkout(work) {

        let html = `<li class="workout workout--${work.type}" data-id="${work.id}">
          <h2 class="workout__title">${work.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${work.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${work.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${work.duration}</span>
            <span class="workout__unit">min</span>
          </div>`
        if (work.type == "running") {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${work.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${work.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
                

        }
        if (work.type ==="cycling") {
            console.log(work.type+"ggg");
            html +=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${work.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${work.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `;


        }
        form.insertAdjacentHTML('afterend', html);

    }
    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _moveToPopup(e) {
       
        const workoutE1 = e.target.closest('.workout');

        if (!workoutE1) {
            return;
        }
        const workout = this.#workout.find((t) => t.id == workoutE1.dataset.id);
        console.log(workout); 
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }
    _setLocalStorage() {
        localStorage.setItem('workout', JSON.stringify(this.#workout));


    }
    _getLocalStorage() {

        const data = JSON.parse(localStorage.getItem('workout'));
        if (!data) {
            return;
        }
        this.#workout = data;
        this.#workout.forEach((work) => this._renderWorkout(work));
    }
    reset() {
        localStorage.removeItem('workout');
        location.reload();

    }
}

const app = new App();
