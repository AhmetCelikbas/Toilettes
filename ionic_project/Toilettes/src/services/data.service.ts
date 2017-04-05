import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ConfigService } from './config.service';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  constructor( private config: ConfigService, public http: Http) {
    console.log('Hello DataService Provider');
  }


  public get(verb:string, toiletSearchArea: any) {
    return this.http.get( this.config.apiUrl + 
                          verb + 
                          "/" + 
                          toiletSearchArea['southWest']['lat'] + "/" + 
                          toiletSearchArea['southWest']['lng'] + "/" + 
                          toiletSearchArea['northEast']['lat'] + "/" + 
                          toiletSearchArea['northEast']['lng']
                        ).map ( 
      res => res.json()
    )
  }

  // public getCityNameFromLatLng(lat, lng) {
  //   return this.http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + this.config.GoogleMapsApiKey).map ( 
  //     res => res.json()
  //   )
  // }


}
