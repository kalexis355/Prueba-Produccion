import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnSubirArchivoComponent } from './btn-subir-archivo.component';

describe('BtnSubirArchivoComponent', () => {
  let component: BtnSubirArchivoComponent;
  let fixture: ComponentFixture<BtnSubirArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BtnSubirArchivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnSubirArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
