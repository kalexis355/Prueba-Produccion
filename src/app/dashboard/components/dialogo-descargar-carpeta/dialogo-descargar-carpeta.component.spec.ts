import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDescargarCarpetaComponent } from './dialogo-descargar-carpeta.component';

describe('DialogoDescargarCarpetaComponent', () => {
  let component: DialogoDescargarCarpetaComponent;
  let fixture: ComponentFixture<DialogoDescargarCarpetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoDescargarCarpetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoDescargarCarpetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
