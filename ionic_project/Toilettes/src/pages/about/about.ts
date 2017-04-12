import { Component } from '@angular/core';

import {PopoverController, NavController} from 'ionic-angular';

import { SigninSignupPopoverPage } from '../signin-signup-popover/signin-signup-popover';
import { AccountPage } from '../account/account';


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



  account(event){
    if(window.localStorage.getItem('token') == null) {
      //popover login
      let signinSignupPopover = this.popoverCtrl.create(SigninSignupPopoverPage);
      signinSignupPopover.present({ev: event});
    } else {
      let accountPopover = this.popoverCtrl.create(AccountPage);
      accountPopover.present({ev: event});
    }


  }


}
