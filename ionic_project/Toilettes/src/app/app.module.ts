import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { AddPage } from '../pages/add/add';
import { ToilettesPage } from '../pages/toilettes/toilettes';
import { SigninSignupPopoverPage } from '../pages/signin-signup-popover/signin-signup-popover';
import { ToiletDetailsPopoverPage } from '../pages/toilet-details-popover/toilet-details-popover';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ConfigService } from '../services/config.service';
import { DataService } from '../services/data.service';

import { Ionic2RatingModule } from 'ionic2-rating';
import { Geolocation } from 'ionic-native';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    AddPage,
    ToilettesPage,
    SigninSignupPopoverPage,
    ToiletDetailsPopoverPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    Ionic2RatingModule // Put ionic2-rating module here
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    AddPage,
    ToilettesPage,
    SigninSignupPopoverPage,
    ToiletDetailsPopoverPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ConfigService,
    DataService,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
