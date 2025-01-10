import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnMasComponent } from './btn-mas.component';

describe('BtnMasComponent', () => {
  let component: BtnMasComponent;
  let fixture: ComponentFixture<BtnMasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BtnMasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnMasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
