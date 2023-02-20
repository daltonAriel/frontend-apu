import { rolI } from "@interfaces/rol.interface";
import { usuarioI } from "@interfaces/usuario.interface";

export interface usuarioRolI {
    
    saur_codigo: {
        saur_usuario_codigo: number;
	
        saur_rol_codigo: number;
    }
	
    subt_apu_usuario: usuarioI;

    subt_apu_rol: rolI;
}