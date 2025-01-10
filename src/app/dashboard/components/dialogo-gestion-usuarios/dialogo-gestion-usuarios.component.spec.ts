import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoGestionUsuariosComponent } from './dialogo-gestion-usuarios.component';

describe('DialogoGestionUsuariosComponent', () => {
  let component: DialogoGestionUsuariosComponent;
  let fixture: ComponentFixture<DialogoGestionUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoGestionUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoGestionUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
