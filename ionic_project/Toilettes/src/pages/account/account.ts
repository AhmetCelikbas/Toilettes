import { Component } from '@angular/core';
import {AlertController, LoadingController,  ViewController,   NavController,   NavParams} from 'ionic-angular';

import {  Camera, 
          CameraOptions } from 'ionic-native';

import { DomSanitizer } from '@angular/platform-browser';

import { ConfigService } from '../../services/config.service';
import { DataService } from '../../services/data.service';
import { md5 } from '../../services/md5.service';


class User {
  public name : string;
  public email : string;
  public password : string;
  public newPassword : string;
  public picture : string;
}


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  
  private user : User;
  private pictureUrl: any;
  private cameraOptions: CameraOptions;
  private imageMimeType: string;
  private imageLoaded : boolean;

  constructor(  public viewCtrl: ViewController, 
                public navCtrl: NavController, 
                public navParams: NavParams,
                private config: ConfigService,
                private data: DataService,
                private sanitizer:DomSanitizer,
                private loadingCtrl: LoadingController,
                public alertCtrl: AlertController
  ) {
  
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
    this.pictureUrl = null;
    this.imageLoaded = false;
    this.user = new User();
    this.loadUserData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountPage');
  }


  loadUserData(){
    this.data.get(this.config.apiVerbs.user).subscribe (
          apiRes => {
            console.log(apiRes)
            this.user.name = apiRes['name'];
            this.user.email = apiRes['email'];
            this.user.password = apiRes['password'];
            this.user.picture = apiRes['picture'];

          },
          error => {
            console.log("error loading toilets");
            console.log(error);
          },
          () => {
            console.log(this.user)
            this.pictureUrl = this.sanitizer.bypassSecurityTrustUrl('data:' + this.imageMimeType + ';base64,' + this.user.picture);
            this.imageLoaded = true;
          }
        )
  }


  update(){


    if(this.user.newPassword) {
      var password = md5(this.user.newPassword)
    } else {
      var password  = this.user.password
    }

    let userData : Object = {
      name : this.user.name,
      password : password,
      pictureMimeType : this.imageMimeType,
      picture : this.user.picture,
    }


    let sendingSpinnerAlert = this.loadingCtrl.create({
      content: 'Mise à jour du compte ...'
    });
    sendingSpinnerAlert.present();
    this.data.put(this.config.apiVerbs.user, userData).then(
      (res) => {
         console.log(res)
        sendingSpinnerAlert.dismiss().then(
          ()=> {
            if(res['name'] == this.user.name ){
              this.viewCtrl.dismiss();
            } else if (res['success'] == false ){
              let alert = this.alertCtrl.create({
                  title: 'Mise à jour de compte',
                  subTitle: 'Erreur lors de la mise à jour du compte.',
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



  getPicture(){
    Camera.getPicture(this.cameraOptions).then((imageData) => {
      this.user.picture = imageData;
      this.pictureUrl = this.sanitizer.bypassSecurityTrustUrl('data:' + this.imageMimeType + ';base64,' + this.user.picture);
    }, (err) => {
    // Handle error
      console.log("Camera is busy");
    });

  }


  logout(){
    window.localStorage.removeItem('token');
    this.viewCtrl.dismiss();
  }

}
