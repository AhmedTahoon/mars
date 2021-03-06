import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class GetJsonService {
  // the path of the big table JSON
  private marsUrl = 'http://regweb/regression_web/mars.php';
  private customSettingsUrl = './assets/custom-settings.json';
  private apiUrl = 'http://orw-oragi-r6:8000/';
  private token=this.cookie.get('token');
  private options={headers:new HttpHeaders().append('content-type', 'application/json').append('authorization',this.token)};
  constructor(private http: HttpClient,private cookie:CookieService) {
    //console.log(this.options.headers));

   }
  // it's an http request to get the BigTable JSON
  getJsonTable (params: string) {
    return this.http.get<any[]>(this.marsUrl + '?' + encodeURI(params));
  }
  // custom settings service
  getCustomSettings () {
    return this.http.get<any[]>(this.customSettingsUrl);
  }
  // Comment Operations
  createNote(params) {
    return this.http.post<any>(this.apiUrl + 'note/create', params, this.options);
  }
  updateNote(params) {
    return this.http.post<any>(this.apiUrl + 'note/update', params, this.options);
  }
  attachNotes(params) {
    return this.http.post<any>(this.apiUrl + 'note/attach', params, this.options);
  }
  detachNotes(params) {
    return this.http.post<any>(this.apiUrl + 'note/detach', params, this.options);
  }
  // DEI Operations
  attachDEI(params) {
    return this.http.post<any>(this.apiUrl + 'dei/attach', params, this.options);
  }
  detachDEI(params) {
    return this.http.post<any>(this.apiUrl + 'dei/detach', params, this.options);
  }
  // Update Test Instances
  updateTests(params) {
    return this.http.post<any>(this.apiUrl + 'test/update', params, this.options);
  }
  login(params) {
    this.token=this.cookie.get('token');
    this.options={headers:new HttpHeaders().append('content-type', 'application/json').append('authorization',this.token)};
    return this.http.post<any>(this.apiUrl + 'login', params, this.options);
  }
}
