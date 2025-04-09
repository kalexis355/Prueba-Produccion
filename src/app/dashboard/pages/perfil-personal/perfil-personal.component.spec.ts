import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilPersonalComponent } from './perfil-personal.component';

describe('PerfilPersonalComponent', () => {
  let component: PerfilPersonalComponent;
  let fixture: ComponentFixture<PerfilPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
