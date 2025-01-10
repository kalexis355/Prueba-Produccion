import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaListaComponent } from './vista-lista.component';

describe('VistaListaComponent', () => {
  let component: VistaListaComponent;
  let fixture: ComponentFixture<VistaListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VistaListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
