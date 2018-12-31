import { Component, OnInit } from '@angular/core';
import { GetJsonService } from '../../../shared/get-json.service';
import { NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  isLoggedIn;
  errorMessage=false;
  params = {username:'',password:'',logout:this.isLoggedIn}
  constructor(private _getJsonService: GetJsonService,private _cookie : CookieService) {
    if (this._cookie.get('token')) {
      this.login()

    } else {
      this.isLoggedIn=false;
      console.log('no token');
    }
  }
  login() {
    this._getJsonService.login(this.params).subscribe(data => {
       if(data.valid) {
        this.isLoggedIn=true
        this.params.username=data.username
        if(data.token) {
          this._cookie.set('token',data.token)
         }
       } else {
        this.isLoggedIn=false
       }
      console.log(data)
    },error => this.errorMessage = <any>error)

  }
  logout(params) {
    this._cookie.delete('token')
    this.isLoggedIn=false;
  }
  onSubmit(f:NgForm) {
    //alert(JSON.stringify(this.params))
    this.login()
    console.log('sub')
    return false
  }
  ngOnInit() {
  }

}
