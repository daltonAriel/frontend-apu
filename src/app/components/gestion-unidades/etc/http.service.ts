import { Injectable } from '@angular/core';
import { AxiosHttpService } from "@services/axios-http.service";
import { API_URL, DEFAULT_PAGE_SIZE } from "@constants/http.constants";
import { unidadI } from "@interfaces/unidad.interface";
import { StringUtilsService } from "@services/string-utils.service";
import { AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private axiosHttp:AxiosHttpService, private stringUtil: StringUtilsService, private modalService: NgbModal,private toastr: ToastrService) { }


  obtenerUnidades(_cadena: string = '', _estado: boolean | string = '', _pageIndex: number = 0, _pageSize: number = DEFAULT_PAGE_SIZE):Promise<any> {
    return new Promise((resolve, reject)=>{
      this.axiosHttp.get(`${API_URL}/unidad?cadenaBusqueda=${_cadena}&estado=${_estado}&page=${_pageIndex}&size=${_pageSize}`)
      .then((response)=>{
        resolve(response.data.data);
      })
      .catch((error)=>{
        if (typeof (error.response.data) === 'object' && error.response.status != 403) {
          this.toastr.error('Error al obtener las unidades!', 'Error', { timeOut: 5000, closeButton: true });
        }
      });
    });
  }



  guardarUnidad(_data: unidadI): Promise<any> {
    _data.saun_abreviatura = this.stringUtil.dropExtraSpaces(_data.saun_abreviatura);
    _data.saun_descripcion = this.stringUtil.dropExtraSpaces(_data.saun_descripcion);

    return new Promise((resolve, reject) => {
      this.axiosHttp.post(`${API_URL}/unidad`, _data).then((response) => {
        resolve(response.data.data);
      })
        .catch((error) => {
          if (typeof (error.response.data) === 'object' && error.response.status != 403) {
            this.toastr.error('Error al guardar la unidad!', 'Error', { timeOut: 5000, closeButton: true });
          }
          reject(error);
        });
    });
  }


  
  actualizarUnidad(_data: unidadI): Promise<any> {
    console.log(_data);
    _data.saun_abreviatura = this.stringUtil.dropExtraSpaces(_data.saun_abreviatura);
    _data.saun_descripcion = this.stringUtil.dropExtraSpaces(_data.saun_descripcion);

    return new Promise((resolve, reject) => {
      this.axiosHttp.put(`${API_URL}/unidad/${_data.saun_codigo}`, _data)
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          if(typeof(error.response.data) === 'object' && error.response.status != 403){
            this.toastr.error('Error al actualizar la unidad!', 'Error', { timeOut: 5000, closeButton: true });
          }
          reject(error);
        });
    });
  }



  eliminarUnidad(_unidadId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.axiosHttp.delete(`${API_URL}/unidad/${_unidadId}`)
        .then((response) => {
          resolve(response.data.data);
        })
        .catch((error) => {
          if(typeof(error.response.data) === 'object' && error.response.status != 403){
            this.toastr.error('Error al eliminar la unidad!', 'Error', { timeOut: 5000, closeButton: true });
          }
          reject(error);
        });
    });
  }



  abreviaturaRepetido(_id: number | null) {
    return async (control: AbstractControl): Promise<{ [key: string]: any } | null> => {
      if(control.value == null || control.value == undefined){
        control.setValue('');
      }
      if (_id == null || _id == undefined) {
        if(await this.abreviaturaUnidad(control.value)){
          return { campoRepetido: true };
        }
        return null;
      } else {
        if(await this.abreviaturaUnidadId(control.value, _id)){
          return { campoRepetido: true };
        }
        return null;
      }
    };
  }



  descripcionRepetido(_id: number | null) {
    return async (control: AbstractControl): Promise<{ [key: string]: any } | null> => {
      if(control.value == null || control.value == undefined){
        control.setValue('');
      }
      if (_id == null || _id == undefined) {
        if(await this.descripcionUnidad(control.value)){
          return { campoRepetido: true };
        }
        return null;
      } else {
        if(await this.descripcionUnidadId(control.value, _id)){
          return { campoRepetido: true };
        }
        return null;
      }
    };
  }



  private abreviaturaUnidad(_abreviatura: string):any {
    return this.axiosHttp
      .getCancelToken(`${API_URL}/unidad/validador-abreviatura?abreviatura=${_abreviatura}`)
      .then((res) => {
        return res.data.data;
      })
      .catch((error) => {
        if(error.response.status === 403) {
          this.modalService.dismissAll();
        }
      });
  }



  private abreviaturaUnidadId(_abreviatura: string, _id: number): any {
    return this.axiosHttp
      .getCancelToken(`${API_URL}/unidad/validador-abreviatura/${_id}?abreviatura=${_abreviatura}`)
      .then((res) => {
        return res.data.data;
      })
      .catch((error) => {
        if (error.response.status === 403) {
          this.modalService.dismissAll();
        }
      });
  }



  private descripcionUnidad(_descripcion: string):any {
    return this.axiosHttp
      .getCancelToken2(`${API_URL}/unidad/validador-descripcion?descripcion=${_descripcion}`)
      .then((res) => {
        return res.data.data;
      })
      .catch((error) => {
        if(error.response.status === 403) {
          this.modalService.dismissAll();
        }
      });
  }

  
  
  private descripcionUnidadId(_descripcion: string, _id: number): any {
    return this.axiosHttp
      .getCancelToken2(`${API_URL}/unidad/validador-descripcion/${_id}?descripcion=${_descripcion}`)
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
