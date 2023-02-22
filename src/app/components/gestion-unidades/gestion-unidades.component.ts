import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { StringUtilsService } from "@services/string-utils.service";
import { PAGE_SIZE, DEFAULT_PAGE_SIZE, DATE_FORMAT } from "@constants/http.constants";
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from "./etc/http.service";
import { unidadI } from "@interfaces/unidad.interface";
import Swal from 'sweetalert2';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-gestion-unidades',
  templateUrl: './gestion-unidades.component.html',
  styleUrls: ['./gestion-unidades.component.scss']
})
export class GestionUnidadesComponent implements OnInit {
  constructor(private modalService: NgbModal, modalConfig: NgbModalConfig, private stringUtils: StringUtilsService, private httpService: HttpService,
    private toastr: ToastrService) {


    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;


    this.unidadForm = new FormGroup({
      saun_codigo: new FormControl(null),
      saun_abreviatura: new FormControl("", [Validators.required, Validators.maxLength(255), Validators.pattern(/^(?=.*[^\s]).*$/)], [this.httpService.abreviaturaRepetido(null)]),
      saun_descripcion: new FormControl("", [Validators.required, Validators.maxLength(255), Validators.pattern(/^(?=.*[^\s]).*$/)], [this.httpService.descripcionRepetido(null)]),
      saun_estado: new FormControl(true, [Validators.required])
    });


    this.filtersForm = new FormGroup({
      estado: new FormControl<any>(''),
      cadenaBusqueda: new FormControl<string>('')
    });


  }

  ngOnInit(): void {
    this.obtenerUnidades(false);
  }


  //------------------------------
  // Variables CRUD
  //------------------------------


  //------------------------------
  // Variables generales
  //------------------------------
  unidadForm: FormGroup;
  closeResult: unknown = '';
  filtersForm: FormGroup;
  listaUnidades: unidadI[] = [];
  mainLoaderUnidad: boolean = false;
  saveLoaderUnidad: boolean = false;


  @ViewChild('unidad_pagination', { static: false }) unidadPaginator: any;
  totalElements: number = 0;
  paginationIndex: number = 0;
  paginationSize: number = DEFAULT_PAGE_SIZE;
  paginationOptions: number[] = PAGE_SIZE;



  //------------------------------
  // Funciones para la paginacion
  //------------------------------
  pageEventChange(event: any, _getFetch: boolean = true) {
    this.paginationSize = event.pageSize;
    this.paginationIndex = event.pageIndex;
    this.obtenerUnidades(false);
  }


  //------------------------------
  // Metodos CRUD principales
  //------------------------------
  
  obtenerUnidades(_resetPage: boolean = true) {
    if (_resetPage) {
      this.paginationIndex = 0;
      this.unidadPaginator.pageIndex = 0;
    }

    let _cadena: string = this.filtersForm.value.cadenaBusqueda;
    let _estado: boolean | string = this.filtersForm.value.estado;
    this.mainLoaderUnidad = true;
    this.httpService.obtenerUnidades(_cadena, _estado, this.paginationIndex, this.paginationSize)
      .then((response) => {
        this.totalElements = response.totalElements;
        this.listaUnidades = response.content;
      })
      .finally(() => {
        this.mainLoaderUnidad = false;
      });
  }



  guardarUnidad() {
    if (this.unidadForm.status == 'INVALID') {
      this.unidadForm.markAllAsTouched();
      return;
    }
    if (this.unidadForm.status == 'PENDING') {
      return;
    }

    this.saveLoaderUnidad = true;
    this.httpService.guardarUnidad(this.unidadForm.value)
      .then(() => {
        this.obtenerUnidades(false);
        this.modalService.dismissAll();
        this.resetUnidadForm();
        this.toastr.success('', 'Unidad guardada!', { timeOut: 5000, closeButton: true });
      })
      .finally(() => {
        this.saveLoaderUnidad = false;
      })
  }



  actualizarUnidad() {
    this.saveLoaderUnidad = true;
    this.httpService.actualizarUnidad(this.unidadForm.value)
      .then((response) => {
        let nuevaUnidad: unidadI = response;
        for (let i = 0; i < this.listaUnidades.length; i++) {
          let _unidad = this.listaUnidades[i];
          if (_unidad.saun_codigo == nuevaUnidad.saun_codigo) {
            this.listaUnidades[i] = nuevaUnidad;
            break;
          }
        }
        this.modalService.dismissAll();
        this.resetUnidadForm();
        this.toastr.success('', 'Unidad actualizado!', { timeOut: 5000, closeButton: true });
      })
      .finally(() => {
        this.saveLoaderUnidad = false;
      })
  }



  eliminarUnidad(_unidadId: number) {
    Swal.fire({
      title: 'Esta seguro que desea eliminar la unidad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        cancelButton: "btn btn-secondary m-1",
        confirmButton: "btn btn-danger m-1"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.httpService.eliminarUnidad(_unidadId)
          .then(() => {
            this.toastr.success('', 'Unidad eliminada!', { timeOut: 5000, closeButton: true });
            this.obtenerUnidades(false);
          })
      }
    });
  }

  //------------------------------
  // Funciones no CRUD
  //------------------------------
  cleanFilter() {
    this.filtersForm.patchValue({
      fromDate: null,
      toDate: null
    });
    this.obtenerUnidades(false);
  }



  resetUnidadForm(_idUnidad: any = null) {
    this.unidadForm.reset();
    this.unidadForm = new FormGroup({
      saun_codigo: new FormControl(null),
      saun_abreviatura: new FormControl("", [Validators.required, Validators.maxLength(255), Validators.pattern(/^(?=.*[^\s]).*$/)], [this.httpService.abreviaturaRepetido(_idUnidad)]),
      saun_descripcion: new FormControl("", [Validators.required, Validators.maxLength(255), Validators.pattern(/^(?=.*[^\s]).*$/)], [this.httpService.descripcionRepetido(_idUnidad)]),
      saun_estado: new FormControl(true, [Validators.required])
    });
  }


  //------------------------------
  // MODALES
  //------------------------------
  openNuevo(content: unknown) {
    this.resetUnidadForm();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    ).finally(() => {
      this.resetUnidadForm();
    })
  }



  openActualizar(content: unknown, _dataUnidad: any = null) {
    if (_dataUnidad == null) {
      return;
    }

    this.resetUnidadForm(_dataUnidad.saun_codigo);
    this.unidadForm.patchValue(_dataUnidad);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    ).finally(() => {
      this.resetUnidadForm();
    })
  }



  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
