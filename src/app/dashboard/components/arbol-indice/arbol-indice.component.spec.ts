import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbolIndiceComponent } from './arbol-indice.component';

describe('ArbolIndiceComponent', () => {
  let component: ArbolIndiceComponent;
  let fixture: ComponentFixture<ArbolIndiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArbolIndiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArbolIndiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
