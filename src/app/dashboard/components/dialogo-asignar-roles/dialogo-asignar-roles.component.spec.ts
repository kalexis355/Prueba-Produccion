import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoAsignarRolesComponent } from './dialogo-asignar-roles.component';

describe('DialogoAsignarRolesComponent', () => {
  let component: DialogoAsignarRolesComponent;
  let fixture: ComponentFixture<DialogoAsignarRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoAsignarRolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoAsignarRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
