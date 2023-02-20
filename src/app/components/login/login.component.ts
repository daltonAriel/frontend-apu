import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

import { API_URL } from "@constants/http.constants";
import { CONNECTION_ERROR, DISABLED_ACCOUNT_ERROR, GENERAL_ERROR } from "@constants/messages.constants";

import axios from 'axios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private localStorage: LocalStorageService, private router: Router) { }

  login_loader: boolean = false;
  alert_danger: boolean = false;


  loginForm = new FormGroup({
    correo: new FormControl('', [Validators.required]),
    clave: new FormControl('', [Validators.required]),
  });



  login() {
    this.login_loader = true;
    this.loginForm.markAllAsTouched();
    let data = this.loginForm.value;
    axios.post(`${API_URL}/login`, data).then((response) => {
      this.localStorage.store('jwt', response.data)
      this.router.navigate(['home']);
    }).catch((error) => {
      console.log(error);
      if (error.code === 'ERR_NETWORK') {
        Swal.fire({
          icon: 'error',
          title: `${CONNECTION_ERROR}`,
          text: `${error.message}`
        });
        return;
      }else if(error.response.status == 401) {
        if(error.response.data.error === "UNAUTHORIZED"){
          this.alert_danger = true;
          return;
        }
        if(error.response.data.error === "USER_BLOCKED"){
          Swal.fire({
            icon: 'warning',
            title: 'Error',
            text: `${DISABLED_ACCOUNT_ERROR}`
          });
          return;
        }
      }else {
        Swal.fire({
          icon: 'error',
          title: `${GENERAL_ERROR}`,
        });
      }
    }).finally(() => {
      this.login_loader = false;
    });
  }




}
