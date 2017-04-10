import {AlertController} from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ConfigService } from './config.service';

import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  constructor( private config: ConfigService, public http: Http, public alertCtrl: AlertController) {
    console.log('Hello DataService Provider');
  }

  // public get(verb:string, toiletSearchArea: any) {
  //   return this.http.get( this.config.apiUrl + 
  //                         verb + 
  //                         "/" + 
  //                         toiletSearchArea['southWest']['lat'] + "/" + 
  //                         toiletSearchArea['southWest']['lng'] + "/" + 
  //                         toiletSearchArea['northEast']['lat'] + "/" + 
  //                         toiletSearchArea['northEast']['lng']
  //                       ).map (
  //     res => res.json()
  //   )
  // }


  public get(verb:string) {
    return this.http.get( this.config.apiUrl + verb).map (
      res => res.json()
    )
  }

  public post(verb:string, data) {

    // bypass login
    // localStorage.setItem('token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjo1LCJpYXQiOjE0OTE3NTI0ODUsImV4cCI6MTQ5MTgzODg4NX0.dJ3R-M1OCvXgynjEqxPQfsu58Xvz2-kdHVkOfC8IpAQ");

    let headers = new Headers({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')
     });
    return new Promise(resolve => {
      this.http.post(this.config.apiUrl + verb, data, {headers: headers}).subscribe(
        data => {
            if(data.json()) {
              resolve(data.json());
            } else {
              resolve(false);
            }
        },
        err => {
          if(err.status == 403) {
            console.log(JSON.parse(err._body)['message'])
            let alert = this.alertCtrl.create({
              title: 'Connection requise',
              subTitle: 'Vous devez vous connecter pour effectuer cette action',
              buttons: ['OK']
            });
            alert.present().then(
              () => {
                resolve(false);
              })
          }
        }
      )
    });
  }


  // public getCityNameFromLatLng(lat, lng) {
  //   return this.http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + this.config.GoogleMapsApiKey).map ( 
  //     res => res.json()
  //   )
  // }


}
