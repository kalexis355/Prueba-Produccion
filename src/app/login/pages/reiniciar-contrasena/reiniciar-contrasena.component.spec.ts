import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReiniciarContrasenaComponent } from './reiniciar-contrasena.component';

describe('ReiniciarContrasenaComponent', () => {
  let component: ReiniciarContrasenaComponent;
  let fixture: ComponentFixture<ReiniciarContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReiniciarContrasenaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReiniciarContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
