import { Component } from '@angular/core';
import {  Platform, 
          NavController 
      } from 'ionic-angular';
import {  GoogleMap,
          GoogleMapsEvent,
          GoogleMapsLatLng,
          CameraPosition,
          GoogleMapsMarkerOptions,
          GoogleMapsMarker
        } from 'ionic-native';
import { ConfigService } from '../../services/config.service';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'page-toilettes',
  templateUrl: 'toilettes.html'
})

export class ToilettesPage {
  private map: GoogleMap;
  private geolocationOptions: any;
  private userPosition: GoogleMapsLatLng;
  private checkinPosition: GoogleMapsLatLng;
  private cameraPos: CameraPosition;


  private toilets : Array<Object>;

  constructor(  public platform: Platform, 
                public navCtrl: NavController,
                private config: ConfigService,
                private data: DataService
                ) {
    this.geolocationOptions = {
      enableHighAccuracy: true      // Force Google Maps Plugin To locate user with a high accuracy
    };
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad Toilets');
    
    this.platform.ready().then(() => {
      // this.loadGoogleMaps();
      this.loadNearbyToilets();
      
    });
  }
  


  private loadNearbyToilets() {
    this.data.get(this.config.apiVerbs.toilets).subscribe (
      apiRes => this.toilets = apiRes,
      error => {
        console.log("error loading toilets");
        console.log(error);
      },
      () => {
        console.log("nearby toilets loaded")
        console.log(this.toilets);

        for(let toilet in this.toilets){

            // // ADD MARKER ON MAP
            // this.map.addMarker({
            //   'position': new GoogleMapsLatLng(this.toilets[toilet]['lat'], this.toilets[toilet]['lng']),
            //   'title': this.toilets[toilet]['user']['name'],
            //   "snippet": this.toilets[toilet]['formatted_address'],
            //   'styles' : {
            //     'text-align': 'center',
            //     'font-weight': 'bold'
            //   }
            // });



            

        }
        
      }
    )


  }


  private loadGoogleMaps() {
    this.map = new GoogleMap(document.getElementById('map'), {
      'backgroundColor': 'white',
      'controls': {
        'compass': true,
        'myLocationButton': true,
        'indoorPicker': true,
        'zoom': true
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      }
    });
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('Map is ready!')
      this.locateUser();
      // this.loadNearbyToilets();
    });
  }

  private locateUser() {
    this.map.getMyLocation(this.geolocationOptions).then((location) => {
      console.log("location success");
      console.log("lat = " + location.latLng.lat);
      console.log("lng = " + location.latLng.lng);

      this.userPosition = new GoogleMapsLatLng(location.latLng.lat, location.latLng.lng);
      this.moveCameraOnUserPosition();
    }).catch((error) => {
      console.log("location error : " + error);

    })
  }

  private moveCameraOnUserPosition() {
    // create CameraPosition
    this.cameraPos = {
      target: this.userPosition,
      zoom: 14
    };
    // move the map's camera to position
    this.map.moveCamera(this.cameraPos);
  }

}
