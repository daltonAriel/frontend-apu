import { Injectable } from '@angular/core';
import { AxiosHttpService } from "@services/axios-http.service";
import { API_URL, DEFAULT_PAGE_SIZE } from "@constants/http.constants";
import { proyectoI } from "@interfaces/proyecto.interface";
import { StringUtilsService } from "@services/string-utils.service";
import { AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private axiosHttp:AxiosHttpService, private stringUtil: StringUtilsService, private modalService: NgbModal,private toastr: ToastrService) { }

  cancelToken: any;


  obtenerProyectos(_cadena: string = '', _fechaIni: string = '', _fechaFin: string = '', _pageIndex: number = 0, _pageSize: number = DEFAULT_PAGE_SIZE):Promise<any> {
    return new Promise((resolve, reject)=>{
      this.axiosHttp.get(`${API_URL}/proyecto?cadenaBusqueda=${_cadena}&fechaInicio=${_fechaIni}&fechaFin=${_fechaFin}&page=${_pageIndex}&size=${_pageSize}`)
      .then((response)=>{
        resolve(response.data.data);
      })
      .catch((error)=>{
        if (typeof (error.response.data) === 'object' && error.response.status != 403) {
          this.toastr.error('Error al obtener los proyectos!', 'Error', { timeOut: 5000, closeButton: true });
        }
      });
    });
  }



  guardarProyecto(_data: proyectoI): Promise<any> {
    _data.sap_nombre = this.stringUtil.dropExtraSpaces(_data.sap_nombre);
    _data.sap_descripcion = this.stringUtil.dropExtraSpaces(_data.sap_descripcion);

    return new Promise((resolve, reject) => {
      this.axiosHttp.post(`${API_URL}/proyecto`, _data).then((response) => {
        resolve(response.data.data);
      })
        .catch((error) => {
          if (typeof (error.response.data) === 'object' && error.response.status != 403) {
            this.toastr.error('Error al guardar el proyecto!', 'Error', { timeOut: 5000, closeButton: true });
          }
          reject(error);
        });
    });
  }


  
  actualizarProyecto(_data: proyectoI): Promise<any> {
    _data.sap_nombre = this.stringUtil.dropExtraSpaces(_data.sap_nombre);
    _data.sap_descripcion = this.stringUtil.dropExtraSpaces(_data.sap_descripcion);
    return new Promise((resolve, reject) => {
      this.axiosHttp.put(`${API_URL}/proyecto/${_data.sap_codigo}`, _data)
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          if(typeof(error.response.data) === 'object' && error.response.status != 403){
            this.toastr.error('Error al actualizar el proyecto!', 'Error', { timeOut: 5000, closeButton: true });
          }
          reject(error);
        });
    });
  }



  eliminarProyecto(_proyectoId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.axiosHttp.delete(`${API_URL}/proyecto/${_proyectoId}`)
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          if(typeof(error.response.data) === 'object' && error.response.status != 403){
            this.toastr.error('Error al eliminar el proyecto!', 'Error', { timeOut: 5000, closeButton: true });
          }
          reject(error);
        });
    });
  }


  nombreRepetido(_id: number | null) {
    return async (control: AbstractControl): Promise<{ [key: string]: any } | null> => {
      if(control.value == null || control.value == undefined){
        control.setValue('');
      }
      if (_id == null || _id == undefined) {
        if(await this.nombreDescripcion(control.value)){
          return { campoRepetido: true };
        }
        return null;
      } else {
        if(await this.nombreDescripcionId(control.value, _id)){
          return { campoRepetido: true };
        }
        return null;
      }
    };
  }



  private nombreDescripcion(_descripcion: string):any {
    console.log(_descripcion);
    return this.axiosHttp
      .getCancelToken(`${API_URL}/proyecto/validador-nombre?nombre=${_descripcion}`)
      .then((res) => {
        return res.data.data;
      })
      .catch((error) => {
        if(error.response.status === 403) {
          this.modalService.dismissAll();
        }
      });
  }



  private nombreDescripcionId(_descripcion: string, _id: number): any {
    return this.axiosHttp
      .getCancelToken(`${API_URL}/proyecto/validador-nombre/${_id}?nombre=${_descripcion}`)
      .then((res) => {
        return res.data.data;
      })
      .catch((error) => {
        if (error.response.status === 403) {
          this.modalService.dismissAll();
        }
      });
  }



}
