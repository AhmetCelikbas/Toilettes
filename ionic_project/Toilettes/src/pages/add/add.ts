import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Ionic2RatingModule } from 'ionic2-rating';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {

  private free : boolean;
  private access : boolean;
  private rate: number;
  private type: string;
  
  constructor(public navCtrl: NavController) {
    this.free = false;
    this.access = false;
    this.rate = 0;
  }

  action(event){
    // console.log(event);
    console.log("free " + this.free);
    console.log("access " + this.access);
    console.log("rate " + this.rate);
    console.log("type " + this.type);
  }

}
