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
import { proyectoI } from "@interfaces/proyecto.interface";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},

		{ provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT },
	]
})
export class HomeComponent implements OnInit{
  constructor(private modalService: NgbModal, modalConfig: NgbModalConfig, private stringUtils: StringUtilsService, private httpService: HttpService,
		private toastr: ToastrService) {

		modalConfig.backdrop = 'static';
		modalConfig.keyboard = false;


		this.proyectoForm = new FormGroup({
			sap_codigo: new FormControl(null),
			sap_nombre: new FormControl("", [Validators.required, Validators.maxLength(255), Validators.pattern(/^(?=.*[^\s]).*$/)], [this.httpService.nombreRepetido(null)]),
			sap_costos_indirectos: new FormControl(1, [Validators.required, Validators.min(0.01), Validators.max(100)]),
			sap_descripcion: new FormControl("", [Validators.maxLength(255)])
		});


		this.filtersForm = new FormGroup({
			fromDate: new FormControl<Date | null>(null),
			toDate: new FormControl<Date | null>(null),
			cadenaBusqueda: new FormControl<string>(''),
		});

	}


	ngOnInit(): void {
		this.obtenerProyectos(false);
	}

	//------------------------------
	// Variables CRUD
	//------------------------------


	//------------------------------
	// Variables generales
	//------------------------------
	proyectoForm: FormGroup;
	closeResult: unknown = '';
	filtersForm: FormGroup;
	listaProyectos: proyectoI[] = [];
	mainLoaderProyecto: boolean = false;
	saveLoaderProyecto: boolean = false;


	@ViewChild('proyecto_pagination', { static: true }) proyectoPaginator: MatPaginator = <MatPaginator>{};
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
		this.obtenerProyectos(false);
	}


	//------------------------------
	// Metodos CRUD principales
	//------------------------------

	obtenerProyectos(_resetPage: boolean = true) {
		if (_resetPage) {
			this.paginationIndex = 0;
			this.proyectoPaginator.pageIndex = 0;
		}

		let _cadena: string = this.filtersForm.value.cadenaBusqueda;
		let _fechaIni: string = this.stringUtils.convertDate(this.filtersForm.value.fromDate);
		let _fechaFin: string = this.stringUtils.convertDate(this.filtersForm.value.toDate);

		this.mainLoaderProyecto = true;
		this.httpService.obtenerProyectos(_cadena, _fechaIni, _fechaFin, this.paginationIndex, this.paginationSize)
			.then((response) => {
				this.totalElements = response.totalElements;
				this.listaProyectos = response.content;
			})
			.finally(() => {
				this.mainLoaderProyecto = false;
			});
	}



	guardarProyecto() {
		if (this.proyectoForm.status == 'INVALID') {
			this.proyectoForm.markAllAsTouched();
			return;
		}
		if (this.proyectoForm.status == 'PENDING') {
			return;
		}

		this.saveLoaderProyecto = true;
		this.httpService.guardarProyecto(this.proyectoForm.value)
			.then(() => {
				this.obtenerProyectos(false);
				this.modalService.dismissAll();
				this.resetProyectoForm();
				this.toastr.success('', 'Proyecto guardado!', { timeOut: 5000, closeButton: true });
			})
			.finally(() => {
				this.saveLoaderProyecto = false;
			})
	}



	actualizarProyecto() {
		this.saveLoaderProyecto = true;
		this.httpService.actualizarProyecto(this.proyectoForm.value)
			.then((response) => {
				let nuevoProyecto: proyectoI = response;
				for (let i = 0; i < this.listaProyectos.length; i++) {
					let _proyecto = this.listaProyectos[i];
					if (_proyecto.sap_codigo == nuevoProyecto.sap_codigo) {
						this.listaProyectos[i] = nuevoProyecto;
						break;
					}
				}
				this.modalService.dismissAll();
				this.resetProyectoForm();
				this.toastr.success('', 'Proyecto actualizado!', { timeOut: 5000, closeButton: true });
			})
			.finally(() => {
				this.saveLoaderProyecto = false;
			})
	}



	eliminarproyecto(_proyectoId: number) {
		Swal.fire({
			title: 'Esta seguro que desea eliminar el proyecto?',
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
				this.httpService.eliminarProyecto(_proyectoId)
					.then(() => {
						this.toastr.success('', 'Proyecto eliminado!', { timeOut: 5000, closeButton: true });
						this.obtenerProyectos(false);
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
		this.obtenerProyectos(false);
	}



	resetProyectoForm(_idProyecto: any = null) {
		this.proyectoForm.reset();
		this.proyectoForm = new FormGroup({
			sap_codigo: new FormControl(null),
			sap_nombre: new FormControl("", [Validators.required, Validators.maxLength(255), Validators.pattern(/^(?=.*[^\s]).*$/)], [this.httpService.nombreRepetido(_idProyecto)]),
			sap_costos_indirectos: new FormControl(1, [Validators.required, Validators.min(0.01), Validators.max(100)]),
			sap_descripcion: new FormControl("", [Validators.maxLength(255)])
		});
	}


	//------------------------------
	// MODALES
	//------------------------------
	openNuevo(content: unknown) {
		this.resetProyectoForm();
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		).finally(() => {
			this.resetProyectoForm();
		})
	}



	openActualizar(content: unknown, _dataProyecto: any = null) {
		if (_dataProyecto == null) {
			return;
		}

		this.resetProyectoForm(_dataProyecto.sap_codigo);
		this.proyectoForm.patchValue(_dataProyecto);
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		).finally(() => {
			this.resetProyectoForm();
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
