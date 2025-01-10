import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaCuadriculaComponent } from './vista-cuadricula.component';

describe('VistaCuadriculaComponent', () => {
  let component: VistaCuadriculaComponent;
  let fixture: ComponentFixture<VistaCuadriculaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VistaCuadriculaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaCuadriculaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
