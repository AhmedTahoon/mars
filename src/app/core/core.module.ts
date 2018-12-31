import { NgModule } from '@angular/core';
import {NavBarComponent} from './components/nav-bar/nav-bar.component';
import {CommonModule} from '@angular/common';
import { MyContextMenuComponent } from './components/context-menu/my-context-menu.component';
import {ContextMenuModule} from 'ngx-contextmenu';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CookieService   } from 'ngx-cookie-service';
import { MarsCommandsComponent } from './components/mars-commands/mars-commands.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    ContextMenuModule.forRoot({
      useBootstrap4: true
    }),
  ],
  providers:[   CookieService],
  declarations: [NavBarComponent, MyContextMenuComponent, LoginFormComponent, MarsCommandsComponent],
  exports: [NavBarComponent, MyContextMenuComponent, MarsCommandsComponent]
})
export class CoreModule { }
