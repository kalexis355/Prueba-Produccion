import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperaContrasenaComponent } from './recupera-contrasena.component';

describe('RecuperaContrasenaComponent', () => {
  let component: RecuperaContrasenaComponent;
  let fixture: ComponentFixture<RecuperaContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecuperaContrasenaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperaContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
