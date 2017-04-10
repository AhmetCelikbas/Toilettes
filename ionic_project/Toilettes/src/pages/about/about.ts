import { Component } from '@angular/core';

import {PopoverController, NavController} from 'ionic-angular';

import { SigninSignupPopoverPage } from '../signin-signup-popover/signin-signup-popover';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  private token : string;

  constructor(  
    public navCtrl: NavController,
    public popoverCtrl: PopoverController
    ) {
  }

  getToken(){
    return window.localStorage.getItem('token');
  }

  logout(){
    window.localStorage.removeItem('token');
    this.token = null;
  }

  login(){

    //popover login
    let popover = this.popoverCtrl.create(SigninSignupPopoverPage);
      // popover.present({ev: event});
      popover.present({ev: event});

  }


}
