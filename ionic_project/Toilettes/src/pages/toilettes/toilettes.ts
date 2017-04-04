import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import {
 GoogleMap,
 GoogleMapsEvent,
 GoogleMapsLatLng,
 CameraPosition,
 GoogleMapsMarkerOptions,
 GoogleMapsMarker
} from 'ionic-native';

@Component({
  selector: 'page-toilettes',
  templateUrl: 'toilettes.html'
})

export class ToilettesPage {
  private map: GoogleMap;
  private geolocationOptions: any;
  private userPosition: GoogleMapsLatLng;
  private checkinPosition: GoogleMapsLatLng;
  private cameraPos: CameraPosition


  constructor(public navCtrl: NavController) {

  }



  

}
