import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { loginRoutingModule } from './login-routing.module';
import { MaterialModule } from '../material/material.module';
import {MatCardModule} from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutPageComponent } from './layouts/layout-page/layout-page.component';
import { provideHttpClient, withFetch } from '@angular/common/http';


@NgModule({
  declarations: [
    LoginPageComponent,
    LayoutPageComponent
  ],
  imports: [
    CommonModule,
    loginRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  providers: [
    provideHttpClient(withFetch())],
})
export class LoginModule { }
