import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcionesCarpetaComponent } from './opciones-carpeta.component';

describe('OpcionesCarpetaComponent', () => {
  let component: OpcionesCarpetaComponent;
  let fixture: ComponentFixture<OpcionesCarpetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpcionesCarpetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpcionesCarpetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
