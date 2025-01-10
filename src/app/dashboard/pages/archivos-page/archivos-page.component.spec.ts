import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivosPageComponent } from './archivos-page.component';

describe('ArchivosPageComponent', () => {
  let component: ArchivosPageComponent;
  let fixture: ComponentFixture<ArchivosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArchivosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
