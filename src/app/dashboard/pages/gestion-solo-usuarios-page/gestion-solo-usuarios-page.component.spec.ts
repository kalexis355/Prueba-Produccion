import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSoloUsuariosPageComponent } from './gestion-solo-usuarios-page.component';

describe('GestionSoloUsuariosPageComponent', () => {
  let component: GestionSoloUsuariosPageComponent;
  let fixture: ComponentFixture<GestionSoloUsuariosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionSoloUsuariosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionSoloUsuariosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
