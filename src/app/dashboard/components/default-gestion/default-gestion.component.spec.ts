import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultGestionComponent } from './default-gestion.component';

describe('DefaultGestionComponent', () => {
  let component: DefaultGestionComponent;
  let fixture: ComponentFixture<DefaultGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DefaultGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
