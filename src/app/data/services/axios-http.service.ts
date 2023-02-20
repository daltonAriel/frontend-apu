import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import axios from 'axios';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CONNECTION_ERROR } from "@constants/messages.constants";

@Injectable({
  providedIn: 'root'
})
export class AxiosHttpService {

  constructor(private localStorage: LocalStorageService, private router: Router, private modalService: NgbModal,
    private toastr: ToastrService) {
    axios.interceptors.request.use(function (config: any) {
      config.headers.Authorization = localStorage.retrieve("jwt")
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
    });

    // Add a response interceptor
    axios.interceptors.response.use(function (response) {
      if (response.data.refreshToken != null && response.data.refreshToken != '' && response.data.refreshToken != undefined) {
        localStorage.store("jwt", response.data.refreshToken);
      }

      return response;

    }, function (error) {
      if (error.code === 'ERR_NETWORK') {
        toastr.error(CONNECTION_ERROR, 'Error', { timeOut: 5000, closeButton: true });
        return Promise.reject(error);
      } else {
        if (error.response.status === 401) {
          modalService.dismissAll();
          localStorage.clear("jwt");
          router.navigate(['login']);
          return Promise.reject(error);
        } else if (error.response.status === 403) {
          toastr.warning("No tiene autorizacion sobre el recurso solicitado!", 'Error', { timeOut: 5000, closeButton: true });
          return;
        } else {
          if (error.response.data != '' && typeof (error.response.data) != 'object') {
            toastr.error(error.response.data, 'Error', { timeOut: 5000, closeButton: true });
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    });
  }

  private cancelToken: any;

  public get(url: string) {
    return axios.get(url);
  }


  public post(url: string, data: unknown) {
    return axios.post(url, data);
  }

  public put(url: string, data: unknown) {
    return axios.put(url, data);
  }

  public delete(url: string) {
    return axios.delete(url);
  }


  public getCancelToken(url: string): Promise<any> {
    if (this.cancelToken) {
      this.cancelToken.cancel("Peticion http cancelada!");
    }
    this.cancelToken = axios.CancelToken.source();
    return axios.get(url, { cancelToken: this.cancelToken.token });
  }

}
