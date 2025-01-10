import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoListadoOficinasProcesoComponent } from './dialogo-listado-oficinas-proceso.component';

describe('DialogoListadoOficinasProcesoComponent', () => {
  let component: DialogoListadoOficinasProcesoComponent;
  let fixture: ComponentFixture<DialogoListadoOficinasProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoListadoOficinasProcesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoListadoOficinasProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
