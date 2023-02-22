import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { LocalStorageService } from 'ngx-webstorage';
import jwt_decode from "jwt-decode";
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FORBIDDEN_ERROR } from "@constants/messages.constants";
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private localStorage: LocalStorageService,
    private permissionsService: NgxPermissionsService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) { }
    

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const routeName = route.routeConfig?.path;
    const requiredPermissions = route.data['permissions'];
    const roles = this.obtenerRoles();
    const global_token = this.localStorage.retrieve("jwt");
    
    this.modalService.dismissAll();

    // verifica si la ruta es login, entonces verifica si el token existe
    if (routeName === "login") {
      if (!global_token) {
        return true;
      }
      this.router.navigate(['/home']);
    }

    //verifica si el jwt esta en localStorage sino redirige al login
    if(!global_token){
      this.localStorage.clear("jwt");
      this.router.navigate(['/login']);
      return false;
    }

    
    // Establece los permisos del usuario en base a sus roles
    this.permissionsService.loadPermissions(roles);

    return this.permissionsService.hasPermission(requiredPermissions)
      .then(hasPermission => {
        if (hasPermission) {
          return true;
        } else {
          this.toastr.warning(FORBIDDEN_ERROR, 'Error', { timeOut: 3000, closeButton: true, positionClass: 'toast-bottom-right'});
          return false;
        }
      });
  }


  // Método para obtener los roles del token JWT
  obtenerRoles(): string[] {
    const token = this.localStorage.retrieve("jwt");
    if (!token) {
      return [];
    }

    let roles: string[];

    try {
      const decodedToken: any = jwt_decode(token);
      roles = decodedToken.roles
      if (!roles) {
        return [];
      }
    } catch (error) {
      return [];
    }
    return roles;
  }

}
