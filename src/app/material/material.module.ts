import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatError, MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { CdkTreeModule } from '@angular/cdk/tree';
import {MatRadioModule} from '@angular/material/radio';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTreeModule,
    CdkTreeModule,
    MatRadioModule
  ],
  exports:[
    MatCardModule,
    MatFormFieldModule,
    MatError,
    MatLabel,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTreeModule,
    CdkTreeModule,
    MatRadioModule
    ],
  providers:[]

})
export class MaterialModule { }
