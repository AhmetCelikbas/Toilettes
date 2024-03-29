import { Component } from '@angular/core';

import {  ViewController,
          Events,
          AlertController, 
          Platform,  
          NavController,  
          NavParams,
          LoadingController, 
          PopoverController } from 'ionic-angular';

import {  Geolocation,
          Camera, 
          CameraOptions } from 'ionic-native';

import { DomSanitizer } from '@angular/platform-browser';

import { ConfigService } from '../../services/config.service';
import { DataService } from '../../services/data.service';

import { SigninSignupPopoverPage } from '../signin-signup-popover/signin-signup-popover';


class Toilet {
  public id : number;
  public id_osm : number;
  public name : string
  public access : Boolean;
  public exist : boolean;
  public rating : number;
  public fee : boolean;
  public male : boolean;
  public female : boolean;
  public wheelchair : boolean;
  public drinking_water : boolean;
  public placeType : string;

  constructor(){
    this.id_osm = null;
    this.access = false;
    this.exist = false;
    this.rating = 0;
    this.fee = false;
    this.male = false;
    this.female = false;
    this.wheelchair = false;
    this.drinking_water = false;
    this.placeType = "public";
  }
}


@Component({
  selector: 'page-toilet-details-popover',
  templateUrl: 'toilet-details-popover.html'
})
export class ToiletDetailsPopoverPage {

  private toilet : Toilet;

  private cameraOptions: CameraOptions;
  private base64ImageURL: any;
  private imageMimeType: string;
  private base64ImageData: any;
  private imageLoaded : boolean;


  constructor(  public viewCtrl: ViewController, 
                public navParams: NavParams,
                private platform: Platform, 
                private navCtrl: NavController, 
                private geolocation: Geolocation, 
                private loadingCtrl: LoadingController,
                private config: ConfigService,
                private data: DataService,
                private sanitizer:DomSanitizer,
                public alertCtrl: AlertController,
                public popoverCtrl: PopoverController,
                public events: Events
  ) {
    this.toilet = new Toilet;
  
    this.toilet.id = this.navParams.get('toiletData')['id'];
    this.toilet.id_osm = this.navParams.get('toiletData')['id_osm'];
    this.toilet.name = this.navParams.get('toiletData')['Details']['name'];
    this.toilet.access = this.navParams.get('toiletData')['Details']['access'];
    this.toilet.exist = this.navParams.get('toiletData')['Details']['exist'];
    this.toilet.rating = this.navParams.get('toiletData')['Details']['rating'];
    this.toilet.fee = this.navParams.get('toiletData')['Details']['fee'];
    this.toilet.male = this.navParams.get('toiletData')['Details']['male'];
    this.toilet.female = this.navParams.get('toiletData')['Details']['female'];
    this.toilet.wheelchair = this.navParams.get('toiletData')['Details']['wheelchair'];
    this.toilet.drinking_water = this.navParams.get('toiletData')['Details']['drinking_water'];
    this.toilet.placeType = this.navParams.get('toiletData')['Details']['placeType'];

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
    this.base64ImageData = null;
    this.base64ImageURL = null;
    this.imageLoaded = false;
    this.getPicture();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ToiletDetailsPopoverPage');
  }


  getPicture(){
    this.data.get(this.config.apiVerbs.toilet + "/" + this.toilet.id + "/picture").subscribe (
      apiRes => this.base64ImageData = apiRes['picture'],
      error => {
        console.log("error loading toilet image");
      },
      () => {
         this.base64ImageURL = this.sanitizer.bypassSecurityTrustUrl('data:' + this.imageMimeType + ';base64,' + this.base64ImageData);
         this.imageLoaded = true;
      });
  }


  getNewPicture(){
    Camera.getPicture(this.cameraOptions).then((imageData) => {
      this.base64ImageData = imageData;
      this.base64ImageURL = this.sanitizer.bypassSecurityTrustUrl('data:' + this.imageMimeType + ';base64,' + this.base64ImageData);
    }, (err) => {
    // Handle error
      console.log("Camera is busy");
    });
  }




  edit(event) {

    if(window.localStorage.getItem('token') == null) {
      //popover login
      let popover = this.popoverCtrl.create(SigninSignupPopoverPage);
      popover.present({ev: event});
      popover.onDidDismiss(
        (dismissValue) => { 
          if(dismissValue) {
            if(dismissValue['SigninSignupFinished'] == true) {
              this.edit(event);
            }
          } else {
            console.log("Dismiss signin signup")
          }    
        }
      )
    } else {
        let locatingAlert = this.alertCtrl.create({
        title: 'Géolocalisation',
        subTitle: 'Veuillez réster en face des toilettes pendant votre géolcalisation.',
        buttons: [
            {
              text: 'Annuler',
              handler: () => {
                console.log('cancel clicked');
              }
            },
            {
              text: 'Ok',
              handler: () => {
                console.log('Agree clicked');
                this.send();
              }
            }
          ]
        
      });
      locatingAlert.present();
    }
  }


send(){

    let locatingSpinnerAlert = this.loadingCtrl.create({
      content: 'Géolicalisation en cours ...'
    });
    locatingSpinnerAlert.present();
    Geolocation.getCurrentPosition().then((resp) => {
      locatingSpinnerAlert.dismiss();

      let toiletData : Object = {
        id : this.toilet.id,
        id_osm : this.toilet.id_osm,
        lat : resp.coords.latitude,
        lon : resp.coords.longitude,
        pictureMimeType : this.imageMimeType,
        picture : this.base64ImageData,
        Details : {
          name : this.toilet.name,
          access : this.toilet.access,
          exist : this.toilet.exist,
          rating : this.toilet.rating,
          fee : this.toilet.fee,
          male : this.toilet.male,
          female : this.toilet.female,
          wheelchair : this.toilet.wheelchair,
          drinking_water : this.toilet.drinking_water,
          placeType : this.toilet.placeType
        }
      }


    let sendingSpinnerAlert = this.loadingCtrl.create({
      content: 'Envois en cours ...'
    });
    sendingSpinnerAlert.present();


      this.data.put(this.config.apiVerbs.toilet + "/" + this.toilet.id, toiletData).then(
        (res) => {
          console.log("success");
          sendingSpinnerAlert.dismiss().then(
            ()=> {
              if(res['success'] == true ){
                let alert = this.alertCtrl.create({
                  title: 'Toilettes',
                  subTitle: 'Toilettes modifiées avec succès.',
                  buttons: ['OK']
                });
                this.events.publish('toiletEdited');
                alert.present();
                
              }
            }
          );
        },
        (err) => {
          sendingSpinnerAlert.dismiss();
          console.log(err);
        });

      // console.log(JSON.stringify(toiletData));

    }).catch((error) => {

      console.log('Error getting location', error);
    });
  }

}
