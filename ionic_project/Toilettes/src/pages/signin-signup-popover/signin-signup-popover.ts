import { Component } from '@angular/core';
import {AlertController, LoadingController,  ViewController,   NavController,   NavParams} from 'ionic-angular';

import {  Camera, 
          CameraOptions } from 'ionic-native';

import { DomSanitizer } from '@angular/platform-browser';

import { ConfigService } from '../../services/config.service';
import { DataService } from '../../services/data.service';
import { md5 } from '../../services/md5.service';

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
                private sanitizer:DomSanitizer,
                private loadingCtrl: LoadingController,
                public alertCtrl: AlertController
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



  signup(){

    let userData : Object = {
      name : this.name,
      email : this.email,
      password : md5(this.password),
      pictureMimeType : this.imageMimeType,
      picture : this.picture,
    }


    let sendingSpinnerAlert = this.loadingCtrl.create({
      content: 'Création du compte ...'
    });
    sendingSpinnerAlert.present();
    this.data.post(this.config.apiVerbs.signup, userData).then(
      (res) => {
        sendingSpinnerAlert.dismiss().then(
          ()=> {
            console.log(res)
            if(res['token'] != null ){
              window.localStorage.setItem('token', res['token']);
              this.viewCtrl.dismiss({SigninSignupFinished: true});
            } else if (res['success'] == false ){
              let alert = this.alertCtrl.create({
                  title: 'Création de compte',
                  subTitle: 'Cette adresse mail est déjà utilisée',
                  buttons: ['OK']
                });
                alert.present();

            }
          }
        );
      },
      (err) => {
        sendingSpinnerAlert.dismiss();
        console.log(err);
      });

    
  }

  signin(){
    let userData : Object = {
      email : this.email,
      password : md5(this.password)
    }


    let sendingSpinnerAlert = this.loadingCtrl.create({
      content: 'Connexion en cours ...'
    });
    sendingSpinnerAlert.present();
    this.data.post(this.config.apiVerbs.authenticate, userData).then(
      (res) => {
        sendingSpinnerAlert.dismiss().then(
          ()=> {
            if(res['token'] != null ){
              window.localStorage.setItem('token', res['token']);
              this.viewCtrl.dismiss({SigninSignupFinished: true});
            } else if (res['success'] == false ){
              let alert = this.alertCtrl.create({
                  title: 'Connexion',
                  subTitle: 'Utilisateur inconnu ou mot de passe erroné.',
                  buttons: ['OK']
                });
                alert.present();

            }
          }
        );
      },
      (err) => {
        sendingSpinnerAlert.dismiss();
        console.log(err);
      });
  }
}
