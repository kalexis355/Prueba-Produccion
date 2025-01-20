import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarpetasContenidoComponent } from './carpetas-contenido.component';

describe('CarpetasContenidoComponent', () => {
  let component: CarpetasContenidoComponent;
  let fixture: ComponentFixture<CarpetasContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarpetasContenidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarpetasContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
