import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesCarpetaComponent } from './detalles-carpeta.component';

describe('DetallesCarpetaComponent', () => {
  let component: DetallesCarpetaComponent;
  let fixture: ComponentFixture<DetallesCarpetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetallesCarpetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesCarpetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
