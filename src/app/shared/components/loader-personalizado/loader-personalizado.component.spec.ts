import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderPersonalizadoComponent } from './loader-personalizado.component';

describe('LoaderPersonalizadoComponent', () => {
  let component: LoaderPersonalizadoComponent;
  let fixture: ComponentFixture<LoaderPersonalizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoaderPersonalizadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderPersonalizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
