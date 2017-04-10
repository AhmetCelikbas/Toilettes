import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/*
  Generated class for the Config provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ConfigService {
  
  // apiUrl = "https://api.ahmetcelikbas.fr/toilettes";
  apiUrl = "http://192.168.1.93:8080/v1/api";
  GoogleMapsApiKey = "AIzaSyDE99utD1l0leasTivb7AuNw_Qk1DzSY2c"; // API KEY FOR ADDRESS REQUEST SEARCH FROM POSITION (lat, lng)
  
  apiVerbs = {
      getToilets : "/mock_liste_toilettes.php",                  // Get user nearby toilets
      createToilet : "/mock_liste_toilettes.php",                // Get user nearby toilets
      toilets : "/toilets",                                     // add new toilet
      signup : "/signup",                                     // signup
      authenticate : "/authenticate"                                     // authenticate

  }


  constructor() {
    console.log('Hello Config Provider');
  }
}
