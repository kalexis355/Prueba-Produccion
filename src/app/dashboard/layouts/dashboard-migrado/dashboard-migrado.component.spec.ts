import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMigradoComponent } from './dashboard-migrado.component';

describe('DashboardMigradoComponent', () => {
  let component: DashboardMigradoComponent;
  let fixture: ComponentFixture<DashboardMigradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardMigradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMigradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
