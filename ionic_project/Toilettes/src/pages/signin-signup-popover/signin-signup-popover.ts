import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { SignupPage } from '../signup/signup';

import {  Camera, 
          CameraOptions } from 'ionic-native';

import { DomSanitizer } from '@angular/platform-browser';

import { ConfigService } from '../../services/config.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'page-signin-signup-popover',
  templateUrl: 'signin-signup-popover.html'
})
export class SigninSignupPopoverPage {
  private action : string;
  private cameraOptions: CameraOptions;
  private imageMimeType: string;

  private name: string;
  private email: string;
  private password: string;
  private picture: any;
  private pictureUrl: any;
  
  constructor(  public viewCtrl: ViewController, 
                public navCtrl: NavController, 
                public navParams: NavParams,
                private config: ConfigService,
                private data: DataService,
                private sanitizer:DomSanitizer
  ) {
    this.action = "signin";

    this.cameraOptions = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth: 300,
            targetHeight: 300,
            saveToPhotoAlbum: false
        };
    this.imageMimeType = "image/jpeg";
    this.picture = null;
    this.pictureUrl = null;


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninSignupPopoverPage');
  }

  getPicture(){
    Camera.getPicture(this.cameraOptions).then((imageData) => {
      this.picture = imageData;
      this.pictureUrl = this.sanitizer.bypassSecurityTrustUrl('data:' + this.imageMimeType + ';base64,' + this.picture);
    }, (err) => {
    // Handle error
      console.log("Camera is busy");
    });

  }



  pushSignup(){
    this.viewCtrl.dismiss({SigninSignupFinished: true});
  }

  pushSignin(){
    this.viewCtrl.dismiss({SigninSignupFinished: true});
  }
}
