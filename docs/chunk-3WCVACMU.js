import{u as c}from"./chunk-7FTVY4QR.js";import{f as s,fa as a}from"./chunk-MP2ZVZOB.js";var e=s(c());var f=(()=>{let r=class r{constructor(){this.swalActive=!1}mostrarCargando(){this.swalActive||(this.swalActive=!0,e.default.fire({title:"Procesando informaci\xF3n",html:"Cargando datos...",allowOutsideClick:!1,allowEscapeKey:!1,didOpen:()=>{e.default.showLoading()}}))}cerrarCargando(){this.swalActive&&(this.swalActive=!1,e.default.close())}mostrarError(t){this.swalActive=!1,e.default.fire({icon:"error",title:"Error",text:t})}mostrarTimeoutDialog(){return e.default.fire({title:"\xBFQu\xE9 desea hacer?",text:"La operaci\xF3n est\xE1 tardando demasiado tiempo",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Reintentar",cancelButtonText:"Cerrar sesi\xF3n"}).then(t=>t.isConfirmed)}mostrarExito(t){this.swalActive=!1,e.default.fire({icon:"success",title:"\xC9xito",text:t})}mostrarConfirmacion(t,i){return e.default.fire({title:t,text:i,icon:"question",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"S\xED",cancelButtonText:"No"}).then(n=>n.isConfirmed)}mostrarAdvertencia(t){this.swalActive=!1,e.default.fire({icon:"warning",title:"Advertencia",text:t})}isSwalActive(){return this.swalActive}};r.\u0275fac=function(i){return new(i||r)},r.\u0275prov=a({token:r,factory:r.\u0275fac,providedIn:"root"});let o=r;return o})();export{f as a};
