import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DropdownModule,
    SplitButtonModule,
    ToastModule,
    AvatarModule,
    ButtonModule,
    RippleModule,
  ],
  exports:[
    DropdownModule,
    SplitButtonModule,
    ToastModule,
    AvatarModule,
    ButtonModule,
    RippleModule
  ],
  providers:[MessageService]
})
export class PrimengModule { }
