import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoRolesComponent } from './dialogo-roles.component';

describe('DialogoRolesComponent', () => {
  let component: DialogoRolesComponent;
  let fixture: ComponentFixture<DialogoRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoRolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
