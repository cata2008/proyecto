import { ToastController, Events } from 'ionic-angular';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response, URLSearchParams, Headers } from '@angular/http';
import { ProcessHttpmsgProvider } from './../process-httpmsg/process-httpmsg';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
interface UserInfo {
  image: string;
  nombre_cuenta: string;
  programas: string;
  tipo_usuario: string;
  id_cliente: string;
  lat: string;
  lng: string;
}
const BASE_URL='http://129.1.1.1:3000'
/*
  Generated class for the LoginServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class LoginServiceProvider {
  private isAuthenticated: boolean;
  private usuario: string;
  private userInfo: UserInfo;
  constructor(public http: Http,
    private ProcessHttpmsgService: ProcessHttpmsgProvider,
    private toastCtrl: ToastController,
    private events: Events) {
    this.loadUserCredentials();
  }
  private loadUserCredentials() {
    let credentials = JSON.parse(localStorage.getItem('token') || '{}');
    /* this.storage.get(environment.TOKEN_KEY).then(credentials => {
      
    }); */
    if (credentials) {
      if (credentials.usuario != undefined) {
        this.isAuthenticated = true;
        //this.useCredentials(credentials);
        this.login(credentials).subscribe(
          data => {
          }, errMess => {
          }
        );
      }
    } else
      console.log('Revisar!! no guarda usuario')
  }
  private storeUserCredentials(credentials) {
    localStorage.setItem('token', JSON.stringify(credentials));
    this.useCredentials(credentials);
  }
  private useCredentials(credentials) {
    this.isAuthenticated = true;
    this.usuario = credentials.usuario;
  }
  private destroyUserCredentials() {
    this.usuario = '';
    this.isAuthenticated = false;
    localStorage.removeItem('token');
  }
  logout() {
    this.http.get(BASE_URL + '').subscribe();
    this.destroyUserCredentials();
    this.events.publish('user:logOut', { userType: 'noUser' });
  }
  login(loginData): Observable<any> {

    //({ 'Origin': 'http://localhost:8100/','Referer': 'http://localhost:8100/' }
    let hea = new Headers();
    //  hea.append( 'Origin', 'http://localhost:8100/');
    //  hea.append( 'Referer', 'http://localhost:8100/')
    return this.http.post(BASE_URL + 'portal/data/Login.php?', {}, { params: loginData })
      .map(res => {
        let response;
        response = this.ProcessHttpmsgService.extractData(res);
        if (!response[0].status || !response["1"].status) {
          alert("Usuario No registrado");
        }
        if (response["1"].status) {
          try {
            // $localStorage.store('mystyle', r['1'].tema);
          }
          catch (e) { }
          // $localStorage.store('timezone', data.zona_horaria);
          // $rootScope.$emit('Style:emit', {
          //   style: data['1'].tema
          // });
          this.userInfo = {
            image: response['1'].logo_cuenta,
            nombre_cuenta: response.nombre_usuario,
            programas: response.programas,
            tipo_usuario: response.tipo_usuario,
            id_cliente: response.id_cliente,
            lat: response['1'].latitud,
            lng: response['1'].longitud
          };
          setTimeout(() => {
            this.toastCtrl.create({
              message: 'Ingreso Correcto: ' + loginData.usuario + ' !',
              position: 'top',
              duration: 3000
            }).present();

            this.events.publish('user:created', this.userInfo);
            if (loginData.remember) {
              this.storeUserCredentials(loginData);
            } else {
              this.destroyUserCredentials();
            }
          }, 10);
          return response;
        }

      })
      .catch(error => {
        console.log("Un error ocurrio :(");
        return this.ProcessHttpmsgService.handleError(error)
      });
  }
  IsAuthenticated(): boolean {
    return this.isAuthenticated;
  }
  //aun no se guarda el username.
  getUsername() {
    return this.usuario;
  };
  logOutFunction() {
    this.events.publish('user:logOut', { userType: 'noUser' });
  };
  getUserInfo():UserInfo {
    return this.userInfo ;
  }

}


