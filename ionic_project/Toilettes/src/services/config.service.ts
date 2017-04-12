import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/*
  Generated class for the Config provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ConfigService {
  
  apiUrl = "http://ahmetcelikbas.fr:8080/v1/api";
  // apiUrl = "http://172.20.10.5:8080/v1/api";
  GoogleMapsApiKey = "AIzaSyDE99utD1l0leasTivb7AuNw_Qk1DzSY2c"; // API KEY FOR ADDRESS REQUEST SEARCH FROM POSITION (lat, lng)
  
  apiVerbs = {
      toilets : "/toilets",                                     // add new toilet
      toilet : "/toilet",                                     // edit a toilet
      signup : "/signup",                                     // signup
      authenticate : "/authenticate",                          // authenticate
      user : "/user"                                         // authenticate
  }


  constructor() {
    console.log('Hello Config Provider');
  }
}
