import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionUsuariosPageComponent } from './gestion-usuarios-page.component';

describe('GestionUsuariosPageComponent', () => {
  let component: GestionUsuariosPageComponent;
  let fixture: ComponentFixture<GestionUsuariosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionUsuariosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionUsuariosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
