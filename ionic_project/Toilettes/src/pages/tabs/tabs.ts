import { Component } from '@angular/core';

import { ToilettesPage } from '../toilettes/toilettes';
import { AddPage } from '../add/add';
import { AboutPage } from '../about/about';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = ToilettesPage;
  tab2Root: any = AddPage;
  tab3Root: any = AboutPage;
  
  constructor() {

  }
}
